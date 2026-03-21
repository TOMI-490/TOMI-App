import { useEffect, useRef, useState } from "react";
import { Device } from "react-native-ble-plx";
import { UseBLEReturn, FlattenedBLEData } from "./useBLE";
import { SmartwatchSensorData } from "../models/smartwatchSensorData";
import { bleConfig } from "../models/bleConfig";

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// Create a fake BLE device object
const fakeDevice = {
  id: "MOCK-DEVICE-1",
  name: "Test Smartwatch",
  localName: "Test Smartwatch",
} as Device;

export default function useBLEMock(
  config: bleConfig<SmartwatchSensorData>
): UseBLEReturn<SmartwatchSensorData> {

  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [data, setData] = useState<FlattenedBLEData<SmartwatchSensorData> | null>(null);

  const intervalRef = useRef<number | null>(null);

  /* ---------- Permissions (always allowed) ---------- */
  const requestPermissions = async () => true;

  /* ---------- Scanning ---------- */
  const startScan = () => {
    // Simulate delay like real BLE scan
    setTimeout(() => {
      setDevices([fakeDevice]);
    }, 1000);
  };

  /* ---------- Fake live data stream ---------- */
  const startGeneratingData = () => {
    intervalRef.current = setInterval(() => {
      const simulated: SmartwatchSensorData = {
        imu: {
          ax: random(-1, 1),
          ay: random(-1, 1),
          az: random(9.5, 10.2),

          gx: random(-0.1, 0.1),
          gy: random(-0.1, 0.1),
          gz: random(-0.1, 0.1),
        },
        heartRate: Math.round(random(70, 110)),
        spo2: Math.round(random(95, 99)),
      };

      setData({
        ...simulated,
        timestamp: Date.now(),
      });

    }, 1000);
  };

  /* ---------- Connection ---------- */
  const connectToDevice = async (device: Device) => {
    setConnectedDevice(device);
    startGeneratingData();
  };

  /* ---------- Disconnect ---------- */
  const disconnect = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setConnectedDevice(null);
    setData(null);
  };

  /* ---------- Cleanup ---------- */
  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

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
