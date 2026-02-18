import { Tabs } from 'expo-router';
import strings from '../../locales/en.json';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: strings.nav.home }} />
      <Tabs.Screen name="community" options={{ title: strings.nav.community }} />
      <Tabs.Screen name="workout" options={{ title: strings.nav.workout }} />
      <Tabs.Screen name="avatar" options={{ title: strings.nav.avatar }} />
      <Tabs.Screen name="history" options={{ title: strings.nav.history }} />
      <Tabs.Screen 
        name="workout-detail" 
        options={{ 
          title: 'Workout Details',
          href: null // Hide from tab bar
        }} 
      />
      <Tabs.Screen 
        name="friend-visit" 
        options={{ 
          title: 'Friend Profile',
          href: null // Hide from tab bar
        }} 
      />
    </Tabs>
  );
}
