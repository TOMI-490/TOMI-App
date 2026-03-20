import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from '../../locales/i18n';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { workoutService } from '../../services/resources/workout.service';
import { userAvatarService } from '../../services/resources/userAvatar.service';
import type { WorkoutSummaryDto } from '../../models/dto/Workout.dto';
import type { UserAvatarResponseDto } from '../../models/dto/UserAvatar.dto';
import { createWorkoutSummaryStyles } from '../../styles/workout/workoutSummaryScreen.styles';
import { avatarStateStore } from '../../utils/avatarStateStore';
import { invalidateUserCache } from '../../hooks/useCurrentUser';
import { invalidateDashboardCache } from '../../hooks/useDashboardData';
import { useTheme } from '../../contexts/ThemeContext';

const WorkoutSummaryScreen: React.FC = () => {
  const router = useRouter();
  const { colors: T } = useTheme();
  const styles = useMemo(() => createWorkoutSummaryStyles(T), [T]);
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const workoutId = Number(params.workoutId);
  const trackedDistance = params.distance ? Number(params.distance) : undefined;
  const xpAwarded = params.xpAwarded ? Number(params.xpAwarded) : undefined;
  const previousLevel = params.previousLevel ? Number(params.previousLevel) : 0;

  const { authId } = useAuth();
  const { user } = useCurrentUser(authId || undefined);

  const [summary, setSummary] = useState<WorkoutSummaryDto | null>(null);
  const [avatarData, setAvatarData] = useState<UserAvatarResponseDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAllData(); }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user && !avatarData) loadUserAvatar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [summaryData] = await Promise.all([
        workoutService.getWorkoutSummary(workoutId),
        user ? loadUserAvatar() : Promise.resolve(),
      ]);
      if (trackedDistance !== undefined) summaryData.distance = trackedDistance;
      if (xpAwarded !== undefined) summaryData.xp = xpAwarded;
      setSummary(summaryData);
    } catch (error) {
      console.error('[WorkoutSummary] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserAvatar = async () => {
    try {
      if (!user) return;
      const avatar = await userAvatarService.getByUserId(user.userId);
      setAvatarData(avatar);
    } catch (error) {
      console.error('[WorkoutSummary] Error loading avatar:', error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const formatTime = (dateString: string): string =>
    new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const formatPace = (): string => {
    if (!summary || !summary.distance || summary.distance < 0.01 || summary.duration <= 0) return '--';
    const pace = (summary.duration / 60) / summary.distance;
    if (pace > 60) return '--';
    const mins = Math.floor(pace);
    const secs = Math.round((pace - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDone = async () => {
    // Pass post-workout data so HomePage can display it instantly
    avatarStateStore.triggerPostWorkout({
      xpAwarded: summary?.xp ?? 0,
      newLevel: avatarData?.level ?? 0,
      previousLevel,
      totalXp: avatarData?.xp ?? 0,
    });
    // Invalidate caches so the next read fetches fresh data from the API
    invalidateUserCache();
    invalidateDashboardCache();
    await new Promise(resolve => setTimeout(resolve, 300));
    router.replace('/(tabs)');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={T.primary} />
        <Text style={styles.loadingText}>{t('workout.summaryLoading')}</Text>
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('workout.summaryError')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadAllData}>
          <Text style={styles.retryButtonText}>{t('workout.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const newLevel = avatarData?.level ?? 0;
  const leveledUp = previousLevel > 0 && newLevel > previousLevel;
  const xpProgress = avatarData?.xpProgress ?? 0;
  const currentXp = avatarData?.xp ?? 0;
  const nextLevelXp = avatarData?.nextLevelXp ?? 100;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Success Header ───────────────────────────── */}
        <View style={styles.headerContainer}>
          <View style={styles.successCircle}>
            <Ionicons name="checkmark" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.headerTitle}>Workout Complete!</Text>
          <Text style={styles.headerSubtitle}>{summary.workoutType.name}</Text>
        </View>

        {/* ── Primary Stats ────────────────────────────── */}
        <View style={styles.primaryRow}>
          <View style={styles.primaryStat}>
            <Text style={styles.primaryStatLabel}>Duration</Text>
            <Text style={styles.primaryStatValue}>{formatDuration(summary.duration)}</Text>
          </View>
          {summary.distance !== undefined && (
            <>
              <View style={styles.primaryDivider} />
              <View style={styles.primaryStat}>
                <Text style={styles.primaryStatLabel}>Distance</Text>
                <Text style={styles.primaryStatValue}>{summary.distance.toFixed(2)} km</Text>
              </View>
            </>
          )}
          <View style={styles.primaryDivider} />
          <View style={styles.primaryStat}>
            <Text style={styles.primaryStatLabel}>XP Earned</Text>
            <Text style={styles.primaryStatValue}>+{summary.xp || 0}</Text>
          </View>
        </View>

        {/* ── Stat Cards ───────────────────────────────── */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#FDEAEA' }]}>
              <Ionicons name="flame" size={22} color="#F0545C" />
            </View>
            <Text style={styles.statValue}>{summary.calories || 0}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#E8F1FD' }]}>
              <Ionicons name="time-outline" size={22} color="#4E9BE8" />
            </View>
            <Text style={styles.statValue}>{formatTime(summary.workout.start)}</Text>
            <Text style={styles.statLabel}>Start Time</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: T.primaryTint }]}>
              <MaterialCommunityIcons name="speedometer" size={22} color={T.primary} />
            </View>
            <Text style={styles.statValue}>{formatPace()}</Text>
            <Text style={styles.statLabel}>Avg Pace{'\n'}(min/km)</Text>
          </View>
        </View>

        {/* ── User Progress Card ───────────────────────── */}
        {avatarData && (
          <View style={styles.detailsCard}>
            <View style={styles.detailsHeader}>
              <MaterialCommunityIcons name="lightning-bolt" size={18} color={T.primary} />
              <Text style={styles.detailsTitle}>Your Progress</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Level</Text>
              <Text style={[styles.detailValue, leveledUp && { color: T.success }]}>
                {leveledUp ? `${previousLevel} → ${newLevel} (Level Up!)` : `${newLevel}`}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total XP</Text>
              <Text style={styles.detailValue}>{currentXp.toLocaleString()}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Next Level</Text>
              <Text style={styles.detailValue}>{nextLevelXp.toLocaleString()} XP</Text>
            </View>
            <View style={[styles.detailRow, styles.detailRowLast]}>
              <Text style={styles.detailLabel}>Progress</Text>
              <Text style={styles.detailValue}>{Math.round(xpProgress)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressBarFill, { width: `${Math.min(xpProgress, 100)}%` as any }]} />
            </View>
          </View>
        )}

        {/* ── Workout Details ──────────────────────────── */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Ionicons name="document-text-outline" size={18} color={T.primary} />
            <Text style={styles.detailsTitle}>Workout Details</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formatDate(summary.workout.start)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type</Text>
            <Text style={styles.detailValue}>{summary.workoutType.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Started</Text>
            <Text style={styles.detailValue}>{formatTime(summary.workout.start)}</Text>
          </View>
          <View style={[styles.detailRow, styles.detailRowLast]}>
            <Text style={styles.detailLabel}>Ended</Text>
            <Text style={styles.detailValue}>{summary.workout.end ? formatTime(summary.workout.end) : '--'}</Text>
          </View>
        </View>

        {/* ── Done Button ──────────────────────────────── */}
        <TouchableOpacity style={styles.doneBtn} onPress={handleDone} activeOpacity={0.8}>
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

export default WorkoutSummaryScreen;
