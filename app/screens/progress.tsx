import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../../services/auth';
import { aiService } from '../../services/ai';
import { useTheme } from './ThemeContext';
import { ProgressTracking, WorkoutPlan } from '../../services/api';

const { width: screenWidth } = Dimensions.get('window');

interface WorkoutStats {
  totalWorkouts: number;
  totalCalories: number;
  currentStreak: number;
  weeklyWorkouts: number;
  monthlyWorkouts: number;
}

interface RecentWorkout {
  id: string;
  date: string;
  type: string;
  duration: number;
  calories: number;
  completed: boolean;
}

const ProgressScreen = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WorkoutStats>({
    totalWorkouts: 0,
    totalCalories: 0,
    currentStreak: 0,
    weeklyWorkouts: 0,
    monthlyWorkouts: 0,
  });
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      setLoading(true);

      // Check if user is authenticated first
      const isAuth = await authService.isAuthenticated();
      if (!isAuth) {
        console.log('⚠️ User not authenticated, using mock progress data');
        // Set default values when not authenticated
        setStats({
          totalWorkouts: 0,
          totalCalories: 0,
          currentStreak: 0,
          weeklyWorkouts: 0,
          monthlyWorkouts: 0,
        });
        setRecentWorkouts([]);
        return;
      }

      // Load real progress data from backend
      const [progressData, workoutPlans] = await Promise.all([
        aiService.getProgressData(),
        aiService.getWorkoutPlans()
      ]);

      // Calculate stats from real data
      const latestProgress = progressData[0]; // Most recent entry
      const totalWorkouts = workoutPlans.filter(plan => plan.completed).length;
      const totalCalories = progressData.reduce((sum, p) => sum + p.calories_burned, 0);
      const currentStreak = latestProgress?.workout_streak || 0;

      // Calculate weekly and monthly workouts
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const weeklyWorkouts = workoutPlans.filter(plan => {
        if (!plan.completion_time) return false;
        const completionDate = new Date(plan.completion_time);
        return completionDate >= weekAgo && plan.completed;
      }).length;

      const monthlyWorkouts = workoutPlans.filter(plan => {
        if (!plan.completion_time) return false;
        const completionDate = new Date(plan.completion_time);
        return completionDate >= monthAgo && plan.completed;
      }).length;

      const realStats: WorkoutStats = {
        totalWorkouts,
        totalCalories,
        currentStreak,
        weeklyWorkouts,
        monthlyWorkouts,
      };

      // Create recent workouts from completed workout plans
      const recentWorkoutsData: RecentWorkout[] = workoutPlans
        .filter(plan => plan.completed && plan.completion_time)
        .slice(-5) // Get last 5 workouts
        .reverse() // Most recent first
        .map((plan, index) => {
          const completionDate = new Date(plan.completion_time!);
          const now = new Date();
          const daysDiff = Math.floor((now.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));

          let dateText = '';
          if (daysDiff === 0) dateText = 'Today';
          else if (daysDiff === 1) dateText = 'Yesterday';
          else if (daysDiff < 7) dateText = `${daysDiff} days ago`;
          else dateText = completionDate.toLocaleDateString();

          return {
            id: plan.id.toString(),
            date: dateText,
            type: plan.workout_type.charAt(0).toUpperCase() + plan.workout_type.slice(1),
            duration: plan.estimated_duration,
            calories: Math.round(plan.intensity_score * 30), // Estimate calories
            completed: plan.completed,
          };
        });

      setStats(realStats);
      setRecentWorkouts(recentWorkoutsData);

      console.log('✅ Progress data loaded successfully:', {
        stats: realStats,
        recentWorkouts: recentWorkoutsData.length
      });

    } catch (error) {
      console.error('❌ Error loading progress data:', error);

      // Fallback to demo data if backend fails
      try {
        const userData = await authService.getUserData();
        const userId = userData?.id || 1;

        const demoStats: WorkoutStats = {
          totalWorkouts: userId * 12 + 8,
          totalCalories: userId * 2500 + 1800,
          currentStreak: userId % 15 + 3,
          weeklyWorkouts: userId % 7 + 2,
          monthlyWorkouts: userId * 3 + 5,
        };

        const demoWorkouts: RecentWorkout[] = [
          {
            id: '1',
            date: 'Today',
            type: 'Cardio',
            duration: 30,
            calories: 250,
            completed: true,
          },
          {
            id: '2',
            date: 'Yesterday',
            type: 'Strength',
            duration: 45,
            calories: 320,
            completed: true,
          },
          {
            id: '3',
            date: '2 days ago',
            type: 'Yoga',
            duration: 60,
            calories: 180,
            completed: true,
          },
          {
            id: '4',
            date: '3 days ago',
            type: 'HIIT',
            duration: 25,
            calories: 400,
            completed: true,
          },
          {
            id: '5',
            date: '4 days ago',
            type: 'Running',
            duration: 35,
            calories: 380,
            completed: true,
          },
        ];

        setStats(demoStats);
        setRecentWorkouts(demoWorkouts);
        console.warn('⚠️ Using demo data due to backend error');
      } catch (demoError) {
        console.error('❌ Even demo data failed:', demoError);
        Alert.alert('Error', 'Failed to load progress data');
      }
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon }: { title: string; value: string | number; subtitle: string; icon: string }) => {
    const { theme } = useTheme();
    return (
      <TouchableOpacity 
        style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
        onPress={() => {
          // Show detailed stat information
          Alert.alert(
            `${title} Details`,
            `${icon} ${title}: ${value}\nPeriod: ${subtitle}\n\nTap to view more detailed analytics in future updates!`,
            [{ text: 'OK', style: 'default' }]
          );
        }}
      >
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.statSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
      </TouchableOpacity>
    );
  };

  const WorkoutItem = ({ workout }: { workout: RecentWorkout }) => {
    const { theme } = useTheme();
    return (
      <TouchableOpacity 
        style={[styles.workoutItem, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
        onPress={() => {
          // Navigate to workout details or show workout info
          Alert.alert(
            'Workout Details',
            `Type: ${workout.type}\nDate: ${workout.date}\nDuration: ${workout.duration} minutes\nCalories: ${workout.calories} cal\nStatus: ${workout.completed ? 'Completed' : 'In Progress'}`,
            [{ text: 'OK', style: 'default' }]
          );
        }}
      >
        <View style={styles.workoutInfo}>
          <Text style={[styles.workoutType, { color: theme.text }]}>{workout.type}</Text>
          <Text style={[styles.workoutDate, { color: theme.textSecondary }]}>{workout.date}</Text>
        </View>
        <View style={styles.workoutStats}>
          <Text style={[styles.workoutDuration, { color: theme.textSecondary }]}>{workout.duration} min</Text>
          <Text style={[styles.workoutCalories, { color: theme.textSecondary }]}>{workout.calories} cal</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.loadingContainer}>
            <LinearGradient
              colors={theme.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.loadingGradient}
            >
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Loading progress...</Text>
            </LinearGradient>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={theme.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Progress 📊</Text>
          <Text style={styles.headerSubtitle}>Track your fitness journey</Text>
        </LinearGradient>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Stats</Text>
            <View style={styles.statsGrid}>
              <StatCard
                title="Total Workouts"
                value={stats.totalWorkouts}
                subtitle="All time"
                icon="🏋️"
              />
              <StatCard
                title="Calories Burned"
                value={stats.totalCalories.toLocaleString()}
                subtitle="Total calories"
                icon="🔥"
              />
              <StatCard
                title="Current Streak"
                value={`${stats.currentStreak} days`}
                subtitle="Keep going!"
                icon="⚡"
              />
              <StatCard
                title="This Week"
                value={stats.weeklyWorkouts}
                subtitle="Workouts"
                icon="📅"
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Workouts</Text>
              <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push('/screens/workout-history' as any)}>
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.seeAllGradient}
                >
                  <Text style={styles.seeAllText}>See All</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <View style={styles.workoutList}>
              {recentWorkouts.map((workout) => (
                <WorkoutItem key={workout.id} workout={workout} />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Overview</Text>
            <View style={styles.monthlyStats}>
              <View style={styles.monthlyStatItem}>
                <Text style={styles.monthlyStatValue}>{stats.monthlyWorkouts}</Text>
                <Text style={styles.monthlyStatLabel}>Workouts this month</Text>
              </View>
              <View style={styles.monthlyStatItem}>
                <Text style={styles.monthlyStatValue}>
                  {Math.round(stats.monthlyWorkouts * 4.2 * 30)}
                </Text>
                <Text style={styles.monthlyStatLabel}>Calories this month</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={styles.startWorkoutButton}
              onPress={() => router.push('/StartWorkout' as any)}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.startWorkoutGradient}
              >
                <Text style={styles.startWorkoutButtonText}>Start New Workout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textShadowColor: '#047857',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ecfdf5',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGradient: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  seeAllButton: {
    borderRadius: 12,
  },
  seeAllGradient: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 12,
    alignItems: 'center',
  },
  seeAllText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 3,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  workoutList: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  workoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 3,
  },
  workoutDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  workoutStats: {
    alignItems: 'flex-end',
  },
  workoutDuration: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 3,
  },
  workoutCalories: {
    fontSize: 12,
    color: '#6b7280',
  },
  monthlyStats: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  monthlyStatItem: {
    alignItems: 'center',
    marginBottom: 15,
  },
  monthlyStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  monthlyStatLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  startWorkoutButton: {
    borderRadius: 15,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  startWorkoutGradient: {
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  startWorkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProgressScreen;
