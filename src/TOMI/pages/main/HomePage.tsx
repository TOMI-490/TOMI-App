import React, { useCallback, useEffect, useRef, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useLanguage } from '../../hooks/useLanguage';
import { useDashboard } from '../../hooks/useDashboardData';
import { useGamification } from '../../hooks/useGamification';
import { useTomiEffects } from '../../hooks/useTomiEffects';
import { usePastWorkouts } from '../../hooks/usePastWorkouts';
import { useTranslation } from '../../locales/i18n';
import { GoalResponseDto } from '../../models/dto/Goal.dto';
import { StreakResponseDto } from '../../models/dto/Streak.dto';
import { WorkoutResponseDto } from '../../models/dto/Workout.dto';
import { NotificationResponseDto } from '../../models/dto/Notification.dto';
import { homePageStyles as styles } from '../../styles/home/homePage.styles';
import { getRelativeTime, getGreeting } from '../../utils/timeFormat';
import { avatarStateStore } from '../../utils/avatarStateStore';
import {
  ProgressRings,
  BadgesCard,
  LeaderboardPreviewCard,
  XpToast,
  LevelUpModal
} from '../../components/gamification';

type NeedIconDef =
  | { lib: 'Ionicons'; name: React.ComponentProps<typeof Ionicons>['name'] }
  | { lib: 'MaterialCommunityIcons'; name: React.ComponentProps<typeof MaterialCommunityIcons>['name'] };

interface TomiNeed {
  iconDef: NeedIconDef;
  label: string;
  status: 'good' | 'warning';
  value: number;
}

// Avatar animation states
type AvatarAnimState = 'idle' | 'active' | 'post_workout';

