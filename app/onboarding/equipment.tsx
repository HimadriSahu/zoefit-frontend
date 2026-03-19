import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOnboarding } from '../screens/OnboardingContext';
import { useTheme } from '../screens/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

const EquipmentScreen = () => {
  const router = useRouter();
  const { data, setEquipmentAvailable } = useOnboarding();
  const { theme } = useTheme();
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(data.equipmentAvailable || []);

  const equipmentOptions = [
    // Cardio Equipment
    { id: 'treadmill', name: 'Treadmill', category: 'cardio', icon: '🏃' },
    { id: 'stationary_bike', name: 'Stationary Bike', category: 'cardio', icon: '🚴' },
    { id: 'elliptical', name: 'Elliptical', category: 'cardio', icon: '🔄' },
    { id: 'rowing_machine', name: 'Rowing Machine', category: 'cardio', icon: '🚣' },
    { id: 'jump_rope', name: 'Jump Rope', category: 'cardio', icon: '🪢' },

    // Strength Equipment
    { id: 'dumbbells', name: 'Dumbbells', category: 'strength', icon: '🏋️' },
    { id: 'barbell', name: 'Barbell', category: 'strength', icon: '🏋️‍♂️' },
    { id: 'kettlebells', name: 'Kettlebells', category: 'strength', icon: '🏺' },
    { id: 'resistance_bands', name: 'Resistance Bands', category: 'strength', icon: '🪢' },
    { id: 'pull_up_bar', name: 'Pull-up Bar', category: 'strength', icon: '🏋️‍♀️' },
    { id: 'dip_station', name: 'Dip Station', category: 'strength', icon: '🤸' },

    // Functional Equipment
    { id: 'stability_ball', name: 'Stability Ball', category: 'functional', icon: '⚪' },
    { id: 'foam_roller', name: 'Foam Roller', category: 'functional', icon: '🔲' },
    { id: 'medicine_ball', name: 'Medicine Ball', category: 'functional', icon: '🔴' },
    { id: 'battle_ropes', name: 'Battle Ropes', category: 'functional', icon: '🪢' },

    // Bodyweight (no equipment)
    { id: 'bodyweight', name: 'Bodyweight Only', category: 'none', icon: '🧍‍♂️' },
  ];

  const equipmentCategories = [
    { id: 'cardio', name: 'Cardio Equipment', icon: '🏃' },
    { id: 'strength', name: 'Strength Equipment', icon: '💪' },
    { id: 'functional', name: 'Functional Equipment', icon: '🏋️' },
    { id: 'none', name: 'No Equipment', icon: '🧍‍♂️' },
  ];

  const toggleEquipment = (equipmentId: string) => {
    if (selectedEquipment.includes(equipmentId)) {
      setSelectedEquipment(selectedEquipment.filter(id => id !== equipmentId));
    } else {
      setSelectedEquipment([...selectedEquipment, equipmentId]);
    }
  };

  const handleNext = () => {
    setEquipmentAvailable(selectedEquipment);
    router.push('/onboarding/workout-preferences');
  };

  const handleSkip = () => {
    setEquipmentAvailable([]);
    router.push('/onboarding/workout-preferences');
  };

  const getEquipmentByCategory = (category: string) => {
    return equipmentOptions.filter(eq => eq.category === category);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={theme.headerGradient}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Select Your Equipment
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Choose the equipment you have access to. This helps us create personalized workouts.
          </Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {equipmentCategories.map((category) => (
            <View key={category.id} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={[styles.categoryTitle, { color: theme.text }]}>
                  {category.icon} {category.name}
                </Text>
              </View>

              <View style={styles.equipmentGrid}>
                {getEquipmentByCategory(category.id).map((equipment) => {
                  const isSelected = selectedEquipment.includes(equipment.id);
                  return (
                    <TouchableOpacity
                      key={equipment.id}
                      style={[
                        styles.equipmentItem,
                        {
                          backgroundColor: isSelected ? theme.primary : theme.cardBackground,
                          borderColor: isSelected ? theme.primary : theme.border
                        }
                      ]}
                      onPress={() => toggleEquipment(equipment.id)}
                    >
                      <View style={styles.equipmentContent}>
                        <Text style={styles.equipmentIcon}>{equipment.icon}</Text>
                        <Text style={[styles.equipmentName, { color: isSelected ? theme.background : theme.text }]}>
                          {equipment.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.skipButton, { backgroundColor: theme.cardBackground }]}
            onPress={handleSkip}
          >
            <Text style={[styles.skipButtonText, { color: theme.textSecondary }]}>
              Skip for now
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: theme.primary }]}
            onPress={handleNext}
            disabled={selectedEquipment.length === 0}
          >
            <Text style={[styles.nextButtonText, { color: theme.background }]}>
              Continue ({selectedEquipment.length} selected)
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 30,
  },
  categoryHeader: {
    marginBottom: 15,
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  equipmentItem: {
    width: (screenWidth - 40) / 3,
    height: 80,
    margin: 5,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equipmentContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  equipmentIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  equipmentName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 15,
  },
  skipButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    flex: 2,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EquipmentScreen;
