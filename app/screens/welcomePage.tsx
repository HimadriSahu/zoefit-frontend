import { useRouter } from 'expo-router';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>

        {/* Title */}
        <Text style={styles.subtitle}>Welcome to</Text>
        <Text style={styles.title}>Fitness app!</Text>

        {/* Illustration */}
        <Image
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/512/2936/2936886.png',
          }}
          style={styles.image}
          resizeMode="contain"
        />

        {/* Start Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/Zoefit/home')}
        >
          <Text style={styles.buttonText}>Start!</Text>
          <Text style={styles.arrow}>{'>>>>'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEFF2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },

  subtitle: {
    fontSize: 18,
    color: '#555',
    marginTop: 10,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },

  image: {
    width: 220,
    height: 220,
    marginVertical: 20,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 30,
    overflow: 'hidden',
    marginTop: 10,
  },

  buttonText: {
    backgroundColor: '#FFD43B',
    paddingVertical: 12,
    paddingHorizontal: 25,
    fontWeight: 'bold',
    borderRadius: 30,
  },

  arrow: {
    color: '#fff',
    paddingHorizontal: 20,
    fontWeight: 'bold',
  },
});
