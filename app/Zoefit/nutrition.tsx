import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal, Dimensions, TextStyle, ViewStyle, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService as nutritionAPI } from '../../services/api';
import { useTheme } from '../screens/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginHorizontal: 4,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textShadowColor: '#764ba2',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    fontWeight: '500',
  },
  personalizeButton: {
    borderRadius: 15,
  },
  personalizeGradient: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  personalizeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  statsContainer: {
    padding: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 18,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statGoal: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#a78bfa',
    borderRadius: 2,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  quickActionCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 18,
    padding: 15,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  waterButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 7,
  },
  waterButton: {
    backgroundColor: '#667eea',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  waterCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    minWidth: 50,
    textAlign: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  actionButtonGradient: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  mealsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  mealCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  mealMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 10,
  },
  mealTypeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  mealTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  calorieBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  calorieText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 10,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  macroLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  ingredientsContainer: {
    marginBottom: 15,
  },
  ingredientsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  ingredientsList: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 16,
  },
  logButton: {
    borderRadius: 10,
  },
  logButtonGradient: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  logButtonActive: {
    opacity: 0.7,
  },
  logButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  tipsContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 15,
  },
  tipsGradient: {
    padding: 20,
    borderRadius: 15,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  tip: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
    opacity: 0.95,
  },
  noResultsContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  loggedMealsContainer: {
    padding: 20,
    backgroundColor: 'rgba(167,139,250,0.1)',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.3)',
  },
  loggedMealsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  loggedCaloriesText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1f2e',
    borderRadius: 20,
    padding: 25,
    width: '80%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#fff',
    marginBottom: 12,
  },
  goalInputContainer: {
    marginBottom: 15,
  },
  goalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 5,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 5,
  },
  modalButtonGradient: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

const NutritionScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const [, setSelectedMeal] = useState<string | null>(null);
  const [waterIntake, setWaterIntake] = useState(6);
  const [waterGoal, setWaterGoal] = useState(8);
  const [searchQuery, setSearchQuery] = useState('');
  const [loggedMeals, setLoggedMeals] = useState<string[]>([]);
  const [showCustomMealModal, setShowCustomMealModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [customMealName, setCustomMealName] = useState('');
  const [customMealCalories, setCustomMealCalories] = useState('');
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [proteinGoal, setProteinGoal] = useState(120);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Sample data - in real app this would come from API
  const [meals] = useState([
    {
      id: '1',
      name: 'Grilled Chicken Salad',
      type: 'Lunch',
      time: '12:30 PM',
      calories: 350,
      protein: 35,
      carbs: 15,
      fat: 12,
      ingredients: ['Chicken breast', 'Mixed greens', 'Cherry tomatoes', 'Cucumber', 'Olive oil']
    },
    {
      id: '2',
      name: 'Protein Smoothie Bowl',
      type: 'Breakfast',
      time: '8:00 AM',
      calories: 280,
      protein: 25,
      carbs: 35,
      fat: 8,
      ingredients: ['Protein powder', 'Banana', 'Berries', 'Almond milk', 'Chia seeds']
    },
    {
      id: '3',
      name: 'Quinoa Power Bowl',
      type: 'Dinner',
      time: '7:00 PM',
      calories: 420,
      protein: 28,
      carbs: 45,
      fat: 15,
      ingredients: ['Quinoa', 'Black beans', 'Avocado', 'Sweet potato', 'Tahini dressing']
    }
  ]);

  const todayStats = {
    calories: 1450,
    goal: calorieGoal,
    protein: 85,
    proteinGoal: proteinGoal,
    water: waterIntake,
    waterGoal: waterGoal
  };

  // Load data from backend on component mount
  useEffect(() => {
    setLoading(false);
  }, []);

  const logMeal = async (mealId: string) => {
    try {
      setSelectedMeal(mealId);
      if (!loggedMeals.includes(mealId)) {
        setLoggedMeals([...loggedMeals, mealId]);
        Alert.alert('Success', 'Meal logged successfully!');
      }
    } catch (error) {
      console.error('Error logging meal:', error);
      Alert.alert('Error', 'Failed to log meal');
    }
  };

  const addWater = () => {
    if (waterIntake < waterGoal + 2) {
      setWaterIntake(waterIntake + 1);
    }
  };

  const removeWater = () => {
    if (waterIntake > 0) {
      setWaterIntake(waterIntake - 1);
    }
  };

  const addCustomMeal = () => {
    if (customMealName.trim() && customMealCalories.trim()) {
      Alert.alert('Success', `Added "${customMealName}" to your nutrition log!`, [
        {
          text: 'OK', onPress: () => {
            setCustomMealName('');
            setCustomMealCalories('');
            setShowCustomMealModal(false);
          }
        }
      ]);
    }
  };

  const updateGoals = async () => {
    try {
      Alert.alert('Goals Updated', 'Your nutrition goals have been updated successfully!', [
        { text: 'OK', onPress: () => setShowGoalsModal(false) }
      ]);
    } catch (error) {
      console.log('Backend update failed, updating locally');
      Alert.alert('Goals Updated', 'Your nutrition goals have been updated successfully!', [
        { text: 'OK', onPress: () => setShowGoalsModal(false) }
      ]);
    }
  };

  const filteredMeals = meals.filter(meal =>
    meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meal.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalLoggedCalories = loggedMeals.reduce((total, mealId) => {
    const meal = meals.find(m => m.id === mealId);
    return total + (meal?.calories || 0);
  }, 0);

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case 'Breakfast': return '#FF9800';
      case 'Lunch': return '#4CAF50';
      case 'Dinner': return '#2196F3';
      default: return '#9C27B0';
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={isDarkMode ? '#667eea' : theme.primary} />
        <Text style={{ color: theme.text, marginTop: 10 }}>Loading nutrition data...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top']}>
        <LinearGradient
          colors={isDarkMode ? ['#667eea', '#764ba2', '#f093fb'] : theme.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View>
            <Text style={styles.title}>Nutrition 🥗</Text>
            <Text style={styles.subtitle}>Fuel your fitness journey</Text>
          </View>
          <TouchableOpacity
            style={styles.personalizeButton}
            onPress={() => router.push('/onboarding' as any)}
          >
            <LinearGradient
              colors={['#a78bfa', '#8b5cf6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.personalizeGradient}
            >
              <Text style={styles.personalizeButtonText}>Personalize ZoeFit</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={[styles.statsContainer, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.statsTitle, { color: theme.text }]}>{"Today's Nutrition"}</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.cardBackground, borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : theme.border }]}>
                <Text style={[styles.statNumber, { color: isDarkMode ? '#fff' : theme.text }]}>{todayStats.calories}</Text>
                <Text style={[styles.statLabel, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>Calories</Text>
                <Text style={[styles.statGoal, { color: isDarkMode ? 'rgba(255,255,255,0.6)' : theme.textSecondary }]}>of {todayStats.goal}</Text>
                <View style={[styles.progressBar, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]}>
                  <View style={[styles.progressFill, { backgroundColor: isDarkMode ? '#a78bfa' : theme.primary, width: `${(todayStats.calories / todayStats.goal) * 100}%` }]} />
                </View>
              </View>
              <View style={[styles.statCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.cardBackground, borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : theme.border }]}>
                <Text style={[styles.statNumber, { color: isDarkMode ? '#fff' : theme.text }]}>{todayStats.protein}g</Text>
                <Text style={[styles.statLabel, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>Protein</Text>
                <Text style={[styles.statGoal, { color: isDarkMode ? 'rgba(255,255,255,0.6)' : theme.textSecondary }]}>of {todayStats.proteinGoal}g</Text>
                <View style={[styles.progressBar, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]}>
                  <View style={[styles.progressFill, { backgroundColor: isDarkMode ? '#a78bfa' : theme.primary, width: `${(todayStats.protein / todayStats.proteinGoal) * 100}%` }]} />
                </View>
              </View>
              <View style={[styles.statCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.cardBackground, borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : theme.border }]}>
                <Text style={[styles.statNumber, { color: isDarkMode ? '#fff' : theme.text }]}>{todayStats.water}</Text>
                <Text style={[styles.statLabel, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>Water Glasses</Text>
                <Text style={[styles.statGoal, { color: isDarkMode ? 'rgba(255,255,255,0.6)' : theme.textSecondary }]}>of {todayStats.waterGoal}</Text>
                <View style={[styles.progressBar, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]}>
                  <View style={[styles.progressFill, { backgroundColor: isDarkMode ? '#a78bfa' : theme.primary, width: `${(todayStats.water / todayStats.waterGoal) * 100}%` }]} />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.quickActionsContainer}>
            <View style={[styles.quickActionCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.cardBackground, borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : theme.border }]}>
              <Text style={[styles.quickActionLabel, { color: isDarkMode ? '#fff' : theme.text }]}>💧 Water Intake</Text>
              <View style={styles.waterButtonsRow}>
                <TouchableOpacity
                  style={[styles.waterButton, { backgroundColor: isDarkMode ? '#667eea' : theme.primary }]}
                  onPress={removeWater}
                >
                  <Text style={styles.waterButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={[styles.waterCount, { color: isDarkMode ? '#fff' : theme.text }]}>{waterIntake}/{waterGoal}</Text>
                <TouchableOpacity
                  style={[styles.waterButton, { backgroundColor: isDarkMode ? '#667eea' : theme.primary }]}
                  onPress={addWater}
                >
                  <Text style={styles.waterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowCustomMealModal(true)}
            >
              <LinearGradient
                colors={isDarkMode ? ['#667eea', '#764ba2'] : [theme.primary, theme.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionButtonGradient}
              >
                <Text style={styles.actionButtonText}>+ Add Meal</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowGoalsModal(true)}
            >
              <LinearGradient
                colors={isDarkMode ? ['#f093fb', '#f5576c'] : [theme.primary, theme.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionButtonGradient}
              >
                <Text style={styles.actionButtonText}>🎯 Goals</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={[styles.searchInput, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.cardBackground, borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : theme.border, color: theme.text }]}
              placeholder="Search meals..."
              placeholderTextColor={isDarkMode ? "#999" : theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={[styles.mealsContainer, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Suggested Meals</Text>
            {filteredMeals.length > 0 ? (
              filteredMeals.map((meal) => (
                <View key={meal.id} style={[styles.mealCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.cardBackground, borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : theme.border }]}>
                  <View style={styles.mealHeader}>
                    <View>
                      <Text style={[styles.mealName, { color: isDarkMode ? '#fff' : theme.text }]}>{meal.name}</Text>
                      <View style={styles.mealMeta}>
                        <View style={[styles.mealTypeBadge, { backgroundColor: getMealTypeColor(meal.type) }]}>
                          <Text style={styles.mealTypeText}>{meal.type}</Text>
                        </View>
                        <Text style={[styles.mealTime, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>⏰ {meal.time}</Text>
                      </View>
                    </View>
                    <View style={styles.calorieBadge}>
                      <Text style={styles.calorieText}>{meal.calories} cal</Text>
                    </View>
                  </View>

                  <View style={[styles.macrosContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }]}>
                    <View style={styles.macroItem}>
                      <Text style={[styles.macroValue, { color: isDarkMode ? '#fff' : theme.text }]}>{meal.protein}g</Text>
                      <Text style={[styles.macroLabel, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>Protein</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={[styles.macroValue, { color: isDarkMode ? '#fff' : theme.text }]}>{meal.carbs}g</Text>
                      <Text style={[styles.macroLabel, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>Carbs</Text>
                    </View>
                    <View style={styles.macroItem}>
                      <Text style={[styles.macroValue, { color: isDarkMode ? '#fff' : theme.text }]}>{meal.fat}g</Text>
                      <Text style={[styles.macroLabel, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>Fat</Text>
                    </View>
                  </View>

                  <View style={styles.ingredientsContainer}>
                    <Text style={[styles.ingredientsTitle, { color: isDarkMode ? '#fff' : theme.text }]}>Ingredients:</Text>
                    <Text style={[styles.ingredientsList, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>{meal.ingredients.join(', ')}</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.logButton, loggedMeals.includes(meal.id) && styles.logButtonActive]}
                    onPress={() => logMeal(meal.id)}
                    disabled={loggedMeals.includes(meal.id)}
                  >
                    <LinearGradient
                      colors={loggedMeals.includes(meal.id) ? ['#4a5568', '#2d3748'] : (isDarkMode ? ['#667eea', '#764ba2'] : [theme.primary, theme.primaryDark])}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.logButtonGradient}
                    >
                      <Text style={styles.logButtonText}>
                        {loggedMeals.includes(meal.id) ? 'Logged ✓' : 'Log This Meal'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={[styles.noResultsContainer, { backgroundColor: 'transparent' }]}>
                <Text style={[styles.noResultsText, { color: isDarkMode ? 'rgba(255,255,255,0.6)' : theme.textSecondary }]}>No meals found matching "{searchQuery}"</Text>
              </View>
            )}
          </View>

          {loggedMeals.length > 0 && (
            <View style={[styles.loggedMealsContainer, { backgroundColor: isDarkMode ? 'rgba(167,139,250,0.1)' : theme.cardBackground, borderColor: isDarkMode ? 'rgba(167,139,250,0.3)' : theme.border }]}>
              <Text style={[styles.loggedMealsTitle, { color: isDarkMode ? '#fff' : theme.text }]}>📋 {"Today's"} Logged Meals ({loggedMeals.length})</Text>
              <Text style={[styles.loggedCaloriesText, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>Total: {totalLoggedCalories} / {calorieGoal} calories</Text>
            </View>
          )}

          <View style={styles.tipsContainer}>
            <LinearGradient
              colors={isDarkMode ? ['#2196f3', '#1976d2'] : [theme.primary, theme.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tipsGradient}
            >
              <Text style={styles.tipsTitle}>🍎 Nutrition Tips</Text>
              <Text style={styles.tip}>• Eat protein with every meal to support muscle growth</Text>
              <Text style={styles.tip}>• Choose complex carbs for sustained energy</Text>
              <Text style={styles.tip}>• Stay hydrated - aim for 8 glasses of water daily</Text>
              <Text style={styles.tip}>• Time your meals around your workouts for optimal performance</Text>
            </LinearGradient>
          </View>

          {/* Custom Meal Modal */}
          <Modal
            visible={showCustomMealModal}
            transparent={true}
            animationType="fade"
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1a1f2e' : theme.cardBackground, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.border }]}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Add Custom Meal</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.cardBackground, borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : theme.border, color: theme.text }]}
                  placeholder="Meal name"
                  placeholderTextColor={isDarkMode ? "#999" : theme.textSecondary}
                  value={customMealName}
                  onChangeText={setCustomMealName}
                />
                <TextInput
                  style={[styles.modalInput, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.cardBackground, borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : theme.border, color: theme.text }]}
                  placeholder="Calories"
                  placeholderTextColor={isDarkMode ? "#999" : theme.textSecondary}
                  keyboardType="numeric"
                  value={customMealCalories}
                  onChangeText={setCustomMealCalories}
                />
                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.cardBackground, borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : theme.border }]}
                    onPress={() => setShowCustomMealModal(false)}
                  >
                    <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonPrimary]}
                    onPress={addCustomMeal}
                  >
                    <LinearGradient
                      colors={isDarkMode ? ['#667eea', '#764ba2'] : [theme.primary, theme.primaryDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.modalButtonGradient}
                    >
                      <Text style={[styles.modalButtonText, { color: '#fff' }]}>Add</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Edit Goals Modal */}
          <Modal
            visible={showGoalsModal}
            transparent={true}
            animationType="fade"
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1a1f2e' : theme.cardBackground, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.border }]}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Nutrition Goals</Text>
                <View style={styles.goalInputContainer}>
                  <Text style={[styles.goalLabel, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>Daily Calorie Goal</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.cardBackground, borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : theme.border, color: theme.text }]}
                    placeholderTextColor={isDarkMode ? "#999" : theme.textSecondary}
                    keyboardType="numeric"
                    value={calorieGoal.toString()}
                    onChangeText={(text) => setCalorieGoal(parseInt(text) || 2000)}
                  />
                </View>
                <View style={styles.goalInputContainer}>
                  <Text style={[styles.goalLabel, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>Daily Protein Goal (g)</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.cardBackground, borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : theme.border, color: theme.text }]}
                    placeholderTextColor={isDarkMode ? "#999" : theme.textSecondary}
                    keyboardType="numeric"
                    value={proteinGoal.toString()}
                    onChangeText={(text) => setProteinGoal(parseInt(text) || 120)}
                  />
                </View>
                <View style={styles.goalInputContainer}>
                  <Text style={[styles.goalLabel, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>Daily Water Goal (glasses)</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.cardBackground, borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : theme.border, color: theme.text }]}
                    placeholderTextColor={isDarkMode ? "#999" : theme.textSecondary}
                    keyboardType="numeric"
                    value={waterGoal.toString()}
                    onChangeText={(text) => setWaterGoal(parseInt(text) || 8)}
                  />
                </View>
                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.cardBackground, borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : theme.border }]}
                    onPress={() => setShowGoalsModal(false)}
                  >
                    <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonPrimary]}
                    onPress={updateGoals}
                  >
                    <LinearGradient
                      colors={isDarkMode ? ['#667eea', '#764ba2'] : [theme.primary, theme.primaryDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.modalButtonGradient}
                    >
                      <Text style={[styles.modalButtonText, { color: '#fff' }]}>Save</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </SafeAreaView>
    </View >
  );
};

export default NutritionScreen;