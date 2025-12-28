import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '../components/ScreenWrapper';
import strings from '../locales/en.json';
import { homePageStyles as styles } from '../styles/home/homePage.styles';

// TODO: Replace with actual backend API when ready
const USE_MOCK_DATA = true;

const mockData = {
  name: 'Noodle',
  level: 5,
  stage: 'Baby',
  xpCurrent: 120,
  xpNext: 200,
  needs: [
    { icon: '🏃', label: 'Activity', status: 'good', value: 85 },
    { icon: '🍽️', label: 'Nutrition', status: 'warning', value: 60 },
    { icon: '❤️', label: 'Health', status: 'good', value: 90 },
    { icon: '🌙', label: 'Rest', status: 'good', value: 95 },
  ],
  streak: 7,
  dailyGoal: { current: 45, target: 60, unit: 'min' },
  today: {
    workouts: 2,
    minutes: 45,
    xpEarned: 120,
  },
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return strings.home.goodMorning;
  if (hour < 18) return strings.home.goodAfternoon;
  return strings.home.goodEvening;
};

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState(mockData);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setData(mockData);
      } else {
        // TODO: Fetch from backend API
        throw new Error('Backend not implemented');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : strings.home.errorLoading);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper style={styles.container}>
        <View style={styles.error}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.button} onPress={loadData}>
            <Text style={styles.buttonText}>{strings.home.retry}</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  const progress = (data.xpCurrent / data.xpNext) * 100;
  const dailyGoalProgress = (data.dailyGoal.current / data.dailyGoal.target) * 100;

  return (
    <ScreenWrapper style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Greeting */}
        <Text style={styles.greeting}>{getGreeting()}</Text>

        {/* TOMI Card */}
        <View style={styles.card}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.avatar} />
          
          {/* Needs Row */}
          <View style={styles.needs}>
            {data.needs.map((need, index) => (
              <TouchableOpacity key={index} style={styles.need}>
                <Text style={styles.needIcon}>{need.icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Identity */}
        <View style={styles.identity}>
          <Text style={styles.name}>{data.name}</Text>
          <Text style={styles.subtitle}>
            {strings.home.levelStage
              .replace('{level}', data.level.toString())
              .replace('{stage}', data.stage)}
          </Text>
        </View>

        {/* Streak Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeIcon}>🔥</Text>
          <Text style={styles.badgeText}>
            {strings.home.dayStreak.replace('{days}', data.streak.toString())}
          </Text>
        </View>

        {/* Daily Goal */}
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>{strings.home.dailyGoal}</Text>
            <Text style={styles.goalValue}>
              {data.dailyGoal.current}/{data.dailyGoal.target} {data.dailyGoal.unit}
            </Text>
          </View>
          <View style={styles.goalBar}>
            <View style={[styles.goalFill, { width: `${Math.min(dailyGoalProgress, 100)}%` }]} />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(tabs)/workout')}
          >
            <Text style={styles.buttonIcon}>🏃</Text>
            <Text style={styles.buttonText}>{strings.home.startWorkout}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => router.push('/(tabs)/avatar')}
          >
            <Text style={styles.buttonIcon}>✨</Text>
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
              {strings.home.customize}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Today's Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>{strings.home.todaysProgress}</Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{data.today.workouts}</Text>
              <Text style={styles.statLabel}>{strings.home.workouts}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{data.today.minutes}</Text>
              <Text style={styles.statLabel}>{strings.home.minutes}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{data.today.xpEarned}</Text>
              <Text style={styles.statLabel}>{strings.home.xpEarned}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
