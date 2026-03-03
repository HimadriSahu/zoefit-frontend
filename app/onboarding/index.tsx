import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

export default function OnboardingIndex() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#eafcf7' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient colors={["#43e97b", "#38f9d7"]} style={styles.header}>
          <Text style={styles.logo}>ZoeFit</Text>
        </LinearGradient>
        
        <View style={styles.container}>
          <View style={styles.cardGlass}>
            <Text style={styles.title}>Welcome to ZoeFit!</Text>
            <Text style={styles.subtitle}>Let's get to know you better</Text>
            
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/onboarding/gender')}
            >
              <LinearGradient colors={["#43e97b", "#38f9d7"]} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#43e97b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
    textShadowColor: '#38f9d7',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  cardGlass: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 24,
    padding: 30,
    marginTop: -30,
    shadowColor: '#43e97b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(67,233,123,0.1)',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    borderRadius: 15,
    shadowColor: '#43e97b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    width: '100%',
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: '#38f9d7',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
