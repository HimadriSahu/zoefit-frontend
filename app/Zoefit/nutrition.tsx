import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService as nutritionAPI } from '../../services/api';
import { aiService } from '../../services/ai';
import { useTheme } from '../screens/ThemeContext';
import { ErrorHandler } from '../../utils/errorHandler';

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
  },
  personalizeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  statGoal: {
    fontSize: 12,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  mlConfidenceContainer: {
    padding: 15,
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mlConfidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mlConfidenceTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  approachBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  approachBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  confidenceLabel: {
    fontSize: 14,
    marginRight: 10,
  },
  confidenceBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  feedbackButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  feedbackButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  quickActionCard: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  waterButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  waterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  waterCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 15,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionButtonGradient: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  searchInput: {
    height: 45,
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    fontSize: 16,
  },
  mealsContainer: {
    padding: 20,
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  mealCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
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
    marginBottom: 10,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  mealMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  mealTypeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  mealTime: {
    fontSize: 14,
  },
  calorieBadge: {
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  calorieText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  macrosContainer: {
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  macroLabel: {
    fontSize: 12,
  },
  ingredientsContainer: {
    marginTop: 10,
  },
  ingredientsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  ingredientsList: {
    fontSize: 14,
    lineHeight: 20,
  },
  logButton: {
    marginTop: 15,
    borderRadius: 8,
    overflow: 'hidden',
  },
  logButtonActive: {
    opacity: 0.6,
  },
  logButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  logButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  noResultsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
  },
  loggedMealsContainer: {
    padding: 15,
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loggedMealsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  loggedCaloriesText: {
    fontSize: 14,
  },
  tipsContainer: {
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tipsGradient: {
    padding: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  tip: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    paddingLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 15,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    height: 45,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonPrimary: {
    borderWidth: 0,
  },
  modalButtonGradient: {
    flex: 1,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalInputContainer: {
    marginBottom: 15,
  },
  goalLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  starButton: {
    padding: 5,
  },
  starText: {
    fontSize: 24,
  },
  booleanContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  booleanButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 1,
  },
  booleanButtonActive: {
    borderWidth: 1,
  },
  booleanButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

interface Meal {
  id: string;
  name: string;
  type: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  foods?: any[];
}

interface TodayStats {
  calories: number;
  protein: number;
  water: number;
  goal: number;
  proteinGoal: number;
  waterGoal: number;
}

const NutritionScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();

  // State variables
  const [loading, setLoading] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loggedMeals, setLoggedMeals] = useState<string[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [waterIntake, setWaterIntake] = useState(4);
  const [waterGoal, setWaterGoal] = useState(8);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [proteinGoal, setProteinGoal] = useState(120);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomMealModal, setShowCustomMealModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Custom meal form state
  const [customMealName, setCustomMealName] = useState('');
  const [customMealCalories, setCustomMealCalories] = useState('');

  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackHelpful, setFeedbackHelpful] = useState(true);
  const [feedbackAccurate, setFeedbackAccurate] = useState(true);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [feedbackSuggestions, setFeedbackSuggestions] = useState('');
  const [currentMealPlanId, setCurrentMealPlanId] = useState('');

  // ML-related state
  const [mealPlanApproach, setMealPlanApproach] = useState('unknown');
  const [confidenceScore, setConfidenceScore] = useState(0);

  const todayStats: TodayStats = {
    calories: loggedMeals.reduce((total, mealId) => {
      const meal = meals.find(m => m.id === mealId);
      return total + (meal?.calories || 0);
    }, 0),
    protein: 45,
    water: waterIntake,
    goal: calorieGoal,
    proteinGoal: proteinGoal,
    waterGoal: waterGoal,
  };

  // Fetch personalized meal plan from backend
  const fetchPersonalizedMealPlan = async () => {
    setLoading(true);
    try {
      // Check if user has health metrics, create default if not
      try {
        const healthMetrics = await nutritionAPI.getHealthMetrics();
        console.log('Health metrics found:', healthMetrics);
      } catch (error: any) {
        console.log('Health metrics not found, creating default...', error.message);
        const height = 170; // cm
        const weight = 70; // kg

        try {
          const result = await nutritionAPI.createOrUpdateHealthMetrics({
            height: height,
            weight: weight,
            fitness_goal: 'maintenance',
            activity_level: 'moderate',
            dietary_preferences: {},
            allergies: [],
            target_weight: weight
          });
          console.log('Health metrics created successfully:', result);
        } catch (createError: any) {
          console.error('Failed to create health metrics:', createError);
          throw createError; // Re-throw to stop meal plan generation
        }
      }

      // Get today's date
      const today = new Date().toISOString().split('T')[0];

      // Generate meal plan using AI service with enhanced personalization
      const response = await aiService.generateMealPlan();

      console.log('Meal plan response:', response);

      if (response && response.meal_plan) {
        const mealPlan = response.meal_plan;

        // Transform backend meal data to frontend format
        const timestamp = Date.now();
        const transformedMeals = mealPlan.meals.map((meal: any, index: number) => ({
          id: meal.id || `${mealPlan.id || 'meal'}-${index}-${timestamp}`,
          name: meal.name || `Meal ${index + 1}`,
          type: meal.name?.toLowerCase().includes('breakfast') ? 'Breakfast' :
            meal.name?.toLowerCase().includes('lunch') ? 'Lunch' :
              meal.name?.toLowerCase().includes('dinner') ? 'Dinner' : 'Snack',
          time: meal.name?.toLowerCase().includes('breakfast') ? '8:00 AM' :
            meal.name?.toLowerCase().includes('lunch') ? '12:30 PM' :
              meal.name?.toLowerCase().includes('dinner') ? '7:00 PM' : '3:00 PM',
          calories: meal.estimated_calories || 0,
          protein: 0, // Will be calculated from foods
          carbs: 0, // Will be calculated from foods
          fat: 0, // Will be calculated from foods
          ingredients: meal.foods?.map((food: any) => food.name) || [],
          foods: meal.foods || [], // Corrected indentation here
        }));

        // Calculate macros from foods
        transformedMeals.forEach((meal: any) => {
          meal.protein = meal.foods.reduce((sum: number, food: any) => sum + (food.protein || 0), 0);
          meal.carbs = meal.foods.reduce((sum: number, food: any) => sum + (food.carbs || 0), 0);
          meal.fat = meal.foods.reduce((sum: number, food: any) => sum + (food.fat || 0), 0);
        });

        setMeals(transformedMeals);
        setMealPlanApproach(mealPlan.approach || 'unknown');
        setConfidenceScore(mealPlan.confidence_score || 0);
        setCurrentMealPlanId(mealPlan.id?.toString() || '');

        // Update stats with actual data from meal plan
        setCalorieGoal(mealPlan.total_calories || 2000);
        setProteinGoal(Math.round(mealPlan.protein || 120));

        console.log(`Meal plan generated using ${mealPlan.approach} approach with confidence ${mealPlan.confidence_score}`);

        // Show ML approach info to user
        if (mealPlan.approach === 'ml_based') {
          Alert.alert(
            'Personalized Meal Plan',
            `Generated using AI with ${Math.round((mealPlan.confidence_score || 0) * 100)}% confidence based on your profile!`,
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error: any) {
      // Use global error handler for consistent error management
      ErrorHandler.handleError(error, 'fetchPersonalizedMealPlan');

      // For non-auth errors, show fallback message
      if (!ErrorHandler.isAuthenticationError(error) && !ErrorHandler.isNetworkError(error)) {
        Alert.alert(
          'Meal Plan',
          'Using sample meal plans. Please complete your profile for personalized recommendations.',
          [{ text: 'OK' }]
        );
      }

      // Fallback to sample meals if API fails
      const fallbackTimestamp = Date.now();
      setMeals([
        {
          id: `fallback-1-${fallbackTimestamp}`,
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
          id: `fallback-2-${fallbackTimestamp}`,
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
          id: `fallback-3-${fallbackTimestamp}`,
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
      setMealPlanApproach('fallback');
      setConfidenceScore(0.3);
    } finally {
      setLoading(false);
    }
  };

  // Load data from backend on component mount
  useEffect(() => {
    // Initialize error handler with router
    ErrorHandler.initialize(router);
    fetchPersonalizedMealPlan();
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

  const submitFeedback = async () => {
    try {
      await nutritionAPI.submitMLFeedback(
        currentMealPlanId,
        feedbackRating,
        feedbackHelpful,
        feedbackAccurate,
        feedbackComments,
        feedbackSuggestions,
        true, // accepted
        false // modified
      );

      Alert.alert('Thank You!', 'Your feedback helps us improve our recommendations.', [
        {
          text: 'OK', onPress: () => {
            setShowFeedbackModal(false);
            // Reset feedback form
            setFeedbackRating(5);
            setFeedbackHelpful(true);
            setFeedbackAccurate(true);
            setFeedbackComments('');
            setFeedbackSuggestions('');
          }
        }
      ]);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
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

  const getApproachColor = (approach: string) => {
    switch (approach) {
      case 'ml_based': return '#4CAF50';
      case 'rule_based': return '#FF9800';
      case 'hybrid': return '#2196F3';
      case 'emergency_fallback': return '#f44336';
      default: return '#9C27B0';
    }
  };

  const getApproachLabel = (approach: string) => {
    switch (approach) {
      case 'ml_based': return 'AI Powered';
      case 'rule_based': return 'Standard';
      case 'hybrid': return 'Enhanced';
      case 'emergency_fallback': return 'Basic';
      default: return 'Unknown';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#4CAF50';
    if (confidence >= 0.6) return '#FF9800';
    if (confidence >= 0.4) return '#FFC107';
    return '#f44336';
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
            <Text style={styles.title}>Nutrition </Text>
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

          {/* ML Confidence Indicator */}
          {(mealPlanApproach !== 'unknown' && confidenceScore > 0) && (
            <View style={[styles.mlConfidenceContainer, { backgroundColor: isDarkMode ? 'rgba(102,126,234,0.1)' : theme.cardBackground, borderColor: isDarkMode ? 'rgba(102,126,234,0.3)' : theme.border }]}>
              <View style={styles.mlConfidenceHeader}>
                <Text style={[styles.mlConfidenceTitle, { color: isDarkMode ? '#fff' : theme.text }]}>AI Recommendation</Text>
                <View style={[styles.approachBadge, { backgroundColor: getApproachColor(mealPlanApproach) }]}>
                  <Text style={styles.approachBadgeText}>{getApproachLabel(mealPlanApproach)}</Text>
                </View>
              </View>

              <View style={styles.confidenceRow}>
                <Text style={[styles.confidenceLabel, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>Confidence:</Text>
                <View style={styles.confidenceBar}>
                  <View style={[styles.confidenceFill, { width: `${confidenceScore * 100}%`, backgroundColor: getConfidenceColor(confidenceScore) }]} />
                </View>
                <Text style={[styles.confidenceValue, { color: isDarkMode ? '#fff' : theme.text }]}>{Math.round(confidenceScore * 100)}%</Text>
              </View>

              <TouchableOpacity
                style={[styles.feedbackButton, { backgroundColor: isDarkMode ? 'rgba(102,126,234,0.2)' : theme.cardBackground }]}
                onPress={() => setShowFeedbackModal(true)}
              >
                <Text style={[styles.feedbackButtonText, { color: isDarkMode ? '#a78bfa' : theme.primary }]}>Rate this meal plan</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.quickActionsContainer}>
            <View style={[styles.quickActionCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.cardBackground, borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : theme.border }]}>
              <Text style={[styles.quickActionLabel, { color: isDarkMode ? '#fff' : theme.text }]}> Water Intake</Text>
              <View style={styles.waterButtonsRow}>
                <TouchableOpacity
                  style={[styles.waterButton, { backgroundColor: isDarkMode ? '#667eea' : theme.primary }]}
                  onPress={removeWater}
                >
                  <Text style={styles.waterButtonText}>-</Text>
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
                <Text style={styles.actionButtonText}> Goals</Text>
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
                        <Text style={[styles.mealTime, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}> {meal.time}</Text>
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
                        {loggedMeals.includes(meal.id) ? 'Logged ' : 'Log This Meal'}
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
              <Text style={[styles.loggedMealsTitle, { color: isDarkMode ? '#fff' : theme.text }]}> {"Today's"} Logged Meals ({loggedMeals.length})</Text>
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
              <Text style={styles.tipsTitle}> Nutrition Tips</Text>
              <Text style={styles.tip}> Eat protein with every meal to support muscle growth</Text>
              <Text style={styles.tip}> Choose complex carbs for sustained energy</Text>
              <Text style={styles.tip}> Stay hydrated - aim for 8 glasses of water daily</Text>
              <Text style={styles.tip}> Time your meals around your workouts for optimal performance</Text>
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

          {/* Feedback Modal */}
          <Modal
            visible={showFeedbackModal}
            transparent={true}
            animationType="fade"
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1a1f2e' : theme.cardBackground, borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.border }]}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Rate Your Meal Plan</Text>

                <View style={styles.goalInputContainer}>
                  <Text style={[styles.goalLabel, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>Overall Rating</Text>
                  <View style={styles.ratingContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setFeedbackRating(star)}
                        style={styles.starButton}
                      >
                        <Text style={[styles.starText, { color: star <= feedbackRating ? '#FFD700' : 'rgba(255,255,255,0.3)' }]}>
                          {star <= feedbackRating ? 'star' : 'star_border'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.goalInputContainer}>
                  <Text style={[styles.goalLabel, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>Was this helpful?</Text>
                  <View style={styles.booleanContainer}>
                    <TouchableOpacity
                      style={[styles.booleanButton, feedbackHelpful && styles.booleanButtonActive, feedbackHelpful && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                      onPress={() => setFeedbackHelpful(true)}
                    >
                      <Text style={[styles.booleanButtonText, { color: feedbackHelpful ? '#fff' : theme.text }]}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.booleanButton, !feedbackHelpful && styles.booleanButtonActive, !feedbackHelpful && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                      onPress={() => setFeedbackHelpful(false)}
                    >
                      <Text style={[styles.booleanButtonText, { color: !feedbackHelpful ? '#fff' : theme.text }]}>No</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.goalInputContainer}>
                  <Text style={[styles.goalLabel, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>Was it accurate?</Text>
                  <View style={styles.booleanContainer}>
                    <TouchableOpacity
                      style={[styles.booleanButton, feedbackAccurate && styles.booleanButtonActive, feedbackAccurate && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                      onPress={() => setFeedbackAccurate(true)}
                    >
                      <Text style={[styles.booleanButtonText, { color: feedbackAccurate ? '#fff' : theme.text }]}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.booleanButton, !feedbackAccurate && styles.booleanButtonActive, !feedbackAccurate && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                      onPress={() => setFeedbackAccurate(false)}
                    >
                      <Text style={[styles.booleanButtonText, { color: !feedbackAccurate ? '#fff' : theme.text }]}>No</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.goalInputContainer}>
                  <Text style={[styles.goalLabel, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>Comments (optional)</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.cardBackground, borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : theme.border, color: theme.text, height: 80 }]}
                    placeholder="Tell us what you thought..."
                    placeholderTextColor={isDarkMode ? "#999" : theme.textSecondary}
                    multiline
                    value={feedbackComments}
                    onChangeText={setFeedbackComments}
                  />
                </View>

                <View style={styles.goalInputContainer}>
                  <Text style={[styles.goalLabel, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>Suggestions (optional)</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.cardBackground, borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : theme.border, color: theme.text, height: 80 }]}
                    placeholder="How can we improve your recommendations?"
                    placeholderTextColor={isDarkMode ? "#999" : theme.textSecondary}
                    multiline
                    value={feedbackSuggestions}
                    onChangeText={setFeedbackSuggestions}
                  />
                </View>

                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.cardBackground, borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : theme.border }]}
                    onPress={() => setShowFeedbackModal(false)}
                  >
                    <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonPrimary]}
                    onPress={submitFeedback}
                  >
                    <LinearGradient
                      colors={isDarkMode ? ['#667eea', '#764ba2'] : [theme.primary, theme.primaryDark]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.modalButtonGradient}
                    >
                      <Text style={[styles.modalButtonText, { color: '#fff' }]}>Submit</Text>
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
