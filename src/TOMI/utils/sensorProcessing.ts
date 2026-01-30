// utils/sensorProcessing.ts
import { FlattenedBLEData } from '../hooks/useBLE';
import { SmartwatchSensorData } from '../models/SmartwatchSensorData';

export interface ProcessedSensorData {
  // Flattened IMU data
  accel_x: number;
  accel_y: number;
  accel_z: number;
  gyro_x: number;
  gyro_y: number;
  gyro_z: number;
  // Vitals
  heart_rate: number;
  spo2: number;
  // Metadata
  timestamp: number;
  user_id: string;
}

export function processSensorData(
  raw: FlattenedBLEData<SmartwatchSensorData>
): ProcessedSensorData {
  return {
    // Flatten IMU data for easier database storage
    accel_x: raw.imu.ax,
    accel_y: raw.imu.ay,
    accel_z: raw.imu.az,
    gyro_x: raw.imu.gx,
    gyro_y: raw.imu.gy,
    gyro_z: raw.imu.gz,
    // Vitals
    heart_rate: raw.heartRate,
    spo2: raw.spo2,
    // Metadata
    timestamp: raw.timestamp,
    user_id: 'get-from-auth', // Replace with actual user ID from your auth system
  };
}

export function encodeForWatch(processed: ProcessedSensorData): string {
  // If you need to send processed data back to watch
  return JSON.stringify(processed);
}