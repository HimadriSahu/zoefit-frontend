import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  TextInput,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeContext';
import { apiService } from '../../services/api';

const { width: screenWidth } = Dimensions.get('window');

interface ProgressData {
  date: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  waist?: number;
  chest?: number;
  arms?: number;
  thighs?: number;
  restingHeartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  notes?: string;
}

const ProgressEntryScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();

  const [progressData, setProgressData] = useState<ProgressData>({
    date: new Date().toISOString().split('T')[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSection, setSelectedSection] = useState('body');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  const progressSections = [
    { id: 'body', label: 'Body Measurements', icon: '📏' },
    { id: 'health', label: 'Health Metrics', icon: '❤️' },
    { id: 'performance', label: 'Performance', icon: '💪' },
    { id: 'notes', label: 'Notes & Photos', icon: '📝' },
  ];

  const bodyMeasurements = [
    { key: 'weight', label: 'Weight (kg)', icon: '⚖️', unit: 'kg' },
    { key: 'bodyFat', label: 'Body Fat %', icon: '📊', unit: '%' },
    { key: 'muscleMass', label: 'Muscle Mass (kg)', icon: '💪', unit: 'kg' },
    { key: 'waist', label: 'Waist (cm)', icon: '📏', unit: 'cm' },
    { key: 'chest', label: 'Chest (cm)', icon: '📐', unit: 'cm' },
    { key: 'arms', label: 'Arms (cm)', icon: '💪', unit: 'cm' },
    { key: 'thighs', label: 'Thighs (cm)', icon: '🦵', unit: 'cm' },
  ];

  const healthMetrics = [
    { key: 'restingHeartRate', label: 'Resting Heart Rate', icon: '❤️', unit: 'bpm' },
    { key: 'bloodPressureSystolic', label: 'Blood Pressure (Systolic)', icon: '🩺', unit: 'mmHg' },
    { key: 'bloodPressureDiastolic', label: 'Blood Pressure (Diastolic)', icon: '🩺', unit: 'mmHg' },
  ];

  const handleInputChange = (key: string, value: string) => {
    const numValue = parseFloat(value);
    setProgressData(prev => ({
      ...prev,
      [key]: isNaN(numValue) ? undefined : numValue,
    }));
  };

  const handleDateChange = () => {
    setTempDate(new Date(progressData.date));
    setShowDatePicker(true);
  };

  const handleDateConfirm = () => {
    setProgressData(prev => ({
      ...prev,
      date: tempDate.toISOString().split('T')[0],
    }));
    setShowDatePicker(false);
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
  };

  const changeDate = (days: number) => {
    const newDate = new Date(tempDate);
    newDate.setDate(newDate.getDate() + days);
    setTempDate(newDate);
  };

  const handleSubmit = async () => {
    // Validate at least one field is filled
    const hasData = Object.keys(progressData).some(key =>
      key !== 'date' && progressData[key as keyof ProgressData] !== undefined
    );

    if (!hasData) {
      Alert.alert('No Data', 'Please enter at least one measurement or metric.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit to backend
      await apiService.createProgressEntry(progressData);

      Alert.alert(
        'Success!',
        'Your progress has been logged successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error submitting progress:', error);
      Alert.alert('Error', 'Failed to save progress. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMeasurementInput = (item: any) => (
    <View key={item.key} style={[styles.inputContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      <View style={styles.inputHeader}>
        <Text style={styles.inputIcon}>{item.icon}</Text>
        <Text style={[styles.inputLabel, { color: theme.text }]}>{item.label}</Text>
        <Text style={[styles.inputUnit, { color: theme.textSecondary }]}>{item.unit}</Text>
      </View>
      <TextInput
        style={[styles.textInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
        value={progressData[item.key as keyof ProgressData]?.toString() || ''}
        onChangeText={(value) => handleInputChange(item.key, value)}
        placeholder="0"
        placeholderTextColor={theme.textSecondary}
        keyboardType="numeric"
      />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={theme.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Log Progress</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Date Selection */}
          <View style={styles.dateContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Date</Text>
            <TouchableOpacity
              style={[styles.dateCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              onPress={handleDateChange}
            >
              <Text style={styles.dateIcon}>📅</Text>
              <View style={styles.dateInfo}>
                <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>Measurement Date</Text>
                <Text style={[styles.dateValue, { color: theme.text }]}>
                  {new Date(progressData.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <Text style={[styles.dateArrow, { color: theme.textSecondary }]}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Section Tabs */}
          <View style={styles.tabsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {progressSections.map((section) => (
                <TouchableOpacity
                  key={section.id}
                  style={[
                    styles.tabButton,
                    {
                      backgroundColor: selectedSection === section.id ? theme.primary : theme.cardBackground,
                      borderColor: theme.border,
                    }
                  ]}
                  onPress={() => setSelectedSection(section.id)}
                >
                  <Text style={styles.tabIcon}>{section.icon}</Text>
                  <Text style={[
                    styles.tabText,
                    { color: selectedSection === section.id ? '#fff' : theme.text }
                  ]}>
                    {section.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Body Measurements Section */}
          {selectedSection === 'body' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Body Measurements</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                Track your physical measurements over time
              </Text>
              {bodyMeasurements.map(renderMeasurementInput)}
            </View>
          )}

          {/* Health Metrics Section */}
          {selectedSection === 'health' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Health Metrics</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                Monitor your health indicators
              </Text>
              {healthMetrics.map(renderMeasurementInput)}
            </View>
          )}

          {/* Performance Section */}
          {selectedSection === 'performance' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Performance Metrics</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                Track your fitness performance
              </Text>

              <View style={[styles.performanceCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <Text style={styles.performanceIcon}>🏃‍♂️</Text>
                <Text style={[styles.performanceTitle, { color: theme.text }]}>Running Performance</Text>
                <View style={styles.performanceInputs}>
                  <View style={styles.performanceInput}>
                    <Text style={[styles.performanceInputLabel, { color: theme.textSecondary }]}>5K Time (min)</Text>
                    <TextInput
                      style={[styles.performanceTextInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.performanceInput}>
                    <Text style={[styles.performanceInputLabel, { color: theme.textSecondary }]}>Distance (km)</Text>
                    <TextInput
                      style={[styles.performanceTextInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              <View style={[styles.performanceCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <Text style={styles.performanceIcon}>🏋️‍♂️</Text>
                <Text style={[styles.performanceTitle, { color: theme.text }]}>Strength Performance</Text>
                <View style={styles.performanceInputs}>
                  <View style={styles.performanceInput}>
                    <Text style={[styles.performanceInputLabel, { color: theme.textSecondary }]}>Bench Press (kg)</Text>
                    <TextInput
                      style={[styles.performanceTextInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.performanceInput}>
                    <Text style={[styles.performanceInputLabel, { color: theme.textSecondary }]}>Squat (kg)</Text>
                    <TextInput
                      style={[styles.performanceTextInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                      placeholder="0"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Notes Section */}
          {selectedSection === 'notes' && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Notes & Photos</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                Add context to your progress entry
              </Text>

              <View style={[styles.notesCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <Text style={[styles.notesLabel, { color: theme.text }]}>Progress Notes</Text>
                <TextInput
                  style={[styles.notesInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                  value={progressData.notes || ''}
                  onChangeText={(value) => setProgressData(prev => ({ ...prev, notes: value }))}
                  placeholder="How are you feeling? Any challenges or achievements?"
                  placeholderTextColor={theme.textSecondary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity style={[styles.photoCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <Text style={styles.photoIcon}>📸</Text>
                <Text style={[styles.photoText, { color: theme.text }]}>Add Progress Photos</Text>
                <Text style={[styles.photoSubtext, { color: theme.textSecondary }]}>
                  Take photos to visually track your progress
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: theme.primary, opacity: isSubmitting ? 0.6 : 1 }]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Saving...' : 'Save Progress Entry'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={handleDateCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Date</Text>

              <View style={styles.dateDisplay}>
                <Text style={[styles.dateDisplayText, { color: theme.text }]}>
                  {tempDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>

              <View style={styles.dateControls}>
                <TouchableOpacity
                  style={[styles.dateButton, { backgroundColor: theme.background }]}
                  onPress={() => changeDate(-1)}
                >
                  <Text style={[styles.dateButtonText, { color: theme.text }]}>-1 Day</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dateButton, { backgroundColor: theme.background }]}
                  onPress={() => changeDate(1)}
                >
                  <Text style={[styles.dateButtonText, { color: theme.text }]}>+1 Day</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dateControls}>
                <TouchableOpacity
                  style={[styles.dateButton, { backgroundColor: theme.background }]}
                  onPress={() => changeDate(-7)}
                >
                  <Text style={[styles.dateButtonText, { color: theme.text }]}>-1 Week</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dateButton, { backgroundColor: theme.background }]}
                  onPress={() => changeDate(7)}
                >
                  <Text style={[styles.dateButtonText, { color: theme.text }]}>+1 Week</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.background }]}
                  onPress={handleDateCancel}
                >
                  <Text style={[styles.modalButtonText, styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton, { backgroundColor: theme.primary }]}
                  onPress={handleDateConfirm}
                >
                  <Text style={styles.modalButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
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
  scrollView: {
    flex: 1,
  },
  dateContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  dateIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateArrow: {
    fontSize: 20,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  inputLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  inputUnit: {
    fontSize: 14,
    fontWeight: '500',
  },
  textInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  performanceCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  performanceIcon: {
    fontSize: 24,
    marginBottom: 12,
  },
  performanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  performanceInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceInput: {
    width: '48%',
  },
  performanceInputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  performanceTextInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  notesCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  notesInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 100,
  },
  photoCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  photoIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  photoText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  photoSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  submitButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  dateDisplay: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  dateDisplayText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateButton: {
    borderRadius: 8,
    padding: 12,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    borderRadius: 8,
    padding: 14,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  confirmButton: {
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#333',
  },
});

export default ProgressEntryScreen;
