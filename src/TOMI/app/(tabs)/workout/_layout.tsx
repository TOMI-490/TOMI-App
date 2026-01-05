import { Stack } from 'expo-router';

export default function WorkoutLayout() {
  return (
    <Stack>
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
          headerShown: true,
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="summary"
        options={{
          title: 'Workout Summary',
          headerShown: true,
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
