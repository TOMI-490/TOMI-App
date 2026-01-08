import { bleConfig } from "../models/bleConfig";
import base64 from "react-native-base64";
import { SmartwatchSensorData } from "../models/smartwatchSensorData";

/**
 * ASSUMPTION (you can change this later):
 *
 * Payload format (base64 decoded, CSV-like):
 * ax,ay,az,gx,gy,gz,hr,spo2
 *
 * Example:
 * "0.12,-0.01,9.81,0.02,0.01,0.00,72,98"
 */

export const smartwatchBleConfig: bleConfig<SmartwatchSensorData> = {
  /**
   * Allow:
   * - Your smartwatch
   * - Headphones (for testing connectivity)
   */
  deviceNameFilter: (name) => {
    if (!name) return false;

    return (
      name.toLowerCase().includes("watch") ||
      name.toLowerCase().includes("band") ||
      name.toLowerCase().includes("buds") ||
      name.toLowerCase().includes("headphones")
    );
  },

  /**
   * Replace these once your firmware is finalized
   */
  serviceUUID: "0000abcd-0000-1000-8000-00805f9b34fb",
  characteristicUUID: "0000dcba-0000-1000-8000-00805f9b34fb",

  decode: (value: string): SmartwatchSensorData => {
    // Decode base64 payload
    const decoded = base64.decode(value);

    // Parse CSV-like format
    const parts = decoded.split(",").map(Number);
    if (parts.length !== 8) {
      throw new Error("Invalid smartwatch BLE payload");
    }

    const [
      ax, ay, az,
      gx, gy, gz,
      heartRate,
      spo2
    ] = parts;

    return {
      imu: { ax, ay, az, gx, gy, gz },
      heartRate,
      spo2,
      timestamp: Date.now(),
    };
  },
};
