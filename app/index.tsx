// import { Text, View } from "react-native";

// export default function Index() {
//   return (
//     <View
//       style={{
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//       }}
//     >
//       <Text>Edit app/index.tsx to edit this screen.</Text>
//     </View>
//   );
// }
// import { Text, View, Button } from 'react-native';
// import { useState } from 'react';

// export default function App() {
//   const [message, setMessage] = useState("");

//   const fetchData = async () => {
//     const res = await fetch("http://192.168.1.9:8000/api/hello/");
//     const data = await res.json();
//     setMessage(data.message);
//   };

//   return (
//     <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
//       <Button title="Call API" onPress={fetchData} />
//       <Text>{message}</Text>
//     </View>
//   );
// }

import { Redirect } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/auth';

const ONBOARDING_COMPLETED_KEY = 'nutrio_onboarding_completed';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
        setOnboardingCompleted(completed === 'true');
      } else {
        setOnboardingCompleted(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setOnboardingCompleted(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || (isAuthenticated && onboardingCompleted === null)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8faf8' }}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading ZoeFit...</Text>
      </View>
    );
  }

  if (isAuthenticated) {
    // Place onboarding before home: go to onboarding first unless already completed
    if (!onboardingCompleted) {
      return <Redirect href={"/onboarding" as import('expo-router').Href} />;
    }
    return <Redirect href="/Zoefit/welcomePage" />;
  }

  return <Redirect href="/LoginScreen" />;
}