import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Animated,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './screens/ThemeContext';
import { aiService } from '../services/ai';
import { authService } from '../services/auth';
import { WorkoutCompletionData } from '../services/api';

const { width, height } = Dimensions.get('window');

interface WorkoutType {
  id: string;
  name: string;
  duration: number;
  calories: number;
  description: string;
}

interface WorkoutPlan {
  id: number;
  day: number;
  exercises: any[];
  workout_type: string;
  estimated_duration: number;
  difficulty_level: string;
  intensity_score: number;
  equipment_needed: string[];
  completed: boolean;
  completion_time?: string;
  user_rating?: number;
}

const workoutTypes: WorkoutType[] = [
  {
    id: 'cardio',
    name: 'Cardio',
    duration: 30,
    calories: 300,
    description: 'Running, cycling, or elliptical training'
  },
  {
    id: 'strength',
    name: 'Strength',
    duration: 45,
    calories: 250,
    description: 'Weight training and resistance exercises'
  },
  {
    id: 'yoga',
    name: 'Yoga',
    duration: 60,
    calories: 180,
    description: 'Flexibility, balance, and mindfulness'
  },
  {
    id: 'hiit',
    name: 'HIIT',
    duration: 20,
    calories: 400,
    description: 'High-intensity interval training'
  },
  {
    id: 'swimming',
    name: 'Swimming',
    duration: 40,
    calories: 350,
    description: 'Full-body aquatic workout'
  },
  {
    id: 'cycling',
    name: 'Cycling',
    duration: 45,
    calories: 320,
    description: 'Indoor or outdoor cycling'
  },
];

