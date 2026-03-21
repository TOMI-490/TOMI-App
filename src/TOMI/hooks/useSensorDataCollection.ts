// hooks/useSensorDataCollection.ts
import { useEffect, useRef, useState } from 'react';
import { sensorDataDb } from '../services/localDatabase/localDb';
import { startMockDataStream, generateMockSensorData } from '../utils/mockSensorData';
import type { SmartwatchSensorData } from '../models/smartwatchSensorData';

type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

interface UseSensorDataCollectionProps {
  workoutId: number;
  isActive: boolean; // Only collect when workout is active
  useMockData?: boolean; // Toggle between real BLE and mock data
  realTimeData?: SmartwatchSensorData | null; // Real data from BLE
  connectionStatus?: ConnectionStatus;
  onConnectionLost?: () => void;
}

export const useSensorDataCollection = ({
  workoutId,
  isActive,
  useMockData = false,
  realTimeData,
  connectionStatus,
  onConnectionLost,
}: UseSensorDataCollectionProps) => {
  const [currentReading, setCurrentReading] = useState<SmartwatchSensorData | null>(null);
  const [readingCount, setReadingCount] = useState(0);
  const [averageHeartRate, setAverageHeartRate] = useState(0);
  const [averageSpO2, setAverageSpO2] = useState(0);  // ADDED
  const [maxHeartRate, setMaxHeartRate] = useState(0);
  const [dataSourceWarning, setDataSourceWarning] = useState<string | null>(null);  // ADDED
  
  const cleanupRef = useRef<(() => void) | null>(null);
  const batchBuffer = useRef<Array<{ data: SmartwatchSensorData; timestamp: number }>>([]);
  const lastDataReceivedTime = useRef<number>(Date.now());  //track last data
  const BATCH_SIZE = 10;
  const DATA_TIMEOUT_MS = 5000;  //5 second timeout

  // ==========================================
  // CONNECTION MONITORING (ADDED)
  // ==========================================
  useEffect(() => {
    // Only monitor connection if using real BLE data
    if (!useMockData && isActive) {
      // Check connection status
      if (connectionStatus === 'disconnected' || connectionStatus === 'error') {
        console.warn('[SensorCollection] ⚠️ Device disconnected during workout!');
        setDataSourceWarning('Device disconnected! Reconnect to continue collecting data.');
        
        // Flush any buffered data
        if (batchBuffer.current.length > 0) {
          flushBatch();
        }
        
        // Notify parent component
        onConnectionLost?.();
      }

      // Monitor data timeout (no data received for X seconds)
      const dataTimeoutInterval = setInterval(() => {
        const timeSinceLastData = Date.now() - lastDataReceivedTime.current;
        
        if (timeSinceLastData > DATA_TIMEOUT_MS && connectionStatus === 'connected') {
          console.warn('[SensorCollection] ⚠️ No data received for 5 seconds');
          setDataSourceWarning('Not receiving data from device. Check connection.');
        } else if (connectionStatus === 'connected') {
          setDataSourceWarning(null);
        }
      }, 2000); // Check every 2 seconds

      return () => clearInterval(dataTimeoutInterval);
    } else if (useMockData) {
      // Clear warnings when using mock data
      setDataSourceWarning(null);
    }
  }, [connectionStatus, useMockData, isActive]);

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
      console.log('[SensorCollection] Starting mock data stream');
      setDataSourceWarning(null);  // ADDED - clear warnings for mock data
      
      cleanupRef.current = startMockDataStream((data) => {
        handleNewReading(data);
      }, 1000); // 1 reading per second
    } else {
      console.log('[SensorCollection] Waiting for real BLE data');
      
      // Validate we have a connection before starting
      if (connectionStatus !== 'connected') {
        console.warn('[SensorCollection] ⚠️ Attempted to start with no device connected');
        setDataSourceWarning('No device connected. Connect a device to collect data.');
      }
    }

    return () => {
      cleanupRef.current?.();
      if (batchBuffer.current.length > 0) {
        flushBatch();
      }
    };
  }, [isActive, useMockData, workoutId, connectionStatus]);

  // Handle real BLE data
  useEffect(() => {
    if (isActive && !useMockData && realTimeData) {
      console.log('[SensorCollection] Received real BLE data');
      lastDataReceivedTime.current = Date.now(); // update last received time
      setDataSourceWarning(null);  // clear warnings when receiving data
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
      const avgSpO2 = sensorDataDb.getAverageSpO2(workoutId);  
      const maxHR = sensorDataDb.getMaxHeartRate(workoutId);
      
      setReadingCount(count);
      setAverageHeartRate(Math.round(avgHR));
      setAverageSpO2(Math.round(avgSpO2));  
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
    averageSpO2,        
    maxHeartRate,
    forceFlush,
    dataSourceWarning,  
  };
};