export default function HomePage() {
  const router = useRouter();
  const { authId } = useAuth();
  const { user } = useCurrentUser(authId || undefined);
  useLanguage(user);
  const { data, loading, error, refresh } = useDashboard(user);
  const { data: gamificationData, loading: gamificationLoading } = useGamification(user?.userId);
  const { workouts: pastWorkouts, loading: workoutsLoading } = usePastWorkouts(user?.userId, 5);
  const { t } = useTranslation();

  // Avatar animation state: idle → active on focus, post_workout after finishing a workout
  const [avatarState, setAvatarState] = useState<AvatarAnimState>('idle');
  const postWorkoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // TOMI effects for XP and level up animations
  const tomiEffects = useTomiEffects(data?.tomi);

  // Derive tomiData early so it's available for avatarGifUrl
  const tomiData = data?.tomi || null;

  // Track last refresh time to prevent rapid re-fetches
  const lastRefreshRef = useRef<number>(0);
  const MIN_REFRESH_INTERVAL = 2000; // 2 seconds minimum between refreshes

  // Resolve which GIF URL to show based on current avatar state
  const avatarGifUrl = useMemo(() => {
    if (!tomiData) return null;
    let url: string | null | undefined;
    switch (avatarState) {
      case 'post_workout': url = tomiData.animationPostWorkoutUrl || tomiData.animationActiveUrl || tomiData.animationIdleUrl; break;
      case 'active':       url = tomiData.animationActiveUrl || tomiData.animationIdleUrl; break;
      default:             url = tomiData.animationIdleUrl || tomiData.animationActiveUrl; break;
    }
    console.log('[HomePage] 🐾 Avatar GIF state:', avatarState, '→ URL:', url ?? 'null');
    return url ?? null;
  }, [tomiData, avatarState]);

  // Switch to active state when the home screen gains focus
  useFocusEffect(
    useCallback(() => {
      // Consume post-workout flag set by WorkoutSummaryScreen
      if (avatarStateStore.consumePostWorkout()) {
        setAvatarState('post_workout');
        if (postWorkoutTimerRef.current) clearTimeout(postWorkoutTimerRef.current);
        postWorkoutTimerRef.current = setTimeout(() => setAvatarState('active'), 8000);
      } else {
        setAvatarState(prev => prev === 'post_workout' ? prev : 'active');
      }
      return () => {
        // Return to idle when leaving the screen
        setAvatarState('idle');
      };
    }, [])
  );

  // Detect when a new workout was just completed (workouts list grew)
  const prevWorkoutCountRef = useRef<number>(0);
  useEffect(() => {
    const current = pastWorkouts.length;
    if (prevWorkoutCountRef.current > 0 && current > prevWorkoutCountRef.current) {
      // A new workout appeared — trigger post-workout celebration
      setAvatarState('post_workout');
      if (postWorkoutTimerRef.current) clearTimeout(postWorkoutTimerRef.current);
      postWorkoutTimerRef.current = setTimeout(() => setAvatarState('active'), 8000);
    }
    prevWorkoutCountRef.current = current;
  }, [pastWorkouts.length]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (postWorkoutTimerRef.current) clearTimeout(postWorkoutTimerRef.current);
    };
  }, []);

  // Memoize derived data to prevent unnecessary recalculations (must be before conditional returns)
  // Note: tomiData is declared above avatarGifUrl to avoid reference-before-declaration
  const dashboardMetrics = useMemo(() => {
    const streaks: StreakResponseDto[] = data?.streaks || [];
    const recentWorkouts: WorkoutResponseDto[] = data?.recentWorkouts || [];
    const notifications: NotificationResponseDto[] = [];
    
    // TODO: Implement activeGoal when goal endpoint includes nested goalStatus and goalType
    const activeGoal: GoalResponseDto | null = null;
    const workoutStreak = streaks.find((s) => s.metric === 'workout');
    const todayWorkouts = recentWorkouts.filter((w) => {
      const today = new Date().toDateString();
      const workoutDate = new Date(w.start).toDateString();
      return today === workoutDate;
    });

    const dailyGoalProgress = 0;
    const xpProgress = tomiData?.xpProgress ?? 0;
    const nextLevelXp = tomiData?.nextLevelXp ?? 100;

    const tomiNeeds: TomiNeed[] = tomiData ? [
      { iconDef: { lib: 'Ionicons', name: 'barbell-outline' }, label: t('home.needActivity'), status: 'good', value: 100 - (tomiData.boredomeLevel || 0) },
      { iconDef: { lib: 'MaterialCommunityIcons', name: 'food-fork-drink' }, label: t('home.needNutrition'), status: tomiData.hungerLevel > 70 ? 'warning' : 'good', value: 100 - (tomiData.hungerLevel || 0) },
      { iconDef: { lib: 'Ionicons', name: 'heart-outline' }, label: t('home.needHealth'), status: 'good', value: tomiData.happinessLevel || 0 },
      { iconDef: { lib: 'Ionicons', name: 'moon-outline' }, label: t('home.needRest'), status: tomiData.sleepinessLevel > 70 ? 'warning' : 'good', value: 100 - (tomiData.sleepinessLevel || 0) },
    ] : [
      { iconDef: { lib: 'Ionicons', name: 'barbell-outline' }, label: t('home.needActivity'), status: 'good', value: 50 },
      { iconDef: { lib: 'MaterialCommunityIcons', name: 'food-fork-drink' }, label: t('home.needNutrition'), status: 'good', value: 50 },
      { iconDef: { lib: 'Ionicons', name: 'heart-outline' }, label: t('home.needHealth'), status: 'good', value: 50 },
      { iconDef: { lib: 'Ionicons', name: 'moon-outline' }, label: t('home.needRest'), status: 'good', value: 50 },
    ];

    return {
      streaks,
      recentWorkouts,
      notifications,
      activeGoal,
      workoutStreak,
      todayWorkouts,
      dailyGoalProgress,
      xpProgress,
      nextLevelXp,
      tomiNeeds,
    };
  }, [data, tomiData, t]);

  // Refresh data when screen comes into focus (e.g., returning from workout)
  // Only refresh if enough time has passed since last refresh
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      const timeSinceLastRefresh = now - lastRefreshRef.current;
      
      if (user && timeSinceLastRefresh >= MIN_REFRESH_INTERVAL) {
        console.log('[HomePage] 🔄 Refreshing dashboard (last refresh:', timeSinceLastRefresh, 'ms ago)');
        lastRefreshRef.current = now;
        refresh();
      } else if (!user) {
        console.log('[HomePage] ⚠️ No user, skipping refresh');
      } else {
        console.log('[HomePage] ⏭️ Skipping refresh (too soon:', timeSinceLastRefresh, 'ms)');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.userId])
  );

  if (!user || loading) {
    return (
      <ScreenWrapper style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>{t('home.loading')}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (error || !data) {
    return (
      <ScreenWrapper style={styles.container}>
        <View style={styles.error}>
          <Text style={styles.errorText}>{error?.message || t('home.errorLoading')}</Text>
          <TouchableOpacity style={styles.button} onPress={refresh}>
            <Text style={styles.buttonText}>{t('home.retry')}</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  // Destructure metrics after early returns
  const { streaks, recentWorkouts, notifications, activeGoal, workoutStreak, todayWorkouts, dailyGoalProgress, xpProgress, nextLevelXp, tomiNeeds } = dashboardMetrics;

  const handleNeedPress = (need: TomiNeed, index: number) => {
    if (!tomiData) return;
    
    // Show interaction options for each need
    Alert.alert(
      t('home.needCareTitle').replace('{label}', need.label),
      t('home.needCareMessage').replace('{label}', need.label.toLowerCase()),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.yes'), 
          onPress: async () => {
            // TODO: Implement TOMI interaction logic when backend endpoints are available
            console.log('TOMI interaction:', need.label);
          }
        }
      ]
    );
  };

  return (
    <ScreenWrapper style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Greeting */}
        <Text style={styles.greeting}>{getGreeting(t)}</Text>

        {/* User Info */}
        <Text style={styles.subtitle}>{t('home.welcomeBack').replace('{name}', user?.name || 'User')}!</Text>

        {/* Notifications Badge */}
        {notifications.length > 0 && (
          <TouchableOpacity 
            style={styles.notificationBadge}
            onPress={() => console.log('Navigate to notifications')}
          >
            <Text style={styles.notificationText}>
              {notifications.length} new notification{notifications.length > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        )}

        {/* TOMI Card */}
        <View style={[
          styles.card,
          tomiData?.themeColor && { borderColor: tomiData.themeColor, borderWidth: 2 }
        ]}>
          {/* GIF + Info side-by-side */}
          <View style={styles.cardBody}>
            {/* Avatar GIF */}
            <View style={styles.avatar}>
              {avatarGifUrl ? (
                <Image
                  source={{ uri: avatarGifUrl }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="contain"
                  autoplay
                  onError={() => console.log('[HomePage] Avatar GIF failed to load:', avatarGifUrl)}
                />
              ) : null}
            </View>

            {/* Right column: name, level, XP bar, streak */}
            <View style={styles.cardInfo}>
              <Text style={styles.name}>
                {tomiData ? tomiData.nickname : t('home.yourTomi')}
              </Text>
              <Text style={styles.levelText}>
                {tomiData
                  ? t('home.levelStage').replace('{level}', tomiData.level.toString())
                  : 'Start your journey!'}
              </Text>

              {/* XP bar + label */}
              {tomiData && (
                <View style={styles.xpSection}>
                  <View style={styles.progressBar}>
                    <View style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(xpProgress, 100)}%`,
                        backgroundColor: tomiData.themeColor || '#007AFF',
                      },
                    ]} />
                  </View>
                  <Text style={styles.xpLabel}>
                    {tomiData.xp} / {nextLevelXp} XP
                  </Text>
                </View>
              )}

              {/* Streak pill */}
              {workoutStreak && workoutStreak.current > 0 && (
                <View style={styles.streakPill}>
                  <Ionicons name="flame" size={13} color="#FF6B35" />
                  <Text style={styles.streakPillText}>
                    {t('home.dayStreak').replace('{days}', workoutStreak.current.toString())}
                  </Text>
                </View>
              )}
            </View>
          </View>

        </View>

        {/* Daily Goal - Hidden until goal endpoint is available */}
        {activeGoal && false && (
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>
                Daily Goal
              </Text>
              <Text style={styles.goalValue}>
                0/0
              </Text>
            </View>
            <View style={styles.goalBar}>
              <View style={[styles.goalFill, { width: `${Math.min(dailyGoalProgress, 100)}%` }]} />
            </View>
            <Text style={styles.goalProgress}>
              {Math.round(dailyGoalProgress)}% complete
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(tabs)/workout')}
          >
            <Ionicons name="play-circle-outline" size={20} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.buttonText}>{t('home.startWorkout')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => router.push('/(tabs)/avatar')}
          >
            <Ionicons name="sparkles-outline" size={20} color="#007AFF" style={{ marginRight: 6 }} />
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
              {t('home.customize')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ===== GAMIFICATION FEATURES ===== */}
        
        {/* Progress Rings */}
        {gamificationData?.progressRings && gamificationData.progressRings.length > 0 && (
          <ProgressRings rings={gamificationData.progressRings} />
        )}

        {/* Badges (Earned + Upcoming) */}
        {gamificationData && (gamificationData.badgesEarned.length > 0 || gamificationData.badgesUpcoming.length > 0) && (
          <BadgesCard 
            earned={gamificationData.badgesEarned} 
            upcoming={gamificationData.badgesUpcoming}
          />
        )}

        {/* Leaderboard Preview */}
        {gamificationData?.leaderboards && gamificationData.leaderboards.length > 0 && (
          <LeaderboardPreviewCard leaderboards={gamificationData.leaderboards} />
        )}

        {/* Today's Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>{t('home.todaysProgress')}</Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{data.todayProgress?.workoutsCount || 0}</Text>
              <Text style={styles.statLabel}>{t('home.workouts')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{data.todayProgress?.minutes || 0}</Text>
              <Text style={styles.statLabel}>{t('home.minutes')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{data.todayProgress?.xpEarned || 0}</Text>
              <Text style={styles.statLabel}>{t('home.xpEarned')}</Text>
            </View>
          </View>
        </View>

        {/* Past Workouts Section */}
        <View style={styles.pastWorkoutsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.pastWorkouts')}</Text>
            {pastWorkouts.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
                <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {workoutsLoading ? (
            <View style={styles.workoutsLoadingContainer}>
              <Text style={styles.workoutsLoadingText}>{t('home.loading')}</Text>
            </View>
          ) : pastWorkouts.length === 0 ? (
            <View style={styles.noWorkoutsContainer}>
              <Text style={styles.noWorkoutsText}>{t('home.noWorkouts')}</Text>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.workoutCarousel}
              contentContainerStyle={styles.workoutCarouselContent}
              nestedScrollEnabled={true}
            >
              {pastWorkouts.map((workout) => (
                <View key={workout.workoutId} style={styles.pastWorkoutCard}>
                  <View style={styles.workoutDetails}>
                    <Text style={styles.workoutName}>{workout.workoutTypeName}</Text>
                    <Text style={styles.workoutTime}>{getRelativeTime(workout.start, t)}</Text>
                  </View>
                  
                  <View style={styles.workoutStats}>
                    <Text style={styles.workoutDurationBadge}>
                      {workout.durationMinutes} {t('home.min')}
                    </Text>
                    {workout.xpAwarded !== undefined && workout.xpAwarded !== null && (
                      <Text style={styles.workoutXpBadge}>
                        +{workout.xpAwarded} XP
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      {/* ===== TOMI EFFECTS ===== */}
      
      {/* XP Toast - shows when XP increases */}
      {tomiEffects.showXpToast && tomiEffects.xpDelta && (
        <XpToast 
          xpDelta={tomiEffects.xpDelta}
          visible={tomiEffects.showXpToast}
          onDismiss={tomiEffects.dismissXpToast}
        />
      )}

      {/* Level Up Modal - shows when level increases */}
      <LevelUpModal
        visible={tomiEffects.showLevelUpModal}
        level={tomiEffects.newLevel}
        onDismiss={tomiEffects.dismissLevelUpModal}
      />
    </ScreenWrapper>
  );
}
