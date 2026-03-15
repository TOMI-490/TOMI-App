import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from '../../locales/i18n';
import { workoutTypeService } from '../../services/resources/workoutType.service';
import { workoutService } from '../../services/resources/workout.service';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useAuth } from '../../contexts/AuthContext';
import { usePastWorkouts } from '../../hooks/usePastWorkouts';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import type { WorkoutTypeResponseDto } from '../../models/dto/WorkoutType.dto';
import { styles } from '../../styles/workout/workoutStartScreen.styles';
import { TOMI_THEME as T } from '../../constants/theme';

/* ─── Icon helpers ──────────────────────────────────────────────────────── */
type IconDef =
  | { lib: 'Ionicons'; name: React.ComponentProps<typeof Ionicons>['name'] }
  | { lib: 'MCI'; name: React.ComponentProps<typeof MaterialCommunityIcons>['name'] }
  | { lib: 'FA5'; name: React.ComponentProps<typeof FontAwesome5>['name'] };

function getWorkoutIcon(typeName: string): IconDef {
  const l = typeName.toLowerCase();
  if (l.includes('run'))       return { lib: 'MCI', name: 'run' };
  if (l.includes('walk'))      return { lib: 'MCI', name: 'walk' };
  if (l.includes('cycl') || l.includes('bike')) return { lib: 'MCI', name: 'bike' };
  if (l.includes('swim'))      return { lib: 'MCI', name: 'swim' };
  if (l.includes('yoga'))      return { lib: 'MCI', name: 'yoga' };
  if (l.includes('strength') || l.includes('weight')) return { lib: 'Ionicons', name: 'barbell-outline' };
  if (l.includes('hiit') || l.includes('interval'))   return { lib: 'MCI', name: 'lightning-bolt' };
  if (l.includes('stretch'))   return { lib: 'MCI', name: 'human-handsup' };
  if (l.includes('box'))       return { lib: 'MCI', name: 'boxing-glove' };
  if (l.includes('dance'))     return { lib: 'MCI', name: 'music-note' };
  if (l.includes('row'))       return { lib: 'MCI', name: 'rowing' };
  return { lib: 'Ionicons', name: 'fitness-outline' };
}

function WIcon({ def, size, color }: { def: IconDef; size: number; color: string }) {
  if (def.lib === 'Ionicons') return <Ionicons name={def.name as any} size={size} color={color} />;
  if (def.lib === 'MCI')      return <MaterialCommunityIcons name={def.name as any} size={size} color={color} />;
  return <FontAwesome5 name={def.name as any} size={size} color={color} />;
}

/* ─── Category definitions ──────────────────────────────────────────────── */
const CATEGORIES: { name: string; icon: IconDef; color: string; bg: string }[] = [
  { name: 'Cardio',   icon: { lib: 'MCI', name: 'run' },            color: '#F0545C', bg: '#FDEAEA' },
  { name: 'Strength', icon: { lib: 'MCI', name: 'dumbbell' },       color: '#FF7A3D', bg: '#FFF0E8' },
  { name: 'Yoga',     icon: { lib: 'MCI', name: 'yoga' },           color: '#4E9BE8', bg: '#E8F1FD' },
  { name: 'HIIT',     icon: { lib: 'MCI', name: 'lightning-bolt' }, color: '#FF7A3D', bg: '#FFF0E8' },
];

/* ─── Featured workout mock data ────────────────────────────────────────── */
interface FeaturedWorkout {
  id: number;
  name: string;
  desc: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  minutes: number;
  calories: number;
  xp: number;
  icon: IconDef;
  color: string;
  bg: string;
}

const WORKOUT_META: Record<string, { diff: 'Easy' | 'Moderate' | 'Hard'; min: number; cal: number; xp: number }> = {
  running:           { diff: 'Moderate', min: 30, cal: 250, xp: 85 },
  walking:           { diff: 'Easy',     min: 40, cal: 180, xp: 60 },
  cycling:           { diff: 'Moderate', min: 45, cal: 400, xp: 100 },
  swimming:          { diff: 'Moderate', min: 30, cal: 300, xp: 90 },
  'strength training': { diff: 'Hard',  min: 45, cal: 320, xp: 120 },
  yoga:              { diff: 'Easy',     min: 35, cal: 150, xp: 55 },
  hiit:              { diff: 'Hard',     min: 20, cal: 280, xp: 95 },
  dancing:           { diff: 'Moderate', min: 30, cal: 220, xp: 70 },
  'rock climbing':   { diff: 'Hard',     min: 60, cal: 500, xp: 130 },
  tennis:            { diff: 'Moderate', min: 45, cal: 350, xp: 95 },
};

function buildFeatured(types: WorkoutTypeResponseDto[]): FeaturedWorkout[] {
  return types.map(t => {
    const meta = WORKOUT_META[t.name.toLowerCase()] ?? { diff: 'Moderate' as const, min: 30, cal: 200, xp: 70 };
    const ic = getWorkoutIcon(t.name);
    const color = meta.diff === 'Hard' ? '#F0545C' : meta.diff === 'Moderate' ? '#FF7A3D' : '#2DCB8A';
    const bg = meta.diff === 'Hard' ? '#FDEAEA' : meta.diff === 'Moderate' ? '#FFF0E8' : '#E6F9F0';
    return {
      id: t.workoutTypeId,
      name: t.name,
      desc: t.description,
      difficulty: meta.diff,
      minutes: meta.min,
      calories: meta.cal,
      xp: meta.xp,
      icon: ic,
      color,
      bg,
    };
  });
}

