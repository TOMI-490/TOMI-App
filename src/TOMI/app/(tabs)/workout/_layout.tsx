import { Stack } from 'expo-router';

export default function WorkoutLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="live"
        options={{
          title: 'Live Workout',
          headerShown: false,
          headerBackVisible: false,
          gestureEnabled: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="summary"
        options={{
          title: 'Workout Summary',
          headerShown: false,
          headerBackVisible: false,
          gestureEnabled: false,
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
