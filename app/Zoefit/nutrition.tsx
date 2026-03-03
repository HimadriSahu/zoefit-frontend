import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal, Dimensions, TextStyle, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

const NutritionScreen = () => {
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
  const router = useRouter();

  const meals = [
    {
      id: '1',
      name: 'Protein Power Bowl',
      type: 'Lunch',
      calories: 450,
      protein: 35,
      carbs: 45,
      fat: 12,
      time: '12:00 PM',
      ingredients: ['Grilled Chicken', 'Quinoa', 'Avocado', 'Mixed Greens', 'Olive Oil'],
    },
    {
      id: '2',
      name: 'Pre-Workout Smoothie',
      type: 'Snack',
      calories: 280,
      protein: 20,
      carbs: 40,
      fat: 8,
      time: '3:00 PM',
      ingredients: ['Banana', 'Protein Powder', 'Almond Milk', 'Peanut Butter', 'Spinach'],
    },
    {
      id: '3',
      name: 'Grilled Salmon Dinner',
      type: 'Dinner',
      calories: 520,
      protein: 42,
      carbs: 35,
      fat: 18,
      time: '7:00 PM',
      ingredients: ['Salmon Fillet', 'Sweet Potato', 'Broccoli', 'Lemon', 'Herbs'],
    },
    {
      id: '4',
      name: 'Oatmeal Breakfast',
      type: 'Breakfast',
      calories: 320,
      protein: 12,
      carbs: 55,
      fat: 6,
      time: '7:30 AM',
      ingredients: ['Rolled Oats', 'Honey', 'Berries', 'Almonds', 'Milk'],
    },
  ];

  const logMeal = (mealId: string) => {
    setSelectedMeal(mealId);
    setLoggedMeals([...loggedMeals, mealId]);
    Alert.alert(
      'Meal Logged!',
      'Great choice! Your meal has been added to your daily nutrition tracker.',
      [{ text: 'Awesome!', style: 'default' }]
    );
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
        { text: 'OK', onPress: () => {
          setCustomMealName('');
          setCustomMealCalories('');
          setShowCustomMealModal(false);
        }}
      ]);
    } else {
      Alert.alert('Error', 'Please fill in all fields');
    }
  };

  const updateGoals = () => {
    Alert.alert('Goals Updated', 'Your nutrition goals have been updated successfully!', [
      { text: 'OK', onPress: () => setShowGoalsModal(false) }
    ]);
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
      case 'Snack': return '#9C27B0';
      default: return '#666';
    }
  };

  const todayStats = {
    calories: totalLoggedCalories,
    goal: calorieGoal,
    protein: 97,
    proteinGoal: proteinGoal,
    water: waterIntake,
    waterGoal: waterGoal,
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0f1c' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb']}
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
          <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>{"Today's Nutrition"}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{todayStats.calories}</Text>
              <Text style={styles.statLabel}>Calories</Text>
              <Text style={styles.statGoal}>of {todayStats.goal}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(todayStats.calories / todayStats.goal) * 100}%` }]} />
              </View>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{todayStats.protein}g</Text>
              <Text style={styles.statLabel}>Protein</Text>
              <Text style={styles.statGoal}>of {todayStats.proteinGoal}g</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(todayStats.protein / todayStats.proteinGoal) * 100}%` }]} />
              </View>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{todayStats.water}</Text>
              <Text style={styles.statLabel}>Water Glasses</Text>
              <Text style={styles.statGoal}>of {todayStats.waterGoal}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(todayStats.water / todayStats.waterGoal) * 100}%` }]} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.quickActionsContainer}>
          <View style={styles.quickActionCard}>
            <Text style={styles.quickActionLabel}>💧 Water Intake</Text>
            <View style={styles.waterButtonsRow}>
              <TouchableOpacity 
                style={styles.waterButton}
                onPress={removeWater}
              >
                <Text style={styles.waterButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.waterCount}>{waterIntake}/{waterGoal}</Text>
              <TouchableOpacity 
                style={styles.waterButton}
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
              colors={['#667eea', '#764ba2']}
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
              colors={['#a78bfa', '#8b5cf6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonText}>⚙️ Edit Goals</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search meals..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.mealsContainer}>
          <Text style={styles.sectionTitle}>Suggested Meals</Text>
          {filteredMeals.length > 0 ? (
            filteredMeals.map((meal) => (
              <View key={meal.id} style={styles.mealCard}>
                <View style={styles.mealHeader}>
                  <View>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    <View style={styles.mealMeta}>
                      <View style={[styles.mealTypeBadge, { backgroundColor: getMealTypeColor(meal.type) }]}>
                        <Text style={styles.mealTypeText}>{meal.type}</Text>
                      </View>
                      <Text style={styles.mealTime}>⏰ {meal.time}</Text>
                    </View>
                  </View>
                  <View style={styles.calorieBadge}>
                    <Text style={styles.calorieText}>{meal.calories} cal</Text>
                  </View>
                </View>

                <View style={styles.macrosContainer}>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{meal.protein}g</Text>
                    <Text style={styles.macroLabel}>Protein</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{meal.carbs}g</Text>
                    <Text style={styles.macroLabel}>Carbs</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{meal.fat}g</Text>
                    <Text style={styles.macroLabel}>Fat</Text>
                  </View>
                </View>

                <View style={styles.ingredientsContainer}>
                  <Text style={styles.ingredientsTitle}>Ingredients:</Text>
                  <Text style={styles.ingredientsList}>{meal.ingredients.join(', ')}</Text>
                </View>

                <TouchableOpacity 
                  style={[styles.logButton, loggedMeals.includes(meal.id) && styles.logButtonActive]}
                  onPress={() => logMeal(meal.id)}
                  disabled={loggedMeals.includes(meal.id)}
                >
                  <LinearGradient
                    colors={loggedMeals.includes(meal.id) ? ['#4a5568', '#2d3748'] : ['#667eea', '#764ba2']}
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
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No meals found matching &quot;{searchQuery}&quot;</Text>
            </View>
          )}
        </View>

        {loggedMeals.length > 0 && (
          <View style={styles.loggedMealsContainer}>
            <Text style={styles.loggedMealsTitle}>📋 {"Today's"} Logged Meals ({loggedMeals.length})</Text>
            <Text style={styles.loggedCaloriesText}>Total: {totalLoggedCalories} / {calorieGoal} calories</Text>
          </View>
        )}

        <View style={styles.tipsContainer}>
          <LinearGradient
            colors={['#2196f3', '#1976d2']}
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
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Custom Meal</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Meal name"
                placeholderTextColor="#999"
                value={customMealName}
                onChangeText={setCustomMealName}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Calories"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={customMealCalories}
                onChangeText={setCustomMealCalories}
              />
              <View style={styles.modalButtonsRow}>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => setShowCustomMealModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={addCustomMeal}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
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
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Nutrition Goals</Text>
              <View style={styles.goalInputContainer}>
                <Text style={styles.goalLabel}>Daily Calorie Goal</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={calorieGoal.toString()}
                  onChangeText={(text) => setCalorieGoal(parseInt(text) || 2000)}
                />
              </View>
              <View style={styles.goalInputContainer}>
                <Text style={styles.goalLabel}>Daily Protein Goal (g)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={proteinGoal.toString()}
                  onChangeText={(text) => setProteinGoal(parseInt(text) || 120)}
                />
              </View>
              <View style={styles.goalInputContainer}>
                <Text style={styles.goalLabel}>Daily Water Goal (glasses)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={waterGoal.toString()}
                  onChangeText={(text) => setWaterGoal(parseInt(text) || 8)}
                />
              </View>
              <View style={styles.modalButtonsRow}>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => setShowGoalsModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={updateGoals}
                >
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
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
    </View>
  );
};

export default NutritionScreen;

const styles = StyleSheet.create<{
  scrollView: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  personalizeButton: ViewStyle;
  personalizeGradient: ViewStyle;
  personalizeButtonText: TextStyle;
  statsContainer: ViewStyle;
  statsTitle: TextStyle;
  statsGrid: ViewStyle;
  statCard: ViewStyle;
  statNumber: TextStyle;
  statLabel: TextStyle;
  statGoal: TextStyle;
  progressBar: ViewStyle;
  progressFill: ViewStyle;
  quickActionsContainer: ViewStyle;
  quickActionButton: ViewStyle;
  quickActionIcon: TextStyle;
  quickActionText: TextStyle;
  quickActionCard: ViewStyle;
  quickActionLabel: TextStyle;
  waterButtonsRow: ViewStyle;
  waterButton: ViewStyle;
  waterButtonText: TextStyle;
  waterCount: TextStyle;
  actionButtonsRow: ViewStyle;
  actionButton: ViewStyle;
  actionButtonGradient: ViewStyle;
  actionButtonText: TextStyle;
  mealsContainer: ViewStyle;
  sectionTitle: TextStyle;
  mealCard: ViewStyle;
  mealHeader: ViewStyle;
  mealName: TextStyle;
  mealMeta: ViewStyle;
  mealTypeBadge: ViewStyle;
  mealTypeText: TextStyle;
  mealTime: TextStyle;
  calorieBadge: ViewStyle;
  calorieText: TextStyle;
  macrosContainer: ViewStyle;
  macroItem: ViewStyle;
  macroValue: TextStyle;
  macroLabel: TextStyle;
  ingredientsContainer: ViewStyle;
  ingredientsTitle: TextStyle;
  ingredientsList: TextStyle;
  logButton: ViewStyle;
  logButtonGradient: ViewStyle;
  logButtonActive: ViewStyle;
  logButtonText: TextStyle;
  tipsContainer: ViewStyle;
  tipsGradient: ViewStyle;
  tipsTitle: TextStyle;
  tip: TextStyle;
  searchContainer: ViewStyle;
  searchInput: TextStyle;
  noResultsContainer: ViewStyle;
  noResultsText: TextStyle;
  loggedMealsContainer: ViewStyle;
  loggedMealsTitle: TextStyle;
  loggedCaloriesText: TextStyle;
  modalOverlay: ViewStyle;
  modalContent: ViewStyle;
  modalTitle: TextStyle;
  modalInput: TextStyle;
  goalInputContainer: ViewStyle;
  goalLabel: TextStyle;
  modalButtonsRow: ViewStyle;
  modalButton: ViewStyle;
  modalButtonGradient: ViewStyle;
  modalButtonPrimary: ViewStyle;
  modalButtonText: TextStyle;
}>({
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
  quickActionButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 15,
    padding: 15,
    width: '30%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  quickActionText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
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
    padding: 20,
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
    borderColor: 'rgba(167,139,250,0.2)',
  },
  loggedMealsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  loggedCaloriesText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
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
