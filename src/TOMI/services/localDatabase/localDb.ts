import * as SQLite from 'expo-sqlite';
import type { SmartwatchSensorData } from '../../models/SmartwatchSensorData';

// Local SQLite database for high-frequency sensor data
const db = SQLite.openDatabaseSync('tomi_local.db');

export const initializeLocalDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS sensor_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER NOT NULL,
      timestamp INTEGER NOT NULL,
      
      -- IMU data
      accel_x REAL NOT NULL,
      accel_y REAL NOT NULL,
      accel_z REAL NOT NULL,
      gyro_x REAL NOT NULL,
      gyro_y REAL NOT NULL,
      gyro_z REAL NOT NULL,
      
      -- Vital signs
      heart_rate INTEGER NOT NULL,
      spo2 INTEGER NOT NULL,
      
      -- Sync status
      synced_to_cloud INTEGER DEFAULT 0
    );
    
    CREATE INDEX IF NOT EXISTS idx_sensor_workout 
    ON sensor_readings(workout_id);
    
    CREATE INDEX IF NOT EXISTS idx_sensor_timestamp 
    ON sensor_readings(timestamp);
    
    CREATE INDEX IF NOT EXISTS idx_sensor_synced 
    ON sensor_readings(synced_to_cloud);
  `);
  
  console.log('✓ Local sensor database initialized');
};

export const sensorDataDb = {
  insertReading: (
    workoutId: number,
    data: SmartwatchSensorData,
    timestamp: number = Date.now()
  ) => {
    const result = db.runSync(
      `INSERT INTO sensor_readings (
        workout_id, timestamp,
        accel_x, accel_y, accel_z,
        gyro_x, gyro_y, gyro_z,
        heart_rate, spo2
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        workoutId,
        timestamp,
        data.imu.ax,
        data.imu.ay,
        data.imu.az,
        data.imu.gx,
        data.imu.gy,
        data.imu.gz,
        data.heartRate,
        data.spo2,
      ]
    );
    
    return result.lastInsertRowId;
  },

  insertBatch: (
    workoutId: number,
    readings: Array<{
      data: SmartwatchSensorData;
      timestamp: number;
    }>
  ) => {
    db.withTransactionSync(() => {
      readings.forEach(({ data, timestamp }) => {
        sensorDataDb.insertReading(workoutId, data, timestamp);
      });
    });
  },

  getByWorkout: (workoutId: number) => {
    return db.getAllSync(
      `SELECT * FROM sensor_readings 
       WHERE workout_id = ? 
       ORDER BY timestamp ASC`,
      [workoutId]
    );
  },

  getAverageHeartRate: (workoutId: number): number => {
    const result = db.getFirstSync<{ avg_hr: number }>(
      `SELECT AVG(heart_rate) as avg_hr 
       FROM sensor_readings 
       WHERE workout_id = ?`,
      [workoutId]
    );
    return result?.avg_hr || 0;
  },

  getAverageSpO2: (workoutId: number): number => {
    const result = db.getFirstSync<{ avg_spo2: number }>(
      `SELECT AVG(spo2) as avg_spo2 
       FROM sensor_readings 
       WHERE workout_id = ?`,
      [workoutId]
    );
    return result?.avg_spo2 || 0;
  },

  getMaxHeartRate: (workoutId: number): number => {
    const result = db.getFirstSync<{ max_hr: number }>(
      `SELECT MAX(heart_rate) as max_hr 
       FROM sensor_readings 
       WHERE workout_id = ?`,
      [workoutId]
    );
    return result?.max_hr || 0;
  },

  getCount: (workoutId: number): number => {
    const result = db.getFirstSync<{ count: number }>(
      `SELECT COUNT(*) as count 
       FROM sensor_readings 
       WHERE workout_id = ?`,
      [workoutId]
    );
    return result?.count || 0;
  },

  deleteByWorkout: (workoutId: number) => {
    return db.runSync(
      `DELETE FROM sensor_readings WHERE workout_id = ?`,
      [workoutId]
    );
  },

  // Get unsynced readings for cloud upload
  getUnsyncedReadings: (workoutId: number) => {
    return db.getAllSync(
      `SELECT * FROM sensor_readings 
       WHERE workout_id = ? AND synced_to_cloud = 0
       ORDER BY timestamp ASC`,
      [workoutId]
    );
  },

  // Mark readings as synced
  markAsSynced: (readingIds: number[]) => {
    db.withTransactionSync(() => {
      readingIds.forEach(id => {
        db.runSync(
          `UPDATE sensor_readings SET synced_to_cloud = 1 WHERE id = ?`,
          [id]
        );
      });
    });
  },
};