import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '../screens/OnboardingContext';
import { apiService } from '../../services/api';

const ContactInfoScreen = () => {
  const router = useRouter();
  const { data, setContactInfo, setPhoneNumber } = useOnboarding();

  const [contactInfo, setContactInfoState] = useState({
    phone: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setContactInfoState(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSkip = async () => {
    try {
      // Set phone to "NA" when user skips
      const skippedData = {
        phone: 'NA',
      };

      // Update local state
      setContactInfoState(skippedData);
      setPhoneNumber('NA'); // Also update the phoneNumber field for consistency

      // Save to backend using comprehensive user API
      await apiService.updateComprehensiveProfile({
        phone_number: 'NA'
      });

      router.push('/onboarding/breakfast-time');
    } catch (error) {
      console.error('Error saving contact info:', error);
      Alert.alert('Error', 'Failed to save contact information. Please try again.');
    }
  };

  const handleContinue = async () => {
    // Validate that phone is filled or explicitly set to "NA"
    const hasAnyData = contactInfo.phone.trim() !== '';

    if (!hasAnyData) {
      Alert.alert(
        'Contact Information',
        'Would you like to skip this step? You can always add this information later.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Skip', onPress: handleSkip },
        ]
      );
      return;
    }

    try {
      // Convert empty phone to "NA" for consistency
      const processedData = {
        phone: contactInfo.phone.trim() || 'NA',
      };

      // Update local state
      setContactInfoState(processedData);
      setPhoneNumber(processedData.phone); // Also update the phoneNumber field for consistency

      // Save to backend using comprehensive user API
      await apiService.updateComprehensiveProfile({
        phone_number: processedData.phone
      });

      router.push('/onboarding/breakfast-time');
    } catch (error) {
      console.error('Error saving contact info:', error);
      Alert.alert('Error', 'Failed to save contact information. Please try again.');
    }
  };

  const renderInputField = (
    label: string,
    value: string,
    field: string,
    placeholder: string,
    keyboardType: any = 'default'
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={(text) => handleInputChange(field, text)}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#10b981', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Information</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Contact Information</Text>
          <Text style={styles.subtitle}>
            This information is optional. You can skip this step or enter "NA" for fields you prefer not to share.
          </Text>

          {/* Personal Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <Text style={styles.sectionSubtitle}>Your phone number (optional)</Text>

            {renderInputField('Phone Number', contactInfo.phone, 'phone', 'Enter phone number or "NA"', 'phone-pad')}
          </View>

          {/* Privacy Notice */}
          <View style={styles.privacyNotice}>
            <Text style={styles.privacyIcon}>🔒</Text>
            <Text style={styles.privacyText}>
              Your contact information is private and secure. We only use it for account-related communications and emergencies.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip This Step</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 30,
    lineHeight: 24,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1f2937',
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  privacyIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  privacyText: {
    flex: 1,
    fontSize: 14,
    color: '#065f46',
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 40,
  },
  skipButton: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  continueButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ContactInfoScreen;
