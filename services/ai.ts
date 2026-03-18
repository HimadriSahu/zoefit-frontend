// AI Service for ZoeFit - handles all AI-powered fitness features
import { apiService, HealthMetricsData, HealthMetricsResponse, WorkoutPlan, WorkoutCompletionData, ChatMessage, ChatResponse, ChatHistory, ProgressTracking, MealPlan } from './api';

export class AIService {
  private static instance: AIService;

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // ============= HEALTH METRICS =============

  /**
   * Create or update user's health metrics
   * This data is used for personalized AI recommendations
   */
  async updateHealthMetrics(data: HealthMetricsData): Promise<HealthMetricsResponse> {
    try {
      console.log('🏥 Updating health metrics:', data);
      const response = await apiService.createOrUpdateHealthMetrics(data);
      console.log('✅ Health metrics updated successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to update health metrics:', error);
      throw error;
    }
  }

  /**
   * Get user's current health metrics
   */
  async getHealthMetrics(): Promise<HealthMetricsResponse> {
    try {
      console.log('📊 Fetching health metrics...');
      const response = await apiService.getHealthMetrics();
      console.log('✅ Health metrics retrieved:', response);
      return response;
    } catch (error: any) {
      console.error('❌ Failed to fetch health metrics:', error);

      // If no health metrics exist, create default ones
      if (error.message?.includes('No HealthMetrics matches the given query')) {
        console.log('📝 No health metrics found, creating default metrics...');
        try {
          const defaultMetrics: HealthMetricsData = {
            height: 170,
            weight: 70,
            fitness_goal: 'maintenance',
            activity_level: 'moderate',
            dietary_preferences: {},
            allergies: [],
            target_weight: 70
          };

          const response = await apiService.createOrUpdateHealthMetrics(defaultMetrics);
          console.log('✅ Default health metrics created:', response);
          return response;
        } catch (createError) {
          console.error('❌ Failed to create default health metrics:', createError);
          throw error; // Throw original error if creation fails
        }
      }

      throw error;
    }
  }

  // ============= WORKOUT PLANS =============

  /**
   * Generate a personalized workout plan based on user's health metrics
   */
  async generateWorkoutPlan(): Promise<{ message: string; workout_plan: WorkoutPlan }> {
    try {
      console.log('🏋️ Generating AI workout plan...');
      const response = await apiService.generateWorkoutPlan();
      console.log('✅ Workout plan generated:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to generate workout plan:', error);
      throw error;
    }
  }

  /**
   * Get all workout plans for the user
   */
  async getWorkoutPlans(): Promise<WorkoutPlan[]> {
    try {
      console.log('📋 Fetching workout plans...');
      const response = await apiService.getWorkoutPlans();
      console.log('✅ Workout plans retrieved:', response.workout_plans.length, 'plans');
      return response.workout_plans;
    } catch (error) {
      console.error('❌ Failed to fetch workout plans:', error);
      throw error;
    }
  }

  /**
   * Mark a workout as completed and track performance
   */
  async completeWorkout(data: WorkoutCompletionData): Promise<void> {
    try {
      console.log('✅ Completing workout:', data);
      const response = await apiService.updateWorkoutCompletion(data);
      console.log('✅ Workout completion recorded:', response);
    } catch (error) {
      console.error('❌ Failed to complete workout:', error);
      throw error;
    }
  }

  // ============= AI CHATBOT =============

  /**
   * Send a message to the AI fitness coach
   */
  async chatWithAI(message: string): Promise<ChatResponse> {
    try {
      console.log('💬 Sending message to AI:', message);
      const response = await apiService.sendChatMessage({ message });
      console.log('✅ AI response received:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to get AI response:', error);
      throw error;
    }
  }

  /**
   * Get chat history with the AI
   */
  async getChatHistory(): Promise<ChatHistory[]> {
    try {
      console.log('📜 Fetching chat history...');
      const response = await apiService.getChatHistory();
      console.log('✅ Chat history retrieved:', response.chat_history.length, 'messages');
      return response.chat_history;
    } catch (error) {
      console.error('❌ Failed to fetch chat history:', error);
      throw error;
    }
  }

  // ============= PROGRESS TRACKING =============

