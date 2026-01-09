import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../locales/i18n';
import { historyStyles } from '../../styles/history.styles';
import { 
  historyService, 
  type WeeklySummary, 
  type WorkoutListItem,
  type MostFrequentResponse,
  type XpOverTimeResponse
} from '../../services/resources/history.service';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { XpMiniChart } from '../../components/history/XpMiniChart';
import { CalendarMonth } from '../../components/history/CalendarMonth';

// Skeleton Loading Components
const SkeletonSummaryCard = () => (
  <View style={historyStyles.skeletonCard}>
    <View style={[historyStyles.skeletonLine, { width: '40%', marginBottom: 16 }]} />
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
      <View style={historyStyles.skeletonMetric}>
        <View style={historyStyles.skeletonMetricValue} />
        <View style={historyStyles.skeletonMetricLabel} />
      </View>
      <View style={historyStyles.skeletonMetric}>
        <View style={historyStyles.skeletonMetricValue} />
        <View style={historyStyles.skeletonMetricLabel} />
      </View>
      <View style={historyStyles.skeletonMetric}>
        <View style={historyStyles.skeletonMetricValue} />
        <View style={historyStyles.skeletonMetricLabel} />
      </View>
    </View>
    <View style={[historyStyles.skeletonLine, { width: '50%' }]} />
  </View>
);

const SkeletonWorkoutCard = () => (
  <View style={historyStyles.skeletonCard}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
      <View style={{ flex: 1 }}>
        <View style={[historyStyles.skeletonLine, { width: '60%', marginBottom: 8 }]} />
        <View style={[historyStyles.skeletonLine, { width: '40%', height: 10 }]} />
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <View style={[historyStyles.skeletonLine, { width: 60, marginBottom: 8 }]} />
        <View style={[historyStyles.skeletonLine, { width: 50, height: 20, borderRadius: 10 }]} />
      </View>
    </View>
    <View style={{ height: 1, backgroundColor: '#f0f0f0', marginBottom: 12 }} />
    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
      <View style={historyStyles.skeletonMetric}>
        <View style={[historyStyles.skeletonLine, { width: 40, marginBottom: 4 }]} />
        <View style={[historyStyles.skeletonLine, { width: 30, height: 10 }]} />
      </View>
      <View style={historyStyles.skeletonMetric}>
        <View style={[historyStyles.skeletonLine, { width: 40, marginBottom: 4 }]} />
        <View style={[historyStyles.skeletonLine, { width: 30, height: 10 }]} />
      </View>
      <View style={historyStyles.skeletonMetric}>
        <View style={[historyStyles.skeletonLine, { width: 40, marginBottom: 4 }]} />
        <View style={[historyStyles.skeletonLine, { width: 30, height: 10 }]} />
      </View>
    </View>
  </View>
);

