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
import { authService } from '../services/auth';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8faf8' }}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading ZoeFit...</Text>
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/LoginScreen" />;
}