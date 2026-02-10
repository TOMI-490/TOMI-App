// hooks/useSensorDataCollection.ts
import { useEffect, useRef, useState } from 'react';
import { sensorDataDb } from '../services/localDatabase/localDb';
import { startMockDataStream, generateMockSensorData } from '../utils/mockSensorData';
import type { SmartwatchSensorData } from '../models/SmartwatchSensorData';

interface UseSensorDataCollectionProps {
  workoutId: number;
  isActive: boolean; // Only collect when workout is active
  useMockData?: boolean; // Toggle between real BLE and mock data
  realTimeData?: SmartwatchSensorData | null; // Real data from BLE
}

export const useSensorDataCollection = ({
  workoutId,
  isActive,
  useMockData = false,
  realTimeData,
}: UseSensorDataCollectionProps) => {
  const [currentReading, setCurrentReading] = useState<SmartwatchSensorData | null>(null);
  const [readingCount, setReadingCount] = useState(0);
  const [averageHeartRate, setAverageHeartRate] = useState(0);
  const [maxHeartRate, setMaxHeartRate] = useState(0);
  
  const cleanupRef = useRef<(() => void) | null>(null);
  const batchBuffer = useRef<Array<{ data: SmartwatchSensorData; timestamp: number }>>([]);
  const BATCH_SIZE = 10; // Insert every 10 readings for performance

  useEffect(() => {
    if (!isActive) {
      // Stop collection when workout is paused/stopped
      cleanupRef.current?.();
      cleanupRef.current = null;
      
      // Flush any remaining buffered data
      if (batchBuffer.current.length > 0) {
        flushBatch();
      }
      
      return;
    }

    // Start data collection
    if (useMockData) {
      // Use mock data stream
      cleanupRef.current = startMockDataStream((data) => {
        handleNewReading(data);
      }, 1000); // 1 reading per second
    }

    return () => {
      cleanupRef.current?.();
      if (batchBuffer.current.length > 0) {
        flushBatch();
      }
    };
  }, [isActive, useMockData, workoutId]);

  // Handle real BLE data
  useEffect(() => {
    if (isActive && !useMockData && realTimeData) {
      handleNewReading(realTimeData);
    }
  }, [realTimeData, isActive, useMockData]);

  const handleNewReading = (data: SmartwatchSensorData) => {
    const timestamp = Date.now();
    
    // Update UI state
    setCurrentReading(data);
    
    // Add to batch buffer
    batchBuffer.current.push({ data, timestamp });
    
    // Flush batch if buffer is full
    if (batchBuffer.current.length >= BATCH_SIZE) {
      flushBatch();
    }
  };

  const flushBatch = () => {
    if (batchBuffer.current.length === 0) return;

    try {
      // Batch insert for better performance
      sensorDataDb.insertBatch(workoutId, batchBuffer.current);
      
      // Update stats
      const count = sensorDataDb.getCount(workoutId);
      const avgHR = sensorDataDb.getAverageHeartRate(workoutId);
      const maxHR = sensorDataDb.getMaxHeartRate(workoutId);
      
      setReadingCount(count);
      setAverageHeartRate(Math.round(avgHR));
      setMaxHeartRate(maxHR);
      
      // Clear buffer
      batchBuffer.current = [];
      
      console.log(`[SensorData] Saved batch. Total readings: ${count}`);
    } catch (error) {
      console.error('[SensorData] Failed to save batch:', error);
    }
  };

  const forceFlush = () => {
    flushBatch();
  };

  return {
    currentReading,
    readingCount,
    averageHeartRate,
    maxHeartRate,
    forceFlush,
  };
};