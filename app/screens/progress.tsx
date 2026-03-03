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
      <View style={{ flex: 1, backgroundColor: '#0a0f1c' }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.loadingContainer}>
            <LinearGradient
              colors={['#667eea', '#764ba2', '#f093fb']}
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
    <View style={{ flex: 1, backgroundColor: '#0a0f1c' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb']}
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
              <TouchableOpacity style={styles.seeAllButton}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
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
                colors={['#667eea', '#764ba2']}
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
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textShadowColor: '#764ba2',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e0e7ff',
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
    color: '#fff',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
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
    color: '#fff',
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 3,
  },
  statSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  workoutList: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  workoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 3,
  },
  workoutDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  workoutStats: {
    alignItems: 'flex-end',
  },
  workoutDuration: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 3,
  },
  workoutCalories: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  monthlyStats: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  monthlyStatItem: {
    alignItems: 'center',
    marginBottom: 15,
  },
  monthlyStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  monthlyStatLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  startWorkoutButton: {
    borderRadius: 15,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
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
