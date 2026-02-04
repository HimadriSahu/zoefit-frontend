import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const HomeScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome Back! 💪</Text>
          <Text style={styles.subtitle}>Ready to crush your fitness goals today?</Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Today's Overview</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Steps</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/start-workout')}>
              <Text style={styles.actionIcon}>🏃‍♂️</Text>
              <Text style={styles.actionTitle}>Start Workout</Text>
              <Text style={styles.actionSubtitle}>Begin your session</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/screens/progress')}>
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionTitle}>Track Progress</Text>
              <Text style={styles.actionSubtitle}>View your stats</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>🥗</Text>
              <Text style={styles.actionTitle}>Log Meal</Text>
              <Text style={styles.actionSubtitle}>Track nutrition</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>🎯</Text>
              <Text style={styles.actionTitle}>Set Goals</Text>
              <Text style={styles.actionSubtitle}>Define targets</Text>
            </TouchableOpacity> */}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          <View style={styles.workoutCard}>
            <Text style={styles.workoutTitle}>No workouts yet</Text>
            <Text style={styles.workoutSubtitle}>Start your fitness journey today!</Text>
          </View>
        </View>

        <View style={styles.motivationSection}>
          <Text style={styles.motivationQuote}>"The only bad workout is the one that didn't happen"</Text>
          <Text style={styles.motivationAuthor}>- Unknown</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

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
    backgroundColor: '#46b24bff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#e8f5e9',
  },
  statsContainer: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8faf8',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  workoutSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  motivationSection: {
    padding: 20,
    backgroundColor: '#2E7D32',
    margin: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  motivationQuote: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  motivationAuthor: {
    fontSize: 14,
    color: '#e8f5e9',
  },
});
