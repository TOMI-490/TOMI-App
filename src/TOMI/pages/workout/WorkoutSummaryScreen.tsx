import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from '../../locales/i18n';
import { workoutService } from '../../services/resources/workout.service';
import type { WorkoutSummaryDto } from '../../models/dto/Workout.dto';
import { styles } from '../../styles/workout/workoutSummaryScreen.styles';
import { avatarStateStore } from '../../utils/avatarStateStore';

const WorkoutSummaryScreen: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const workoutId = Number(params.workoutId);
  const trackedDistance = params.distance ? Number(params.distance) : undefined;
  const xpAwarded = params.xpAwarded ? Number(params.xpAwarded) : undefined;

  const [summary, setSummary] = useState<WorkoutSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[WorkoutSummary] 📊 Component mounted');
    console.log('[WorkoutSummary]   - Workout ID:', workoutId);
    console.log('[WorkoutSummary]   - Tracked Distance:', trackedDistance);
    console.log('[WorkoutSummary]   - XP Awarded:', xpAwarded);
    
    loadWorkoutSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadWorkoutSummary = async () => {
    try {
      setLoading(true);
      console.log('[WorkoutSummary] 🔄 Loading workout summary...');
      
      const data = await workoutService.getWorkoutSummary(workoutId);
      console.log('[WorkoutSummary] ✓ Summary loaded');
      console.log('[WorkoutSummary]   - Duration:', data.duration, 'seconds');
      console.log('[WorkoutSummary]   - Calories:', data.calories);
      console.log('[WorkoutSummary]   - XP (calculated):', data.xp);
      console.log('[WorkoutSummary]   - Distance:', data.distance);
      
      // If distance was tracked during workout, use that value
      if (trackedDistance !== undefined) {
        console.log('[WorkoutSummary] 📍 Using tracked distance:', trackedDistance, 'km');
        data.distance = trackedDistance;
      }
      
      // If XP was awarded during workout end, use that value
      if (xpAwarded !== undefined) {
        console.log('[WorkoutSummary] 🎯 Using awarded XP:', xpAwarded);
        data.xp = xpAwarded;
      }
      
      setSummary(data);
    } catch (error) {
      console.error('[WorkoutSummary] ❌ Error loading workout summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDone = async () => {
    console.log('[WorkoutSummary] ✅ Done button pressed');
    console.log('[WorkoutSummary] 📱 Navigating to home page...');
    console.log('[WorkoutSummary]   - XP earned:', summary?.xp || 0);
    
    // Signal HomePage to play post-workout GIF before navigating
    avatarStateStore.triggerPostWorkout();

    // Small delay to ensure backend updates are committed
    console.log('[WorkoutSummary] ⏳ Waiting for database updates to complete...');
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('[WorkoutSummary] ✓ Ready to navigate');
    
    // Navigate to main/home page and reset navigation stack
    router.replace('/(tabs)');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>{t('workout.summaryLoading')}</Text>
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('workout.summaryError')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadWorkoutSummary}>
          <Text style={styles.retryButtonText}>{t('workout.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Success Header */}
      <View style={styles.header}>
        <Ionicons name="checkmark-circle" size={60} color="#34C759" style={{ marginBottom: 10 }} />
        <Text style={styles.title}>{t('workout.summaryComplete')}</Text>
        <Text style={styles.subtitle}>{summary.workoutType.name}</Text>
      </View>

      {/* Primary Stats */}
      <View style={styles.primaryStats}>
        <View style={styles.primaryStat}>
          <Text style={styles.primaryStatLabel}>{t('workout.summaryDuration')}</Text>
          <Text style={styles.primaryStatValue}>{formatDuration(summary.duration)}</Text>
        </View>

        {summary.distance !== undefined && (
          <View style={styles.primaryStat}>
            <Text style={styles.primaryStatLabel}>{t('workout.summaryDistance')}</Text>
            <Text style={styles.primaryStatValue}>{summary.distance.toFixed(2)} km</Text>
          </View>
        )}

        <View style={styles.primaryStat}>
          <Text style={styles.primaryStatLabel}>{t('workout.summaryXpEarned')}</Text>
          <Text style={styles.primaryStatValue}>+{summary.xp || 0}</Text>
        </View>
      </View>

      {/* Secondary Stats */}
      <View style={styles.secondaryStats}>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={30} color="#FF6B35" style={{ marginBottom: 8 }} />
          <Text style={styles.statCardValue}>{summary.calories || 0}</Text>
          <Text style={styles.statCardLabel}>{t('workout.summaryCalories')}</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="time-outline" size={30} color="#4A90E2" style={{ marginBottom: 8 }} />
          <Text style={styles.statCardValue}>{formatTime(summary.workout.start)}</Text>
          <Text style={styles.statCardLabel}>{t('workout.summaryStartTime')}</Text>
        </View>

        {summary.distance !== undefined && summary.duration > 0 && (
          <View style={styles.statCard}>
            <Ionicons name="speedometer-outline" size={30} color="#4A90E2" style={{ marginBottom: 8 }} />
            <Text style={styles.statCardValue}>
              {((summary.duration / 60) / summary.distance).toFixed(2)}
            </Text>
            <Text style={styles.statCardLabel}>{t('workout.summaryAvgPace')}</Text>
          </View>
        )}
      </View>

      {/* Workout Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>{t('workout.summaryDetailsTitle')}</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('workout.summaryDate')}</Text>
          <Text style={styles.detailValue}>{formatDate(summary.workout.start)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('workout.summaryType')}</Text>
          <Text style={styles.detailValue}>{summary.workoutType.name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('workout.summaryStarted')}</Text>
          <Text style={styles.detailValue}>{formatTime(summary.workout.start)}</Text>
        </View>
        {summary.workout.end && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('workout.summaryEnded')}</Text>
            <Text style={styles.detailValue}>{formatTime(summary.workout.end)}</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>{t('workout.done')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default WorkoutSummaryScreen;
