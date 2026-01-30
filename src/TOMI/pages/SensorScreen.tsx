// screens/SensorScreen.tsx
import useBLE from '../hooks/useBLE';
import { View, Text, Button } from 'react-native';
import { useSensorDataProcessor } from '../hooks/useSensorDataProcessor';
import { processSensorData } from '../utils/sensorProcessing';
import { SmartwatchSensorData } from '../models/SmartwatchSensorData'; // Use this
import { smartwatchBleConfig } from '@/config/SmartwatchBleConfig';

export default function SensorScreen() {
  const { data, connectionStatus, ...bleControls } = useBLE<SmartwatchSensorData>(smartwatchBleConfig);
  
  const { bufferSize, lastUpload, uploadStatus, forceUpload } = useSensorDataProcessor(
    data,
    {
      batchSize: 50,
      uploadInterval: 60000,
      processFunction: processSensorData,
    }
  );

  return (
    <View>
      <Text>Buffer: {bufferSize} readings</Text>
      <Text>Status: {uploadStatus}</Text>
      <Text>Heart Rate: {data?.heartRate} bpm</Text>
      <Text>SpO2: {data?.spo2}%</Text>
      <Button title="Force Upload" onPress={forceUpload} />
    </View>
  );
}