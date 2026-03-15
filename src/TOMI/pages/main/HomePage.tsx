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
import { useGamification } from '../../hooks/useGamification';
import { useTranslation } from '../../locales/i18n';
import { StreakResponseDto } from '../../models/dto/Streak.dto';
import { homePageStyles as styles } from '../../styles/home/homePage.styles';
import { TOMI_THEME as T } from '../../constants/theme';
import { avatarStateStore } from '../../utils/avatarStateStore';
import { XpToast, LevelUpModal } from '../../components/gamification';
import { DailyQuest } from '../../services/resources/homeScreen.service';
import { EarnedBadge, UpcomingBadge } from '../../services/gamification';

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
   BadgeCard (replaces AchievementCard — uses real gamification API data)
   --------------------------------------------------------------------------- */
function getBadgeIcon(achievement: string): { lib: 'Ionicons' | 'MaterialCommunityIcons'; name: string; color: string; bg: string } {
  const a = (achievement || '').toLowerCase();
  if (a.includes('step'))     return { lib: 'MaterialCommunityIcons', name: 'shoe-print',           color: '#7C3AED', bg: '#EDE9FE' };
  if (a.includes('run'))      return { lib: 'MaterialCommunityIcons', name: 'run',                  color: '#EA580C', bg: '#FFF0E6' };
  if (a.includes('workout_1') && !a.includes('10') && !a.includes('100'))
                              return { lib: 'Ionicons',               name: 'checkmark-circle',      color: '#16A34A', bg: '#DCFCE7' };
  if (a.includes('workout'))  return { lib: 'MaterialCommunityIcons', name: 'dumbbell',             color: '#2563EB', bg: '#DBEAFE' };
  if (a.includes('streak'))   return { lib: 'Ionicons',               name: 'flame',                color: '#FF6B35', bg: '#FFF0E8' };
  if (a.includes('distance')) return { lib: 'MaterialCommunityIcons', name: 'map-marker-distance',  color: '#0891B2', bg: '#E0F7FA' };
  if (a.includes('level'))    return { lib: 'Ionicons',               name: 'star',                 color: '#D97706', bg: '#FEF3C7' };
  if (a.includes('social') || a.includes('friend'))
                              return { lib: 'Ionicons',               name: 'people',               color: '#DB2777', bg: '#FCE7F3' };
  return                             { lib: 'Ionicons',               name: 'ribbon',               color: '#7C3AED', bg: '#EDE9FE' };
}