const StartWorkout: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutType | null>(null);
  const [customDuration, setCustomDuration] = useState<number>(30);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isLoading, setIsLoading] = useState(false);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [currentWorkoutPlan, setCurrentWorkoutPlan] = useState<WorkoutPlan | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isWorkoutActive && selectedWorkout) {
      interval = setInterval(() => {
        setElapsedTime(prev => {
          if (prev >= selectedWorkout.duration * 60) {
            handleWorkoutComplete();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkoutActive, selectedWorkout]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Load existing workout plans
    loadWorkoutPlans();
  }, []);

  const loadWorkoutPlans = async () => {
    try {
      setIsLoading(true);

      // Check if user is authenticated first
      const isAuth = await authService.isAuthenticated();
      if (!isAuth) {
        console.log('⚠️ User not authenticated, using default workouts');
        return;
      }

      const plans = await aiService.getWorkoutPlans();
      setWorkoutPlans(plans);
      console.log('✅ Workout plans loaded:', plans.length, 'plans');
    } catch (error) {
      console.warn('⚠️ Could not load workout plans:', error);
      // Continue with default workout types
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewWorkoutPlan = async () => {
    try {
      setIsLoading(true);

      // Check if user is authenticated first
      const isAuth = await authService.isAuthenticated();
      if (!isAuth) {
        Alert.alert('Authentication Required', 'Please log in to generate personalized workout plans.');
        return;
      }

      const response = await aiService.generateWorkoutPlan();
      setCurrentWorkoutPlan(response.workout_plan);
      setWorkoutPlans([...workoutPlans, response.workout_plan]);
      console.log('✅ New workout plan generated:', response.workout_plan);
      Alert.alert('Success', 'New personalized workout plan generated!');
    } catch (error) {
      console.error('❌ Failed to generate workout plan:', error);
      Alert.alert('Error', 'Failed to generate workout plan. Using default workouts.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkoutComplete = async () => {
    setIsWorkoutActive(false);

    // Save workout completion to backend
    await saveWorkoutCompletion(true);

    Alert.alert(
      'Workout Complete! 🎉',
      `Great job! You burned ${selectedWorkout?.calories || 0} calories in ${formatTime(elapsedTime)}.`,
      [
        { text: 'View Summary', onPress: () => router.push('/Zoefit/home') },
        { text: 'Start Another', onPress: resetWorkout },
      ]
    );
  };

  const saveWorkoutCompletion = async (completed: boolean) => {
    try {
      setIsLoading(true);

      // Calculate actual calories based on duration and intensity
      const actualCalories = Math.round(
        (selectedWorkout?.calories || 0) *
        (elapsedTime / ((selectedWorkout?.duration || 30) * 60))
      );

      const completionData: WorkoutCompletionData = {
        workout_plan_id: currentWorkoutPlan?.id || null, // Allow null for default workouts
        completed: completed,
        completion_time: formatTime(elapsedTime),
        calories_burned: actualCalories,
        completion_time_minutes: Math.round(elapsedTime / 60), // Add duration in minutes
        workout_type: selectedWorkout?.name || currentWorkoutPlan?.workout_type || 'Workout', // Add workout type
      };

      await aiService.completeWorkout(completionData);
      console.log('✅ Workout completion saved to backend:', completionData);

      // Show success message to user
      Alert.alert(
        'Workout Saved!',
        `Great job! You completed ${completionData.workout_type} for ${formatTime(elapsedTime)} and burned ${completionData.calories_burned} calories.`,
        [{ text: 'OK', onPress: () => router.push('/Zoefit/home') }]
      );

      // Trigger home screen refresh
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('workout_completed', Date.now().toString());
      } catch (storageError) {
        console.warn('⚠️ Could not trigger home screen refresh:', storageError);
      }
    } catch (error) {
      console.error('❌ Failed to save workout completion:', error);
      // Don't show error to user immediately, just log it
    } finally {
      setIsLoading(false);
    }
  };

  const resetWorkout = () => {
    setSelectedWorkout(null);
    setElapsedTime(0);
    setIsWorkoutActive(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startWorkout = () => {
    if (!selectedWorkout) {
      Alert.alert('Select Workout', 'Please select a workout type first.');
      return;
    }
    setIsWorkoutActive(true);
  };

  const pauseWorkout = () => {
    setIsWorkoutActive(false);
  };

  const resumeWorkout = () => {
    setIsWorkoutActive(true);
  };

  const stopWorkout = () => {
    const actualCalories = Math.round((elapsedTime / ((selectedWorkout?.duration || 30) * 60)) * (selectedWorkout?.calories || 0));

    Alert.alert(
      'Stop Workout?',
      `You've completed ${formatTime(elapsedTime)} of your workout.\nEstimated calories burned: ${actualCalories}`,
      [
        { text: 'Continue Workout', style: 'cancel' },
        {
          text: 'Stop & Save',
          onPress: () => handleWorkoutSummary(actualCalories),
          style: 'destructive'
        },
      ]
    );
  };

  const handleWorkoutSummary = async (caloriesBurned: number) => {
    const workoutData = {
      workoutType: selectedWorkout?.name,
      duration: formatTime(elapsedTime),
      calories: caloriesBurned,
      completed: elapsedTime >= ((selectedWorkout?.duration || 30) * 60) * 0.8,
      timestamp: new Date().toISOString()
    };

    // Save workout completion to backend
    await saveWorkoutCompletion(workoutData.completed);

    console.log('Workout Summary:', workoutData);

    Alert.alert(
      'Workout Saved!',
      `Great job! ${workoutData.completed ? 'Workout completed!' : 'Workout saved for partial completion.'}\n\nDuration: ${workoutData.duration}\nCalories: ${workoutData.calories}`,
      [
        {
          text: 'OK', onPress: () => {
            resetWorkout();
            router.push('/Zoefit/home');
          }
        },
        { text: 'Start Another', onPress: () => resetWorkout() },
      ]
    );
  };

  const renderWorkoutSelection = () => (
    <Animated.View style={[styles.container, { backgroundColor: theme.background, opacity: fadeAnim }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style= {styles.backButtonText}>G�� Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Start Workout</Text>
        </View> */}

        <ScrollView style={[styles.scrollView, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Choose Your Workout</Text>
            <View style={styles.workoutGrid}>
              {workoutTypes.map((workout) => (
                <TouchableOpacity
                  key={workout.id}
                  style={[
                    styles.workoutCard,
                    { backgroundColor: theme.cardBackground, borderColor: theme.border },
                    selectedWorkout?.id === workout.id && { backgroundColor: theme.primary },
                  ]}
                  onPress={() => setSelectedWorkout(workout)}
                >
                  <Text style={[styles.workoutName, { color: selectedWorkout?.id === workout.id ? '#fff' : theme.text }]}>{workout.name}</Text>
                  <Text style={[styles.workoutDuration, { color: selectedWorkout?.id === workout.id ? '#fff' : theme.textSecondary }]}>{workout.duration} min</Text>
                  <Text style={[styles.workoutCalories, { color: selectedWorkout?.id === workout.id ? '#fff' : theme.textSecondary }]}>{workout.calories} cal</Text>
                  <Text style={[styles.workoutDescription, { color: selectedWorkout?.id === workout.id ? '#fff' : theme.textSecondary }]}>{workout.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {selectedWorkout && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Customize Duration</Text>
              <View style={[styles.durationContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <Text style={[styles.durationLabel, { color: theme.text }]}>Duration: {customDuration} minutes</Text>
                <View style={styles.durationButtons}>
                  <TouchableOpacity
                    style={[styles.durationButton, { backgroundColor: theme.primary }]}
                    onPress={() => setCustomDuration(Math.max(5, customDuration - 5))}
                  >
                    <Text style={styles.durationButtonText}>-5</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.durationButton, { backgroundColor: theme.primary }]}
                    onPress={() => setCustomDuration(Math.min(120, customDuration + 5))}
                  >
                    <Text style={styles.durationButtonText}>+5</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {selectedWorkout && (
            <View style={styles.section}>
              <TouchableOpacity style={styles.startButton} onPress={startWorkout}>
                <LinearGradient
                  colors={theme.headerGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.startButton}
                >
                  <Text style={styles.startButtonText}>Start {selectedWorkout.name} Workout</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );

  const renderActiveWorkout = () => (
    <LinearGradient
      colors={theme.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.activeWorkoutContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.workoutHeader}>
          <Text style={styles.workoutTitle}>{selectedWorkout?.name}</Text>
          <TouchableOpacity onPress={stopWorkout} style={styles.stopButton}>
            <Text style={styles.stopButtonText}>Stop</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Time Remaining</Text>
          <Text style={styles.timerText}>
            {formatTime((selectedWorkout?.duration || 30) * 60 - elapsedTime)}
          </Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(elapsedTime / ((selectedWorkout?.duration || 30) * 60)) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round((elapsedTime / ((selectedWorkout?.duration || 30) * 60)) * 100)}%
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{selectedWorkout?.calories}</Text>
            <Text style={styles.statLabel}>Est. Calories</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{formatTime(elapsedTime)}</Text>
            <Text style={styles.statLabel}>Elapsed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{selectedWorkout?.duration}</Text>
            <Text style={styles.statLabel}>Total Min</Text>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, isWorkoutActive ? styles.pauseButton : styles.resumeButton]}
            onPress={isWorkoutActive ? pauseWorkout : resumeWorkout}
          >
            <Text style={styles.controlButtonText}>
              {isWorkoutActive ? 'Pause' : 'Resume'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.motivationContainer}>
          <Text style={styles.motivationText}>Keep pushing! </Text>
          <Text style={styles.motivationSubtext}>You're doing great!</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  return selectedWorkout && elapsedTime > 0 ? renderActiveWorkout() : renderWorkoutSelection();
};

const styles = StyleSheet.create({
  container: {
    flex: 2,
    backgroundColor: '#f0f9ff',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'transparent',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 15,
    marginBottom: 25,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
    marginHorizontal: 5,
  },
  workoutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  workoutCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 160,
    boxSizing: 'border-box',
  },
  selectedWorkoutCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2E7D32',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  workoutDuration: {
    fontSize: 15,
    color: '#2E7D32',
    fontWeight: '700',
    marginBottom: 5,
  },
  workoutCalories: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
    fontWeight: '500',
  },
  workoutDescription: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    lineHeight: 16,
  },
  durationContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  durationLabel: {
    fontSize: 18,
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  durationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  durationButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 30,
    width: 70,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  durationButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  startButton: {
    marginVertical: 20,
    borderRadius: 25,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  activeWorkoutContainer: {
    flex: 1,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 25,
    paddingTop: 10,
  },
  workoutTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  stopButton: {
    backgroundColor: '#ff4757',
    borderRadius: 25,
    paddingHorizontal: 25,
    paddingVertical: 12,
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timerContainer: {
    alignItems: 'center',
    padding: 40,
    paddingTop: 20,
  },
  timerLabel: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 15,
    fontWeight: '500',
  },
  timerText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  progressContainer: {
    marginTop: 25,
    alignItems: 'center',
    width: '100%',
  },
  progressBar: {
    width: '85%',
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 25,
    gap: 15,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    minWidth: 90,
    flex: 1,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statNumber: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  controlsContainer: {
    alignItems: 'center',
    padding: 25,
    paddingTop: 15,
  },
  controlButton: {
    borderRadius: 35,
    paddingHorizontal: 45,
    paddingVertical: 18,
    minWidth: 170,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  pauseButton: {
    backgroundColor: '#ff9800',
  },
  resumeButton: {
    backgroundColor: '#4caf50',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  motivationContainer: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 10,
  },
  motivationText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  motivationSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
});

export default StartWorkout;
