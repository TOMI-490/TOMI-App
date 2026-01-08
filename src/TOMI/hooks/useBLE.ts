import { useEffect, useMemo, useRef, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import * as ExpoDevice from "expo-device";

import { Device } from "react-native-ble-plx";

import { getBleManager, destroyBleManager } from "../services/ble/bleManager";
import { scanForDevices, stopScan } from "../services/ble/bleScanner";
import { bleConfig } from "../models/bleConfig";

interface BLEData<T> {
  value: T;
  timestamp: number;
}

function useBLE<T>(config: bleConfig<T>) {
  const bleManager = useMemo(() => getBleManager(), []);

  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [data, setData] = useState<BLEData<T> | null>(null);

  const notificationCleanup = useRef<(() => void) | null>(null);

  /* ---------- Lifecycle ---------- */

  useEffect(() => {
    return () => {
      stopScan();
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
    stopScan();
    setDevices([]);

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
      }
    );
  };

  /* ---------- Connection ---------- */

  const connectToDevice = async (device: Device) => {
    try {
      const connection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(connection);

      await connection.discoverAllServicesAndCharacteristics();
      stopScan();

      // Clean up any previous notification
      notificationCleanup.current?.();
      notificationCleanup.current = null;

      const subscription = connection.monitorCharacteristicForService(
        config.serviceUUID,
        config.characteristicUUID,
        (error, characteristic) => {
          if (error || !characteristic?.value) return;

          try {
            const decoded = config.decode(characteristic.value);

            setData({
              value: decoded,
              timestamp: Date.now(),
            });
          } catch (e) {
            console.warn("BLE decode error:", e);
          }
        }
      );

      notificationCleanup.current = () => subscription.remove();
    } catch (e) {
      console.error("Connection failed:", e);
    }
  };

  const disconnect = async () => {
    try {
      notificationCleanup.current?.();
      notificationCleanup.current = null;

      if (connectedDevice) {
        await bleManager.cancelDeviceConnection(connectedDevice.id);
        setConnectedDevice(null);
      }
    } catch (e) {
      console.error("Disconnect failed:", e);
    }
  };

  return {
    devices,
    connectedDevice,
    data,
    requestPermissions,
    startScan,
    connectToDevice,
    disconnect,
  };
}

export default useBLE;
