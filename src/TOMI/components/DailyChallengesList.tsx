/**
 * Daily challenges — shared by Home and Workout screens.
 */

import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { TomiThemeColors } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import { createDailyChallengeListStyles } from '../styles/dailyChallengeList.styles';
import type { DailyQuest } from '../services/resources/homeScreen.service';

type IconDef =
  | { lib: 'Ionicons'; name: React.ComponentProps<typeof Ionicons>['name'] }
  | { lib: 'MaterialCommunityIcons'; name: React.ComponentProps<typeof MaterialCommunityIcons>['name'] };

const ICON_REGISTRY: Record<string, IconDef> = {
  trophy: { lib: 'Ionicons', name: 'trophy' },
  flame: { lib: 'Ionicons', name: 'flame' },
  star: { lib: 'Ionicons', name: 'star' },
  heart: { lib: 'Ionicons', name: 'heart' },
  barbell: { lib: 'Ionicons', name: 'barbell' },
  run: { lib: 'MaterialCommunityIcons', name: 'run' },
  walk: { lib: 'MaterialCommunityIcons', name: 'walk' },
  dumbbell: { lib: 'MaterialCommunityIcons', name: 'dumbbell' },
  medal: { lib: 'MaterialCommunityIcons', name: 'medal' },
  zap: { lib: 'MaterialCommunityIcons', name: 'lightning-bolt' },
  default: { lib: 'Ionicons', name: 'star-outline' },
};

function RegistryIcon({ name, size, color }: { name?: string; size: number; color: string }) {
  const def = (name && ICON_REGISTRY[name]) || ICON_REGISTRY.default;
  if (def.lib === 'Ionicons') {
    return (
      <Ionicons name={def.name as React.ComponentProps<typeof Ionicons>['name']} size={size} color={color} />
    );
  }
  return (
    <MaterialCommunityIcons
      name={def.name as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
      size={size}
      color={color}
    />
  );
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.substring(i, i + 2), 16)).join(',');
}

function resolveQuestColor(token: string, T: TomiThemeColors): string {
  return (
    {
      primary: T.primary,
      secondary: T.secondary,
      warning: T.warning,
      success: T.success,
      danger: T.danger,
    } as Record<string, string>
  )[token] ?? T.primary;
}

type Styles = ReturnType<typeof createDailyChallengeListStyles>;

function QuestSkeleton({ styles }: { styles: Styles }) {
  const opacity = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: 750, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return (
    <View style={styles.skeletonCard} accessibilityLabel="Loading daily challenges">
      <Animated.View style={[styles.skeletonLine, { height: 16, width: '70%', opacity }]} />
      <Animated.View style={[styles.skeletonLine, { height: 10, width: '40%', opacity }]} />
      <Animated.View style={[styles.skeletonLine, { height: 8, width: '100%', opacity }]} />
    </View>
  );
}

export interface DailyChallengesListProps {
  variant: 'home' | 'workout';
  dailyQuests: DailyQuest[];
  loading: boolean;
  error: string | null;
  showSectionHeader?: boolean;
  onViewAll?: () => void;
  /** Workout tab: BLE + start */
  watchConnected?: boolean;
  startingWorkoutTypeId?: number | null;
  onStartChallenge?: (workoutTypeId: number) => void;
}

export function DailyChallengesList({
  variant,
  dailyQuests,
  loading,
  error,
  showSectionHeader = true,
  onViewAll,
  watchConnected = true,
  startingWorkoutTypeId = null,
  onStartChallenge,
}: DailyChallengesListProps) {
  const router = useRouter();
  const { colors: T } = useTheme();
  const styles = useMemo(() => createDailyChallengeListStyles(T), [T]);

  const goWorkoutTab = () => {
    if (onViewAll) onViewAll();
    else router.push('/(tabs)/workout');
  };

  const wrapCard = (quest: DailyQuest, inner: React.ReactNode) => {
    if (variant === 'home') {
      return (
        <TouchableOpacity
          key={quest.id}
          activeOpacity={0.88}
          onPress={goWorkoutTab}
          accessibilityRole="button"
          accessibilityLabel={`${quest.title}. Open workouts.`}
        >
          {inner}
        </TouchableOpacity>
      );
    }
    return <View key={quest.id}>{inner}</View>;
  };

  return (
    <View>
      {showSectionHeader && (
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionTitleAccent} />
            <Text style={styles.sectionTitle}>Daily Challenges</Text>
          </View>
          {variant === 'home' && (
            <TouchableOpacity style={styles.viewAllBtn} onPress={goWorkoutTab} accessibilityRole="button">
              <Text style={styles.viewAllText}>Workouts</Text>
              <Ionicons name="chevron-forward" size={13} color={T.primary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {error && !loading && (
        <View style={styles.inlineErrorPill}>
          <Text style={styles.inlineErrorText}>{error}</Text>
        </View>
      )}

      {loading && (
        <>
          <QuestSkeleton styles={styles} />
          <QuestSkeleton styles={styles} />
        </>
      )}

      {!loading && !error && dailyQuests.length === 0 && (
        <View style={styles.inlineErrorPill}>
          <Text style={styles.inlineErrorText}>
            No workout types yet — add workouts in the database to unlock daily challenges.
          </Text>
        </View>
      )}

      {!loading &&
        dailyQuests.map((quest) => {
          const pct = quest.max_value > 0 ? Math.min(quest.progress / quest.max_value, 1) : 0;
          const accentColor = resolveQuestColor(quest.color_token, T);
          const iconBg = `rgba(${hexToRgb(accentColor)},0.18)`;
          const wid = quest.workoutTypeId;
          const showStart =
            variant === 'workout' &&
            typeof wid === 'number' &&
            onStartChallenge &&
            !quest.completed;

          const cardInner = (
            <View style={styles.questCard}>
              <View style={[styles.questIconBox, { backgroundColor: iconBg }]}>
                <RegistryIcon name={quest.icon_name} size={22} color={accentColor} />
              </View>
              <View style={styles.questContent}>
                <View style={styles.questTitleRow}>
                  <Text style={styles.questTitle} numberOfLines={2}>
                    {quest.title}
                  </Text>
                  <View style={styles.questXpChip}>
                    <Ionicons name="flash" size={11} color={T.warning} />
                    <Text style={styles.questXpText}>+{quest.xp_reward}</Text>
                  </View>
                </View>
                {!!quest.subtitle && (
                  <Text style={styles.questSubtitle} numberOfLines={2}>
                    {quest.subtitle}
                  </Text>
                )}
                <Text style={styles.questProgressText}>
                  {quest.progress} / {quest.max_value}
                  {quest.completed ? ' · Done today' : ''}
                </Text>
                <View style={styles.questBarTrack}>
                  <View
                    style={[
                      styles.questBarFill,
                      {
                        width: `${pct * 100}%` as any,
                        backgroundColor: quest.completed ? T.success : accentColor,
                      },
                    ]}
                  />
                </View>
              </View>
              {showStart && (
                <TouchableOpacity
                  style={[
                    styles.challengeStartBtn,
                    (!watchConnected || startingWorkoutTypeId !== null) && styles.challengeStartBtnDisabled,
                  ]}
                  onPress={() => onStartChallenge!(wid)}
                  disabled={!watchConnected || startingWorkoutTypeId !== null}
                  accessibilityRole="button"
                  accessibilityLabel={`Start ${quest.title}`}
                >
                  {startingWorkoutTypeId === wid ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="play" size={14} color="#FFF" />
                      <Text style={styles.challengeStartBtnText}>Start</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          );

          return wrapCard(quest, cardInner);
        })}
    </View>
  );
}
