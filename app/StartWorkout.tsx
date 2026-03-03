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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface WorkoutType {
  id: string;
  name: string;
  icon: string;
  duration: number;
  calories: number;
  description: string;
}

const workoutTypes: WorkoutType[] = [
  {
    id: 'cardio',
    name: 'Cardio',
    icon: '=É≈‚G«ÏG÷Èn+≈',
    duration: 30,
    calories: 300,
    description: 'Running, cycling, or elliptical training'
  },
  {
    id: 'strength',
    name: 'Strength',
    icon: '=É≈Ôn+≈G«ÏG÷Èn+≈',
    duration: 45,
    calories: 250,
    description: 'Weight training and resistance exercises'
  },
  {
    id: 'yoga',
    name: 'Yoga',
    icon: '=É∫ˇG«ÏG÷Èn+≈',
    duration: 60,
    calories: 180,
    description: 'Flexibility, balance, and mindfulness'
  },
  {
    id: 'hiit',
    name: 'HIIT',
    icon: 'G‹Ì',
    duration: 20,
    calories: 400,
    description: 'High-intensity interval training'
  },
  {
    id: 'swimming',
    name: 'Swimming',
    icon: '=É≈ËG«ÏG÷Èn+≈',
    duration: 40,
    calories: 350,
    description: 'Full-body aquatic workout'
  },
  {
    id: 'cycling',
    name: 'Cycling',
    icon: '=É‹¶G«ÏG÷Èn+≈',
    duration: 45,
    calories: 320,
    description: 'Indoor or outdoor cycling'
  },
];

const StartWorkout: React.FC = () => {
  const router = useRouter();
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutType | null>(null);
  const [customDuration, setCustomDuration] = useState<number>(30);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

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
  }, []);

  const handleWorkoutComplete = () => {
    setIsWorkoutActive(false);
    Alert.alert(
      'Workout Complete! =ÉƒÎ',
      `Great job! You burned ${selectedWorkout?.calories || 0} calories in ${formatTime(elapsedTime)}.`,
      [
        { text: 'View Summary', onPress: () => router.push('/Zoefit/home') },
        { text: 'Start Another', onPress: resetWorkout },
      ]
    );
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
    Alert.alert(
      'Stop Workout?',
      'Are you sure you want to stop your current workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Stop', onPress: resetWorkout, style: 'destructive' },
      ]
    );
  };

  const renderWorkoutSelection = () => (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>GÂ… Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Start Workout</Text>
        </View> */}

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Your Workout</Text>
            <View style={styles.workoutGrid}>
              {workoutTypes.map((workout) => (
                <TouchableOpacity
                  key={workout.id}
                  style={[
                    styles.workoutCard,
                    selectedWorkout?.id === workout.id && styles.selectedWorkoutCard,
                  ]}
                  onPress={() => setSelectedWorkout(workout)}
                >
                  <Text style={styles.workoutIcon}>{workout.icon}</Text>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <Text style={styles.workoutDuration}>{workout.duration} min</Text>
                  <Text style={styles.workoutCalories}>{workout.calories} cal</Text>
                  <Text style={styles.workoutDescription}>{workout.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {selectedWorkout && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customize Duration</Text>
              <View style={styles.durationContainer}>
                <Text style={styles.durationLabel}>Duration: {customDuration} minutes</Text>
                <View style={styles.durationButtons}>
                  <TouchableOpacity
                    style={styles.durationButton}
                    onPress={() => setCustomDuration(Math.max(5, customDuration - 5))}
                  >
                    <Text style={styles.durationButtonText}>-5</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.durationButton}
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
                <Text style={styles.startButtonText}>Start {selectedWorkout.name} Workout</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );

  const renderActiveWorkout = () => (
    <View style={styles.activeWorkoutContainer}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.workoutHeader}>
          <Text style={styles.workoutTitle}>{selectedWorkout?.icon} {selectedWorkout?.name}</Text>
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
          <Text style={styles.motivationText}>Keep pushing! =É∆¨</Text>
          <Text style={styles.motivationSubtext}>You're doing great!</Text>
        </View>
      </SafeAreaView>
    </View>
  );

  return selectedWorkout && elapsedTime > 0 ? renderActiveWorkout() : renderWorkoutSelection();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8faf8',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#2E7D32',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  workoutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  workoutCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedWorkoutCard: {
    backgroundColor: '#e8f5e9',
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  workoutIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  workoutDuration: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
    marginBottom: 3,
  },
  workoutCalories: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  workoutDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  durationContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  durationLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  durationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  durationButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 25,
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  activeWorkoutContainer: {
    flex: 1,
    backgroundColor: '#2E7D32',
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  stopButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timerContainer: {
    alignItems: 'center',
    padding: 30,
  },
  timerLabel: {
    fontSize: 16,
    color: '#e8f5e9',
    marginBottom: 10,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  progressBar: {
    width: width * 0.8,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    minWidth: 80,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#e8f5e9',
  },
  controlsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  controlButton: {
    borderRadius: 30,
    paddingHorizontal: 40,
    paddingVertical: 15,
    minWidth: 150,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#ff9800',
  },
  resumeButton: {
    backgroundColor: '#4caf50',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  motivationContainer: {
    alignItems: 'center',
    padding: 30,
  },
  motivationText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  motivationSubtext: {
    fontSize: 16,
    color: '#e8f5e9',
  },
});

export default StartWorkout;