  /**
   * Get user's progress tracking data
   */
  async getProgressData(): Promise<ProgressTracking[]> {
    try {
      console.log('📈 Fetching progress data...');
      const response = await apiService.getProgressTracking();
      console.log('✅ Progress data retrieved:', response.progress_data.length, 'entries');
      return response.progress_data;
    } catch (error) {
      console.error('❌ Failed to fetch progress data:', error);
      throw error;
    }
  }

  /**
   * Get AI-powered progress predictions
   */
  async getProgressPrediction(): Promise<{ prediction: any; insights: string[] }> {
    try {
      console.log('🔮 Getting progress predictions...');
      const response = await apiService.predictProgress();
      console.log('✅ Progress predictions received:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to get progress predictions:', error);
      throw error;
    }
  }

  /**
   * Get AI insights and recommendations
   */
  async getAIInsights(): Promise<{ insights: string[]; recommendations: string[] }> {
    try {
      console.log('🧠 Getting AI insights...');
      const response = await apiService.getAIInsights();
      console.log('✅ AI insights received:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to get AI insights:', error);
      throw error;
    }
  }

  // ============= NUTRITION =============

  /**
   * Generate a personalized meal plan
   */
  async generateMealPlan(): Promise<{ message: string; meal_plan: MealPlan }> {
    try {
      console.log('🥗 Generating AI meal plan...');
      const response = await apiService.generateMealPlan();
      console.log('✅ Meal plan generated:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to generate meal plan:', error);
      throw error;
    }
  }

  /**
   * Get all meal plans for the user
   */
  async getMealPlans(): Promise<MealPlan[]> {
    try {
      console.log('🍽️ Fetching meal plans...');
      const response = await apiService.getMealPlans();
      console.log('✅ Meal plans retrieved:', response.meal_plans.length, 'plans');
      return response.meal_plans;
    } catch (error) {
      console.error('❌ Failed to fetch meal plans:', error);
      throw error;
    }
  }

  // ============= ADVANCED AI FEATURES =============

  /**
   * Adapt workout plan based on user feedback
   */
  async adaptWorkoutPlan(workoutPlanId: number, feedback: string): Promise<{ message: string; adapted_workout: WorkoutPlan }> {
    try {
      console.log('🔄 Adapting workout plan:', workoutPlanId, feedback);
      const response = await apiService.adaptWorkoutPlan(workoutPlanId, feedback);
      console.log('✅ Workout plan adapted:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to adapt workout plan:', error);
      throw error;
    }
  }

  /**
   * Get user analytics and trends
   */
  async getUserAnalytics(): Promise<{ analytics: any; trends: any }> {
    try {
      console.log('📊 Fetching user analytics...');
      const response = await apiService.getUserAnalytics();
      console.log('✅ User analytics retrieved:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to fetch user analytics:', error);
      throw error;
    }
  }

  // ============= UTILITY METHODS =============

  /**
   * Calculate calories burned for a workout based on type and duration
   * This is a client-side estimation for immediate feedback
   */
  calculateCaloriesBurned(workoutType: string, durationMinutes: number, weightKg?: number): number {
    const weight = weightKg || 70; // Default weight if not provided
    const caloriesPerMinute = {
      cardio: 0.1,
      strength: 0.08,
      hiit: 0.15,
      yoga: 0.05,
      swimming: 0.12,
      cycling: 0.09,
    };

    const rate = caloriesPerMinute[workoutType as keyof typeof caloriesPerMinute] || 0.08;
    return Math.round(rate * weight * durationMinutes);
  }

  /**
   * Get workout recommendations based on user's progress
   */
  async getWorkoutRecommendations(): Promise<string[]> {
    try {
      const insights = await this.getAIInsights();
      return insights.recommendations.filter(rec => rec.toLowerCase().includes('workout'));
    } catch (error) {
      console.error('❌ Failed to get workout recommendations:', error);
      return ['Try a 20-minute HIIT workout today', 'Consider adding strength training to your routine'];
    }
  }

  /**
   * Get nutrition recommendations based on user's goals
   */
  async getNutritionRecommendations(): Promise<string[]> {
    try {
      const insights = await this.getAIInsights();
      return insights.recommendations.filter(rec => rec.toLowerCase().includes('nutrition') || rec.toLowerCase().includes('protein'));
    } catch (error) {
      console.error('❌ Failed to get nutrition recommendations:', error);
      return ['Increase protein intake for muscle recovery', 'Stay hydrated throughout the day'];
    }
  }
}

export const aiService = AIService.getInstance();
