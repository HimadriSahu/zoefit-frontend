import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

const WorkoutScreen = () => {
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const router = useRouter();

  const workouts = [
    {
      id: '1',
      name: 'Morning Cardio',
      duration: '30 min',
      calories: '250',
      difficulty: 'Beginner',
      exercises: ['Jumping Jacks', 'High Knees', 'Burpees', 'Mountain Climbers'],
    },
    {
      id: '2',
      name: 'Strength Training',
      duration: '45 min',
      calories: '350',
      difficulty: 'Intermediate',
      exercises: ['Push-ups', 'Squats', 'Lunges', 'Plank'],
    },
    {
      id: '3',
      name: 'HIIT Workout',
      duration: '20 min',
      calories: '400',
      difficulty: 'Advanced',
      exercises: ['Sprint Intervals', 'Box Jumps', 'Kettlebell Swings', 'Battle Ropes'],
    },
    {
      id: '4',
      name: 'Yoga Flow',
      duration: '60 min',
      calories: '180',
      difficulty: 'Beginner',
      exercises: ['Sun Salutation', 'Warrior Poses', 'Tree Pose', 'Meditation'],
    },
  ];

  const startWorkout = (workoutId: string) => {
    setSelectedWorkout(workoutId);
    Alert.alert(
      'Workout Started!',
      'Great job taking the first step! Track your progress as you go.',
      [
        { 
          text: 'Let\'s Go!', 
          onPress: () => router.push('/StartWorkout'),
          style: 'default' 
        }
      ]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      default: return '#666';
    }
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
          <Text style={styles.title}>Workouts 💪</Text>
          <Text style={styles.subtitle}>Choose your training session</Text>
        </LinearGradient>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.quickStartContainer}>
            <TouchableOpacity style={styles.quickStartButton}>
              <LinearGradient
                colors={['#ff6b6b', '#ee5a24']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.quickStartGradient}
              >
                <Text style={styles.quickStartText}>Quick Start</Text>
                <Text style={styles.quickStartSubtext}>Random workout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.workoutsContainer}>
            <Text style={styles.sectionTitle}>Available Workouts</Text>
            {workouts.map((workout) => (
              <View key={workout.id} style={styles.workoutCard}>
                <View style={styles.workoutHeader}>
                  <View>
                    <Text style={styles.workoutName}>{workout.name}</Text>
                    <View style={styles.workoutMeta}>
                      <Text style={styles.workoutMetaText}>⏱️ {workout.duration}</Text>
                      <Text style={styles.workoutMetaText}>🔥 {workout.calories} cal</Text>
                    </View>
                  </View>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(workout.difficulty) }]}>
                    <Text style={styles.difficultyText}>{workout.difficulty}</Text>
                  </View>
                </View>

                <View style={styles.exercisesContainer}>
                  <Text style={styles.exercisesTitle}>Exercises:</Text>
                  {workout.exercises.map((exercise, index) => (
                    <Text key={index} style={styles.exerciseItem}>• {exercise}</Text>
                  ))}
                </View>

                <TouchableOpacity 
                  style={[styles.startButton, selectedWorkout === workout.id && styles.startButtonActive]}
                  onPress={() => startWorkout(workout.id)}
                  disabled={selectedWorkout === workout.id}
                >
                  <LinearGradient
                    colors={selectedWorkout === workout.id ? ['#4a5568', '#2d3748'] : ['#667eea', '#764ba2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.startButtonGradient}
                  >
                    <Text style={styles.startButtonText}>
                      {selectedWorkout === workout.id ? 'In Progress...' : 'Start Workout'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.tipsContainer}>
            <LinearGradient
              colors={['#2196f3', '#1976d2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tipsGradient}
            >
              <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
              <Text style={styles.tip}>• Always warm up before starting any workout</Text>
              <Text style={styles.tip}>• Stay hydrated throughout your session</Text>
              <Text style={styles.tip}>• Listen to your body and rest when needed</Text>
              <Text style={styles.tip}>• Consistency is key to reaching your goals</Text>
            </LinearGradient>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default WorkoutScreen;

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
  quickStartContainer: {
    padding: 20,
  },
  quickStartButton: {
    borderRadius: 18,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  quickStartGradient: {
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
  },
  quickStartText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  quickStartSubtext: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
    opacity: 0.9,
  },
  workoutsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  workoutCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 18,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  workoutMeta: {
    flexDirection: 'row',
  },
  workoutMetaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginRight: 15,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  exercisesContainer: {
    marginBottom: 15,
  },
  exercisesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  exerciseItem: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 3,
  },
  startButton: {
    borderRadius: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  startButtonGradient: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonActive: {
    opacity: 0.7,
    shadowOpacity: 0.1,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  tipsContainer: {
    margin: 20,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#2196f3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  tipsGradient: {
    padding: 20,
    borderRadius: 18,
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
});
