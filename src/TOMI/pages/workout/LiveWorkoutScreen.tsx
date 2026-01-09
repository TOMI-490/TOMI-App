import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import MapView, { Polyline, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { workoutService } from '../../services/resources/workout.service';
import { workoutTypeService } from '../../services/resources/workoutType.service';
import type { WorkoutTypeResponseDto } from '../../models/dto/WorkoutType.dto';
import { styles } from '../../styles/workout/liveWorkoutScreen.styles';

const MAP_WORKOUT_TYPES = ['Running', 'Walking', 'Cycling'];

interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
}

const LiveWorkoutScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const workoutId = Number(params.workoutId);
  const workoutTypeId = Number(params.workoutTypeId);

  const [workoutType, setWorkoutType] = useState<WorkoutTypeResponseDto | null>(null);
  const [workoutXp, setWorkoutXp] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [heartRate] = useState(72); // Mock for now
  const [distance, setDistance] = useState(0); // in km
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
  const [isEnding, setIsEnding] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    console.log('[LiveWorkout] 🏃 Component mounted');
    console.log('[LiveWorkout]   - Workout ID:', workoutId);
    console.log('[LiveWorkout]   - Workout Type ID:', workoutTypeId);
    loadWorkoutType();
    loadWorkoutXp();
    requestLocationPermission();
    startTimer();

    return () => {
      console.log('[LiveWorkout] 🛑 Component unmounting, cleaning up...');
      stopTimer();
      stopLocationTracking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (workoutType && hasLocationPermission) {
      if (MAP_WORKOUT_TYPES.includes(workoutType.name)) {
        setShowMap(true);
        startLocationTracking();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutType, hasLocationPermission]);

  const loadWorkoutType = async () => {
    try {
      console.log('[LiveWorkout] 📋 Loading workout type...');
      const type = await workoutTypeService.getById(workoutTypeId);
      console.log('[LiveWorkout] ✓ Workout type loaded:', type.name);
      setWorkoutType(type);
    } catch (error) {
      console.error('[LiveWorkout] ❌ Error loading workout type:', error);
    }
  };

  const loadWorkoutXp = async () => {
    try {
      console.log('[LiveWorkout] 🎯 Loading workout XP...');
      const workout = await workoutService.getWorkoutById(workoutId);
      console.log('[LiveWorkout] ✓ Workout XP loaded:', workout.xpAwarded);
      setWorkoutXp(workout.xpAwarded || null);
    } catch (error) {
      console.error('[LiveWorkout] ❌ Error loading workout XP:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setHasLocationPermission(true);
      } else {
        Alert.alert('Permission Denied', 'Location permission is required for map tracking.');
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const startLocationTracking = async () => {
    try {
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000, // Update every second
          distanceInterval: 1, // Update every meter
        },
        (location: Location.LocationObject) => {
          const newPoint: LocationPoint = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: Date.now(),
          };

          setCurrentLocation(newPoint);
          
          // Animate map to new location
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: newPoint.latitude,
              longitude: newPoint.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }, 1000);
          }
          
          setLocations((prev) => {
            const updated = [...prev, newPoint];
            // Calculate distance
            if (updated.length > 1) {
              const newDistance = calculateTotalDistance(updated);
              setDistance(newDistance);
            }
            return updated;
          });
        }
      );
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  };

  const calculateTotalDistance = (points: LocationPoint[]): number => {
    let total = 0;
    for (let i = 1; i < points.length; i++) {
      total += calculateDistance(points[i - 1], points[i]);
    }
    return total;
  };

  // Haversine formula to calculate distance between two points
  const calculateDistance = (point1: LocationPoint, point2: LocationPoint): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(point2.latitude - point1.latitude);
    const dLon = toRad(point2.longitude - point1.longitude);
    const lat1 = toRad(point1.latitude);
    const lat2 = toRad(point2.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (value: number): number => {
    return (value * Math.PI) / 180;
  };

  const startTimer = () => {
    timerInterval.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000) as unknown as NodeJS.Timeout;
  };

  const stopTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
  };

  const handlePauseResume = () => {
    if (isPaused) {
      startTimer();
      if (showMap) startLocationTracking();
    } else {
      stopTimer();
      if (showMap) stopLocationTracking();
    }
    setIsPaused(!isPaused);
  };

  const handleEndWorkout = async () => {
    Alert.alert(
      'End Workout',
      'Are you sure you want to end this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsEnding(true);
              stopTimer();
              stopLocationTracking();

              console.log('[LiveWorkout] 🏁 Ending workout...');
              console.log('[LiveWorkout]   - Workout ID:', workoutId);
              console.log('[LiveWorkout]   - Duration:', elapsedSeconds, 'seconds');
              console.log('[LiveWorkout]   - Distance:', distance.toFixed(2), 'km');

              // End workout via backend API (backend handles XP awarding)
              const { workout: endedWorkout, xpAwarded } = await workoutService.endWorkout(workoutId);
              console.log('[LiveWorkout] ✓ Workout ended successfully');
              console.log('[LiveWorkout]   - Start:', endedWorkout.start);
              console.log('[LiveWorkout]   - End:', endedWorkout.end);
              console.log('[LiveWorkout]   - XP Awarded:', xpAwarded);

              // Navigate to summary screen with replace to prevent back navigation
              console.log('[LiveWorkout] 📱 Navigating to summary screen...');
              router.replace({
                pathname: '/workout-summary',
                params: {
                  workoutId: workoutId.toString(),
                  distance: distance.toFixed(2),
                  xpAwarded: xpAwarded.toString(),
                },
              });
            } catch (error) {
              console.error('Error ending workout:', error);
              Alert.alert(
                'Error',
                'Failed to end workout. Please try again.',
                [
                  { text: 'Retry', onPress: () => handleEndWorkout() },
                  { text: 'Cancel', style: 'cancel' },
                ]
              );
            } finally {
              setIsEnding(false);
            }
          },
        },
      ]
    );
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!workoutType) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map Section */}
      {showMap && currentLocation ? (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            initialRegion={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            followsUserLocation={true}
            showsMyLocationButton={false}
          >
            {locations.length > 1 && (
              <Polyline
                coordinates={locations.map((loc) => ({
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                }))}
                strokeColor="#4A90E2"
                strokeWidth={4}
              />
            )}
          </MapView>
        </View>
      ) : (
        <View style={[styles.mapContainer, styles.noMapPlaceholder]}>
          <Text style={styles.noMapText}>🏃</Text>
          <Text style={styles.workoutTypeName}>{workoutType.name}</Text>
        </View>
      )}

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Time</Text>
            <Text style={styles.statValue}>{formatTime(elapsedSeconds)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Heart Rate</Text>
            <Text style={styles.statValue}>{heartRate} bpm</Text>
          </View>
        </View>

        {showMap && (
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Distance</Text>
              <Text style={styles.statValue}>{distance.toFixed(2)} km</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Pace</Text>
              <Text style={styles.statValue}>
                {elapsedSeconds > 0 && distance > 0
                  ? `${((elapsedSeconds / 60) / distance).toFixed(2)} min/km`
                  : '-- min/km'}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.statusRow}>
          <Text style={styles.statusText}>
            {isPaused ? '⏸ Paused' : '▶ Active'}
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, styles.pauseButton]}
          onPress={handlePauseResume}
          disabled={isEnding}
        >
          <Text style={styles.controlButtonText}>{isPaused ? 'Resume' : 'Pause'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.endButton]}
          onPress={handleEndWorkout}
          disabled={isEnding}
        >
          {isEnding ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.controlButtonText}>End Workout</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LiveWorkoutScreen;