export default function HistoryPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useCurrentUser();
  
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutListItem[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeDates, setActiveDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [mostFrequent, setMostFrequent] = useState<MostFrequentResponse | null>(null);
  const [xpOverTime, setXpOverTime] = useState<XpOverTimeResponse | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workoutsLoading, setWorkoutsLoading] = useState(false);
  const [overviewLoading, setOverviewLoading] = useState(false);

  const MAX_RECENT_WORKOUTS = 3; // Reduced from 5 to show 3-4 recent workouts

  // Format month for API calls
  const getMonthString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  // Get date string for a day
  const getDateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Load initial data
  useEffect(() => {
    if (user?.userId) {
      loadData();
    }
  }, [user?.userId]);

  // Handle month changes separately without full loading screen
  useEffect(() => {
    if (user?.userId && !loading) {
      loadMonthData();
    }
  }, [currentMonth]);

  const loadData = async () => {
    if (!user?.userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const monthStr = getMonthString(currentMonth);
      
      // Load weekly summary and calendar in parallel
      const [summary, calendar] = await Promise.all([
        historyService.getWeeklySummary(user.userId),
        historyService.getCalendarActivity(user.userId, monthStr),
      ]);
      
      setWeeklySummary(summary);
      setActiveDates(calendar.activeDates);
      
      // Auto-select most recent active date or today if active
      const today = new Date().toISOString().split('T')[0];
      let dateToSelect: string | undefined;
      
      if (calendar.activeDates.includes(today)) {
        dateToSelect = today;
      } else if (calendar.activeDates.length > 0) {
        // Select most recent active date
        dateToSelect = calendar.activeDates.sort().reverse()[0];
      }
      
      setSelectedDate(dateToSelect);
      
      // Load workouts for selected date
      if (dateToSelect) {
        await loadWorkoutsForDate(dateToSelect);
      } else {
        setWorkouts([]);
      }
      
      // Load overview data
      loadOverviewData(monthStr);
    } catch (err) {
      console.error('Error loading history data:', err);
      setError(t('history.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const loadMonthData = async () => {
    if (!user?.userId) return;
    
    try {
      const monthStr = getMonthString(currentMonth);
      
      // Load calendar, workouts, and overview for new month
      const calendar = await historyService.getCalendarActivity(user.userId, monthStr);
      setActiveDates(calendar.activeDates);
      
      // Auto-select most recent active date in new month
      let dateToSelect: string | undefined;
      if (calendar.activeDates.length > 0) {
        dateToSelect = calendar.activeDates.sort().reverse()[0];
      }
      
      setSelectedDate(dateToSelect);
      
      // Load workouts for selected date
      if (dateToSelect) {
        await loadWorkoutsForDate(dateToSelect);
      } else {
        setWorkouts([]);
      }
      
      // Load overview data
      loadOverviewData(monthStr);
    } catch (err) {
      console.error('Error loading month data:', err);
    }
  };

  const loadWorkoutsForDate = async (date?: string) => {
    if (!user?.userId) return;
    
    setWorkoutsLoading(true);
    setSelectedDate(date);
    
    try {
      const workoutsData = await historyService.getWorkoutsList(
        user.userId, 
        date, 
        1, 
        date ? 20 : MAX_RECENT_WORKOUTS // More items if filtering by date
      );
      setWorkouts(workoutsData.items.slice(0, MAX_RECENT_WORKOUTS));
    } catch (err) {
      console.error('Error loading workouts for date:', err);
    } finally {
      setWorkoutsLoading(false);
    }
  };

  const loadOverviewData = async (monthStr: string) => {
    if (!user?.userId) return;
    
    setOverviewLoading(true);
    
    try {
      const [frequent, xp] = await Promise.all([
        historyService.getMostFrequent(user.userId, monthStr),
        historyService.getXpOverTime(user.userId, monthStr),
      ]);
      
      setMostFrequent(frequent);
      setXpOverTime(xp);
    } catch (err) {
      console.error('Error loading overview data:', err);
    } finally {
      setOverviewLoading(false);
    }
  };

  const handleDatePress = (date: Date) => {
    const dateStr = getDateString(date);
    loadWorkoutsForDate(dateStr);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleWorkoutPress = (workoutId: number) => {
    router.push(`/(tabs)/workout-detail?id=${workoutId}` as any);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDelta = (delta: number) => {
    const sign = delta >= 0 ? '+' : '';
    return `${sign}${delta.toFixed(0)}% ${t('history.fromLastWeek')}`;
  };

  // Loading state
  if (loading) {
    return (
      <View style={historyStyles.container}>
        <ScrollView style={historyStyles.container} contentContainerStyle={historyStyles.scrollContent}>
          <SkeletonSummaryCard />
          <View style={historyStyles.skeletonCard}>
            <View style={[historyStyles.skeletonLine, { width: '60%', height: 16, marginBottom: 20 }]} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
              {[...Array(35)].map((_, i) => (
                <View key={i} style={{ width: '14.28%', aspectRatio: 1, padding: 8 }}>
                  <View style={historyStyles.skeletonCircle} />
                </View>
              ))}
            </View>
          </View>
          <SkeletonWorkoutCard />
          <SkeletonWorkoutCard />
          <SkeletonWorkoutCard />
        </ScrollView>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={historyStyles.container}>
        <View style={historyStyles.errorContainer}>
          <Text style={historyStyles.errorText}>{error}</Text>
          <TouchableOpacity style={historyStyles.retryButton} onPress={loadData}>
            <Text style={historyStyles.retryButtonText}>{t('history.retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={historyStyles.container}>
      <ScrollView style={historyStyles.container} contentContainerStyle={historyStyles.scrollContent}>
        {/* Weekly Summary Card */}
        {weeklySummary && (
          <View style={historyStyles.summaryCard}>
            <View style={historyStyles.summaryHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="calendar-outline" size={20} color="#4CAF50" style={{ marginRight: 8 }} />
                <Text style={historyStyles.summaryTitle}>{t('history.thisWeek')}</Text>
              </View>
            </View>
            <View style={historyStyles.summaryMetrics}>
              <View style={historyStyles.metricItem}>
                <Text style={historyStyles.metricValue}>{weeklySummary.workoutsCount}</Text>
                <Text style={historyStyles.metricLabel}>{t('history.workouts')}</Text>
              </View>
              <View style={historyStyles.metricItem}>
                <Text style={historyStyles.metricValue}>{weeklySummary.minutesTotal}</Text>
                <Text style={historyStyles.metricLabel}>{t('history.minutes')}</Text>
              </View>
              <View style={historyStyles.metricItem}>
                <Text style={historyStyles.metricValue}>{weeklySummary.xpTotal}</Text>
                <Text style={historyStyles.metricLabel}>{t('history.totalXP')}</Text>
              </View>
            </View>
            <Text 
              style={[
                historyStyles.deltaText,
                weeklySummary.deltaPercentFromLastWeek >= 0 
                  ? historyStyles.deltaPositive 
                  : historyStyles.deltaNegative
              ]}
            >
              {formatDelta(weeklySummary.deltaPercentFromLastWeek)}
            </Text>
          </View>
        )}

        {/* Calendar Card */}
        <CalendarMonth
          currentMonth={currentMonth}
          activeDates={activeDates}
          selectedDate={selectedDate}
          onMonthChange={handleMonthChange}
          onDatePress={handleDatePress}
          emptyMessage={t('history.noWorkoutsThisMonth')}
        />

        {/* Recent Workouts Section */}
        <View style={historyStyles.workoutsSection}>
          <View style={historyStyles.sectionHeader}>
            <Text style={historyStyles.sectionTitle}>{t('history.recentWorkouts')}</Text>
            {workouts.length >= MAX_RECENT_WORKOUTS && (
              <TouchableOpacity 
                style={historyStyles.sectionAction}
                onPress={() => {/* Navigate to full workouts list */}}
              >
                <Text style={historyStyles.sectionActionText}>{t('history.seeMoreWorkouts')}</Text>
                <Ionicons name="chevron-forward" size={16} color="#4CAF50" />
              </TouchableOpacity>
            )}
          </View>
          
          {workoutsLoading ? (
            <>
              <SkeletonWorkoutCard />
              <SkeletonWorkoutCard />
              <SkeletonWorkoutCard />
            </>
          ) : workouts.length === 0 ? (
            <View style={historyStyles.emptyContainer}>
              <Text style={historyStyles.emptyTitle}>
                {selectedDate ? t('history.noWorkoutsForDate') : t('history.noWorkoutsTitle')}
              </Text>
              {!selectedDate && (
                <Text style={historyStyles.emptyMessage}>{t('history.noWorkoutsMessage')}</Text>
              )}
            </View>
          ) : (
            <>
              {workouts.map((workout) => (
                <TouchableOpacity
                  key={workout.id}
                  style={historyStyles.workoutCard}
                  activeOpacity={0.7}
                  onPress={() => handleWorkoutPress(workout.id)}
                >
                  <View style={historyStyles.workoutCardHeader}>
                    <View style={historyStyles.workoutHeaderLeft}>
                      <Text style={historyStyles.workoutType}>{workout.type}</Text>
                      <Text style={historyStyles.workoutDate}>{formatDate(workout.startedAt)}</Text>
                    </View>
                    <View style={historyStyles.workoutHeaderRight}>
                      <Text style={historyStyles.workoutDuration}>{workout.durationMinutes} min</Text>
                      <View style={historyStyles.xpBadge}>
                        <Text style={historyStyles.xpBadgeText}>{workout.xpEarned} xp</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={historyStyles.workoutStats}>
                    <View style={historyStyles.statItem}>
                      <Text style={[historyStyles.statValue, !workout.calories && historyStyles.statValueMuted]}>
                        {workout.calories ?? '--'}
                      </Text>
                      <Text style={historyStyles.statLabel}>{t('history.calories')}</Text>
                    </View>
                    <View style={historyStyles.statItem}>
                      <Text style={[historyStyles.statValue, !workout.avgHr && historyStyles.statValueMuted]}>
                        {workout.avgHr ?? '--'}
                      </Text>
                      <Text style={historyStyles.statLabel}>{t('history.avgHR')}</Text>
                    </View>
                    <View style={historyStyles.statItem}>
                      <Text style={[historyStyles.statValue, !workout.exercisesCount && historyStyles.statValueMuted]}>
                        {workout.exercisesCount ?? '--'}
                      </Text>
                      <Text style={historyStyles.statLabel}>{t('history.exercises')}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>

        {/* History Overview */}
        <View style={historyStyles.sectionHeader}>
          <Text style={historyStyles.sectionTitle}>{t('history.historyOverview')}</Text>
        </View>
        
        <View style={historyStyles.overviewGrid}>
          {/* Most Frequent Workouts */}
          <View style={historyStyles.overviewCard}>
            <Text style={historyStyles.overviewTitle}>{t('history.mostFrequentWorkouts')}</Text>
            {overviewLoading ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#4CAF50" />
              </View>
            ) : mostFrequent && mostFrequent.items.length > 0 ? (
              <>
                {mostFrequent.items.map((item, idx) => (
                  <View 
                    key={idx} 
                    style={[
                      historyStyles.frequentItem,
                      idx === mostFrequent.items.length - 1 && historyStyles.frequentItemLast
                    ]}
                  >
                    <Text style={historyStyles.frequentWorkoutName}>{item.name}</Text>
                    <Text style={historyStyles.frequentWorkoutCount}>{item.count}</Text>
                  </View>
                ))}
              </>
            ) : (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Text style={historyStyles.emptyText}>{t('history.noData')}</Text>
              </View>
            )}
          </View>

          {/* XP Over Time */}
          <View style={historyStyles.overviewCard}>
            <Text style={historyStyles.overviewTitle}>{t('history.xpOverTime')}</Text>
            {overviewLoading ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#4CAF50" />
              </View>
            ) : xpOverTime && xpOverTime.series.length > 0 ? (
              <>
                <XpMiniChart 
                  data={xpOverTime.series} 
                  width={280}
                  height={140}
                  maxXp={xpOverTime.maxXp}
                  rangeLabel={t('history.thisMonth')}
                  showLabels={true}
                />
                <View style={historyStyles.xpMetrics}>
                  <View style={historyStyles.xpMetricItem}>
                    <Text style={historyStyles.xpMetricValue}>{xpOverTime.totalXp}</Text>
                    <Text style={historyStyles.xpMetricLabel}>{t('history.total')}</Text>
                  </View>
                  <View style={historyStyles.xpMetricItem}>
                    <Text style={historyStyles.xpMetricValue}>{xpOverTime.workoutsCount}</Text>
                    <Text style={historyStyles.xpMetricLabel}>{t('history.workouts')}</Text>
                  </View>
                  <View style={historyStyles.xpMetricItem}>
                    <Text style={historyStyles.xpMetricValue}>{xpOverTime.avgXpPerWorkout}</Text>
                    <Text style={historyStyles.xpMetricLabel}>{t('history.avgPerWorkout')}</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Text style={historyStyles.emptyText}>{t('history.noData')}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
