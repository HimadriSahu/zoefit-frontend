import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WorkoutScreen = () => {
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);

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
      [{ text: 'Let\'s Go!', style: 'default' }]
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Workouts 💪</Text>
          <Text style={styles.subtitle}>Choose your training session</Text>
        </View>

        <View style={styles.quickStartContainer}>
          <TouchableOpacity style={styles.quickStartButton}>
            <Text style={styles.quickStartText}>Quick Start</Text>
            <Text style={styles.quickStartSubtext}>Random workout</Text>
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
                <Text style={styles.startButtonText}>
                  {selectedWorkout === workout.id ? 'In Progress...' : 'Start Workout'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Pro Tips</Text>
          <Text style={styles.tip}>• Always warm up before starting any workout</Text>
          <Text style={styles.tip}>• Stay hydrated throughout your session</Text>
          <Text style={styles.tip}>• Listen to your body and rest when needed</Text>
          <Text style={styles.tip}>• Consistency is key to reaching your goals</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WorkoutScreen;

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
    backgroundColor: '#2E7D32',
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
  quickStartContainer: {
    padding: 20,
  },
  quickStartButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  },
  workoutsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  workoutCard: {
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
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  workoutMeta: {
    flexDirection: 'row',
  },
  workoutMetaText: {
    fontSize: 12,
    color: '#666',
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
    color: '#333',
    marginBottom: 8,
  },
  exerciseItem: {
    fontSize: 13,
    color: '#666',
    marginBottom: 3,
  },
  startButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  startButtonActive: {
    backgroundColor: '#a5d6a7',
  },
  startButtonText: {
    fontSize: 16,
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
    color: '#2E7D32',
    marginBottom: 10,
  },
  tip: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});
