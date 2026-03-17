import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from '../../locales/i18n';
import { workoutService } from '../../services/resources/workout.service';
import type { WorkoutSummaryDto } from '../../models/dto/Workout.dto';
import { styles } from '../../styles/workout/workoutSummaryScreen.styles';
import { avatarStateStore } from '../../utils/avatarStateStore';

const DISTANCE_WORKOUT_TYPES = ['Running', 'Walking', 'Cycling'];
const STEP_WORKOUT_TYPES = ['Running', 'Walking'];

const WorkoutSummaryScreen: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();

  const workoutId        = Number(params.workoutId);
  const trackedDistance  = params.distance ? Number(params.distance) : undefined;
  const xpAwarded        = params.xpAwarded ? Number(params.xpAwarded) : undefined;
  const workoutTypeName  = params.workoutTypeName as string ?? '';

  // Sensor summary params
  const avg_hr   = params.avg_hr   ? Number(params.avg_hr)   : null;
  const min_hr   = params.min_hr   ? Number(params.min_hr)   : null;
  const max_hr   = params.max_hr   ? Number(params.max_hr)   : null;
  const avg_spo2 = params.avg_spo2 ? Number(params.avg_spo2) : null;
  const min_spo2 = params.min_spo2 ? Number(params.min_spo2) : null;
  const max_spo2 = params.max_spo2 ? Number(params.max_spo2) : null;
  const steps    = params.steps    ? Number(params.steps)    : null;

  const showSteps    = STEP_WORKOUT_TYPES.includes(workoutTypeName);
  const showDistance = DISTANCE_WORKOUT_TYPES.includes(workoutTypeName);

  const [summary, setSummary] = useState<WorkoutSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkoutSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadWorkoutSummary = async () => {
    try {
      setLoading(true);
      const data = await workoutService.getWorkoutSummary(workoutId);

      if (trackedDistance !== undefined) data.distance = trackedDistance;
      if (xpAwarded !== undefined) data.xp = xpAwarded;

      setSummary(data);
    } catch (error) {
      console.error('[WorkoutSummary] ❌ Error loading workout summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hrs  = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0)  return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleDone = async () => {
    avatarStateStore.triggerPostWorkout();
    await new Promise(resolve => setTimeout(resolve, 500));
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

      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="checkmark-circle" size={60} color="#34C759" style={{ marginBottom: 10 }} />
        <Text style={styles.title}>{t('workout.summaryComplete')}</Text>
        <Text style={styles.subtitle}>{summary.workoutType.name}</Text>
      </View>

      {/* Primary Stats — duration, distance, XP */}
      <View style={styles.primaryStats}>
        <View style={styles.primaryStat}>
          <Text style={styles.primaryStatLabel}>{t('workout.summaryDuration')}</Text>
          <Text style={styles.primaryStatValue}>{formatDuration(summary.duration)}</Text>
        </View>

        {showDistance && summary.distance !== undefined && (
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

      {/* Heart Rate Card */}
      {avg_hr !== null && (
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>
            <Ionicons name="heart" size={16} color="#FF3B30" /> {t('workout.summaryHeartRate')}
          </Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('workout.summaryAvgHR')}</Text>
            <Text style={styles.detailValue}>{avg_hr} bpm</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('workout.summaryMinHR')}</Text>
            <Text style={styles.detailValue}>{min_hr} bpm</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('workout.summaryMaxHR')}</Text>
            <Text style={styles.detailValue}>{max_hr} bpm</Text>
          </View>
        </View>
      )}

      {/* SpO2 Card */}
      {avg_spo2 !== null && (
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>
            <Ionicons name="water" size={16} color="#4A90E2" /> {t('workout.summarySpo2')}
          </Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('workout.summaryAvgSpo2')}</Text>
            <Text style={styles.detailValue}>{avg_spo2}%</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('workout.summaryMinSpo2')}</Text>
            <Text style={styles.detailValue}>{min_spo2}%</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('workout.summaryMaxSpo2')}</Text>
            <Text style={styles.detailValue}>{max_spo2}%</Text>
          </View>
        </View>
      )}

      {/* Secondary Stats — calories, pace, steps */}
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

        {showDistance && summary.distance !== undefined && summary.duration > 0 && (
          <View style={styles.statCard}>
            <Ionicons name="speedometer-outline" size={30} color="#4A90E2" style={{ marginBottom: 8 }} />
            <Text style={styles.statCardValue}>
              {((summary.duration / 60) / summary.distance).toFixed(2)}
            </Text>
            <Text style={styles.statCardLabel}>{t('workout.summaryAvgPace')}</Text>
          </View>
        )}

        {showSteps && steps !== null && (
          <View style={styles.statCard}>
            <Ionicons name="footsteps-outline" size={30} color="#34C759" style={{ marginBottom: 8 }} />
            <Text style={styles.statCardValue}>{steps}</Text>
            <Text style={styles.statCardLabel}>{t('workout.summarySteps')}</Text>
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