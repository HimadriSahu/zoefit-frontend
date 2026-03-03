import { Stack } from "expo-router";
import { OnboardingProvider } from '../context/OnboardingContext';

export default function RootLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            // backgroundColor: '#1399a3ff',
          },
          // headerTintColor: '#fff',
          headerTitleStyle: {
          fontWeight: 'bold',
          },
        }}
      />
    </OnboardingProvider>
  );
}