function BadgeCard({ badge, itemWidth }: { badge: EarnedBadge; itemWidth: string }) {
  const icon = getBadgeIcon(badge.achievement);
  return (
    <View style={[styles.achievementCard, styles.achievementCardUnlocked, { width: itemWidth as unknown as number }]}>
      <View style={[styles.achievementIconBox, { backgroundColor: icon.bg }]}>
        {icon.lib === 'Ionicons'
          ? <Ionicons name={icon.name as React.ComponentProps<typeof Ionicons>['name']} size={20} color={icon.color} />
          : <MaterialCommunityIcons name={icon.name as React.ComponentProps<typeof MaterialCommunityIcons>['name']} size={20} color={icon.color} />
        }
      </View>
      <Text style={styles.achievementLabel} numberOfLines={2}>{badge.name}</Text>
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
  const { dailyQuests, loading: questsLoading, error: questsError } = useHomeQuests(user?.userId);
  const { data: gamificationData, loading: gamLoading } = useGamification(user?.userId);
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

  const ACHI_W = '22%';
  const userName = user?.name || 'there';

  /* =========================================================================
     RENDER
     ========================================================================= */
  return (
    <ScreenWrapper style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Section 1 — Greeting */}
        <View>
          <View style={styles.greetingPill}>
            <View style={styles.greetingPillDot} />
            <Text style={styles.greetingPillText}>{getGreetingLabel()}</Text>
          </View>
          <Text style={styles.greetingTitle}>Hey {userName}!</Text>
          <Text style={styles.greetingSubtitle}>{"Let's crush your goals today"}</Text>
        </View>

        {error && !loading && (
          <TouchableOpacity style={styles.inlineErrorPill} onPress={refresh} activeOpacity={0.7}>
            <Text style={styles.inlineErrorText}>Couldn't load data — tap to retry</Text>
          </TouchableOpacity>
        )}

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
              {/* Wall */}
              <View style={styles.roomWall} pointerEvents="none" />
              {/* Wainscoting trim */}
              <View style={styles.roomWainscoting} pointerEvents="none" />
              {/* Floor */}
              <View style={styles.roomFloor} pointerEvents="none" />

              {/* Window with curtains */}
              <View style={styles.roomWindow} pointerEvents="none">
                <View style={styles.windowCurtainLeft} />
                <View style={styles.windowGlass}>
                  <View style={styles.windowSky} />
                  <View style={styles.windowCloud} />
                </View>
                <View style={styles.windowCurtainRight} />
                <View style={styles.windowSill} />
              </View>

              {/* Picture frame on wall */}
              <View style={styles.roomPictureFrame} pointerEvents="none">
                <View style={styles.pictureInner}>
                  <Ionicons name="heart" size={14} color="#E8A87C" />
                </View>
              </View>

              {/* Rug under avatar */}
              <View style={styles.roomRug} pointerEvents="none" />

              {/* Cozy sofa */}
              <View style={styles.roomSofa} pointerEvents="none">
                <View style={styles.sofaBack} />
                <View style={styles.sofaSeat} />
                <View style={styles.sofaCushionLeft} />
                <View style={styles.sofaCushionRight} />
                <View style={styles.sofaArmLeft} />
                <View style={styles.sofaArmRight} />
              </View>

              {/* Floor lamp */}
              <View style={styles.roomLampContainer} pointerEvents="none">
                <View style={styles.roomLampGlow} />
                <View style={styles.roomLampShade}>
                  <Ionicons name="bulb" size={12} color="#FBBF24" />
                </View>
                <View style={styles.roomLampPole} />
                <View style={styles.roomLampBase} />
              </View>

              {/* Side table with coffee */}
              <View style={styles.roomSideTable} pointerEvents="none">
                <View style={styles.sideTableTop}>
                  <Ionicons name="cafe" size={13} color="#92400e" />
                </View>
                <View style={styles.sideTableLeg} />
              </View>

              {/* Small plant */}
              <View style={styles.roomPlant} pointerEvents="none">
                <View style={styles.plantLeaves}>
                  <Ionicons name="leaf" size={16} color="#4ADE80" />
                </View>
                <View style={styles.plantPot} />
              </View>

              {/* Bookshelf */}
              <View style={styles.roomBookshelf} pointerEvents="none">
                <View style={styles.bookshelfShelf} />
                <View style={styles.bookRow}>
                  <View style={[styles.book, { backgroundColor: '#F87171', height: 16 }]} />
                  <View style={[styles.book, { backgroundColor: '#60A5FA', height: 18 }]} />
                  <View style={[styles.book, { backgroundColor: '#FBBF24', height: 14 }]} />
                  <View style={[styles.book, { backgroundColor: '#34D399', height: 17 }]} />
                </View>
              </View>

              {/* Avatar */}
              <TouchableOpacity
                style={styles.avatarTouchable}
                onPress={() => router.push('/(tabs)/avatar')}
                activeOpacity={0.90}
                accessibilityRole="button"
                accessibilityLabel={`Customize ${tomiData?.nickname ?? 'TOMI'}`}
              >
                <View style={styles.avatarShadowPlatform} />
                <View style={styles.avatarContainer}>
                  {avatarGifUrl ? (
                    <Image source={{ uri: avatarGifUrl }} style={{ width: 110, height: 110 }} contentFit="contain" autoplay />
                  ) : (
                    <Ionicons name="sparkles" size={48} color={T.primary} />
                  )}
                </View>
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
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionTitleAccent} />
              <Text style={styles.sectionTitle}>Daily Challenges</Text>
            </View>
            <TouchableOpacity style={styles.viewAllBtn} onPress={() => router.push('/(tabs)/history')} accessibilityRole="button">
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={13} color={T.primary} />
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

        {/* Section 6 — Badges (from gamification API) */}
        <View>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionTitleAccent} />
              <Text style={styles.sectionTitle}>Badges</Text>
            </View>
            <TouchableOpacity style={styles.viewAllBtn} onPress={() => router.push('/(tabs)/history')} accessibilityRole="button">
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={13} color={T.primary} />
            </TouchableOpacity>
          </View>
          {gamLoading && (
            <View style={styles.achievementsGrid}>
              {[0,1,2,3].map(i => <AchievementSkeleton key={i} itemWidth={ACHI_W} />)}
            </View>
          )}
          {!gamLoading && (gamificationData?.badgesEarned?.length ?? 0) > 0 && (
            <View style={styles.achievementsGrid}>
              {(gamificationData!.badgesEarned).slice(0, 4).map(b => (
                <BadgeCard key={b.id} badge={b} itemWidth={ACHI_W} />
              ))}
            </View>
          )}
          {!gamLoading && (gamificationData?.badgesEarned?.length ?? 0) === 0 && (
            <View style={styles.inlineErrorPill}>
              <Text style={styles.inlineErrorText}>Complete a workout to earn your first badge!</Text>
            </View>
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
