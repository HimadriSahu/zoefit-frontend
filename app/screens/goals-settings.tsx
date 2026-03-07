import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from './OnboardingContext';
import { useTheme } from './ThemeContext';
import { apiService, HealthMetricsData } from '../../services/api';
import { authService } from '../../services/auth';

const GoalsSettingsScreen = () => {
  const router = useRouter();
  const { data, setGoal, setTargetWeight, setActivityLevel } = useOnboarding();
  const { theme } = useTheme();
  
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const goalOptions = [
    { value: 'lose_weight', label: 'Lose Weight', icon: '🎯', description: 'Reduce body weight through diet and exercise' },
    { value: 'gain_muscle', label: 'Gain Muscle', icon: '💪', description: 'Build lean muscle mass and strength' },
    { value: 'maintain', label: 'Maintain Weight', icon: '⚖️', description: 'Keep current weight and improve fitness' },
    { value: 'eat_healthier', label: 'Eat Healthier', icon: '🥗', description: 'Improve nutrition and eating habits' },
  ];

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary', icon: '🪑', description: 'Little or no exercise' },
    { value: 'light', label: 'Lightly Active', icon: '🚶‍♂️', description: 'Light exercise 1-3 days/week' },
    { value: 'moderate', label: 'Moderately Active', icon: '🏃‍♂️', description: 'Moderate exercise 3-5 days/week' },
    { value: 'active', label: 'Very Active', icon: '💪', description: 'Hard exercise 6-7 days/week' },
    { value: 'very_active', label: 'Extremely Active', icon: '🔥', description: 'Very hard exercise, physical job' },
  ];

  useEffect(() => {
    loadCurrentGoals();
  }, []);

  const loadCurrentGoals = async () => {
    try {
      setIsLoading(true);
      const isAuth = await authService.isAuthenticated();
      if (!isAuth) {
        console.log('User not authenticated, using local data');
        return;
      }

      // Load current health metrics from backend
      const response = await apiService.getHealthMetrics();
      console.log('Current goals loaded:', response);
    } catch (error) {
      console.warn('Could not load current goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveGoalsToBackend = async () => {
    try {
      setIsLoading(true);
      const isAuth = await authService.isAuthenticated();
      if (!isAuth) {
        Alert.alert('Authentication Required', 'Please log in to save your goals.');
        return;
      }

      const goalsData: HealthMetricsData = {
        fitness_goal: data.goal as any || 'maintenance',
        activity_level: data.activityLevel || 'moderate',
        target_weight: data.targetWeight || undefined,
      };

      await apiService.createOrUpdateHealthMetrics(goalsData);
      Alert.alert('Success', 'Your goals have been updated successfully!');
    } catch (error) {
      console.error('Failed to save goals:', error);
      Alert.alert('Error', 'Failed to save goals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoalSelect = (goal: string) => {
    setGoal(goal as any);
  };

  const handleActivityLevelSelect = (level: string) => {
    setActivityLevel(level as any);
  };

  const handleEditStart = (field: string, value: number | null) => {
    setEditingField(field);
    setTempValue(value?.toString() || '');
    setModalVisible(true);
  };

  const handleEditSave = () => {
    if (!tempValue) {
      Alert.alert('Error', 'Field cannot be empty');
      return;
    }

    try {
      const value = parseFloat(tempValue);
      if (isNaN(value) || value <= 0) {
        throw new Error('Invalid value');
      }

      if (editingField === 'targetWeight') {
        setTargetWeight(value);
      }

      setModalVisible(false);
      setEditingField(null);
      setTempValue('');
    } catch (error) {
      Alert.alert('Error', 'Invalid input. Please enter a valid number.');
    }
  };

  const renderGoalOption = (option: any) => (
    <TouchableOpacity
      key={option.value}
      style={[
        styles.optionCard,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
          borderWidth: 2,
        },
        data.goal === option.value && {
          borderColor: theme.primary,
          backgroundColor: `${theme.primary}10`,
        }
      ]}
      onPress={() => handleGoalSelect(option.value)}
    >
      <View style={styles.optionHeader}>
        <Text style={styles.optionIcon}>{option.icon}</Text>
        <View style={styles.optionInfo}>
          <Text style={[styles.optionTitle, { color: theme.text }]}>
            {option.label}
          </Text>
          <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
            {option.description}
          </Text>
        </View>
        {data.goal === option.value && (
          <View style={[styles.checkmark, { backgroundColor: theme.primary }]}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderActivityLevelOption = (option: any) => (
    <TouchableOpacity
      key={option.value}
      style={[
        styles.optionCard,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
          borderWidth: 1,
        },
        data.activityLevel === option.value && {
          borderColor: theme.primary,
          backgroundColor: `${theme.primary}10`,
        }
      ]}
      onPress={() => handleActivityLevelSelect(option.value)}
    >
      <View style={styles.optionHeader}>
        <Text style={styles.optionIcon}>{option.icon}</Text>
        <View style={styles.optionInfo}>
          <Text style={[styles.optionTitle, { color: theme.text }]}>
            {option.label}
          </Text>
          <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
            {option.description}
          </Text>
        </View>
        {data.activityLevel === option.value && (
          <View style={[styles.checkmark, { backgroundColor: theme.primary }]}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEditModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={[styles.cancelButton, { color: theme.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Edit {editingField === 'targetWeight' ? 'Target Weight' : 'Goal'}
            </Text>
            <TouchableOpacity onPress={handleEditSave}>
              <Text style={[styles.saveButton, { color: theme.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.textInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              value={tempValue}
              onChangeText={setTempValue}
              placeholder={`Enter ${editingField === 'targetWeight' ? 'target weight (kg)' : 'value'}`}
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading your goals...</Text>
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
        <Text style={styles.headerTitle}>Goals Settings</Text>
        <TouchableOpacity onPress={saveGoalsToBackend}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Fitness Goal</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            What do you want to achieve?
          </Text>
          <View style={styles.optionsContainer}>
            {goalOptions.map(renderGoalOption)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Activity Level</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            How active are you currently?
          </Text>
          <View style={styles.optionsContainer}>
            {activityLevels.map(renderActivityLevelOption)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Target Metrics</Text>
          
          <TouchableOpacity
            style={[styles.metricCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
            onPress={() => handleEditStart('targetWeight', data.targetWeight)}
          >
            <View style={styles.metricHeader}>
              <Text style={[styles.metricLabel, { color: theme.text }]}>Target Weight</Text>
              <Text style={styles.editIcon}>✏️</Text>
            </View>
            <Text style={[styles.metricValue, { color: theme.textSecondary }]}>
              {data.targetWeight ? `${data.targetWeight} kg` : 'Not set'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Progress Summary</Text>
          <View style={[styles.summaryCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.summaryText, { color: theme.text }]}>
              Current Goal: {data.goal ? goalOptions.find(g => g.value === data.goal)?.label : 'Not set'}
            </Text>
            <Text style={[styles.summaryText, { color: theme.text }]}>
              Activity Level: {data.activityLevel ? activityLevels.find(l => l.value === data.activityLevel)?.label : 'Not set'}
            </Text>
            {data.targetWeight && (
              <Text style={[styles.summaryText, { color: theme.text }]}>
                Target Weight: {data.targetWeight} kg
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {renderEditModal()}
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
  saveButton: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  metricCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  editIcon: {
    fontSize: 16,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cancelButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});

export default GoalsSettingsScreen;
