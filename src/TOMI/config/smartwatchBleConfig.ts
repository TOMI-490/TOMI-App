import { bleConfig } from "../models/bleConfig";
import base64 from "react-native-base64";
import { SmartwatchSensorData } from "../models/SmartwatchSensorData";

let dataBuffer = '';

export const smartwatchBleConfig: bleConfig<SmartwatchSensorData> = {
  deviceNameFilter: (name) => {
    if (!name) return false;
    const match = name.toUpperCase().includes('XIAO');
    console.log(`[BLE Filter] Device: "${name}" — ${match ? '✅ MATCH' : '❌ skip'}`);
    return match;
  },

  serviceUUID: "6E400001-B5A3-F393-E0A9-E50E24DCCA9E",
  characteristicUUID: "6E400003-B5A3-F393-E0A9-E50E24DCCA9E",

decode: (value: string): SmartwatchSensorData => {
    const decoded = base64.decode(value);
    
    // Add to buffer
    dataBuffer += decoded;
    
    // Look for complete line (ends with \r\n or \n)
    const lines = dataBuffer.split(/\r?\n/);
    
    // Keep incomplete line in buffer
    dataBuffer = lines.pop() || '';
    
    // Process last complete line
    if (lines.length === 0) {
      throw new Error("No complete data line yet");
    }
    
    const lastLine = lines[lines.length - 1].trim();
    const parts = lastLine.split(",").map(Number);
    
    if (parts.length !== 8) {
      throw new Error(`Invalid data: expected 8 values, got ${parts.length}`);
    }

    const [ax, ay, az, gx, gy, gz, heartRate, spo2] = parts;

    return {
      imu: { ax, ay, az, gx, gy, gz },
      heartRate,
      spo2,
    };
  },

  encode: (command: string): string => {
    return base64.encode(command);
  },
};

  //decode: (value: string): SmartwatchSensorData => {
    //const decoded = base64.decode(value);
    //const parts = decoded.split(",").map(Number);
    
   // if (parts.length !== 8) {
    //  throw new Error("Invalid smartwatch BLE payload");
    //}

    //const [ax, ay, az, gx, gy, gz, heartRate, spo2] = parts;

    //return {
     // imu: { ax, ay, az, gx, gy, gz },
      //heartRate,
     // spo2,
   // };
 // },

  // NEW: Encode function for sending commands
 // encode: (command: string): string => {
    // Encode command to base64
  //  return base64.encode(command);
 // },
//};