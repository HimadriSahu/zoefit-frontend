import { Stack } from "expo-router";
import { OnboardingProvider } from './screens/OnboardingContext';
import { ThemeProvider, useTheme } from './screens/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

function ThemedStack() {
  const { theme } = useTheme();

  return (
    <>
      <StatusBar
        style="light"
        backgroundColor={theme.background}
        translucent={false}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerBackground: () => (
            <LinearGradient
              colors={theme.headerGradient}
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
            backgroundColor: theme.background,
          },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <ThemeProvider>
          <ThemedStack />
        </ThemeProvider>
      </OnboardingProvider>
    </AuthProvider>
  );
}
