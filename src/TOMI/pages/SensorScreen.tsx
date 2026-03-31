// screens/SensorScreen.tsx - UPDATED VERSION
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutBle } from '../contexts/WorkoutBleContext';
import { useSensorDataCollection } from '../hooks/useSensorDataCollection';
import type { FlattenedBLEData } from '../hooks/useBLE';
import type { SmartwatchSensorData } from '../models/smartwatchSensorData';
import BLEPopup from '../components/ble/blePopup';

/**
 * 🧪 SENSOR TEST SCREEN
 * 
 * Purpose: Test real Bluetooth communication with smartwatch
 * 
 * What this screen does:
 * 1. Connect to your smartwatch via Bluetooth
 * 2. Receive real sensor data (HR, SpO2, IMU)
 * 3. Save data to local SQLite database
 * 4. Display real-time stats and connection status
 * 
 * Use this screen to verify:
 * ✅ Bluetooth connection works
 * ✅ Data is being received from smartwatch
 * ✅ Data format matches expected structure
 * ✅ Database storage is working
 */
export default function SensorScreen() {
  const TEST_WORKOUT_ID = 999; // Test workout ID for development
  
  // ==========================================
  // STATE
  // ==========================================
  const [isCollecting, setIsCollecting] = useState(false);
  const [showBLEPopup, setShowBLEPopup] = useState(false);
  const [useMockData, setUseMockData] = useState(false); // Toggle for testing

  // ==========================================
  // BLE CONNECTION
  // ==========================================
  const {
    data,
    connectionStatus,
    connectedDevice,
    devices,
    isScanning,
    startScan,
    connectToDevice,
    disconnect,
    requestPermissions,
    error,
    bluetoothState,
    writeData,
  } = useWorkoutBle();

  /** Strip timestamp for the collection hook (expects SmartwatchSensorData). */
  const sensorPayload = useMemo((): SmartwatchSensorData | null => {
    if (!data) return null;
    const { timestamp: _ts, ...sensor } = data as FlattenedBLEData<SmartwatchSensorData>;
    return sensor;
  }, [data]);

  useEffect(() => {
    console.log('[SensorScreen] Connection Status:', connectionStatus);
    console.log('[SensorScreen] Connected Device:', connectedDevice?.name);
  }, [connectionStatus, connectedDevice]);

  // ==========================================
  // DATA COLLECTION
  // ==========================================
  const { 
    currentReading,          // Latest sensor reading
    readingCount,            // Total readings saved to DB
    averageHeartRate,        // Average HR for session
    averageSpO2,             // Average SpO2 for session
    maxHeartRate,            // Max HR recorded
    dataSourceWarning,       // Warning if connection issues
    forceFlush,              // Manually save buffered data
  } = useSensorDataCollection({
    workoutId: TEST_WORKOUT_ID,
    isActive: isCollecting,
    useMockData,
    realTimeData: sensorPayload,
    connectionStatus,
    onConnectionLost: () => {
      console.warn('[Test] Connection lost during data collection!');
      setIsCollecting(false);
    },
  });

  /** Show live BLE as soon as packets decode; collection view adds DB stats. */
  const displaySample = useMemo(() => {
    if (currentReading) return currentReading;
    if (connectionStatus === 'connected' && sensorPayload) return sensorPayload;
    return null;
  }, [currentReading, connectionStatus, sensorPayload]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleConnect = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      alert('Bluetooth permissions required');
      return;
    }
    setShowBLEPopup(true);
    startScan();
  };

  const handleStartCollecting = () => {
    if (connectionStatus !== 'connected' && !useMockData) {
      alert('Connect to device first or enable mock data');
      return;
    }
    setIsCollecting(true);
  };

  const handleStopCollecting = () => {
    setIsCollecting(false);
    forceFlush(); // Save any remaining buffered data
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <ScrollView style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
        <Ionicons name="flask" size={24} color="#4A90E2" />
        <Text style={styles.title}>Sensor Test Screen</Text>
      </View>

      {/* ========== CONNECTION STATUS ========== */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Connection Status</Text>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[
            styles.statusText,
            { color: connectionStatus === 'connected' ? '#4CAF50' : '#F44336' }
          ]}>
            {connectionStatus.toUpperCase()}
          </Text>
        </View>
        
        {connectedDevice && (
          <View style={styles.statusRow}>
            <Text style={styles.label}>Device:</Text>
            <Text style={styles.value}>{connectedDevice.name || 'Unknown'}</Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          {connectionStatus !== 'connected' ? (
            <Button title="Connect to Device" onPress={handleConnect} />
          ) : (
            <Button title="Disconnect" onPress={disconnect} color="#F44336" />
          )}
        </View>
      </View>

      {/* ========== DATA SOURCE TOGGLE ========== */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data Source</Text>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Using:</Text>
          <Text style={styles.value}>
            {useMockData ? '🎭 Mock Data' : '📡 Real Smartwatch Data'}
          </Text>
        </View>
        <Button 
          title={`Switch to ${useMockData ? 'Real' : 'Mock'} Data`}
          onPress={() => setUseMockData(!useMockData)}
        />
      </View>

      {/* ========== DATA WARNING ========== */}
      {dataSourceWarning && (
        <View style={styles.warningCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="warning" size={18} color="#FF9800" />
            <Text style={styles.warningText}>{dataSourceWarning}</Text>
          </View>
        </View>
      )}

      {/* ========== REAL-TIME DATA ========== */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Real-Time Data</Text>
        {displaySample ? (
          <>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Heart Rate:</Text>
              <Text style={styles.metricValue}>{displaySample.heartRate} bpm</Text>
            </View>
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>SpO2:</Text>
              <Text style={styles.metricValue}>{displaySample.spo2}%</Text>
            </View>
            
            {/* IMU Data (Debug) */}
            <Text style={styles.debugTitle}>IMU Data:</Text>
            <Text style={styles.debugText}>
              Accel: ({displaySample.imu.ax.toFixed(2)}, {displaySample.imu.ay.toFixed(2)}, {displaySample.imu.az.toFixed(2)})
            </Text>
            <Text style={styles.debugText}>
              Gyro: ({displaySample.imu.gx.toFixed(2)}, {displaySample.imu.gy.toFixed(2)}, {displaySample.imu.gz.toFixed(2)})
            </Text>
          </>
        ) : (
          <Text style={styles.noData}>
            {connectionStatus === 'connected'
              ? 'Waiting for sensor packets… (watch must stream CSV on Nordic UART TX)'
              : 'No data — connect to the watch first'}
          </Text>
        )}
      </View>

      {/* ========== STATISTICS ========== */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Session Statistics</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Readings Saved:</Text>
          <Text style={styles.statValue}>{readingCount}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Avg Heart Rate:</Text>
          <Text style={styles.statValue}>{averageHeartRate} bpm</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Max Heart Rate:</Text>
          <Text style={styles.statValue}>{maxHeartRate} bpm</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Avg SpO2:</Text>
          <Text style={styles.statValue}>{averageSpO2}%</Text>
        </View>
      </View>

      {/* ========== DATA COLLECTION CONTROLS ========== */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Data Collection</Text>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[
            styles.statusText,
            { color: isCollecting ? '#4CAF50' : '#9E9E9E' }
          ]}>
            {isCollecting ? 'COLLECTING' : 'STOPPED'}
          </Text>
        </View>

        <View style={styles.buttonRow}>
          {!isCollecting ? (
            <Button 
              title="Start Collecting Data" 
              onPress={handleStartCollecting}
              color="#4CAF50"
            />
          ) : (
            <Button 
              title="Stop Collecting" 
              onPress={handleStopCollecting}
              color="#F44336"
            />
          )}
        </View>

        {isCollecting && (
          <View style={styles.buttonRow}>
            <Button 
              title="Force Save Now" 
              onPress={forceFlush}
              color="#FF9800"
            />
          </View>
        )}
      </View>

      {/* ========== BLE POPUP ========== */}
      <BLEPopup 
  visible={showBLEPopup}
  onClose={() => setShowBLEPopup(false)}
  bleHook={{
    devices,
    connectedDevice,
    data,
    connectionStatus,
    error,
    isScanning,
    bluetoothState,
    requestPermissions,
    startScan,
    connectToDevice,
    disconnect,
    writeData,
  }}
/>
    </ScrollView>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  warningCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2C3E50',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonRow: {
    marginTop: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  metricLabel: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#95A5A6',
    marginTop: 12,
    marginBottom: 4,
  },
  debugText: {
    fontSize: 11,
    color: '#95A5A6',
    fontFamily: 'monospace',
  },
  noData: {
    fontSize: 14,
    color: '#95A5A6',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  statLabel: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
});