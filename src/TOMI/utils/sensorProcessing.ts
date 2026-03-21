// utils/sensorProcessing.ts
import { FlattenedBLEData } from '../hooks/useBLE';
import { SmartwatchSensorData } from '../models/smartwatchSensorData';

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

export type WorkoutSummary = {
  workout_id:   number;
  duration_ms:  number;
  avg_hr:       number;
  min_hr:       number;
  max_hr:       number;
  avg_spo2:     number;
  min_spo2:     number;
  max_spo2:     number;
  steps:        number;
  distance_km:  number | null;
};

const filterReadings = (readings: any[]) =>
  readings.filter(
    (r) => r.heart_rate >= 30 && r.heart_rate <= 250 &&
           r.spo2 >= 50 && r.spo2 <= 100
  );

const countSteps = (readings: any[]): number => {
  const THRESHOLD = 1.2; // calibrate for your device
  let steps = 0;
  let above = false;
  readings.forEach((r) => {
    const mag = Math.sqrt(r.accel_x ** 2 + r.accel_y ** 2 + r.accel_z ** 2);
    if (mag > THRESHOLD && !above) { steps++; above = true; }
    else if (mag <= THRESHOLD) above = false;
  });
  return steps;
};

// Reuses the Haversine logic already in LiveWorkoutScreen
const toRad = (deg: number) => (deg * Math.PI) / 180;
const haversine = (a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) => {
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
};

export const processWorkout = (
  workoutId: number,
  rawReadings: any[],
  locations: { latitude: number; longitude: number }[],
  elapsedSeconds: number,
  includeDistance: boolean
): WorkoutSummary => {
  const readings = filterReadings(rawReadings);
  if (!readings.length) throw new Error('No valid sensor readings to process');

  const hrValues   = readings.map((r) => r.heart_rate);
  const spo2Values = readings.map((r) => r.spo2);

  let distance_km: number | null = null;
  if (includeDistance && locations.length >= 2) {
    let total = 0;
    for (let i = 1; i < locations.length; i++) {
      total += haversine(locations[i - 1], locations[i]);
    }
    distance_km = Math.round(total * 100) / 100;
  }

  return {
    workout_id:  workoutId,
    duration_ms: elapsedSeconds * 1000,
    avg_hr:  Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length),
    min_hr:  Math.min(...hrValues),
    max_hr:  Math.max(...hrValues),
    avg_spo2:  Math.round(spo2Values.reduce((a, b) => a + b, 0) / spo2Values.length),
    min_spo2:  Math.min(...spo2Values),
    max_spo2:  Math.max(...spo2Values),
    steps:       countSteps(readings),
    distance_km,
  };
};