import { useEffect, useMemo, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import * as ExpoDevice from "expo-device";

import { Device, Characteristic, BleError } from "react-native-ble-plx";

import { getBleManager, destroyBleManager } from "../services/ble/bleManager";
import { scanForDevices, stopScan } from "../services/ble/bleScanner";
import { BleColorData } from "../models/bleColorData";
import { bleConfig } from "../models/bleConfig";

const DATA_SERVICE_UUID = "19b10000-e8f2-537e-4f6c-d104768a1214";
const COLOR_CHARACTERISTIC_UUID = "19b10001-e8f2-537e-4f6c-d104768a1217";

function useBLE(config:bleConfig) {
  const bleManager = useMemo(() => getBleManager(), []);

  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
 // const [data, setData] = useState<BleColorData | null>(null);

  useEffect(() => {
    return () => {
      stopScan();
      destroyBleManager(); // Clean up BLE manager on unmount
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
      scan === "granted" &&
      connect === "granted" &&
      location === "granted"
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
  scanForDevices(
    (device) =>
      config.deviceNameFilter?.(device.name ?? device.localName) ?? true,
    (device) => {
      setDevices((prev) =>
        prev.some((d) => d.id === device.id) ? prev : [...prev, device]
      );
    },
    console.error
  );
};

  /* ---------- Connection ---------- */

  const connectToDevice = async (device: Device) => {
    try {
      const connection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(connection);

      await connection.discoverAllServicesAndCharacteristics();
      stopScan();

      connection.monitorCharacteristicForService(
        config.serviceUUID,
        config.characteristicUUID,
        (error, characteristic) => {
       if (error || !characteristic?.value) return;

      setData({
        value: config.decode(characteristic.value),
        timestamp: Date.now(),
    });
  }
);
    } catch (e) {
      console.error("Connection failed", e);
    }
  };

  const disconnect = async () => {
    if (connectedDevice) {
      await bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
    }
  };

  /* ---------- Data ---------- */

  // const onDataUpdate = (
  //   error: BleError | null,
  //   characteristic: Characteristic | null
  // ) => {
  //   if (error || !characteristic?.value) return;

  //   setData({
  //     color: decodeColor(characteristic.value),
  //     timestamp: Date.now(),
  //   });
  // };
  
  const [data, setData] = useState<{
  value: any;
  timestamp: number;
} | null>(null);

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
