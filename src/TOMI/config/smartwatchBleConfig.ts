import { bleConfig } from "../models/bleConfig";
import base64 from "react-native-base64";
import { SmartwatchSensorData } from "../models/SmartwatchSensorData";

export const smartwatchBleConfig: bleConfig<SmartwatchSensorData> = {
  deviceNameFilter: (name) => {
    if (!name) return false;

    return (
      name.toLowerCase().includes("watch") ||
      name.toLowerCase().includes("band") ||
      name.toLowerCase().includes("buds") ||
      name.toLowerCase().includes("headphones") ||
      name.toLowerCase().includes("airpods")
    );
  },

  serviceUUID: "0000abcd-0000-1000-8000-00805f9b34fb",
  characteristicUUID: "0000dcba-0000-1000-8000-00805f9b34fb",

  decode: (value: string): SmartwatchSensorData => {
    const decoded = base64.decode(value);
    const parts = decoded.split(",").map(Number);
    
    if (parts.length !== 8) {
      throw new Error("Invalid smartwatch BLE payload");
    }

    const [ax, ay, az, gx, gy, gz, heartRate, spo2] = parts;

    return {
      imu: { ax, ay, az, gx, gy, gz },
      heartRate,
      spo2,
    };
  },

  // NEW: Encode function for sending commands
  encode: (command: string): string => {
    // Encode command to base64
    return base64.encode(command);
  },
};