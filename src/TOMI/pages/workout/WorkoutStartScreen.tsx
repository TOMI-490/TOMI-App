import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Device } from 'react-native-ble-plx';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../locales/i18n';
import { workoutTypeService } from '../../services/resources/workoutType.service';
import { workoutService } from '../../services/resources/workout.service';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useAuth } from '../../contexts/AuthContext';
import useBLE, { ConnectionStatus } from '../../hooks/useBLE';
import { smartwatchBleConfig } from '../../config/smartwatchBleConfig';
import type { WorkoutTypeResponseDto } from '../../models/dto/WorkoutType.dto';
import type { SmartwatchSensorData } from '../../models/SmartwatchSensorData';
import { styles } from '../../styles/workout/workoutStartScreen.styles';

type WorkoutIconDef =
  | { lib: 'Ionicons'; name: React.ComponentProps<typeof Ionicons>['name'] }
  | { lib: 'MaterialCommunityIcons'; name: React.ComponentProps<typeof MaterialCommunityIcons>['name'] }
  | { lib: 'FontAwesome5'; name: React.ComponentProps<typeof FontAwesome5>['name'] };

function getWorkoutIcon(typeName: string): WorkoutIconDef {
  const lower = typeName.toLowerCase();
  if (lower.includes('run'))      return { lib: 'MaterialCommunityIcons', name: 'run' };
  if (lower.includes('walk'))     return { lib: 'MaterialCommunityIcons', name: 'walk' };
  if (lower.includes('cycl') || lower.includes('bike')) return { lib: 'MaterialCommunityIcons', name: 'bike' };
  if (lower.includes('swim'))     return { lib: 'MaterialCommunityIcons', name: 'swim' };
  if (lower.includes('yoga'))     return { lib: 'MaterialCommunityIcons', name: 'yoga' };
  if (lower.includes('strength') || lower.includes('weight')) return { lib: 'Ionicons', name: 'barbell-outline' };
  if (lower.includes('hiit') || lower.includes('interval'))   return { lib: 'MaterialCommunityIcons', name: 'lightning-bolt' };
  if (lower.includes('stretch') || lower.includes('flex'))    return { lib: 'MaterialCommunityIcons', name: 'human-handsup' };
  if (lower.includes('box') || lower.includes('martial'))     return { lib: 'MaterialCommunityIcons', name: 'boxing-glove' };
  if (lower.includes('climb'))    return { lib: 'MaterialCommunityIcons', name: 'image-filter-hdr' };
  if (lower.includes('dance'))    return { lib: 'MaterialCommunityIcons', name: 'music-note' };
  if (lower.includes('row'))      return { lib: 'MaterialCommunityIcons', name: 'rowing' };
  if (lower.includes('ski'))      return { lib: 'FontAwesome5', name: 'skiing' };
  if (lower.includes('soccer') || lower.includes('football')) return { lib: 'Ionicons', name: 'football-outline' };
  if (lower.includes('basket'))   return { lib: 'Ionicons', name: 'basketball-outline' };
  if (lower.includes('tennis'))   return { lib: 'Ionicons', name: 'tennisball-outline' };
  // default
  return { lib: 'Ionicons', name: 'fitness-outline' };
}

function WorkoutIcon({ def, size, color }: { def: WorkoutIconDef; size: number; color: string }) {
  if (def.lib === 'Ionicons')               return <Ionicons name={def.name as any} size={size} color={color} />;
  if (def.lib === 'MaterialCommunityIcons') return <MaterialCommunityIcons name={def.name as any} size={size} color={color} />;
  return <FontAwesome5 name={def.name as any} size={size} color={color} />;
}

const WorkoutStartScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { authId } = useAuth();
  const { user, loading: userLoading } = useCurrentUser(authId || undefined);
  
  const [workoutTypes, setWorkoutTypes] = useState<WorkoutTypeResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<number | null>(null);
  const [workoutXpValues, setWorkoutXpValues] = useState<{ [key: number]: number }>({});
  const [bleCountdown, setBleCountdown] = useState<number | null>(null);
  const startingRef = useRef(false); // ref-based guard against double-tap
  const devicesRef = useRef<Device[]>([]);
  const connectionStatusRef = useRef<ConnectionStatus>('disconnected');
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize BLE
  const {
    requestPermissions, bluetoothState, startScan, connectToDevice,
    devices, connectionStatus, connectedDevice,
  } = useBLE<SmartwatchSensorData>(smartwatchBleConfig);

  // Keep refs in sync with BLE state (for use inside async callbacks)
  useEffect(() => { devicesRef.current = devices; }, [devices]);
  useEffect(() => { connectionStatusRef.current = connectionStatus; }, [connectionStatus]);

  // If the XIAO is already connected (e.g. paired via Sensor screen), auto-populate devices ref
  useEffect(() => {
    if (
      connectedDevice &&
      (connectedDevice.name ?? connectedDevice.localName ?? '').toUpperCase().includes('XIAO') &&
      !devicesRef.current.some((d) => d.id === connectedDevice.id)
    ) {
      devicesRef.current = [connectedDevice, ...devicesRef.current];
    }
  }, [connectedDevice]);

  useEffect(() => {
    loadWorkoutTypes();
  }, []);

  const loadWorkoutTypes = async () => {
    try {
      setLoading(true);
      const types = await workoutTypeService.getAll();
      setWorkoutTypes(types);
      
      // Generate random XP values for each workout type (5-49 XP)
      const xpValues: { [key: number]: number } = {};
      types.forEach(type => {
        xpValues[type.workoutTypeId] = Math.floor(Math.random() * 45) + 5; // 5-49
      });
      setWorkoutXpValues(xpValues);
    } catch (error) {
      console.error('Error loading workout types:', error);
      Alert.alert(t('common.error'), t('workout.errorLoadingTypes'));
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = async (workoutTypeId: number) => {
    // Ref-based guard: prevent double-tap before React state updates
    if (startingRef.current) return;

    if (!user) {
      Alert.alert(t('common.error'), t('workout.errorUserNotFound'));
      return;
    }

    try {
      startingRef.current = true;
      setStartingId(workoutTypeId);
      
      // Request Bluetooth permissions before starting workout
      console.log('[WorkoutStart] 📡 Requesting Bluetooth permissions...');
      const hasPermission = await requestPermissions();
      
      if (!hasPermission) {
        Alert.alert(
          t('workout.bluetoothRequired'),
          t('workout.bluetoothMessage'),
          [{ text: t('workout.ok') }]
        );
        setStartingId(null);
        return;
      }

      console.log('[WorkoutStart] ✓ Bluetooth permissions granted');
      console.log('[WorkoutStart] 📶 Bluetooth state (react):', bluetoothState);

      // Start BLE scan and wait up to 15 seconds to connect to the device
      const BLE_TIMEOUT_SECS = 15;
      console.log('[WorkoutStart] ─────────────────────────────────────');
      console.log('[WorkoutStart] 🔍 Starting BLE scan — 15s timeout begins NOW');
      console.log('[WorkoutStart] ─────────────────────────────────────');

      // Fast-path: if already connected to XIAO, skip the scan entirely
      if (connectionStatusRef.current === 'connected') {
        console.log('[WorkoutStart] ✅ Already connected to XIAO — skipping scan');
      } else {
        startScan();
      }

      setBleCountdown(BLE_TIMEOUT_SECS);
      const scanStartTime = Date.now();

      // Per-second countdown log
      countdownTimerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - scanStartTime) / 1000);
        const remaining = Math.max(0, BLE_TIMEOUT_SECS - elapsed);
        const devicesFound = devicesRef.current.length;
        const status = connectionStatusRef.current;
        console.log(
          `[WorkoutStart] ⏱  T+${elapsed}s | ${remaining}s remaining | devices: ${devicesFound} | status: ${status}`
        );
        setBleCountdown(remaining);
      }, 1000);

      const bleConnected = await new Promise<boolean>((resolve) => {
        let resolved = false;
        let connectAttempted = false;
        let poll: ReturnType<typeof setInterval>;

        const doResolve = (val: boolean) => {
          if (resolved) return;
          resolved = true;
          clearInterval(poll);
          clearTimeout(timer);
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          setBleCountdown(null);
          const elapsed = ((Date.now() - scanStartTime) / 1000).toFixed(1);
          console.log(`[WorkoutStart] ${val ? '✅' : '❌'} doResolve(${val}) at T+${elapsed}s`);
          resolve(val);
        };

        const timer = setTimeout(() => {
          console.log('[WorkoutStart] ⏰ 15s timeout fired — no device connected');
          doResolve(false);
        }, BLE_TIMEOUT_SECS * 1000);

        poll = setInterval(async () => {
          if (resolved) { clearInterval(poll); return; }

          if (connectionStatusRef.current === 'connected') {
            console.log('[WorkoutStart] 📶 Connection status is connected — resolving true');
            doResolve(true);
            return;
          }

          if (!connectAttempted && devicesRef.current.length > 0) {
            // Only connect to the XIAO device
            const xiaoDevice = devicesRef.current.find(
              (d) => (d.name ?? d.localName ?? '').toUpperCase().includes('XIAO')
            );
            if (!xiaoDevice) return; // keep polling until XIAO is found

            connectAttempted = true;
            console.log('[WorkoutStart] 📱 XIAO device found:', xiaoDevice.name ?? xiaoDevice.id, '— attempting connect...');
            try {
              await connectToDevice(xiaoDevice);
              console.log('[WorkoutStart] 🔗 connectToDevice resolved successfully');
              doResolve(true);
            } catch (e) {
              console.warn('[WorkoutStart] ⚠️  connectToDevice failed:', e);
              connectAttempted = false;
            }
          }
        }, 500);
      });

      if (!bleConnected) {
        Alert.alert(
          t('workout.bluetoothDeviceNotFound'),
          t('workout.bluetoothDeviceMessage'),
          [{ text: t('workout.ok') }]
        );
        setStartingId(null);
        return;
      }

      console.log('[WorkoutStart] ✅ BLE device connected, proceeding...');

      // Default device ID (you can make this dynamic if needed)
      const deviceId = 1;
      
      // Get the pre-generated XP for this workout type
      const xpAwarded = workoutXpValues[workoutTypeId];

      // Start workout via backend API with XP value
      const workout = await workoutService.startWorkout({
        userId: user.userId,
        workoutTypeId,
        deviceId,
        xpAwarded, // Send XP to backend
      });

      console.log('Workout started:', workout);

      // Navigate to live workout screen
      router.push({
        pathname: '/workout-live',
        params: {
          workoutId: workout.workoutId.toString(),
          workoutTypeId: workout.workoutTypeId.toString(),
        },
      });
    } catch (error) {
      console.error('Error starting workout:', error);
      Alert.alert(t('common.error'), t('workout.errorStarting'));
    } finally {
      startingRef.current = false;
      setStartingId(null);
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      setBleCountdown(null);
    }
  };

  const handleQuickStart = () => {
    // Quick start with first available workout type (or default to Running)
    const defaultType = workoutTypes.find(t => t.name === 'Running') || workoutTypes[0];
    if (defaultType) {
      handleStartWorkout(defaultType.workoutTypeId);
    }
  };

  if (loading || userLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>{t('workout.loadingTypes')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Quick Start Card */}
      <View style={styles.quickStartCard}>
        <Text style={styles.quickStartTitle}>{t('workout.quickStart')}</Text>
        <TouchableOpacity
          style={styles.quickStartButton}
          onPress={handleQuickStart}
          disabled={startingId !== null || workoutTypes.length === 0}
        >
          {startingId !== null ? (
            <>
              <ActivityIndicator color="#FFF" />
              {bleCountdown !== null && (
                <Text style={{ color: '#FFF', fontSize: 13, marginLeft: 8 }}>
                  {bleCountdown}s
                </Text>
              )}
            </>
          ) : (
            <>
              <Ionicons name="play" size={20} color="#FFF" />
              <Text style={styles.quickStartButtonText}>{t('workout.startWorkout')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Sensor Test Button */}
      <View style={styles.section}>
        <TouchableOpacity
          style={{
            backgroundColor: '#2C2C3E',
            borderRadius: 12,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
          onPress={() => router.push('/(tabs)/workout/sensor')}
        >
          <Ionicons name="bluetooth" size={22} color="#4A90E2" />
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600' }}>
            Sensor / BLE Test
          </Text>
        </TouchableOpacity>
      </View>

      {/* Choose Workout Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('workout.chooseType')}</Text>
        <View style={styles.grid}>
          {workoutTypes.map((type) => (
            <View
              key={type.workoutTypeId}
              style={styles.workoutCard}
            >
              <View style={styles.iconPlaceholder}>
                <WorkoutIcon def={getWorkoutIcon(type.name)} size={30} color="#4A90E2" />
              </View>
              <Text style={styles.workoutName}>{type.name}</Text>
              <View style={styles.xpBadge}>
                <Text style={styles.xpBadgeText}>+{workoutXpValues[type.workoutTypeId] || 0} XP</Text>
              </View>
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => handleStartWorkout(type.workoutTypeId)}
                disabled={startingId !== null}
              >
                {startingId === type.workoutTypeId ? (
                  <>
                    <ActivityIndicator size="small" color="#FFF" />
                    {bleCountdown !== null && (
                      <Text style={{ color: '#FFF', fontSize: 12, marginLeft: 6 }}>
                        {bleCountdown}s
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={styles.startButtonText}>{t('workout.start')}</Text>
                )}
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default WorkoutStartScreen;
