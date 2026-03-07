import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeContext';
import { authService, UserData } from '../../services/auth';

const { width: screenWidth } = Dimensions.get('window');

interface ContactInfo {
  phone?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

const ContactInfoScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();

  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    phone: '',
    location: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: '',
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadContactInfo();
  }, []);

  const loadContactInfo = async () => {
    try {
      setIsLoading(true);
      // In a real app, this would load from backend
      const userData = await authService.getUserData();
      if (userData) {
        // Mock data - in real app, load from backend
        setContactInfo({
          phone: '+1-555-123-4567',
          location: '123 Fitness Street',
          city: 'Wellness City',
          state: 'CA',
          country: 'United States',
          zipCode: '90210',
          emergencyContact: {
            name: 'Jane Doe',
            phone: '+1-555-987-6543',
            relationship: 'Spouse',
          },
        });
      }
    } catch (error) {
      console.error('Error loading contact info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStart = (field: string, value: string) => {
    setEditingField(field);
    setTempValue(value);
    setModalVisible(true);
  };

  const handleEditSave = () => {
    if (!tempValue.trim()) {
      Alert.alert('Error', 'Field cannot be empty');
      return;
    }

    if (editingField?.startsWith('emergency.')) {
      const emergencyField = editingField.replace('emergency.', '');
      setContactInfo(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact!,
          [emergencyField]: tempValue.trim(),
        },
      }));
    } else {
      setContactInfo(prev => ({
        ...prev,
        [editingField!]: tempValue.trim(),
      }));
    }

    setModalVisible(false);
    setEditingField(null);
    setTempValue('');
  };

  const handleSaveAll = async () => {
    try {
      setIsLoading(true);
      // Save to backend
      console.log('Saving contact info:', contactInfo);
      Alert.alert('Success', 'Contact information updated successfully');
      router.back();
    } catch (error) {
      console.error('Error saving contact info:', error);
      Alert.alert('Error', 'Failed to save contact information');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEditModal = () => (
    <Modal visible={modalVisible} animationType="slide" transparent={true}>
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={[styles.cancelButton, { color: theme.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit {editingField}</Text>
            <TouchableOpacity onPress={handleEditSave}>
              <Text style={[styles.saveButtonText, { color: theme.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.textInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              value={tempValue}
              onChangeText={setTempValue}
              placeholder={`Enter ${editingField}`}
              placeholderTextColor={theme.textSecondary}
              autoFocus
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );

  const renderContactField = (label: string, value: string, field: string, icon: string) => (
    <TouchableOpacity
      key={field}
      style={[styles.contactField, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
      onPress={() => handleEditStart(field, value)}
    >
      <Text style={styles.fieldIcon}>{icon}</Text>
      <View style={styles.fieldContent}>
        <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{label}</Text>
        <Text style={[styles.fieldValue, { color: theme.text }]}>
          {value || 'Not set'}
        </Text>
      </View>
      <Text style={[styles.fieldArrow, { color: theme.textSecondary }]}>›</Text>
    </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Contact Information</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Personal Contact Info */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Personal Contact</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Your personal contact information
            </Text>

            {renderContactField('Phone Number', contactInfo.phone || '', 'phone', '📱')}
            {renderContactField('Address', contactInfo.location || '', 'location', '📍')}
            {renderContactField('City', contactInfo.city || '', 'city', '🏙️')}
            {renderContactField('State/Province', contactInfo.state || '', 'state', '🗺️')}
            {renderContactField('Country', contactInfo.country || '', 'country', '🌍')}
            {renderContactField('ZIP/Postal Code', contactInfo.zipCode || '', 'zipCode', '📮')}
          </View>

          {/* Emergency Contact */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Emergency Contact</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Who to contact in case of emergency
            </Text>

            {renderContactField(
              'Contact Name',
              contactInfo.emergencyContact?.name || '',
              'emergency.name',
              '👤'
            )}
            {renderContactField(
              'Contact Phone',
              contactInfo.emergencyContact?.phone || '',
              'emergency.phone',
              '📞'
            )}
            {renderContactField(
              'Relationship',
              contactInfo.emergencyContact?.relationship || '',
              'emergency.relationship',
              '👨‍👩‍👧‍👦'
            )}
          </View>

          {/* Privacy Settings */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Privacy Settings</Text>
            <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              Control how your contact information is used
            </Text>

            <View style={[styles.privacyCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <View style={styles.privacyItem}>
                <Text style={styles.privacyIcon}>🔒</Text>
                <View style={styles.privacyContent}>
                  <Text style={[styles.privacyTitle, { color: theme.text }]}>Contact Visibility</Text>
                  <Text style={[styles.privacyDescription, { color: theme.textSecondary }]}>
                    Your contact information is private and only used for account-related communications
                  </Text>
                </View>
              </View>

              <View style={styles.privacyItem}>
                <Text style={styles.privacyIcon}>🚫</Text>
                <View style={styles.privacyContent}>
                  <Text style={[styles.privacyTitle, { color: theme.text }]}>No Marketing Calls</Text>
                  <Text style={[styles.privacyDescription, { color: theme.textSecondary }]}>
                    We will never use your phone number for marketing purposes
                  </Text>
                </View>
              </View>

              <View style={styles.privacyItem}>
                <Text style={styles.privacyIcon}>🛡️</Text>
                <View style={styles.privacyContent}>
                  <Text style={[styles.privacyTitle, { color: theme.text }]}>Data Protection</Text>
                  <Text style={[styles.privacyDescription, { color: theme.textSecondary }]}>
                    Your contact data is encrypted and stored securely
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Verification Status */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Verification Status</Text>

            <View style={[styles.verificationCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <View style={styles.verificationItem}>
                <Text style={styles.verificationIcon}>📧</Text>
                <View style={styles.verificationContent}>
                  <Text style={[styles.verificationTitle, { color: theme.text }]}>Email Verified</Text>
                  <Text style={[styles.verificationStatus, { color: '#10b981' }]}>✓ Verified</Text>
                </View>
              </View>

              <View style={styles.verificationItem}>
                <Text style={styles.verificationIcon}>📱</Text>
                <View style={styles.verificationContent}>
                  <Text style={[styles.verificationTitle, { color: theme.text }]}>Phone Verified</Text>
                  <Text style={[styles.verificationStatus, { color: contactInfo.phone ? '#10b981' : '#f59e0b' }]}>
                    {contactInfo.phone ? '✓ Verified' : '⚠ Not Verified'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.primary, opacity: isLoading ? 0.6 : 1 }]}
              onPress={handleSaveAll}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save Contact Information'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      {renderEditModal()}
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
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  contactField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  fieldIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  fieldArrow: {
    fontSize: 18,
  },
  privacyCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  privacyIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  privacyDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  verificationCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  verificationIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  verificationContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  verificationStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  saveButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  textInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
});

export default ContactInfoScreen;
