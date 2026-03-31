import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../locales/i18n';
import { createHistoryStyles } from '../../styles/history.styles';
import { useTheme } from '../../contexts/ThemeContext';
import { workoutService } from '../../services/resources/workout.service';
import type { WorkoutSummaryDto } from '../../models/dto/Workout.dto';

export default function WorkoutDetailScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const historyStyles = useMemo(() => createHistoryStyles(colors), [colors]);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [workout, setWorkout] = useState<WorkoutSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkoutDetail = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const workoutData = await workoutService.getWorkoutSummary(id);
      setWorkout(workoutData);
    } catch (err) {
      console.error('Error loading workout detail:', err);
      setError(t('history.errorLoadingWorkout'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    if (id) {
      loadWorkoutDetail();
    }
  }, [id, loadWorkoutDetail]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const handleBack = () => {
    router.back();
  };

  // Loading state
  if (loading) {
    return (
      <View style={historyStyles.detailContainer}>
        <View style={historyStyles.detailNavRow}>
          <TouchableOpacity style={historyStyles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={historyStyles.detailNavTitle}>{t('history.workoutDetail')}</Text>
          <View style={historyStyles.menuButton} />
        </View>
        <View style={historyStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={historyStyles.loadingText}>{t('history.loading')}</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error || !workout) {
    return (
      <View style={historyStyles.detailContainer}>
        <View style={historyStyles.detailNavRow}>
          <TouchableOpacity style={historyStyles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={historyStyles.detailNavTitle}>{t('history.workoutDetail')}</Text>
          <View style={historyStyles.menuButton} />
        </View>
        <View style={historyStyles.errorContainer}>
          <Text style={historyStyles.errorText}>{error || t('history.errorLoadingWorkout')}</Text>
          <TouchableOpacity style={historyStyles.retryButton} onPress={loadWorkoutDetail}>
            <Text style={historyStyles.retryButtonText}>{t('history.retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={historyStyles.detailContainer}>
      {/* Header */}
      <View style={historyStyles.detailNavRow}>
        <TouchableOpacity style={historyStyles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={historyStyles.detailNavTitle}>{t('history.workoutDetail')}</Text>
        <View style={historyStyles.menuButton} />
      </View>

      <ScrollView 
        style={historyStyles.detailContainer} 
        contentContainerStyle={historyStyles.detailScrollContent}
      >
        {/* Workout Header Card */}
        <View style={historyStyles.detailCard}>
          <View style={historyStyles.detailHeader}>
            <Text style={historyStyles.detailType}>{workout.workoutType.name}</Text>
            <Text style={historyStyles.detailDate}>{formatDate(workout.workout.start)}</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={historyStyles.detailCard}>
          <View style={historyStyles.detailStatsGrid}>
            <View style={historyStyles.detailStatItem}>
              <Text style={historyStyles.detailStatLabel}>{t('history.duration')}</Text>
              <Text style={historyStyles.detailStatValue}>{formatDuration(workout.duration)}</Text>
            </View>
            
            <View style={historyStyles.detailStatItem}>
              <Text style={historyStyles.detailStatLabel}>XP Earned</Text>
              <Text style={historyStyles.detailStatValue}>
                {workout.workout.xpAwarded || 0}
              </Text>
            </View>
            
            <View style={historyStyles.detailStatItem}>
              <Text style={historyStyles.detailStatLabel}>{t('history.calories')}</Text>
              <Text style={historyStyles.detailStatValue}>--</Text>
            </View>
            
            <View style={historyStyles.detailStatItem}>
              <Text style={historyStyles.detailStatLabel}>{t('history.avgHr')}</Text>
              <Text style={historyStyles.detailStatValue}>--</Text>
            </View>
            
            <View style={historyStyles.detailStatItem}>
              <Text style={historyStyles.detailStatLabel}>{t('history.exercises')}</Text>
              <Text style={historyStyles.detailStatValue}>--</Text>
            </View>
            
            <View style={historyStyles.detailStatItem}>
              <Text style={historyStyles.detailStatLabel}>Device</Text>
              <Text style={historyStyles.detailStatValue}>
                {workout.workout.deviceId}
              </Text>
            </View>
          </View>
        </View>

        {/* Workout Description */}
        <View style={historyStyles.detailCard}>
          <Text style={historyStyles.detailSectionTitle}>Description</Text>
          <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>
            {workout.workoutType.description || 'No description available'}
          </Text>
        </View>

        {/* Placeholder sections */}
        <View style={historyStyles.placeholderSection}>
          <Text style={historyStyles.sectionTitle}>Workout Timeline</Text>
          <View style={historyStyles.placeholderCard}>
            <Text style={historyStyles.placeholderText}>Exercise Timeline (Placeholder)</Text>
          </View>
        </View>

        <View style={historyStyles.placeholderSection}>
          <Text style={historyStyles.detailSectionTitle}>Heart Rate Zone</Text>
          <View style={historyStyles.placeholderCard}>
            <Text style={historyStyles.placeholderText}>HR Zone Chart (Placeholder)</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
