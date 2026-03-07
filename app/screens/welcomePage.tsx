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
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#10b981', '#059669', '#047857']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.card}>

          {/* Title */}
          <Text style={styles.subtitle}>Welcome to</Text>
          <Text style={styles.title}>ZoeFit! 💪</Text>

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
            <Text style={styles.buttonText}>Start Your Journey</Text>
            <Text style={styles.arrow}>{'→'}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    width: '85%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },

  subtitle: {
    fontSize: 18,
    color: '#374151',
    marginTop: 10,
    fontWeight: '500',
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#047857',
    marginBottom: 20,
    textShadowColor: '#10b981',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  image: {
    width: 220,
    height: 220,
    marginVertical: 20,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#047857',
    borderRadius: 30,
    overflow: 'hidden',
    marginTop: 20,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },

  buttonText: {
    backgroundColor: '#10b981',
    paddingVertical: 15,
    paddingHorizontal: 30,
    fontWeight: 'bold',
    borderRadius: 30,
    color: '#fff',
    fontSize: 16,
  },

  arrow: {
    color: '#fff',
    paddingHorizontal: 20,
    fontWeight: 'bold',
    fontSize: 18,
  },
});
