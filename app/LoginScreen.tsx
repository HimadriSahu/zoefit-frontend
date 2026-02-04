import LoginScreen from '../components/LoginScreen';
import { Stack } from 'expo-router';

export default function LoginScreenPage() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'ZoeFit',
          headerShown: true,
        }}
      />
      <LoginScreen />
    </>
  );
}
