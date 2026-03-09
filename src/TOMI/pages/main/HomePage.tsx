/**
 * HomeScreen — High-Fidelity UI
 *
 * Sections (top to bottom):
 *  1. Greeting pill + headline
 *  2. Stats grid (Level · Streak · XP)
 *  3. Avatar Living-Room card + mood indicators
 *  4. Start Workout CTA
 *  5. Daily Challenges (Supabase: daily_quests)
 *  6. Achievements Preview (Supabase: achievements)
 *  7. Rewards Shop CTA
 *
 * All existing hooks and overlay effects (XpToast, LevelUpModal) are preserved.
 * Daily quests and achievements come from the new useHomeQuests hook.
 */

import React, {
  useCallback, useEffect, useRef, useMemo, useState,
} from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useLanguage } from '../../hooks/useLanguage';
import { useDashboard } from '../../hooks/useDashboardData';
import { useTomiEffects } from '../../hooks/useTomiEffects';
import { usePastWorkouts } from '../../hooks/usePastWorkouts';
import { useHomeQuests } from '../../hooks/useHomeQuests';
import { useTranslation } from '../../locales/i18n';
import { StreakResponseDto } from '../../models/dto/Streak.dto';
import { homePageStyles as styles } from '../../styles/home/homePage.styles';
import { TOMI_THEME as T } from '../../constants/theme';
import { avatarStateStore } from '../../utils/avatarStateStore';
import { XpToast, LevelUpModal } from '../../components/gamification';
import { DailyQuest, Achievement } from '../../services/resources/homeScreen.service';

/* ---------------------------------------------------------------------------
   Icon registry
   --------------------------------------------------------------------------- */
type IconDef =
  | { lib: 'Ionicons'; name: React.ComponentProps<typeof Ionicons>['name'] }
  | { lib: 'MaterialCommunityIcons'; name: React.ComponentProps<typeof MaterialCommunityIcons>['name'] };

const ICON_REGISTRY: Record<string, IconDef> = {
  trophy:   { lib: 'Ionicons', name: 'trophy' },
  flame:    { lib: 'Ionicons', name: 'flame' },
  star:     { lib: 'Ionicons', name: 'star' },
  heart:    { lib: 'Ionicons', name: 'heart' },
  barbell:  { lib: 'Ionicons', name: 'barbell' },
  run:      { lib: 'MaterialCommunityIcons', name: 'run' },
  dumbbell: { lib: 'MaterialCommunityIcons', name: 'dumbbell' },
  medal:    { lib: 'MaterialCommunityIcons', name: 'medal' },
  zap:      { lib: 'MaterialCommunityIcons', name: 'lightning-bolt' },
  default:  { lib: 'Ionicons', name: 'star-outline' },
};

