import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NutritionScreen = () => {
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);

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
  ];

  const logMeal = (mealId: string) => {
    setSelectedMeal(mealId);
    Alert.alert(
      'Meal Logged!',
      'Great choice! Your meal has been added to your daily nutrition tracker.',
      [{ text: 'Awesome!', style: 'default' }]
    );
  };

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
    calories: 1250,
    goal: 2000,
    protein: 97,
    proteinGoal: 120,
    water: 6,
    waterGoal: 8,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Nutrition 🥗</Text>
          <Text style={styles.subtitle}>Fuel your fitness journey</Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Today's Nutrition</Text>
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
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionIcon}>📊</Text>
            <Text style={styles.quickActionText}>Scan Food</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionIcon}>💧</Text>
            <Text style={styles.quickActionText}>Log Water</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton}>
            <Text style={styles.quickActionIcon}>🍽️</Text>
            <Text style={styles.quickActionText}>Custom Meal</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mealsContainer}>
          <Text style={styles.sectionTitle}>Suggested Meals</Text>
          {meals.map((meal) => (
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
                style={[styles.logButton, selectedMeal === meal.id && styles.logButtonActive]}
                onPress={() => logMeal(meal.id)}
                disabled={selectedMeal === meal.id}
              >
                <Text style={styles.logButtonText}>
                  {selectedMeal === meal.id ? 'Logged ✓' : 'Log This Meal'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>🍎 Nutrition Tips</Text>
          <Text style={styles.tip}>• Eat protein with every meal to support muscle growth</Text>
          <Text style={styles.tip}>• Choose complex carbs for sustained energy</Text>
          <Text style={styles.tip}>• Stay hydrated - aim for 8 glasses of water daily</Text>
          <Text style={styles.tip}>• Time your meals around your workouts for optimal performance</Text>
        </View>
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
});
