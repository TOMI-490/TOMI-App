export interface IMUData {
  ax: number;
  ay: number;
  az: number;
  gx: number;
  gy: number;
  gz: number;
}

export interface SmartwatchSensorData {
  imu: IMUData;
  heartRate: number;   // bpm
  spo2: number;        // %
}