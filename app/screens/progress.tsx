import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { authService } from '../../services/auth';

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
}

const ProgressScreen = () => {
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
      // For now, generate demo data based on user ID
      const userData = await authService.getUserData();
      const userId = userData?.id || 1;
      
      // Generate demo stats
      const demoStats: WorkoutStats = {
        totalWorkouts: userId * 12 + 8,
        totalCalories: userId * 2500 + 1800,
        currentStreak: userId % 15 + 3,
        weeklyWorkouts: userId % 7 + 2,
        monthlyWorkouts: userId * 3 + 5,
      };

      // Generate demo recent workouts
      const demoWorkouts: RecentWorkout[] = [
        {
          id: '1',
          date: 'Today',
          type: 'Cardio',
          duration: 30,
          calories: 250,
        },
        {
          id: '2',
          date: 'Yesterday',
          type: 'Strength',
          duration: 45,
          calories: 320,
        },
        {
          id: '3',
          date: '2 days ago',
          type: 'Yoga',
          duration: 60,
          calories: 180,
        },
        {
          id: '4',
          date: '3 days ago',
          type: 'HIIT',
          duration: 25,
          calories: 400,
        },
        {
          id: '5',
          date: '4 days ago',
          type: 'Running',
          duration: 35,
          calories: 380,
        },
      ];

      setStats(demoStats);
      setRecentWorkouts(demoWorkouts);
    } catch (error) {
      console.error('Error loading progress data:', error);
      Alert.alert('Error', 'Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon }: { title: string; value: string | number; subtitle: string; icon: string }) => (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );

  const WorkoutItem = ({ workout }: { workout: RecentWorkout }) => (
    <View style={styles.workoutItem}>
      <View style={styles.workoutInfo}>
        <Text style={styles.workoutType}>{workout.type}</Text>
        <Text style={styles.workoutDate}>{workout.date}</Text>
      </View>
      <View style={styles.workoutStats}>
        <Text style={styles.workoutDuration}>{workout.duration} min</Text>
        <Text style={styles.workoutCalories}>{workout.calories} cal</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>See All</Text>
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
            onPress={() => router.push('/start-workout')}
          >
            <Text style={styles.startWorkoutButtonText}>Start New Workout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8faf8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
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
    color: '#333',
    marginBottom: 15,
  },
  seeAllButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: '#2E7D32',
    borderRadius: 15,
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
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 3,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  workoutList: {
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  workoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  workoutDate: {
    fontSize: 12,
    color: '#666',
  },
  workoutStats: {
    alignItems: 'flex-end',
  },
  workoutDuration: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 3,
  },
  workoutCalories: {
    fontSize: 12,
    color: '#666',
  },
  monthlyStats: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  monthlyStatItem: {
    alignItems: 'center',
    marginBottom: 15,
  },
  monthlyStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  monthlyStatLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  startWorkoutButton: {
    backgroundColor: '#2E7D32',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  startWorkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProgressScreen;
