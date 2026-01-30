import { useEffect, useMemo, useRef, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import * as ExpoDevice from "expo-device";

import { Device, State } from "react-native-ble-plx";

import { getBleManager, destroyBleManager } from "../services/ble/bleManager";
import { scanForDevices, stopScan } from "../services/ble/bleScanner";
import { bleConfig } from "../models/bleConfig";

/* ---------- Types ---------- */

export type FlattenedBLEData<T> = T & {
  timestamp: number;
};

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface UseBLEReturn<T> {
  devices: Device[];
  connectedDevice: Device | null;
  data: FlattenedBLEData<T> | null;
  connectionStatus: ConnectionStatus;
  error: Error | null;
  isScanning: boolean;
  bluetoothState: State;
  requestPermissions: () => Promise<boolean>;
  startScan: () => void;
  connectToDevice: (device: Device) => Promise<void>;
  disconnect: () => Promise<void>;
  writeData: (data: string) => Promise<void>;
}

/* ---------- Hook ---------- */

function useBLE<T>(config: bleConfig<T>): UseBLEReturn<T> {
  const bleManager = useMemo(() => getBleManager(), []);

  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [data, setData] = useState<FlattenedBLEData<T> | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<Error | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [bluetoothState, setBluetoothState] = useState<State>(State.Unknown);

  const notificationCleanup = useRef<(() => void) | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReconnect = useRef(false);
  const targetDeviceId = useRef<string | null>(null);

  /* ---------- Lifecycle ---------- */

  useEffect(() => {
    // Monitor Bluetooth state
    const subscription = bleManager.onStateChange((state) => {
      setBluetoothState(state);
      
      if (state === State.PoweredOn && shouldReconnect.current && targetDeviceId.current) {
        // Bluetooth turned back on, attempt reconnect
        handleReconnect();
      }
    }, true);

    return () => {
      subscription.remove();
      stopScan();
      setIsScanning(false);
      shouldReconnect.current = false;
      
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      
      notificationCleanup.current?.();
      destroyBleManager();
    };
  }, []);

  /* ---------- Permissions ---------- */

  const requestAndroid31Permissions = async () => {
    const scan = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
    );
    const connect = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
    );
    const location = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    return (
      scan === PermissionsAndroid.RESULTS.GRANTED &&
      connect === PermissionsAndroid.RESULTS.GRANTED &&
      location === PermissionsAndroid.RESULTS.GRANTED
    );
  };

  const requestPermissions = async () => {
    if (Platform.OS !== "android") return true;

    if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    return requestAndroid31Permissions();
  };

  /* ---------- Scanning ---------- */

  const startScan = () => {
    if (bluetoothState !== State.PoweredOn) {
      setError(new Error("Bluetooth is not powered on"));
      return;
    }

    stopScan();
    setDevices([]);
    setIsScanning(true);
    setError(null);

    scanForDevices(
      (device) =>
        config.deviceNameFilter?.(device.name ?? device.localName) ?? true,
      (device) => {
        setDevices((prev) =>
          prev.some((d) => d.id === device.id) ? prev : [...prev, device]
        );
      },
      (error) => {
        console.error("BLE scan error:", error);
        setError(error);
        setIsScanning(false);
      }
    );
  };

  /* ---------- Auto-Reconnection ---------- */

  const handleReconnect = async () => {
    if (!targetDeviceId.current || !shouldReconnect.current) return;

    console.log("Attempting to reconnect...");
    
    try {
      const device = await bleManager.connectToDevice(targetDeviceId.current);
      await setupConnection(device);
    } catch (e) {
      console.error("Reconnection failed:", e);
      
      // Retry after delay
      reconnectTimeout.current = setTimeout(() => {
        handleReconnect();
      }, 3000); // Retry every 3 seconds
    }
  };

  const setupConnection = async (device: Device) => {
    setConnectionStatus('connected');
    setConnectedDevice(device);
    setError(null);

    await device.discoverAllServicesAndCharacteristics();

    notificationCleanup.current?.();
    notificationCleanup.current = null;

    const subscription = device.monitorCharacteristicForService(
      config.serviceUUID,
      config.characteristicUUID,
      (error, characteristic) => {
        if (error || !characteristic?.value) return;

        try {
          const decoded = config.decode(characteristic.value);

          setData({
            ...decoded,
            timestamp: Date.now(),
          });
        } catch (e) {
          console.warn("BLE decode error:", e);
        }
      }
    );

    notificationCleanup.current = () => subscription.remove();

    // Monitor connection state
    device.onDisconnected((error, disconnectedDevice) => {
      console.log("Device disconnected:", error);
      setConnectionStatus('disconnected');
      setConnectedDevice(null);
      
      if (shouldReconnect.current) {
        setConnectionStatus('connecting');
        handleReconnect();
      }
    });
  };

  /* ---------- Connection ---------- */

  const connectToDevice = async (device: Device) => {
    if (bluetoothState !== State.PoweredOn) {
      const err = new Error("Bluetooth is not powered on");
      setError(err);
      throw err;
    }

    try {
      setConnectionStatus('connecting');
      setError(null);
      
      const connection = await bleManager.connectToDevice(device.id, {
        timeout: 10000, // 10 second timeout
      });
      
      targetDeviceId.current = device.id;
      shouldReconnect.current = true;
      
      stopScan();
      setIsScanning(false);

      await setupConnection(connection);
    } catch (e) {
      console.error("Connection failed:", e);
      const error = e instanceof Error ? e : new Error("Connection failed");
      setError(error);
      setConnectionStatus('error');
      throw error;
    }
  };

  /* ---------- Disconnect ---------- */

  const disconnect = async () => {
    try {
      shouldReconnect.current = false;
      targetDeviceId.current = null;
      
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }

      notificationCleanup.current?.();
      notificationCleanup.current = null;

      if (connectedDevice) {
        await bleManager.cancelDeviceConnection(connectedDevice.id);
        setConnectedDevice(null);
      }
      
      setConnectionStatus('disconnected');
      setError(null);
    } catch (e) {
      console.error("Disconnect failed:", e);
      const error = e instanceof Error ? e : new Error("Disconnect failed");
      setError(error);
    }
  };

  /* ---------- Write Data ---------- */

  const writeData = async (data: string) => {
    if (!connectedDevice) {
      const err = new Error("No device connected");
      setError(err);
      throw err;
    }

    try {
      await connectedDevice.writeCharacteristicWithResponseForService(
        config.serviceUUID,
        config.characteristicUUID,
        data
      );
    } catch (e) {
      console.error("Write failed:", e);
      const error = e instanceof Error ? e : new Error("Write failed");
      setError(error);
      throw error;
    }
  };

  return {
    devices,
    connectedDevice,
    data,
    connectionStatus,
    error,
    isScanning,
    bluetoothState,
    requestPermissions,
    startScan,
    connectToDevice,
    disconnect,
    writeData,
  };
}

export default useBLE;