import { Stack } from "expo-router";
import { OnboardingProvider } from './screens/OnboardingContext';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

export default function RootLayout() {
  return (
    <OnboardingProvider>
      <StatusBar 
        style="light" 
        backgroundColor="#0a0f1c" 
        translucent={false}
      />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerBackground: () => (
            <LinearGradient
              colors={['#667eea', '#764ba2', '#f093fb']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1 }}
            />
          ),
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          contentStyle: {
            backgroundColor: '#0a0f1c',
          },
        }}
      />
    </OnboardingProvider>
  );
}