const DIFF_COLORS: Record<string, string> = { Easy: '#2DCB8A', Moderate: '#FF7A3D', Hard: '#F0545C' };

/* ─── Time ago helper ───────────────────────────────────────────────────── */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

/* ========================================================================= */
const WorkoutStartScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { authId } = useAuth();
  const { user, loading: userLoading } = useCurrentUser(authId || undefined);
  const { workouts: pastWorkouts } = usePastWorkouts(user?.userId, 5);

  const [workoutTypes, setWorkoutTypes] = useState<WorkoutTypeResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<number | null>(null);
  const startingRef = useRef(false);

  useEffect(() => { loadWorkoutTypes(); }, []);

  const loadWorkoutTypes = async () => {
    try {
      setLoading(true);
      const types = await workoutTypeService.getAll();
      setWorkoutTypes(types);
    } catch (error) {
      console.error('Error loading workout types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = async (workoutTypeId: number) => {
    if (startingRef.current || !user) return;
    try {
      startingRef.current = true;
      setStartingId(workoutTypeId);

      const wt = workoutTypes.find(t => t.workoutTypeId === workoutTypeId);
      const meta = WORKOUT_META[wt?.name.toLowerCase() ?? ''] ?? { xp: 70 };
      const workout = await workoutService.startWorkout({
        userId: user.userId, workoutTypeId, deviceId: 1, xpAwarded: meta.xp,
      });
      router.push({ pathname: '/workout-live', params: {
        workoutId: workout.workoutId.toString(),
        workoutTypeId: workout.workoutTypeId.toString(),
        expectedXp: meta.xp.toString(),
      }});
    } catch (error) {
      console.error('Error starting workout:', error);
      Alert.alert(t('common.error'), t('workout.errorStarting'));
    } finally {
      startingRef.current = false;
      setStartingId(null);
    }
  };

  const handleQuickStart = () => {
    const def = workoutTypes.find(t => t.name.toLowerCase().includes('run')) || workoutTypes[0];
    if (def) handleStartWorkout(def.workoutTypeId);
  };

  const featured = buildFeatured(workoutTypes);

  const categoryCounts: Record<string, number> = {};
  for (const cat of CATEGORIES) {
    categoryCounts[cat.name] = workoutTypes.filter(wt => {
      const l = wt.name.toLowerCase();
      if (cat.name === 'Cardio') return l.includes('run') || l.includes('walk') || l.includes('cycl') || l.includes('swim');
      if (cat.name === 'Strength') return l.includes('strength') || l.includes('weight');
      if (cat.name === 'Yoga') return l.includes('yoga') || l.includes('stretch');
      if (cat.name === 'HIIT') return l.includes('hiit') || l.includes('interval');
      return false;
    }).length;
  }

  if (loading || userLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={T.primary} />
        <Text style={styles.loadingText}>{t('workout.loadingTypes')}</Text>
      </View>
    );
  }

  return (
    <ScreenWrapper style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerIconBox}>
            <MaterialCommunityIcons name="dumbbell" size={26} color={T.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Workouts</Text>
            <Text style={styles.headerSubtitle}>Ready to move?</Text>
          </View>
        </View>

        {/* ── Stats row ─────────────────────────────────────── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconRow, { backgroundColor: '#FFF0E8' }]}>
              <MaterialCommunityIcons name="dumbbell" size={16} color="#FF7A3D" />
            </View>
            <Text style={styles.statValue}>{pastWorkouts.length > 0 ? pastWorkouts.length * 10 + 3 : 0}</Text>
            <Text style={styles.statLabel}>Total{'\n'}Workouts</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconRow, { backgroundColor: '#E8F1FD' }]}>
              <MaterialCommunityIcons name="chart-line" size={16} color="#4E9BE8" />
            </View>
            <Text style={styles.statValue}>{Math.min(pastWorkouts.length, 7)}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconRow, { backgroundColor: '#E6F9F0' }]}>
              <MaterialCommunityIcons name="lightning-bolt" size={16} color="#2DCB8A" />
            </View>
            <Text style={styles.statValue}>{pastWorkouts.length > 0 ? pastWorkouts.length * 85 + 50 : 0}</Text>
            <Text style={styles.statLabel}>XP Earned</Text>
          </View>
        </View>

        {/* ── Quick Start ───────────────────────────────────── */}
        <View style={styles.quickStartCard}>
          <View style={styles.quickStartLeft}>
            <View style={styles.quickStartIconBox}>
              <Ionicons name="locate" size={20} color={T.primary} />
            </View>
            <View>
              <Text style={styles.quickStartTitle}>Quick Start</Text>
              <Text style={styles.quickStartSubtitle}>Track any outdoor activity</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.quickStartBtn} onPress={handleQuickStart} disabled={startingId !== null}>
            {startingId !== null ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <><Ionicons name="play" size={14} color="#FFF" /><Text style={styles.quickStartBtnText}>Start</Text></>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Sensor / BLE Test ─────────────────────────────── */}
        <TouchableOpacity style={styles.sensorBtn} onPress={() => router.push('/(tabs)/workout/sensor')}>
          <Ionicons name="bluetooth" size={16} color={T.secondary} />
          <Text style={styles.sensorBtnText}>Sensor / BLE Test</Text>
        </TouchableOpacity>

        {/* ── Categories ────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="shape" size={18} color={T.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Categories</Text>
          </View>
        </View>
        <View style={styles.categoriesGrid}>
          {CATEGORIES.map(cat => (
            <View key={cat.name} style={styles.categoryCard}>
              <View style={[styles.categoryIconBox, { backgroundColor: cat.bg }]}>
                <WIcon def={cat.icon} size={24} color={cat.color} />
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
              <Text style={styles.categoryCount}>{categoryCounts[cat.name] || 0} workouts</Text>
            </View>
          ))}
        </View>

        {/* ── Featured ──────────────────────────────────────── */}
        {featured.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="sparkles" size={18} color={T.primary} style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Featured</Text>
              </View>
              <TouchableOpacity style={styles.viewAllBtn}>
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="chevron-forward" size={13} color={T.primary} />
              </TouchableOpacity>
            </View>
            {featured.map(fw => (
              <View key={fw.id} style={styles.featuredCard}>
                <View style={styles.featuredTop}>
                  <View style={[styles.featuredIconBox, { backgroundColor: fw.bg }]}>
                    <WIcon def={fw.icon} size={26} color={fw.color} />
                  </View>
                  <View style={styles.featuredInfo}>
                    <View style={styles.featuredNameRow}>
                      <Text style={styles.featuredName}>{fw.name}</Text>
                      <View style={[styles.difficultyPill, { backgroundColor: DIFF_COLORS[fw.difficulty] }]}>
                        <Text style={styles.difficultyText}>{fw.difficulty}</Text>
                      </View>
                    </View>
                    <Text style={styles.featuredDesc}>{fw.desc}</Text>
                  </View>
                </View>
                <View style={styles.featuredDivider} />
                <View style={styles.featuredMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={15} color={T.textMuted} />
                    <Text style={styles.metaText}>{fw.minutes} min</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="flame-outline" size={15} color={T.textMuted} />
                    <Text style={styles.metaText}>{fw.calories} cal</Text>
                  </View>
                </View>
                <View style={styles.featuredBottom}>
                  <View style={styles.xpChip}>
                    <MaterialCommunityIcons name="lightning-bolt" size={13} color={T.primary} />
                    <Text style={styles.xpChipText}>+{fw.xp} XP</Text>
                  </View>
                  <TouchableOpacity style={styles.startBtn} onPress={() => handleStartWorkout(fw.id)} disabled={startingId !== null}>
                    {startingId === fw.id ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <><Ionicons name="play" size={16} color="#FFF" /><Text style={styles.startBtnText}>Start Workout</Text></>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ── Do It Again ───────────────────────────────────── */}
        {pastWorkouts.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <MaterialCommunityIcons name="replay" size={18} color={T.primary} style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Do It Again</Text>
              </View>
            </View>
            {pastWorkouts.slice(0, 3).map(pw => {
              const ic = getWorkoutIcon(pw.workoutTypeName || '');
              const color = '#FF7A3D';
              const bg = '#FFF0E8';
              return (
                <View key={pw.workoutId} style={styles.pastCard}>
                  <View style={[styles.pastAccent, { backgroundColor: color }]} />
                  <View style={[styles.pastIconBox, { backgroundColor: bg }]}>
                    <WIcon def={ic} size={22} color={color} />
                  </View>
                  <View style={styles.pastInfo}>
                    <Text style={styles.pastName}>{pw.workoutTypeName || 'Workout'}</Text>
                    <Text style={styles.pastMeta}>{timeAgo(pw.start)} · {pw.durationMinutes || 0} min</Text>
                  </View>
                  <View style={styles.pastXp}>
                    <MaterialCommunityIcons name="lightning-bolt" size={14} color={T.primary} />
                    <Text style={styles.pastXpText}>+{pw.xpAwarded ?? 0}</Text>
                  </View>
                  <TouchableOpacity style={styles.pastPlayBtn} onPress={() => handleStartWorkout(pw.workoutTypeId)}>
                    <Ionicons name="play" size={16} color={T.primary} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </>
        )}

        {/* ── Create Custom ─────────────────────────────────── */}
        <View style={styles.customCard}>
          <View style={styles.customIconBox}>
            <Ionicons name="add" size={28} color={T.primary} />
          </View>
          <Text style={styles.customTitle}>Create Custom Workout</Text>
          <Text style={styles.customSubtitle}>Build your own routine from scratch</Text>
          <TouchableOpacity style={styles.customBtn}>
            <Text style={styles.customBtnText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
};

export default WorkoutStartScreen;