function RegistryIcon({ name, size, color }: { name?: string; size: number; color: string }) {
  const def = (name && ICON_REGISTRY[name]) || ICON_REGISTRY.default;
  if (def.lib === 'Ionicons') {
    return <Ionicons name={def.name as React.ComponentProps<typeof Ionicons>['name']} size={size} color={color} />;
  }
  return (
    <MaterialCommunityIcons
      name={def.name as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
      size={size}
      color={color}
    />
  );
}

/* ---------------------------------------------------------------------------
   Helpers
   --------------------------------------------------------------------------- */
function getGreetingLabel(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  return [0, 2, 4].map(i => parseInt(h.substring(i, i + 2), 16)).join(',');
}

function resolveQuestColor(token: string): string {
  return ({ primary: T.primary, secondary: T.secondary, warning: T.warning, success: T.success, danger: T.danger } as Record<string, string>)[token] ?? T.primary;
}

/* ---------------------------------------------------------------------------
   Skeleton block
   --------------------------------------------------------------------------- */
function SkeletonBlock({ height, width = '100%' }: { height: number; width?: string | number }) {
  const opacity = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 0.9,  duration: 750, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.45, duration: 750, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View style={[styles.skeletonLine, { height, width: width as number, opacity }]} />;
}

function QuestSkeleton() {
  return (
    <View style={styles.skeletonCard} accessible accessibilityLabel="Loading">
      <SkeletonBlock height={16} width="70%" />
      <SkeletonBlock height={10} width="40%" />
      <SkeletonBlock height={8} />
    </View>
  );
}

function AchievementSkeleton({ itemWidth }: { itemWidth: string }) {
  const opacity = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 0.9,  duration: 750, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.45, duration: 750, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return (
    <Animated.View style={[styles.achievementCard, styles.achievementCardUnlocked, { width: itemWidth as unknown as number, opacity }]} accessible accessibilityLabel="Loading">
      <View style={[styles.achievementIconBox, styles.achievementIconBoxLocked]} />
      <View style={[styles.skeletonLineShort, { alignSelf: 'center' }]} />
    </Animated.View>
  );
}

/* ---------------------------------------------------------------------------
   QuestCard
   --------------------------------------------------------------------------- */
function QuestCard({ quest }: { quest: DailyQuest }) {
  const pct         = quest.max_value > 0 ? Math.min(quest.progress / quest.max_value, 1) : 0;
  const accentColor = resolveQuestColor(quest.color_token);
  const iconBg      = `rgba(${hexToRgb(accentColor)},0.18)`;

  return (
    <View style={styles.questCard}>
      <View style={[styles.questIconBox, { backgroundColor: iconBg }]}>
        <RegistryIcon name={quest.icon_name} size={22} color={accentColor} />
      </View>
      <View style={styles.questContent}>
        <View style={styles.questTitleRow}>
          <Text style={styles.questTitle} numberOfLines={1}>{quest.title}</Text>
          <View style={styles.questXpChip}>
            <Ionicons name="flash" size={11} color={T.warning} />
            <Text style={styles.questXpText}>+{quest.xp_reward}</Text>
          </View>
        </View>
        <Text style={styles.questProgressText}>{quest.progress} / {quest.max_value}</Text>
        <View style={styles.questBarTrack}>
          <View style={[styles.questBarFill, { width: `${pct * 100}%` as any, backgroundColor: quest.completed ? T.success : accentColor }]} />
        </View>
      </View>
    </View>
  );
}

/* ---------------------------------------------------------------------------
   AchievementCard
   --------------------------------------------------------------------------- */
function AchievementCard({ achievement, itemWidth }: { achievement: Achievement; itemWidth: string }) {
  const iconColor = achievement.unlocked ? resolveQuestColor(achievement.color_token) : T.textMuted;
  return (
    <View style={[styles.achievementCard, achievement.unlocked ? styles.achievementCardUnlocked : styles.achievementCardLocked, { width: itemWidth as unknown as number }]}>
      <View style={[styles.achievementIconBox, achievement.unlocked ? styles.achievementIconBoxUnlocked : styles.achievementIconBoxLocked]}>
        <RegistryIcon name={achievement.icon_name} size={20} color={iconColor} />
      </View>
      <Text style={styles.achievementLabel} numberOfLines={2}>{achievement.name}</Text>
    </View>
  );
}

/* ---------------------------------------------------------------------------
   Avatar animation state
   --------------------------------------------------------------------------- */
type AvatarAnimState = 'idle' | 'active' | 'post_workout';

/* ===========================================================================
   HomePage — main component
   =========================================================================== */
export default function HomePage() {
  const router     = useRouter();
  const { authId } = useAuth();
  const { user }   = useCurrentUser(authId || undefined);
  useLanguage(user);

  const { data, loading, error, refresh } = useDashboard(user);
  const { workouts: pastWorkouts }        = usePastWorkouts(user?.userId, 5);
  const { dailyQuests, achievements, loading: questsLoading, error: questsError } = useHomeQuests(user?.userId);
  const { t } = useTranslation();

  /* Avatar animation */
  const [avatarState, setAvatarState]   = useState<AvatarAnimState>('idle');
  const postWorkoutTimerRef             = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tomiEffects                     = useTomiEffects(data?.tomi);
  const tomiData                        = data?.tomi ?? null;

  const avatarGifUrl = useMemo(() => {
    if (!tomiData) return null;
    switch (avatarState) {
      case 'post_workout': return tomiData.animationPostWorkoutUrl || tomiData.animationActiveUrl || tomiData.animationIdleUrl;
      case 'active':       return tomiData.animationActiveUrl || tomiData.animationIdleUrl;
      default:             return tomiData.animationIdleUrl || tomiData.animationActiveUrl;
    }
  }, [tomiData, avatarState]);

  useFocusEffect(useCallback(() => {
    if (avatarStateStore.consumePostWorkout()) {
      setAvatarState('post_workout');
      if (postWorkoutTimerRef.current) clearTimeout(postWorkoutTimerRef.current);
      postWorkoutTimerRef.current = setTimeout(() => setAvatarState('active'), 8000);
    } else {
      setAvatarState(prev => (prev === 'post_workout' ? prev : 'active'));
    }
    return () => { setAvatarState('idle'); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []));

  const prevWorkoutCountRef = useRef<number>(0);
  const lastRefreshRef      = useRef<number>(0);

  useEffect(() => {
    const current = pastWorkouts.length;
    if (prevWorkoutCountRef.current > 0 && current > prevWorkoutCountRef.current) {
      setAvatarState('post_workout');
      if (postWorkoutTimerRef.current) clearTimeout(postWorkoutTimerRef.current);
      postWorkoutTimerRef.current = setTimeout(() => setAvatarState('active'), 8000);
    }
    prevWorkoutCountRef.current = current;
  }, [pastWorkouts.length]);

  useEffect(() => () => { if (postWorkoutTimerRef.current) clearTimeout(postWorkoutTimerRef.current); }, []);

  useFocusEffect(useCallback(() => {
    const now = Date.now();
    if (user && now - lastRefreshRef.current >= 2000) { lastRefreshRef.current = now; refresh(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]));

  /* Derived data */
  const { workoutStreak, nextLevelXp } = useMemo(() => {
    const streaks: StreakResponseDto[] = data?.streaks ?? [];
    return { workoutStreak: streaks.find(s => s.metric === 'workout'), nextLevelXp: tomiData?.nextLevelXp ?? 100 };
  }, [data, tomiData]);

  /* Start Workout press animation */
  const startBtnScale   = useRef(new Animated.Value(1)).current;
  const onStartPressIn  = () => Animated.spring(startBtnScale, { toValue: 0.975, useNativeDriver: true }).start();
  const onStartPressOut = () => Animated.spring(startBtnScale, { toValue: 1,     useNativeDriver: true }).start();

  /* Loading / Error */
  if (!user || loading) {
    return (
      <ScreenWrapper style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t('home.loading')}</Text>
      </ScreenWrapper>
    );
  }
  if (error || !data) {
    return (
      <ScreenWrapper style={styles.errorContainer}>
        <Text style={styles.errorText}>{error?.message || t('home.errorLoading')}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refresh} accessibilityRole="button">
          <Text style={styles.retryBtnText}>{t('home.retry')}</Text>
        </TouchableOpacity>
      </ScreenWrapper>
    );
  }

  const ACHI_W = '22%';

  /* =========================================================================
     RENDER
     ========================================================================= */
  return (
    <ScreenWrapper style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Section 1 — Greeting */}
        <View>
          <View style={styles.greetingPill}>
            <Text style={styles.greetingPillText}>{getGreetingLabel()}</Text>
          </View>
          <Text style={styles.greetingTitle}>Hey {user.name || 'there'}!</Text>
          <Text style={styles.greetingSubtitle}>{"Let's crush your goals today"}</Text>
        </View>

        <View style={styles.sectionGap} />

        {/* Section 2 — Stats Grid */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: T.warningTint }]}>
              <Ionicons name="trophy" size={20} color={T.warning} />
            </View>
            <Text style={styles.statValue}>{tomiData?.level ?? 0}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: T.dangerTint }]}>
              <Ionicons name="flame" size={20} color={T.danger} />
            </View>
            <Text style={styles.statValue}>{workoutStreak?.current ?? 0}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: T.primaryTint }]}>
              <MaterialCommunityIcons name="lightning-bolt" size={22} color={T.primary} />
            </View>
            <Text style={styles.statValue}>{tomiData?.xp ?? 0}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
        </View>

        <View style={styles.sectionGap} />

        {/* Section 3 — Avatar Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCardGlassOverlay} pointerEvents="none" />
          <View style={styles.avatarCardInner}>

            {/* Header */}
            <View style={styles.avatarCardHeader}>
              <View>
                <Text style={styles.avatarName}>{tomiData?.nickname ?? 'Your TOMI'}</Text>
                <Text style={styles.avatarSubtitle}>Tap avatar to customize</Text>
              </View>
              <View style={styles.xpPill}>
                <Text style={styles.xpPillLabel}>Level Progress</Text>
                <Text style={styles.xpPillValue}>{tomiData?.xp ?? 0}/{nextLevelXp} XP</Text>
              </View>
            </View>

            {/* Living-room scene */}
            <View style={styles.livingRoom}>
              <View style={styles.roomSkyTop} pointerEvents="none" />
              <View style={styles.roomFloor} pointerEvents="none" />
              <View style={styles.roomWindow} pointerEvents="none">
                <View style={styles.windowPane} /><View style={styles.windowPane} />
                <View style={styles.windowPane} /><View style={styles.windowPane} />
              </View>
              <View style={styles.roomSofa} pointerEvents="none">
                <MaterialCommunityIcons name="sofa" size={32} color={T.primary} />
              </View>
              <View style={styles.roomLampContainer} pointerEvents="none">
                <View style={styles.roomLampShade}>
                  <Ionicons name="bulb" size={16} color={T.warning} />
                </View>
                <View style={styles.roomLampPole} />
                <View style={styles.roomTable} />
                <View style={styles.roomTableBase} />
              </View>
              <View style={styles.roomCoffeeCup} pointerEvents="none">
                <Ionicons name="cafe" size={16} color="#92400e" />
              </View>
              <TouchableOpacity
                style={styles.avatarTouchable}
                onPress={() => router.push('/(tabs)/avatar')}
                activeOpacity={0.90}
                accessibilityRole="button"
                accessibilityLabel={`Customize ${tomiData?.nickname ?? 'TOMI'}`}
              >
                <View style={styles.avatarCircle}>
                  {avatarGifUrl ? (
                    <Image source={{ uri: avatarGifUrl }} style={{ width: 102, height: 102 }} contentFit="contain" autoplay />
                  ) : (
                    <Ionicons name="sparkles" size={48} color="#FFF" />
                  )}
                </View>
                <View style={styles.avatarShadowPlatform} />
              </TouchableOpacity>
            </View>

            {/* XP bar */}
            <View style={styles.xpBarTrack}>
              <View style={[styles.xpBarFill, { width: `${Math.min(((tomiData?.xp ?? 0) / Math.max(nextLevelXp, 1)) * 100, 100)}%` as any, backgroundColor: tomiData?.themeColor ?? T.secondary }]} />
            </View>

            {/* Mood indicators */}
            <View style={styles.moodGrid}>
              <View style={styles.moodCard}>
                <View style={styles.moodLabelRow}>
                  <Ionicons name="heart" size={14} color={T.success} />
                  <Text style={styles.moodLabel}>Happiness</Text>
                </View>
                <Text style={[styles.moodValue, { color: T.success }]}>{100 - (tomiData?.hungerLevel ?? 0)}%</Text>
              </View>
              <View style={styles.moodCard}>
                <View style={styles.moodLabelRow}>
                  <MaterialCommunityIcons name="lightning-bolt" size={14} color={T.secondary} />
                  <Text style={styles.moodLabel}>Energy</Text>
                </View>
                <Text style={[styles.moodValue, { color: T.secondary }]}>{100 - (tomiData?.sleepinessLevel ?? 0)}%</Text>
              </View>
            </View>

          </View>
        </View>

        <View style={styles.sectionGap} />

        {/* Section 4 — Start Workout CTA */}
        <Animated.View style={{ transform: [{ scale: startBtnScale }] }}>
          <TouchableOpacity
            style={styles.startWorkoutBtn}
            onPress={() => router.push('/(tabs)/workout')}
            onPressIn={onStartPressIn}
            onPressOut={onStartPressOut}
            activeOpacity={1}
            accessibilityRole="button"
            accessibilityLabel="Start Workout"
          >
            <View style={styles.startWorkoutGloss} pointerEvents="none" />
            <View style={styles.startWorkoutLeft}>
              <Text style={styles.startWorkoutLabel}>Ready to move?</Text>
              <Text style={styles.startWorkoutTitle}>Start Workout</Text>
            </View>
            <View style={styles.startWorkoutIconBox}>
              <Ionicons name="play" size={28} color="#FFF" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.sectionGap} />

        {/* Section 5 — Daily Challenges */}
        <View>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Daily Challenges</Text>
            <TouchableOpacity style={styles.viewAllBtn} onPress={() => router.push('/(tabs)/history')} accessibilityRole="button">
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={14} color={T.primary} />
            </TouchableOpacity>
          </View>
          {questsError && !questsLoading && (
            <View style={styles.inlineErrorPill}><Text style={styles.inlineErrorText}>Daily quests are coming soon.</Text></View>
          )}
          {questsLoading && <><QuestSkeleton /><QuestSkeleton /></>}
          {!questsLoading && !questsError && dailyQuests.length === 0 && (
            <View style={styles.inlineErrorPill}><Text style={styles.inlineErrorText}>No quests for today — check back later!</Text></View>
          )}
          {!questsLoading && dailyQuests.map(q => <QuestCard key={q.id} quest={q} />)}
        </View>

        <View style={styles.sectionGap} />

        {/* Section 6 — Achievements Preview */}
        <View>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <TouchableOpacity style={styles.viewAllBtn} onPress={() => router.push('/(tabs)/history')} accessibilityRole="button">
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={14} color={T.primary} />
            </TouchableOpacity>
          </View>
          {questsLoading && (
            <View style={styles.achievementsGrid}>
              {[0,1,2,3].map(i => <AchievementSkeleton key={i} itemWidth={ACHI_W} />)}
            </View>
          )}
          {!questsLoading && achievements.length > 0 && (
            <View style={styles.achievementsGrid}>
              {achievements.map(a => <AchievementCard key={a.id} achievement={a} itemWidth={ACHI_W} />)}
            </View>
          )}
          {!questsLoading && achievements.length === 0 && (
            <View style={styles.inlineErrorPill}><Text style={styles.inlineErrorText}>Complete a workout to earn your first achievement!</Text></View>
          )}
        </View>

        <View style={styles.sectionGap} />

        {/* Section 7 — Rewards Shop CTA */}
        <View style={styles.rewardsCard}>
          <View style={styles.rewardsGloss} pointerEvents="none" />
          <View style={styles.rewardsLeft}>
            <Text style={styles.rewardsTitle}>Rewards Shop</Text>
            <Text style={styles.rewardsSubtitle}>Unlock exclusive items with your XP</Text>
            <TouchableOpacity style={styles.rewardsShopBtn} onPress={() => console.log('TODO: rewards shop')} accessibilityRole="button">
              <Text style={styles.rewardsShopBtnText}>Browse Shop</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.rewardsIconBox}>
            <Ionicons name="star" size={32} color={T.secondary} />
          </View>
        </View>

        <View style={styles.sectionGap} />

      </ScrollView>

      {/* XP Toast */}
      {tomiEffects.showXpToast && tomiEffects.xpDelta && (
        <XpToast xpDelta={tomiEffects.xpDelta} visible={tomiEffects.showXpToast} onDismiss={tomiEffects.dismissXpToast} />
      )}

      {/* Level-Up Modal */}
      <LevelUpModal visible={tomiEffects.showLevelUpModal} level={tomiEffects.newLevel} onDismiss={tomiEffects.dismissLevelUpModal} />
    </ScreenWrapper>
  );
}
