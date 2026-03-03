import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Nutrition 🥗</Text>
            <Text style={styles.subtitle}>Fuel your fitness journey</Text>
          </View>
          <TouchableOpacity
            style={styles.personalizeButton}
            onPress={() => router.push('/onboarding' as any)}
          >
            <Text style={styles.personalizeButtonText}>Personalize Nutrio</Text>
          </TouchableOpacity>
        </View>

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
            <Text style={styles.actionButtonText}>+ Add Meal</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowGoalsModal(true)}
          >
            <Text style={styles.actionButtonText}>⚙️ Edit Goals</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search meals..."
            placeholderTextColor="#999"
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
                  <Text style={styles.logButtonText}>
                    {loggedMeals.includes(meal.id) ? 'Logged ✓' : 'Log This Meal'}
                  </Text>
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
          <Text style={styles.tipsTitle}>🍎 Nutrition Tips</Text>
          <Text style={styles.tip}>• Eat protein with every meal to support muscle growth</Text>
          <Text style={styles.tip}>• Choose complex carbs for sustained energy</Text>
          <Text style={styles.tip}>• Stay hydrated - aim for 8 glasses of water daily</Text>
          <Text style={styles.tip}>• Time your meals around your workouts for optimal performance</Text>
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
                value={customMealName}
                onChangeText={setCustomMealName}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Calories"
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
                  <Text style={[styles.modalButtonText, { color: '#fff' }]}>Add</Text>
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
                  keyboardType="numeric"
                  value={calorieGoal.toString()}
                  onChangeText={(text) => setCalorieGoal(parseInt(text) || 2000)}
                />
              </View>
              <View style={styles.goalInputContainer}>
                <Text style={styles.goalLabel}>Daily Protein Goal (g)</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  value={proteinGoal.toString()}
                  onChangeText={(text) => setProteinGoal(parseInt(text) || 120)}
                />
              </View>
              <View style={styles.goalInputContainer}>
                <Text style={styles.goalLabel}>Daily Water Goal (glasses)</Text>
                <TextInput
                  style={styles.modalInput}
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
                  <Text style={[styles.modalButtonText, { color: '#fff' }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default NutritionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8faf8',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#4CAF50',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  personalizeButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  personalizeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#e8f5e9',
  },
  statsContainer: {
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statGoal: {
    fontSize: 10,
    color: '#999',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  quickActionButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    width: '30%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  quickActionText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  mealsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    color: '#333',
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
    color: '#666',
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
    backgroundColor: '#f8faf8',
    borderRadius: 10,
    padding: 10,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  macroLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  ingredientsContainer: {
    marginBottom: 15,
  },
  ingredientsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  ingredientsList: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  logButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  logButtonActive: {
    backgroundColor: '#a5d6a7',
  },
  logButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  tipsContainer: {
    padding: 20,
    backgroundColor: '#f0f8f0',
    margin: 20,
    borderRadius: 15,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  tip: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  quickActionCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    width: '100%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  waterButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  waterButton: {
    backgroundColor: '#4CAF50',
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
    color: '#333',
    minWidth: 50,
    textAlign: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 12,
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
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  noResultsContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: '#999',
  },
  loggedMealsContainer: {
    padding: 20,
    backgroundColor: '#e8f5e9',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
  },
  loggedMealsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 5,
  },
  loggedCaloriesText: {
    fontSize: 12,
    color: '#558b2f',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '85%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  modalInput: {
    backgroundColor: '#f8faf8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  goalInputContainer: {
    marginBottom: 15,
  },
  goalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  modalButtonPrimary: {
    backgroundColor: '#4CAF50',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});
