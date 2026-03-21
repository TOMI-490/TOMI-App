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
  const bleAvailable = bleManager !== null;

  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [data, setData] = useState<FlattenedBLEData<T> | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<Error | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [bluetoothState, setBluetoothState] = useState<State>(
    bleAvailable ? State.Unknown : State.Unsupported,
  );

  const notificationCleanup = useRef<(() => void) | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReconnect = useRef(false);
  const targetDeviceId = useRef<string | null>(null);
  const bluetoothStateRef = useRef<State>(
    bleAvailable ? State.Unknown : State.Unsupported,
  );

  /* ---------- Lifecycle ---------- */

  useEffect(() => {
    if (!bleManager) {
      console.warn('[BLE] BleManager unavailable — Bluetooth features disabled.');
      setBluetoothState(State.Unsupported);
      return;
    }

    bleManager.state().then((s) => {
      bluetoothStateRef.current = s;
      setBluetoothState(s);
    }).catch(() => {});

    const subscription = bleManager.onStateChange((state) => {
      bluetoothStateRef.current = state;
      setBluetoothState(state);
      console.log('[BLE] Bluetooth state changed:', state);
      
      if (state === State.PoweredOn && shouldReconnect.current && targetDeviceId.current) {
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
    if (!bleManager) {
      setError(new Error('Bluetooth is not available on this device'));
      return false;
    }

    if (Platform.OS === "ios") {
      // Use the ref for an immediate, synchronous check — avoids hanging on bleManager.state()
      // which can block for several seconds before BT stack initialises.
      const currentState = bluetoothStateRef.current;
      console.log('[BLE] requestPermissions (iOS) — bluetoothStateRef:', currentState);

      if (currentState === State.PoweredOn) return true;

      if (currentState !== State.Unknown && currentState !== State.Resetting) {
        // Explicitly off, unauthorized, or unsupported
        setError(new Error(`Bluetooth unavailable (state: ${currentState})`));
        return false;
      }

      // State is still Unknown (BT stack just started) — wait up to 3s for it to settle
      console.log('[BLE] BT state Unknown — waiting up to 3s for state change...');
      const settled = await new Promise<State>((resolve) => {
        const unsub = bleManager.onStateChange((s) => {
          if (s !== State.Unknown && s !== State.Resetting) {
            bluetoothStateRef.current = s;
            setBluetoothState(s);
            unsub.remove();
            resolve(s);
          }
        }, false);
        setTimeout(() => { unsub.remove(); resolve(bluetoothStateRef.current); }, 3000);
      });
      console.log('[BLE] BT state after wait:', settled);
      if (settled !== State.PoweredOn) {
        setError(new Error(`Bluetooth unavailable (state: ${settled})`));
        return false;
      }
      return true;
    }

    // Android permissions
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
    if (!bleManager) { setError(new Error('Bluetooth not available')); return; }
    console.log('[BLE] startScan called — state (ref):', bluetoothStateRef.current, '| state (react):', bluetoothState);
    if (bluetoothStateRef.current !== State.PoweredOn) {
      const msg = `Bluetooth is not powered on (state: ${bluetoothStateRef.current})`;
      console.warn('[BLE] startScan aborted:', msg);
      setError(new Error(msg));
      return;
    }

    stopScan();
    setDevices([]);
    setIsScanning(true);
    setError(null);

    // First, check for already-connected devices (paired in iOS Settings)
    const serviceUUIDs = config.serviceUUID ? [config.serviceUUID] : [];
    bleManager.connectedDevices(serviceUUIDs).then((connectedDevices) => {
      console.log('[BLE] Already connected devices:', connectedDevices.map(d => d.name));
      connectedDevices.forEach((device) => {
        if (config.deviceNameFilter?.(device.name ?? device.localName) ?? true) {
          setDevices((prev) =>
            prev.some((d) => d.id === device.id) ? prev : [...prev, device]
          );
        }
      });
    }).catch((e) => {
      console.warn('[BLE] Error checking connected devices:', e);
    });

    // Also check known devices (previously bonded)
    bleManager.devices([]).then((knownDevices) => {
      console.log('[BLE] Known devices:', knownDevices.map(d => d.name));
    }).catch(() => {});

    // Then do a normal scan for advertising devices
    scanForDevices(
      (device) =>
        config.deviceNameFilter?.(device.name ?? device.localName) ?? true,
      (device) => {
        setDevices((prev) =>
          prev.some((d) => d.id === device.id) ? prev : [...prev, device]
        );
      },
      (scanError) => {
        const msg: string = (scanError as any)?.message ?? String(scanError);
        if (msg.toLowerCase().includes('unknown state') || msg.toLowerCase().includes('unknown error')) {
          // BLE manager just re-initialised — wait for PoweredOn then retry automatically
          console.warn('[BLE] Scan failed with unknown state — waiting for PoweredOn to retry...');
          setIsScanning(false);
          const retrySub = bleManager.onStateChange((s) => {
            if (s === State.PoweredOn) {
              retrySub.remove();
              console.log('[BLE] PoweredOn received — retrying scan...');
              startScan();
            }
          }, true);
        } else {
          console.error('[BLE] Scan error:', scanError);
          setError(scanError);
          setIsScanning(false);
        }
      }
    );
  };

  /* ---------- Auto-Reconnection ---------- */

  const handleReconnect = async () => {
    if (!bleManager || !targetDeviceId.current || !shouldReconnect.current) return;

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

    config.resetDecodeState?.();

    await device.discoverAllServicesAndCharacteristics();

    if (Platform.OS === 'android') {
      try {
        await device.requestMTU(247);
      } catch (e) {
        console.warn('[BLE] requestMTU optional failed:', e);
      }
    }

    notificationCleanup.current?.();
    notificationCleanup.current = null;

    const subscription = device.monitorCharacteristicForService(
      config.serviceUUID,
      config.characteristicUUID,
      (error, characteristic) => {
        if (error) {
          console.error('[BLE] Monitor error:', error);
          return;
        }

        if (!characteristic?.value) {
          if (__DEV__) console.log('[BLE] Notification with empty value');
          return;
        }

        if (__DEV__) console.log('[BLE] Raw notification (b64 len):', characteristic.value.length);

        try {
          const decoded = config.decode(characteristic.value);
          if (decoded != null) {
            if (__DEV__) console.log('[BLE] Decoded sample:', decoded);
            setData({
              ...decoded,
              timestamp: Date.now(),
            });
          }
        } catch (e) {
          console.warn('[BLE] decode error:', e);
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
    if (!bleManager || bluetoothStateRef.current !== State.PoweredOn) {
      const err = new Error("Bluetooth is not powered on");
      setError(err);
      throw err;
    }

    try {
      setConnectionStatus('connecting');
      setError(null);
      
      const connection = await bleManager.connectToDevice(device.id, {
        timeout: 6000, // 6s — must fit within the 15s scan window
      });
      
      targetDeviceId.current = device.id;
      shouldReconnect.current = true;
      
      stopScan();
      setIsScanning(false);

      await setupConnection(connection);
      console.log('[BLE] Setup complete!');
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
      config.resetDecodeState?.();

      if (connectedDevice && bleManager) {
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