import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '../screens/OnboardingContext';
import { useTheme } from '../screens/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const EquipmentScreen = () => {
  const router = useRouter();
  const { data, setEquipmentNeeded } = useOnboarding();
  const { theme } = useTheme();
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  const equipmentOptions = [
    {
      category: 'Basic Equipment',
      items: [
        { id: 'bodyweight', name: 'Bodyweight Only', icon: '🏃‍♂️', description: 'No equipment needed' },
        { id: 'dumbbells', name: 'Dumbbells', icon: '🏋️‍♂️', description: 'Various weights' },
        { id: 'resistance_bands', name: 'Resistance Bands', icon: '🎯', description: 'Different resistance levels' },
        { id: 'yoga_mat', name: 'Yoga Mat', icon: '🧘‍♀️', description: 'For floor exercises' },
        { id: 'jump_rope', name: 'Jump Rope', icon: '🪢', description: 'Cardio equipment' },
      ]
    },
    {
      category: 'Cardio Equipment',
      items: [
        { id: 'treadmill', name: 'Treadmill', icon: '🏃‍♂️', description: 'Running/walking machine' },
        { id: 'stationary_bike', name: 'Stationary Bike', icon: '🚴‍♂️', description: 'Indoor cycling' },
        { id: 'elliptical', name: 'Elliptical', icon: '🔄', description: 'Low-impact cardio' },
        { id: 'rowing_machine', name: 'Rowing Machine', icon: '🚣‍♂️', description: 'Full-body workout' },
        { id: 'stair_climber', name: 'Stair Climber', icon: '🪜', description: 'Climbing machine' },
      ]
    },
    {
      category: 'Strength Training',
      items: [
        { id: 'barbell', name: 'Barbell', icon: '🏋️‍♂️', description: 'Olympic or standard' },
        { id: 'kettlebells', name: 'Kettlebells', icon: '🔔', description: 'Various weights' },
        { id: 'bench', name: 'Workout Bench', icon: '🪑', description: 'Adjustable or flat' },
        { id: 'pull_up_bar', name: 'Pull-up Bar', icon: '🔗', description: 'Doorway or wall-mounted' },
        { id: 'cables', name: 'Cable Machine', icon: '⚓', description: 'Multi-station gym' },
      ]
    },
    {
      category: 'Specialty Equipment',
      items: [
        { id: 'trx', name: 'TRX/Suspension', icon: '🪢', description: 'Suspension trainer' },
        { id: 'medicine_ball', name: 'Medicine Ball', icon: '⚽', description: 'Weighted balls' },
        { id: 'foam_roller', name: 'Foam Roller', icon: '🔲', description: 'Recovery tool' },
        { id: 'punching_bag', name: 'Punching Bag', icon: '🥊', description: 'Boxing equipment' },
        { id: 'stability_ball', name: 'Stability Ball', icon: '⚪', description: 'Exercise ball' },
      ]
    }
  ];

  const toggleEquipment = (equipmentId: string) => {
    setSelectedEquipment(prev => {
      if (prev.includes(equipmentId)) {
        return prev.filter(id => id !== equipmentId);
      } else {
        return [...prev, equipmentId];
      }
    });
  };

  const handleContinue = () => {
    // Store selected equipment in onboarding context
    setEquipmentNeeded(selectedEquipment);
    console.log('Selected equipment:', selectedEquipment);
    router.push('/onboarding/dietary-preferences');
  };

  const handleSkip = () => {
    router.push('/onboarding/dietary-preferences');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={theme.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Equipment</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '70%', backgroundColor: theme.primary }]} />
          </View>
          <Text style={[styles.progressText, { color: theme.textSecondary }]}>Step 7 of 10</Text>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>
            What equipment do you have?
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Select all equipment you have access to for workouts
          </Text>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {equipmentOptions.map((category) => (
              <View key={category.category} style={styles.categoryContainer}>
                <Text style={[styles.categoryTitle, { color: theme.text }]}>
                  {category.category}
                </Text>

                <View style={styles.equipmentGrid}>
                  {category.items.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.equipmentCard,
                        {
                          backgroundColor: selectedEquipment.includes(item.id)
                            ? theme.primary
                            : theme.cardBackground,
                          borderColor: theme.border,
                        }
                      ]}
                      onPress={() => toggleEquipment(item.id)}
                    >
                      <Text style={styles.equipmentIcon}>{item.icon}</Text>
                      <Text style={[
                        styles.equipmentName,
                        { color: selectedEquipment.includes(item.id) ? '#fff' : theme.text }
                      ]}>
                        {item.name}
                      </Text>
                      <Text style={[
                        styles.equipmentDescription,
                        { color: selectedEquipment.includes(item.id) ? 'rgba(255,255,255,0.8)' : theme.textSecondary }
                      ]}>
                        {item.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.skipButton, { borderColor: theme.border }]}
              onPress={handleSkip}
            >
              <Text style={[styles.skipButtonText, { color: theme.textSecondary }]}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.continueButton, { backgroundColor: theme.primary }]}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  backButton: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#047857',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
    marginBottom: 20,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  equipmentCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  equipmentIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  equipmentName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  equipmentDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  skipButton: {
    width: '30%',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    width: '65%',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EquipmentScreen;
