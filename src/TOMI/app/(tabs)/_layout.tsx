import { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { F } from '../../constants/fonts';
import strings from '../../locales/en.json';

export default function TabLayout() {
  const { colors: T } = useTheme();

  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarActiveTintColor: T.primary,
      tabBarInactiveTintColor: T.textMuted,
      tabBarLabelStyle: {
        fontFamily: F.semiBold,
        fontSize: 10,
        letterSpacing: 0.2,
        marginTop: 2,
      },
      tabBarStyle: {
        backgroundColor: T.cardBg,
        borderTopWidth: 0,
        height: Platform.OS === 'ios' ? 96 : 74,
        paddingTop: 10,
        paddingBottom: Platform.OS === 'ios' ? 32 : 12,
        ...Platform.select({
          ios: {
            shadowColor: T.textMuted,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.08,
            shadowRadius: 16,
          },
          android: { elevation: 12 },
        }),
      },
      tabBarItemStyle: {
        gap: 2,
      },
    }),
    [T],
  );

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: strings.nav.home,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} activeTint={T.primaryTint}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: strings.nav.community,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} activeTint={T.primaryTint}>
              <Ionicons name={focused ? 'people' : 'people-outline'} size={22} color={color} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: strings.nav.workout,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} activeTint={T.primaryTint}>
              <Ionicons name={focused ? 'barbell' : 'barbell-outline'} size={22} color={color} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="avatar"
        options={{
          title: strings.nav.avatar,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} activeTint={T.primaryTint}>
              <MaterialCommunityIcons name={focused ? 'emoticon' : 'emoticon-outline'} size={22} color={color} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: strings.nav.history,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} activeTint={T.primaryTint}>
              <Ionicons name={focused ? 'time' : 'time-outline'} size={22} color={color} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="workout-detail"
        options={{
          title: 'Workout Details',
          href: null,
        }}
      />
      <Tabs.Screen
        name="friend-visit"
        options={{
          title: 'Friend Profile',
          href: null,
        }}
      />
    </Tabs>
  );
}

function TabIcon({
  focused,
  children,
  activeTint,
}: {
  focused: boolean;
  children: React.ReactNode;
  activeTint: string;
}) {
  return (
    <View style={[iconStyles.wrap, focused && { backgroundColor: activeTint }]}>
      {children}
    </View>
  );
}

const iconStyles = StyleSheet.create({
  wrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
