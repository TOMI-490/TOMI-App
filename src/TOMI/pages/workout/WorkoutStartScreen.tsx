import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { workoutTypeService } from '../../services/resources/workoutType.service';
import { workoutService } from '../../services/resources/workout.service';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useDashboard } from '../../hooks/useDashboardData';
import { useAuth } from '../../contexts/AuthContext';
import type { WorkoutTypeResponseDto } from '../../models/dto/WorkoutType.dto';
import { styles } from '../../styles/workout/workoutStartScreen.styles';

const WorkoutStartScreen: React.FC = () => {
  const router = useRouter();
  const { authId } = useAuth();
  const { user, loading: userLoading } = useCurrentUser(authId || undefined);
  const { data: dashboardData } = useDashboard(user);
  
  const [workoutTypes, setWorkoutTypes] = useState<WorkoutTypeResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [workoutXpValues, setWorkoutXpValues] = useState<{ [key: number]: number }>({});

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
      Alert.alert('Error', 'Failed to load workout types');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = async (workoutTypeId: number) => {
    if (!user) {
      Alert.alert('Error', 'User not found. Please log in.');
      return;
    }

    try {
      setStarting(true);
      
      // Default device ID (you can make this dynamic if needed)
      const deviceId = 1;
      
      // Get the pre-generated random XP for this workout type
      const xpAwarded = workoutXpValues[workoutTypeId];

      // Start workout via backend API with random XP value
      const workout = await workoutService.startWorkout({
        userId: user.userId,
        workoutTypeId,
        deviceId,
        xpAwarded,
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
      Alert.alert('Error', 'Failed to start workout. Please try again.');
    } finally {
      setStarting(false);
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
        <Text style={styles.loadingText}>Loading workout types...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Quick Start Card */}
      <View style={styles.quickStartCard}>
        <Text style={styles.quickStartTitle}>Quick Start</Text>
        <TouchableOpacity
          style={styles.quickStartButton}
          onPress={handleQuickStart}
          disabled={starting || workoutTypes.length === 0}
        >
          {starting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.playIcon}>▶</Text>
              <Text style={styles.quickStartButtonText}>Start Workout</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Choose Workout Type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Workout Type</Text>
        <View style={styles.grid}>
          {workoutTypes.map((type) => (
            <TouchableOpacity
              key={type.workoutTypeId}
              style={styles.workoutCard}
              onPress={() => handleStartWorkout(type.workoutTypeId)}
              disabled={starting}
            >
              <View style={styles.iconPlaceholder}>
                <Text style={styles.iconText}>🏃</Text>
              </View>
              <Text style={styles.workoutName}>{type.name}</Text>
              <View style={styles.xpBadge}>
                <Text style={styles.xpBadgeText}>+{workoutXpValues[type.workoutTypeId] || 0} XP</Text>
              </View>
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => handleStartWorkout(type.workoutTypeId)}
                disabled={starting}
              >
                <Text style={styles.startButtonText}>Start</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default WorkoutStartScreen;
