import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from '../../locales/i18n';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useAvatarPage } from '../../hooks/useAvatarPage';
import { avatarPageStyles as styles } from '../../styles/home/avatarPage.styles';

// ── Mood bar config ───────────────────────────────────────────────────────────
// For hunger/sleepiness/boredom a HIGH value is BAD, so we invert the bar fill.
// For happiness a HIGH value is GOOD — fill directly.
type MoodIconDef =
  | { lib: 'Ionicons'; name: React.ComponentProps<typeof Ionicons>['name'] }
  | { lib: 'MaterialCommunityIcons'; name: React.ComponentProps<typeof MaterialCommunityIcons>['name'] };

interface MoodMetric {
  iconDef: MoodIconDef;
  labelKey: string;
  value: number;        // raw 0–100 from backend
  fillValue: number;    // 0–100 used for bar width
  color: string;
  statusKey: string;
}

function getMoodMetrics(avatar: {
  hungerLevel: number;
  sleepinessLevel: number;
  boredomeLevel: number;
  happinessLevel: number;
}): MoodMetric[] {
  const hunger     = avatar.hungerLevel;
  const sleepiness = avatar.sleepinessLevel;
  const boredom    = avatar.boredomeLevel;
  const happiness  = avatar.happinessLevel;

  const statusKeyFor = (val: number, inverted: boolean) => {
    // inverted metrics (hunger/sleepiness/boredom): high val = bad → low goodness
    // non-inverted (happiness): high val = good → high goodness
    const effective = inverted ? 100 - val : val;
    if (effective < 30) return 'avatar.moodCritical';
    if (effective < 60) return 'avatar.moodNeedsCare';
    return 'avatar.moodGood';
  };

  // Bar fill = wellness (low = bad, high = good)
  // For inverted metrics: fillValue = 100 - raw  (high hunger → low bar)
  // For happiness:        fillValue = raw         (high happiness → high bar)
  const fillFor = (raw: number, inverted: boolean) => inverted ? 100 - raw : raw;
  const colorFor = (fill: number) =>
    fill < 30 ? '#FF3B30' : fill < 60 ? '#FF9500' : '#34C759';

  const hFill  = fillFor(hunger, true);
  const sFill  = fillFor(sleepiness, true);
  const bFill  = fillFor(boredom, true);
  const hpFill = fillFor(happiness, false);

  return [
    {
      iconDef: { lib: 'MaterialCommunityIcons', name: 'food-fork-drink' } as MoodIconDef,
      labelKey: 'avatar.moodHunger',
      value: hunger,
      fillValue: hFill,
      color: colorFor(hFill),
      statusKey: statusKeyFor(hunger, true),
    },
    {
      iconDef: { lib: 'Ionicons', name: 'moon-outline' } as MoodIconDef,
      labelKey: 'avatar.moodSleepiness',
      value: sleepiness,
      fillValue: sFill,
      color: colorFor(sFill),
      statusKey: statusKeyFor(sleepiness, true),
    },
    {
      iconDef: { lib: 'Ionicons', name: 'game-controller-outline' } as MoodIconDef,
      labelKey: 'avatar.moodBoredom',
      value: boredom,
      fillValue: bFill,
      color: colorFor(bFill),
      statusKey: statusKeyFor(boredom, true),
    },
    {
      iconDef: { lib: 'Ionicons', name: 'heart-outline' } as MoodIconDef,
      labelKey: 'avatar.moodHappiness',
      value: happiness,
      fillValue: hpFill,
      color: colorFor(hpFill),
      statusKey: statusKeyFor(happiness, false),
    },
  ];
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AvatarPage() {
  const { t } = useTranslation();
  const { authId } = useAuth();
  const { user } = useCurrentUser(authId || undefined);
  const { avatar, loading, error, refresh } = useAvatarPage(user?.userId);

  const moodMetrics = useMemo(
    () =>
      avatar
        ? getMoodMetrics({
            hungerLevel:    avatar.hungerLevel,
            sleepinessLevel: avatar.sleepinessLevel,
            boredomeLevel:  avatar.boredomeLevel,
            happinessLevel: avatar.happinessLevel,
          })
        : [],
    [avatar]
  );

  const xpPercent = avatar?.xpProgress ?? 0;
  const themeColor = avatar?.themeColor ?? '#007AFF';

  // ── Loading ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <ScreenWrapper style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{t('avatar.loading')}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // ── Error ───────────────────────────────────────────────────────
  if (error || !avatar) {
    return (
      <ScreenWrapper style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>
            {error?.message ?? t('avatar.noAvatarFound')}
          </Text>
          {error && (
            <TouchableOpacity style={styles.retryButton} onPress={refresh}>
              <Text style={styles.retryText}>{t('avatar.retry')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScreenWrapper>
    );
  }

  // ── Render ──────────────────────────────────────────────────────
  return (
    <ScreenWrapper style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('avatar.title')}</Text>
        </View>

        {/* ── Avatar card ─────────────────────────────────────── */}
        <View style={[styles.avatarCard, { borderWidth: 2, borderColor: themeColor }]}>

          {/* GIF */}
          <View style={styles.gifContainer}>
            {avatar.animationActiveUrl ? (
              <Image
                source={{ uri: avatar.animationActiveUrl }}
                style={{ width: '100%', height: '100%' }}
                contentFit="contain"
                autoplay
              />
            ) : (
              <View style={[styles.gifPlaceholder, { backgroundColor: themeColor + '33' }]} />
            )}
          </View>

          {/* Name & level */}
          <Text style={styles.nickname}>{avatar.nickname}</Text>
          <Text style={styles.levelLabel}>{t('avatar.levelLabel').replace('{level}', String(avatar.level))}</Text>

          {/* XP bar */}
          <View style={styles.xpSection}>
            <View style={styles.xpRow}>
              <Text style={styles.xpLabel}>{t('avatar.xpLabel')}</Text>
              <Text style={styles.xpValue}>
                {avatar.xp} / {avatar.nextLevelXp ?? '?'}
              </Text>
            </View>
            <View style={styles.xpBarTrack}>
              <View
                style={[
                  styles.xpBarFill,
                  { width: `${Math.min(xpPercent, 100)}%`, backgroundColor: themeColor },
                ]}
              />
            </View>
          </View>

          {/* Age */}
          <View style={styles.ageBadge}>
            <Ionicons name="calendar-outline" size={13} color="#8E8E93" style={{ marginRight: 4 }} />
            <Text style={styles.ageBadgeText}>
              {avatar.ageDays !== 1
                ? t('avatar.daysOldPlural').replace('{days}', String(avatar.ageDays))
                : t('avatar.daysOld').replace('{days}', String(avatar.ageDays))}
            </Text>
          </View>
        </View>

        {/* ── Quick stats ──────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>{t('avatar.statsTitle')}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="ribbon-outline" size={24} color="#FF9500" />
            <Text style={styles.statValue}>{avatar.level}</Text>
            <Text style={styles.statLabel}>{t('avatar.statLevel')}</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flash-outline" size={24} color="#FF9500" />
            <Text style={styles.statValue}>{avatar.xp}</Text>
            <Text style={styles.statLabel}>{t('avatar.statTotalXp')}</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={24} color="#8E8E93" />
            <Text style={styles.statValue}>{avatar.ageDays}</Text>
            <Text style={styles.statLabel}>{t('avatar.statDaysOld')}</Text>
          </View>
        </View>

        {/* ── Mood ─────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>{t('avatar.moodTitle')}</Text>
        <View style={styles.moodGrid}>
          {moodMetrics.map((m) => (
            <View key={m.labelKey} style={styles.moodCard}>
              {m.iconDef.lib === 'Ionicons' ? (
                <Ionicons name={m.iconDef.name as React.ComponentProps<typeof Ionicons>['name']} size={24} color="#8E8E93" />
              ) : (
                <MaterialCommunityIcons name={m.iconDef.name as React.ComponentProps<typeof MaterialCommunityIcons>['name']} size={24} color="#8E8E93" />
              )}
              <Text style={styles.moodLabel}>{t(m.labelKey)}</Text>
              <View style={styles.moodBarTrack}>
                <View
                  style={[
                    styles.moodBarFill,
                    { width: `${m.fillValue}%`, backgroundColor: m.color },
                  ]}
                />
              </View>
              <Text style={[styles.moodValue, { color: m.color }]}>{t(m.statusKey)}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}

