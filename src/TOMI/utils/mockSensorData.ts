// utils/mockSensorData.ts
import type { SmartwatchSensorData } from '../models/SmartwatchSensorData';

/**
 * Generates realistic mock sensor data
 */
export const generateMockSensorData = (): SmartwatchSensorData => {
  // Realistic resting heart rate: 60-100 bpm
  // During exercise: 100-180 bpm
  const baseHeartRate = 70;
  const heartRateVariation = Math.random() * 20 - 10; // ±10 bpm
  const heartRate = Math.round(baseHeartRate + heartRateVariation);

  // Normal SpO2: 95-100%
  const spo2 = Math.round(95 + Math.random() * 5);

  // Simulate walking/running motion
  // Accelerometer: measures linear acceleration (m/s²)
  const ax = (Math.random() - 0.5) * 2; // -1 to 1 m/s²
  const ay = (Math.random() - 0.5) * 2;
  const az = 9.81 + (Math.random() - 0.5) * 0.5; // Gravity ± variation

  // Gyroscope: measures rotation (rad/s)
  const gx = (Math.random() - 0.5) * 0.1; // Small rotation
  const gy = (Math.random() - 0.5) * 0.1;
  const gz = (Math.random() - 0.5) * 0.1;

  return {
    imu: { ax, ay, az, gx, gy, gz },
    heartRate,
    spo2,
  };
};

/**
 * Simulates receiving data at regular intervals
 * Returns a cleanup function to stop the simulation
 */
export const startMockDataStream = (
  onData: (data: SmartwatchSensorData) => void,
  intervalMs: number = 1000 // Default: 1 reading per second
): (() => void) => {
  const interval = setInterval(() => {
    const mockData = generateMockSensorData();
    onData(mockData);
  }, intervalMs);

  // Return cleanup function
  return () => clearInterval(interval);
};