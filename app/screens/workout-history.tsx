import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeContext';
import { apiService, WorkoutPlan } from '../../services/api';
import { authService } from '../../services/auth';

const { width: screenWidth } = Dimensions.get('window');

const WorkoutHistoryScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();

  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadWorkoutHistory();
  }, []);

  const loadWorkoutHistory = async () => {
    try {
      setIsLoading(true);
      const isAuth = await authService.isAuthenticated();
      if (!isAuth) {
        console.log('User not authenticated');
        return;
      }

      // Fetch from frontend API instead of AI API (filter for last 3 months)
      const response = await apiService.getWorkoutSessions();
      console.log('Raw workout sessions:', response);

      // Handle empty results gracefully
      if (!response.results || response.results.length === 0) {
        setWorkouts([]);
        console.log('No workout sessions found');
        return;
      }

      // Filter workouts from the last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const recentWorkouts = response.results.filter((session: any) => {
        const sessionDate = new Date(session.created_at);
        return sessionDate >= threeMonthsAgo;
      });

      console.log(`Filtered ${recentWorkouts.length} workouts from last 3 months`);

      // Transform frontend workout sessions to match WorkoutPlan interface
      const transformedWorkouts = recentWorkouts.map((session: any) => {
        // Extract workout type from exercises or exercise_logs
        let workoutType = 'strength';
        const exercisesData = session.exercises_completed || session.exercise_logs || [];

        if (exercisesData.length > 0) {
          const firstExercise = exercisesData[0];
          // Handle different data structures
          const exercise = firstExercise.exercise || firstExercise;
          if (exercise?.category) {
            const category = exercise.category.toLowerCase();
            if (category.includes('cardio')) workoutType = 'cardio';
            else if (category.includes('hiit')) workoutType = 'hiit';
            else if (category.includes('flexibility') || category.includes('stretch')) workoutType = 'flexibility';
            else if (category.includes('strength') || category.includes('weights')) workoutType = 'strength';
          }
        }

        // Calculate difficulty based on duration and exercises
        let difficulty = 'beginner';
        const duration = session.duration_minutes || 2;
        const exerciseCount = exercisesData.length;

        if (duration >= 30 || exerciseCount >= 8) difficulty = 'advanced';
        else if (duration >= 15 || exerciseCount >= 5) difficulty = 'intermediate';

        return {
          id: session.id,
          day: 1,
          exercises: exercisesData,
          workout_type: session.workout_plan?.workout_type || workoutType,
          estimated_duration: duration,
          difficulty_level: session.difficulty_rating || difficulty,
          intensity_score: Math.min(10, Math.max(1, Math.round((duration / 10) + (exerciseCount / 2)))),
          equipment_needed: [],
          completed: session.completed || (session.end_time !== null),
          completion_time: session.end_time,
          user_rating: session.user_rating,
          created_at: session.created_at
        };
      });

      setWorkouts(transformedWorkouts);
      console.log('Workout history loaded:', transformedWorkouts);
    } catch (error) {
      console.error('Failed to load workout history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkoutHistory();
    setRefreshing(false);
  };

  const handleWorkoutPress = (workout: WorkoutPlan) => {
    setSelectedWorkout(workout);
    setModalVisible(true);
  };

  const updateWorkoutRating = async (workoutId: number, rating: number) => {
    try {
      await apiService.updateWorkoutCompletion({
        workout_plan_id: workoutId,
        completed: true,
        user_rating: rating,
      });

      // Update local state
      setWorkouts(prev => prev.map(w =>
        w.id === workoutId ? { ...w, user_rating: rating, completed: true } : w
      ));

      Alert.alert('Success', 'Workout rated successfully!');
    } catch (error) {
      console.error('Failed to rate workout:', error);
      Alert.alert('Error', 'Failed to rate workout. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getWorkoutTypeIcon = (type: string) => {
    switch (type) {
      case 'strength': return '🏋️';
      case 'cardio': return '🏃';
      case 'hiit': return '🔥';
      case 'flexibility': return '🧘';
      case 'mixed': return '💪';
      default: return '🏃';
    }
  };

  const renderWorkoutCard = (workout: WorkoutPlan) => (
    <TouchableOpacity
      key={workout.id}
      style={[
        styles.workoutCard,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
        }
      ]}
      onPress={() => handleWorkoutPress(workout)}
    >
      <View style={styles.workoutHeader}>
        <View style={styles.workoutInfo}>
          <Text style={styles.workoutTypeIcon}>
            {getWorkoutTypeIcon(workout.workout_type)}
          </Text>
          <View style={styles.workoutDetails}>
            <Text style={[styles.workoutTitle, { color: theme.text }]}>
              Day {workout.day} - {workout.workout_type.charAt(0).toUpperCase() + workout.workout_type.slice(1)}
            </Text>
            <Text style={[styles.workoutDate, { color: theme.textSecondary }]}>
              {formatDate(workout.created_at)}
            </Text>
          </View>
        </View>
        <View style={styles.workoutMeta}>
          <View style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(workout.difficulty_level) }
          ]}>
            <Text style={styles.difficultyText}>
              {workout.difficulty_level.charAt(0).toUpperCase() + workout.difficulty_level.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.workoutStats}>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>⏱️</Text>
          <Text style={[styles.statText, { color: theme.textSecondary }]}>
            {formatDuration(workout.estimated_duration)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={[styles.statText, { color: theme.textSecondary }]}>
            Intensity {workout.intensity_score}/10
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statIcon}>🏋️</Text>
          <Text style={[styles.statText, { color: theme.textSecondary }]}>
            {workout.exercises?.length || 0} exercises
          </Text>
        </View>
      </View>

      <View style={styles.workoutFooter}>
        <View style={styles.completionStatus}>
          {workout.completed ? (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>✓ Completed</Text>
            </View>
          ) : (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>Pending</Text>
            </View>
          )}
        </View>

        {workout.user_rating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>⭐ {workout.user_rating}/5</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderWorkoutModal = () => {
    if (!selectedWorkout) return null;

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.closeButton, { color: theme.primary }]}>Close</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Workout Details
              </Text>
              <View style={{ width: 60 }} />
            </View>

            <ScrollView style={styles.modalScrollView}>
              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>
                  {getWorkoutTypeIcon(selectedWorkout.workout_type)} Day {selectedWorkout.day}
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  {selectedWorkout.workout_type.charAt(0).toUpperCase() + selectedWorkout.workout_type.slice(1)} Workout
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Workout Info</Text>
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoIcon}>⏱️</Text>
                    <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                      {formatDuration(selectedWorkout.estimated_duration)}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoIcon}>🔥</Text>
                    <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                      Intensity {selectedWorkout.intensity_score}/10
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoIcon}>📊</Text>
                    <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                      {selectedWorkout.difficulty_level.charAt(0).toUpperCase() + selectedWorkout.difficulty_level.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoIcon}>🏋️</Text>
                    <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                      {selectedWorkout.exercises?.length || 0} exercises
                    </Text>
                  </View>
                </View>
              </View>

              {selectedWorkout.equipment_needed && selectedWorkout.equipment_needed.length > 0 && (
                <View style={styles.modalSection}>
                  <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Equipment Needed</Text>
                  <View style={styles.equipmentContainer}>
                    {selectedWorkout.equipment_needed.map((equipment, index) => (
                      <View key={index} style={[styles.equipmentTag, { backgroundColor: theme.background, borderColor: theme.border }]}>
                        <Text style={[styles.equipmentText, { color: theme.text }]}>
                          {equipment.replace('_', ' ').charAt(0).toUpperCase() + equipment.replace('_', ' ').slice(1)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Rate This Workout</Text>
                <View style={styles.modalRatingContainer}>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <TouchableOpacity
                      key={rating}
                      style={[
                        styles.ratingStar,
                        (selectedWorkout.user_rating || 0) === rating && styles.selectedStar
                      ]}
                      onPress={() => updateWorkoutRating(selectedWorkout.id, rating)}
                    >
                      <Text style={styles.starText}>
                        {(selectedWorkout.user_rating || 0) >= rating ? '⭐' : '☆'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading workout history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={theme.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Workout History</Text>
          <Text style={styles.headerSubtitle}>Last 3 Months</Text>
        </View>
        <View style={{ width: 60 }} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {workouts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏋️</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Workouts Yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Start your fitness journey to see your workout history here
            </Text>
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: theme.primary }]}
              onPress={() => router.push('/StartWorkout')}
            >
              <Text style={styles.startButtonText}>Generate Workout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.workoutList}>
            {workouts.map(workout => renderWorkoutCard(workout))}
          </View>
        )}
      </ScrollView>

      {renderWorkoutModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
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
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  workoutList: {
    gap: 16,
  },
  workoutsContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  workoutCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  workoutInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  workoutTypeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  workoutDetails: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  workoutDate: {
    fontSize: 14,
  },
  workoutMeta: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  statText: {
    fontSize: 14,
  },
  workoutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completionStatus: {
    flex: 1,
  },
  completedBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  completedText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  pendingText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  startButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalScrollView: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  infoText: {
    fontSize: 14,
  },
  equipmentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  equipmentTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  equipmentText: {
    fontSize: 14,
  },
  modalRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  ratingStar: {
    padding: 8,
  },
  selectedStar: {
    transform: [{ scale: 1.1 }],
  },
  starText: {
    fontSize: 24,
  },
});

export default WorkoutHistoryScreen;
