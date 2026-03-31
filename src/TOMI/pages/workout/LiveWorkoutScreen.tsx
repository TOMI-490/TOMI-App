import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import MapView, { Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from '../../locales/i18n';
import { workoutService } from '../../services/resources/workout.service';
import { workoutTypeService } from '../../services/resources/workoutType.service';
import { userAvatarService } from '../../services/resources/userAvatar.service';
import type { WorkoutTypeResponseDto } from '../../models/dto/WorkoutType.dto';
import type { UserAvatarResponseDto } from '../../models/dto/UserAvatar.dto';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { createLiveWorkoutStyles } from '../../styles/workout/liveWorkoutScreen.styles';
import { useTheme } from '../../contexts/ThemeContext';
import { useWorkoutBle } from '../../contexts/WorkoutBleContext';
import type { FlattenedBLEData } from '../../hooks/useBLE';
import { useSensorDataCollection } from '../../hooks/useSensorDataCollection';
import type { SmartwatchSensorData } from '../../models/smartwatchSensorData';
import BLEPopup from '../../components/ble/blePopup';

const MAP_WORKOUT_TYPES = ['Running', 'Walking', 'Cycling'];

interface IconDef { lib: 'Ionicons' | 'MCI' | 'FA5'; name: string; }

function getWorkoutIcon(typeName: string): IconDef {
  const l = typeName.toLowerCase();
  if (l.includes('run'))       return { lib: 'MCI', name: 'run' };
  if (l.includes('walk'))      return { lib: 'MCI', name: 'walk' };
  if (l.includes('cycl') || l.includes('bike')) return { lib: 'MCI', name: 'bike' };
  if (l.includes('swim'))      return { lib: 'MCI', name: 'swim' };
  if (l.includes('yoga'))      return { lib: 'MCI', name: 'yoga' };
  if (l.includes('strength') || l.includes('weight')) return { lib: 'Ionicons', name: 'barbell-outline' };
  if (l.includes('hiit') || l.includes('interval'))   return { lib: 'MCI', name: 'lightning-bolt' };
  if (l.includes('stretch'))   return { lib: 'MCI', name: 'human-handsup' };
  if (l.includes('box'))       return { lib: 'MCI', name: 'boxing-glove' };
  if (l.includes('dance'))     return { lib: 'MCI', name: 'music-note' };
  if (l.includes('row'))       return { lib: 'MCI', name: 'rowing' };
  return { lib: 'Ionicons', name: 'fitness-outline' };
}

function WIcon({ def, size, color }: { def: IconDef; size: number; color: string }) {
  if (def.lib === 'Ionicons') return <Ionicons name={def.name as any} size={size} color={color} />;
  if (def.lib === 'MCI')      return <MaterialCommunityIcons name={def.name as any} size={size} color={color} />;
  return <FontAwesome5 name={def.name as any} size={size} color={color} />;
}

interface LocationPoint { latitude: number; longitude: number; timestamp: number; }

const LiveWorkoutScreen: React.FC = () => {
  const router = useRouter();
  const { colors: T } = useTheme();
  const styles = useMemo(() => createLiveWorkoutStyles(T), [T]);
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const workoutId = Number(params.workoutId);
  const workoutTypeId = Number(params.workoutTypeId);
  const expectedXp = params.expectedXp ? Number(params.expectedXp) : 70;

  const { authId } = useAuth();
  const { user } = useCurrentUser(authId || undefined);

  const [workoutType, setWorkoutType] = useState<WorkoutTypeResponseDto | null>(null);
  const [avatarData, setAvatarData] = useState<UserAvatarResponseDto | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showBlePopup, setShowBlePopup] = useState(false);
  const [distance, setDistance] = useState(0);
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
  const [isEnding, setIsEnding] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapRef = useRef<MapView>(null);

  const ble = useWorkoutBle();

  const bleSensorPayload = useMemo((): SmartwatchSensorData | null => {
    if (!ble.data) return null;
    const { timestamp: _ts, ...sensor } = ble.data as FlattenedBLEData<SmartwatchSensorData>;
    return sensor;
  }, [ble.data]);

  const sensorActive = !isPaused && !isEnding;

  const { currentReading, dataSourceWarning, forceFlush } = useSensorDataCollection({
    workoutId,
    isActive: sensorActive,
    useMockData: false,
    realTimeData: bleSensorPayload,
    connectionStatus: ble.connectionStatus,
    onConnectionLost: () => {
      console.warn('[LiveWorkout] BLE connection lost during session');
    },
  });

  const heartRate =
    currentReading?.heartRate ?? bleSensorPayload?.heartRate ?? ble.data?.heartRate ?? null;
  const heartRateDisplay = heartRate != null && heartRate > 0 ? String(heartRate) : '—';

  useEffect(() => {
    loadWorkoutType();
    loadAvatar();
    requestLocationPermission();
    startTimer();
    return () => { stopTimer(); stopLocationTracking(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (workoutType && hasLocationPermission && MAP_WORKOUT_TYPES.includes(workoutType.name)) {
      setShowMap(true);
      startLocationTracking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutType, hasLocationPermission]);

  useEffect(() => {
    if (user && !avatarData) loadAvatar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadWorkoutType = async () => {
    try { setWorkoutType(await workoutTypeService.getById(workoutTypeId)); }
    catch (e) { console.error('[LiveWorkout] Error loading type:', e); }
  };

  const loadAvatar = async () => {
    try { if (user) setAvatarData(await userAvatarService.getByUserId(user.userId)); }
    catch (e) { console.error('[LiveWorkout] Error loading avatar:', e); }
  };

  const formatPace = (): string => {
    if (distance < 0.01 || elapsedSeconds <= 0) return '--';
    const p = (elapsedSeconds / 60) / distance;
    return p > 60 ? '--' : p.toFixed(1);
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') setHasLocationPermission(true);
    } catch (e) { console.error('Location permission error:', e); }
  };

  const startLocationTracking = async () => {
    try {
      locationSubscription.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 1 },
        (loc: Location.LocationObject) => {
          const pt: LocationPoint = { latitude: loc.coords.latitude, longitude: loc.coords.longitude, timestamp: Date.now() };
          setCurrentLocation(pt);
          mapRef.current?.animateToRegion({ ...pt, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 1000);
          setLocations(prev => {
            const updated = [...prev, pt];
            if (updated.length > 1) setDistance(calcDist(updated));
            return updated;
          });
        },
      );
    } catch (e) { console.error('Location tracking error:', e); }
  };

  const stopLocationTracking = () => { locationSubscription.current?.remove(); locationSubscription.current = null; };

  const calcDist = (pts: LocationPoint[]): number => {
    let total = 0;
    for (let i = 1; i < pts.length; i++) {
      const R = 6371;
      const dLat = ((pts[i].latitude - pts[i - 1].latitude) * Math.PI) / 180;
      const dLon = ((pts[i].longitude - pts[i - 1].longitude) * Math.PI) / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 *
        Math.cos((pts[i - 1].latitude * Math.PI) / 180) * Math.cos((pts[i].latitude * Math.PI) / 180);
      total += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    return total;
  };

  const startTimer = () => { timerInterval.current = setInterval(() => setElapsedSeconds(p => p + 1), 1000); };
  const stopTimer = () => { if (timerInterval.current) { clearInterval(timerInterval.current); timerInterval.current = null; } };

  const handlePauseResume = () => {
    if (isPaused) { startTimer(); if (showMap) startLocationTracking(); }
    else { stopTimer(); if (showMap) stopLocationTracking(); }
    setIsPaused(!isPaused);
  };

  const handleOpenBle = async () => {
    const ok = await ble.requestPermissions();
    if (!ok) {
      Alert.alert(t('workout.bluetoothRequired'), t('workout.blePermissionDenied'));
      return;
    }
    setShowBlePopup(true);
    ble.startScan();
  };

  const handleEndWorkout = () => {
    Alert.alert(t('workout.endWorkoutTitle'), t('workout.endWorkoutMessage'), [
      { text: t('workout.cancel'), style: 'cancel' },
      { text: t('workout.end'), style: 'destructive', onPress: async () => {
        try {
          setIsEnding(true); stopTimer(); stopLocationTracking();
          forceFlush();
          const prevLevel = avatarData?.level ?? 0;
          const { xpAwarded } = await workoutService.endWorkout(workoutId);
          router.replace({ pathname: '/workout-summary', params: {
            workoutId: workoutId.toString(), distance: distance.toFixed(2),
            xpAwarded: xpAwarded.toString(), previousLevel: prevLevel.toString(),
          }});
        } catch (e) {
          console.error('Error ending workout:', e);
          Alert.alert(t('workout.errorEndingTitle'), t('workout.errorEndingMessage'), [
            { text: t('workout.retry'), onPress: handleEndWorkout },
            { text: t('workout.cancel'), style: 'cancel' },
          ]);
        } finally { setIsEnding(false); }
      }},
    ]);
  };

  const pad = (n: number) => n.toString().padStart(2, '0');
  const hrs = Math.floor(elapsedSeconds / 3600);
  const mins = Math.floor((elapsedSeconds % 3600) / 60);
  const secs = elapsedSeconds % 60;
  const calories = Math.round((elapsedSeconds / 60) * 6.5);

  if (!workoutType) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color={T.primary} /></View>;
  }

  return (
    <View style={styles.screen}>

      {/* ── Header ─────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerIconBox}>
          <WIcon def={getWorkoutIcon(workoutType.name)} size={24} color={T.primary} />
        </View>
        <View>
          <Text style={styles.headerTitle}>{workoutType.name}</Text>
          <View style={styles.headerStatusRow}>
            <View style={[styles.statusDot, { backgroundColor: isPaused ? T.secondary : T.success }]} />
            <Text style={[styles.statusText, { color: isPaused ? T.secondary : T.success }]}>
              {isPaused ? 'Paused' : 'In Progress'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.bleRow}>
        <TouchableOpacity
          style={styles.bleChip}
          onPress={handleOpenBle}
          disabled={isEnding}
          activeOpacity={0.75}
        >
          <Ionicons
            name="bluetooth"
            size={16}
            color={ble.connectionStatus === 'connected' ? T.success : T.secondary}
          />
          <Text style={styles.bleChipText} numberOfLines={1}>
            {ble.connectionStatus === 'connected' && ble.connectedDevice
              ? ble.connectedDevice.name || t('workout.watchConnected')
              : t('workout.connectWatch')}
          </Text>
        </TouchableOpacity>
      </View>

      {dataSourceWarning ? (
        <View style={styles.bleWarning}>
          <Text style={styles.bleWarningText}>{dataSourceWarning}</Text>
        </View>
      ) : null}

      {/* ── Map ────────────────────────────────────────── */}
      <View style={styles.mapCard}>
        {showMap && currentLocation ? (
          <>
            <MapView
              ref={mapRef} style={styles.map} provider={PROVIDER_DEFAULT}
              initialRegion={{ ...currentLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
              showsUserLocation followsUserLocation showsMyLocationButton={false}
            >
              {locations.length > 1 && (
                <Polyline
                  coordinates={locations.map(l => ({ latitude: l.latitude, longitude: l.longitude }))}
                  strokeColor={T.danger} strokeWidth={4}
                />
              )}
            </MapView>
            <View style={styles.mapOverlay}>
              <View style={styles.mapPill}>
                <Ionicons name="location" size={14} color={T.success} />
                <View>
                  <Text style={styles.mapPillValue}>{distance.toFixed(2)}</Text>
                  <Text style={styles.mapPillUnit}>kilometers</Text>
                </View>
              </View>
              <View style={styles.mapPill}>
                <Ionicons name="heart" size={14} color={T.danger} />
                <View>
                  <Text style={styles.mapPillValue}>{heartRateDisplay}</Text>
                  <Text style={styles.mapPillUnit}>bpm</Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.noMapPlaceholder}>
            {avatarData?.animationActiveUrl ? (
              <Image source={{ uri: avatarData.animationActiveUrl }} style={styles.placeholderAvatar} resizeMode="contain" />
            ) : (
              <MaterialCommunityIcons name="dumbbell" size={48} color={T.textMuted} />
            )}
            <Text style={styles.placeholderTypeName}>{workoutType.name}</Text>
          </View>
        )}
      </View>

      {!(showMap && currentLocation) ? (
        <View style={styles.inlineHrRow}>
          <Ionicons name="heart" size={16} color={T.danger} />
          <View>
            <Text style={styles.inlineHrValue}>{heartRateDisplay}</Text>
            <Text style={styles.inlineHrUnit}>bpm</Text>
          </View>
        </View>
      ) : null}

      {/* ── Stats content ──────────────────────────────── */}
      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.contentScroll} showsVerticalScrollIndicator={false}>

          {/* Timer */}
          <View style={styles.timerCard}>
            <View style={styles.timerLabel}>
              <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.75)" />
              <Text style={styles.timerLabelText}>Elapsed Time</Text>
            </View>
            <View style={styles.timerRow}>
              <View style={styles.timerBlock}>
                <Text style={styles.timerDigit}>{pad(hrs)}</Text>
                <Text style={styles.timerUnit}>hrs</Text>
              </View>
              <Text style={styles.timerColon}>:</Text>
              <View style={styles.timerBlock}>
                <Text style={styles.timerDigit}>{pad(mins)}</Text>
                <Text style={styles.timerUnit}>min</Text>
              </View>
              <Text style={styles.timerColon}>:</Text>
              <View style={styles.timerBlock}>
                <Text style={styles.timerDigit}>{pad(secs)}</Text>
                <Text style={styles.timerUnit}>sec</Text>
              </View>
            </View>
          </View>

          {/* Calories + Pace + XP */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statCardIconBox, { backgroundColor: '#FDEAEA' }]}>
                <Ionicons name="flame" size={20} color="#F0545C" />
              </View>
              <Text style={styles.statCardLabel}>Calories</Text>
              <Text style={styles.statCardValue}>{calories}</Text>
              <Text style={styles.statCardUnit}>kcal burned</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statCardIconBox, { backgroundColor: T.primaryTint }]}>
                <MaterialCommunityIcons name="speedometer" size={20} color={T.primary} />
              </View>
              <Text style={styles.statCardLabel}>Pace</Text>
              <Text style={styles.statCardValue}>{formatPace()}</Text>
              <Text style={styles.statCardUnit}>min/km</Text>
            </View>
          </View>

          {/* XP row */}
          <View style={styles.xpRow}>
            <View style={styles.xpIconBox}>
              <MaterialCommunityIcons name="lightning-bolt" size={20} color={T.primary} />
            </View>
            <View>
              <Text style={styles.xpLabel}>XP Earned</Text>
              <Text style={styles.xpValue}>+{expectedXp}</Text>
            </View>
            <View style={styles.xpSpacer} />
            <View style={styles.xpBadge}>
              <MaterialCommunityIcons name="medal-outline" size={18} color={T.primary} />
            </View>
          </View>

        </ScrollView>
      </View>

      {/* ── Controls (pinned) ──────────────────────────── */}
      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.pauseBtn} onPress={handlePauseResume} disabled={isEnding} activeOpacity={0.8}>
          <Ionicons name={isPaused ? 'play' : 'pause'} size={20} color="#FFF" />
          <Text style={styles.pauseBtnText}>{isPaused ? 'Resume' : 'Pause'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.endBtn} onPress={handleEndWorkout} disabled={isEnding} activeOpacity={0.7}>
          {isEnding ? <ActivityIndicator color={T.danger} /> : <Ionicons name="stop" size={22} color={T.danger} />}
        </TouchableOpacity>
      </View>

      <BLEPopup visible={showBlePopup} onClose={() => setShowBlePopup(false)} bleHook={ble} />
    </View>
  );
};

export default LiveWorkoutScreen;
