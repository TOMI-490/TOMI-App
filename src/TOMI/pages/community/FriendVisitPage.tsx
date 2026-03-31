import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useLanguage } from '../../hooks/useLanguage';
import { useTranslation, i18n } from '../../locales/i18n';
import { communityService } from '../../services/community';
import { userAvatarService } from '../../services/resources/userAvatar.service';
import { useTheme } from '../../contexts/ThemeContext';
import { createFriendProfileStyles } from '../../styles/friendProfile.styles';
import type { UserAvatarResponseDto } from '../../models/dto/UserAvatar.dto';
import type { 
  FriendDashboardSummary,
  FriendRecentWorkout 
} from '../../models/dto/Community.dto';

export default function FriendVisitPage() {
  const router = useRouter();
  const { colors: T } = useTheme();
  const styles = useMemo(() => createFriendProfileStyles(T), [T]);
  const { friendId } = useLocalSearchParams<{ friendId: string }>();
  const { authId } = useAuth();
  const { user } = useCurrentUser(authId || undefined);
  useLanguage(user);
  const { t } = useTranslation();

  const [dashboardSummary, setDashboardSummary] = useState<FriendDashboardSummary | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<FriendRecentWorkout[]>([]);
  const [friendAvatar, setFriendAvatar] = useState<UserAvatarResponseDto | null>(null);
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
      setError(null);
      if (!dashboardSummary) setLoading(true);

      const [summaryData, workoutsData, avatarData] = await Promise.all([
        communityService.getFriendDashboardSummary(user.userId, parseInt(friendId, 10)),
        communityService.getFriendRecentWorkouts(user.userId, parseInt(friendId, 10), 5),
        userAvatarService.getByUserId(parseInt(friendId, 10)).catch(() => null),
      ]);

      setDashboardSummary(summaryData);
      setRecentWorkouts(workoutsData.items);
      setFriendAvatar(avatarData);
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
        [{ text: t('common.ok'), onPress: () => router.back() }]
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

  /** Readable date for workout rows (not raw ISO). */
  const formatWorkoutDate = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    const loc = i18n.locale === 'fr' ? 'fr-FR' : 'en-US';
    return date.toLocaleDateString(loc, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const minLabel = t('home.min');

  if (loading) {
    return (
      <ScreenWrapper style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={T.secondary} />
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
          
          {/* Avatar */}
          {friendAvatar?.animationActiveUrl && (
            <Image
              source={{ uri: friendAvatar.animationActiveUrl }}
              style={styles.buddyAvatar}
              contentFit="contain"
              autoplay
            />
          )}
          
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
              <Ionicons name="flame" size={16} color={T.primary} style={{ marginRight: 4 }} />
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
            {recentWorkouts.length > 5 && (
              <TouchableOpacity onPress={() => { /* future: full list */ }} activeOpacity={0.7}>
                <Text style={styles.sectionHeaderAction}>{t('common.seeAll')}</Text>
              </TouchableOpacity>
            )}
          </View>
          {recentWorkouts.length > 0 ? (
            <View style={styles.workoutsList}>
              {recentWorkouts.map((workout) => {
                const cals = workout.calories;
                const hasCals = cals != null && cals > 0;
                return (
                  <View key={workout.id} style={styles.workoutCard}>
                    <View style={styles.workoutHeader}>
                      <Text style={styles.workoutType}>{workout.type}</Text>
                      <Text style={styles.workoutDate}>{formatWorkoutDate(workout.startedAt)}</Text>
                    </View>
                    <View style={styles.workoutStats}>
                      <View style={styles.workoutStat}>
                        <View style={styles.workoutStatLabelRow}>
                          <Ionicons name="time-outline" size={12} color={T.textMuted} />
                          <Text style={styles.workoutStatLabel}>{t('history.duration')}</Text>
                        </View>
                        <Text style={styles.workoutStatValue}>
                          {workout.durationMinutes} {minLabel}
                        </Text>
                      </View>
                      <View style={styles.workoutStat}>
                        <View style={styles.workoutStatLabelRow}>
                          <Ionicons name="flash-outline" size={12} color={T.textMuted} />
                          <Text style={styles.workoutStatLabel}>{t('avatar.xpLabel')}</Text>
                        </View>
                        <Text style={styles.workoutStatValue}>{workout.xpEarned ?? 0}</Text>
                      </View>
                      <View style={styles.workoutStat}>
                        <View style={styles.workoutStatLabelRow}>
                          <Ionicons name="flame-outline" size={12} color={T.textMuted} />
                          <Text style={styles.workoutStatLabel}>{t('history.calories')}</Text>
                        </View>
                        <Text
                          style={[
                            styles.workoutStatValue,
                            !hasCals && styles.workoutStatValueMuted,
                          ]}
                        >
                          {hasCals ? Math.round(cals).toLocaleString() : '—'}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
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
