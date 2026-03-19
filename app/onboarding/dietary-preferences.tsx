import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '../screens/OnboardingContext';
import { useTheme } from '../screens/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const DietaryPreferencesScreen = () => {
  const router = useRouter();
  const { data, setDietaryPreferences, setAllergies } = useOnboarding();
  const { theme } = useTheme();
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState('');

  const dietOptions = [
    { id: 'omnivore', name: 'Omnivore', icon: '🍽️', description: 'No restrictions' },
    { id: 'vegetarian', name: 'Vegetarian', icon: '🥗', description: 'No meat or fish' },
    { id: 'vegan', name: 'Vegan', icon: '🌱', description: 'No animal products' },
    { id: 'pescatarian', name: 'Pescatarian', icon: '🐟', description: 'Fish but no meat' },
    { id: 'keto', name: 'Keto', icon: '🥑', description: 'Low carb, high fat' },
    // { id: 'paleo', name: 'Paleo', icon: '🦕', description: 'Whole foods only' },
    { id: 'mediterranean', name: 'Mediterranean', icon: '🫒', description: 'Plant-based, healthy fats' },
    { id: 'low_carb', name: 'Low Carb', icon: '🥦', description: 'Reduced carbohydrates' },
    { id: 'high_protein', name: 'High Protein', icon: '🍗', description: 'Protein-focused' },
    { id: 'gluten_free', name: 'Gluten-Free', icon: '🌾', description: 'No gluten' },
  ];

  const allergyOptions = [
    { id: 'nuts', name: 'Nuts', icon: '🥜' },
    { id: 'dairy', name: 'Dairy', icon: '🥛' },
    { id: 'eggs', name: 'Eggs', icon: '🥚' },
    { id: 'soy', name: 'Soy', icon: '🫘' },
    { id: 'shellfish', name: 'Shellfish', icon: '🦐' },
    { id: 'fish', name: 'Fish', icon: '🐟' },
    { id: 'wheat', name: 'Wheat', icon: '🌾' },
    { id: 'sesame', name: 'Sesame', icon: '🫘' },
  ];

  const toggleDiet = (dietId: string) => {
    setSelectedDiets(prev => {
      if (prev.includes(dietId)) {
        return prev.filter(id => id !== dietId);
      } else {
        return [...prev, dietId];
      }
    });
  };

  const toggleAllergy = (allergyId: string) => {
    setSelectedAllergies(prev => {
      if (prev.includes(allergyId)) {
        return prev.filter(id => id !== allergyId);
      } else {
        return [...prev, allergyId];
      }
    });
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !selectedAllergies.includes(customAllergy.trim())) {
      setSelectedAllergies(prev => [...prev, customAllergy.trim()]);
      setCustomAllergy('');
    }
  };

  const handleContinue = () => {
    // Store dietary preferences in onboarding context
    const dietaryPrefs = selectedDiets.reduce((acc, diet) => {
      acc[diet] = true;
      return acc;
    }, {} as Record<string, any>);

    setDietaryPreferences(dietaryPrefs);
    setAllergies(selectedAllergies);

    console.log('Selected diets:', selectedDiets);
    console.log('Selected allergies:', selectedAllergies);
    router.push('/onboarding/medical-conditions');
  };

  const handleSkip = () => {
    router.push('/onboarding/medical-conditions');
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
          <Text style={styles.headerTitle}>Dietary Preferences</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '80%', backgroundColor: theme.primary }]} />
          </View>
          <Text style={[styles.progressText, { color: theme.textSecondary }]}>Step 8 of 10</Text>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>
            Tell us about your diet
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            This helps us create personalized meal plans for you
          </Text>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Diet Preferences */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Diet Type</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                Select your dietary preferences (you can choose multiple)
              </Text>

              <View style={styles.dietGrid}>
                {dietOptions.map((diet) => (
                  <TouchableOpacity
                    key={diet.id}
                    style={[
                      styles.dietCard,
                      {
                        backgroundColor: selectedDiets.includes(diet.id)
                          ? theme.primary
                          : theme.cardBackground,
                        borderColor: theme.border,
                      }
                    ]}
                    onPress={() => toggleDiet(diet.id)}
                  >
                    <Text style={styles.dietIcon}>{diet.icon}</Text>
                    <Text style={[
                      styles.dietName,
                      { color: selectedDiets.includes(diet.id) ? '#fff' : theme.text }
                    ]}>
                      {diet.name}
                    </Text>
                    <Text style={[
                      styles.dietDescription,
                      { color: selectedDiets.includes(diet.id) ? 'rgba(255,255,255,0.8)' : theme.textSecondary }
                    ]}>
                      {diet.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Allergies */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Food Allergies</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                Select any foods you're allergic to
              </Text>

              <View style={styles.allergyGrid}>
                {allergyOptions.map((allergy) => (
                  <TouchableOpacity
                    key={allergy.id}
                    style={[
                      styles.allergyCard,
                      {
                        backgroundColor: selectedAllergies.includes(allergy.id)
                          ? '#ef4444'
                          : theme.cardBackground,
                        borderColor: theme.border,
                      }
                    ]}
                    onPress={() => toggleAllergy(allergy.id)}
                  >
                    <Text style={styles.allergyIcon}>{allergy.icon}</Text>
                    <Text style={[
                      styles.allergyName,
                      { color: selectedAllergies.includes(allergy.id) ? '#fff' : theme.text }
                    ]}>
                      {allergy.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Allergy Input */}
              <View style={[styles.customAllergyContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <Text style={[styles.customAllergyLabel, { color: theme.text }]}>Add Custom Allergy:</Text>
                <View style={styles.customAllergyInputContainer}>
                  <TextInput
                    style={[styles.customAllergyInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                    value={customAllergy}
                    onChangeText={setCustomAllergy}
                    placeholder="Enter allergy name"
                    placeholderTextColor={theme.textSecondary}
                  />
                  <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: theme.primary }]}
                    onPress={addCustomAllergy}
                  >
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>

                {/* Custom Allergies List */}
                {selectedAllergies.filter(a => !allergyOptions.find(opt => opt.id === a)).map((allergy, index) => (
                  <View key={index} style={styles.customAllergyItem}>
                    <Text style={[styles.customAllergyText, { color: theme.text }]}>{allergy}</Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => setSelectedAllergies(prev => prev.filter(a => a !== allergy))}
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  dietGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dietCard: {
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
  dietIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  dietName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  dietDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  allergyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  allergyCard: {
    width: '22%',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  allergyIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  allergyName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  customAllergyContainer: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  customAllergyLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  customAllergyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  customAllergyInput: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    marginRight: 12,
  },
  addButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  customAllergyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  customAllergyText: {
    fontSize: 14,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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

export default DietaryPreferencesScreen;
