import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="gender" options={{ headerShown: false }} />
      <Stack.Screen name="birthday" options={{ headerShown: false }} />
      <Stack.Screen name="height" options={{ headerShown: false }} />
      <Stack.Screen name="weight" options={{ headerShown: false }} />
      <Stack.Screen name="goal" options={{ headerShown: false }} />
      <Stack.Screen name="activity-level" options={{ headerShown: false }} />
      <Stack.Screen name="dietary-preferences" options={{ headerShown: false }} />
      <Stack.Screen name="medical-conditions" options={{ headerShown: false }} />
      <Stack.Screen name="progress-setup" options={{ headerShown: false }} />
      <Stack.Screen name="workout-preferences" options={{ headerShown: false }} />
      <Stack.Screen name="contact-info" options={{ headerShown: false }} />
      <Stack.Screen name="breakfast-time" options={{ headerShown: false }} />
      <Stack.Screen name="dinner-time" options={{ headerShown: false }} />
      <Stack.Screen name="personalizing" options={{ headerShown: false }} />
    </Stack>
  );
}
