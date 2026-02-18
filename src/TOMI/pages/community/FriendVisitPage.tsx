import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useLanguage } from '../../hooks/useLanguage';
import { useTranslation } from '../../locales/i18n';
import { communityService } from '../../services/community';
import { friendProfileStyles as styles } from '../../styles/friendProfile.styles';
import type { 
  FriendDashboardSummary,
  FriendRecentWorkout 
} from '../../models/dto/Community.dto';

export default function FriendVisitPage() {
  const router = useRouter();
  const { friendId } = useLocalSearchParams<{ friendId: string }>();
  const { authId } = useAuth();
  const { user } = useCurrentUser(authId || undefined);
  useLanguage(user);
  const { t } = useTranslation();

  const [dashboardSummary, setDashboardSummary] = useState<FriendDashboardSummary | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<FriendRecentWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (user && friendId) {
      loadFriendData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId, friendId]);

  const loadFriendData = async () => {
    if (!user || !friendId) return;

    try {
      setLoading(true);
      setError(null);

      // Load dashboard summary and recent workouts in parallel
      const [summaryData, workoutsData] = await Promise.all([
        communityService.getFriendDashboardSummary(user.userId, parseInt(friendId, 10)),
        communityService.getFriendRecentWorkouts(user.userId, parseInt(friendId, 10), 5)
      ]);

      setDashboardSummary(summaryData);
      setRecentWorkouts(workoutsData.items);
    } catch (err: any) {
      console.error('[FriendVisitPage] Error loading data:', err);
      setError(err.message || t('community.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = () => {
    if (!dashboardSummary) return;

    Alert.alert(
      t('friendProfile.removeConfirmTitle'),
      t('friendProfile.removeConfirmBody').replace('{name}', dashboardSummary.displayName),
      [
        {
          text: t('common.cancel'),
          style: 'cancel'
        },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: confirmRemoveFriend
        }
      ]
    );
  };

  const confirmRemoveFriend = async () => {
    if (!user || !friendId) return;

    try {
      setRemoving(true);
      await communityService.removeFriend(user.userId, parseInt(friendId, 10));
      
      // Navigate back and refresh friends list
      Alert.alert(
        t('common.success'),
        t('friendProfile.removeSuccess'),
        [{ text: t('common.yes'), onPress: () => router.back() }]
      );
    } catch (err: any) {
      console.error('[FriendVisitPage] Error removing friend:', err);
      Alert.alert(
        t('common.error'),
        err.message || t('friendProfile.removeError')
      );
    } finally {
      setRemoving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}${t('history.min')} ${t('home.ago')}`;
    } else if (diffHours < 24) {
      return `${diffHours}h ${t('home.ago')}`;
    } else if (diffDays < 7) {
      return `${diffDays}d ${t('home.ago')}`;
    }
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <ScreenWrapper style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>{t('community.loading')}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (error || !dashboardSummary) {
    return (
      <ScreenWrapper style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || t('community.errorLoading')}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadFriendData}>
            <Text style={styles.retryButtonText}>{t('community.retry')}</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={styles.container}>
      {/* Unified Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('friendProfile.title')}</Text>
        <TouchableOpacity 
          style={styles.removeButton} 
          onPress={handleRemoveFriend}
          disabled={removing}
        >
          <Text style={styles.removeButtonText}>
            {removing ? t('common.loading') : t('friendProfile.removeFriend')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Buddy Card: Dashboard-Style Friend Summary */}
        <View style={[
          styles.buddyCard,
          dashboardSummary.themeColor && { borderColor: dashboardSummary.themeColor, borderWidth: 2 }
        ]}>
          {/* XP Progress Bar */}
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill, 
              { 
                width: `${Math.min(dashboardSummary.xp.progress, 100)}%`,
                backgroundColor: dashboardSummary.themeColor || '#007AFF'
              }
            ]} />
          </View>
          
          {/* Avatar Circle */}
          <View style={[
            styles.buddyAvatar,
            { backgroundColor: dashboardSummary.themeColor || '#8E8E93' }
          ]}>
            {dashboardSummary.avatarImageUrl && !dashboardSummary.avatarImageUrl.includes('example.com') ? (
              <Image 
                source={{ uri: dashboardSummary.avatarImageUrl }} 
                style={{ width: '100%', height: '100%', borderRadius: 50 }}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.buddyAvatarInitials}>
                {getInitials(dashboardSummary.displayName)}
              </Text>
            )}
          </View>
          
          {/* Identity */}
          <View style={styles.buddyIdentity}>
            <Text style={styles.buddyName}>{dashboardSummary.avatarNickname}</Text>
            <Text style={styles.buddySubtitle}>
              {t('friendProfile.viewingFriend').replace('{name}', dashboardSummary.displayName)}
            </Text>
            <Text style={styles.buddyLevel}>
              {t('home.levelStage').replace('{level}', dashboardSummary.level.toString())}
            </Text>
            <Text style={styles.buddyXpText}>
              {t('friendProfile.xpProgress')
                .replace('{current}', dashboardSummary.xp.currentXp.toString())
                .replace('{total}', dashboardSummary.xp.nextLevelXp.toString())}
            </Text>
          </View>

          {/* Streak Badge */}
          {dashboardSummary.streak.days > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakIcon}>🔥</Text>
              <Text style={styles.streakText}>
                {t('friendProfile.streakDays').replace('{days}', dashboardSummary.streak.days.toString())}
              </Text>
            </View>
          )}

          {/* This Week Stats */}
          <View style={styles.thisWeekSection}>
            <Text style={styles.thisWeekTitle}>{t('friendProfile.thisWeek')}</Text>
            <View style={styles.thisWeekGrid}>
              <View style={styles.thisWeekStat}>
                <Text style={styles.thisWeekValue}>{dashboardSummary.thisWeek.workoutsCount}</Text>
                <Text style={styles.thisWeekLabel}>{t('home.workouts')}</Text>
              </View>
              <View style={styles.thisWeekStat}>
                <Text style={styles.thisWeekValue}>{dashboardSummary.thisWeek.minutesTotal}</Text>
                <Text style={styles.thisWeekLabel}>{t('home.minutes')}</Text>
              </View>
              <View style={styles.thisWeekStat}>
                <Text style={styles.thisWeekValue}>{dashboardSummary.thisWeek.xpTotal}</Text>
                <Text style={styles.thisWeekLabel}>{t('home.totalXP')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Workouts Section (Max 5) */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>{t('friendProfile.recentWorkouts')}</Text>
            {recentWorkouts.length > 3 && (
              <TouchableOpacity onPress={() => {/* TODO: Navigate to full workouts list */}}>
                <Text style={styles.sectionHeaderAction}>{t('common.seeAll')}</Text>
              </TouchableOpacity>
            )}
          </View>
          {recentWorkouts.length > 0 ? (
            <View style={styles.workoutsList}>
              {recentWorkouts.slice(0, 3).map((workout) => (
                <View key={workout.id} style={styles.workoutCard}>
                  <View style={styles.workoutHeader}>
                    <Text style={styles.workoutType}>{workout.type}</Text>
                    <Text style={styles.workoutDate}>{formatDate(workout.startedAt)}</Text>
                  </View>
                  <View style={styles.workoutStats}>
                    <View style={styles.workoutStat}>
                      <Text style={styles.workoutStatLabel}>{t('history.duration')}</Text>
                      <Text style={styles.workoutStatValue}>{workout.durationMinutes} {t('history.min')}</Text>
                    </View>
                    {workout.xpEarned !== undefined && (
                      <View style={styles.workoutStat}>
                        <Text style={styles.workoutStatLabel}>XP</Text>
                        <Text style={styles.workoutStatValue}>{workout.xpEarned}</Text>
                      </View>
                    )}
                    {workout.calories !== undefined && (
                      <View style={styles.workoutStat}>
                        <Text style={styles.workoutStatLabel}>{t('history.calories')}</Text>
                        <Text style={styles.workoutStatValue}>{workout.calories}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyWorkouts}>
              <Text style={styles.emptyWorkoutsText}>{t('friendProfile.noRecentWorkouts')}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
