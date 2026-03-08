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
  FlatList,
  Image,
  ActionSheetIOS,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding, Gender, NutrioGoal } from './OnboardingContext';
import { useTheme } from './ThemeContext';
import * as ImagePicker from 'expo-image-picker';
import { aiService } from '../../services/ai';
import { authService } from '../../services/auth';
import { apiService, UserProfileData, HealthMetricsData } from '../../services/api';

const PersonalInfoScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { data, setGender, setBirthday, setHeightCm, setWeightKg, setGoal, setBreakfastTime, setDinnerTime, setPhoneNumber, setBio, setLocation, setTargetWeight } =
    useOnboarding();

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'gender' | 'goal' | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [healthMetricsLoaded, setHealthMetricsLoaded] = useState(false);

  const genderOptions: Gender[] = ['male', 'female', 'other'];
  const goalOptions: NutrioGoal[] = ['lose_weight', 'maintain', 'gain_muscle', 'eat_healthier'];

  // Shared goal mapping for backend API
  const goalMap: { [key: string]: NutrioGoal } = {
    'weight_loss': 'lose_weight',
    'maintenance': 'maintain',
    'muscle_gain': 'gain_muscle',
    'endurance': 'eat_healthier',
    'strength': 'gain_muscle'
  };

  // Reverse goal mapping for frontend to backend
  const reverseGoalMap: { [key: string]: 'weight_loss' | 'maintenance' | 'muscle_gain' | 'endurance' | 'strength' } = {
    'lose_weight': 'weight_loss',
    'maintain': 'maintenance',
    'gain_muscle': 'muscle_gain',
    'eat_healthier': 'maintenance'
  };

  // Load existing health metrics on component mount
  useEffect(() => {
    loadHealthMetrics();
  }, []);

  const loadHealthMetrics = async () => {
    try {
      setIsLoading(true);

      // Check if user is authenticated first
      const isAuth = await authService.isAuthenticated();
      if (!isAuth) {
        console.log('⚠️ User not authenticated, skipping health metrics load');
        setHealthMetricsLoaded(true);
        return;
      }

      const response = await aiService.getHealthMetrics();

      // Update local state with backend data
      if (response.metrics.height) setHeightCm(response.metrics.height);
      if (response.metrics.weight) setWeightKg(response.metrics.weight);

      if (response.metrics.fitness_goal && goalMap[response.metrics.fitness_goal]) {
        setGoal(goalMap[response.metrics.fitness_goal]);
      }

      setHealthMetricsLoaded(true);
      console.log('✅ Health metrics loaded successfully');
    } catch (error) {
      console.warn('⚠️ Could not load health metrics:', error);
      // Don't show error to user on initial load, just continue with local data
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserProfileToBackend = async () => {
    try {
      setIsLoading(true);

      const profileData: UserProfileData = {
        phone_number: data.phoneNumber || undefined,
        date_of_birth: data.birthday || undefined,
        bio: data.bio || undefined,
        location: data.location || undefined,
        height: data.heightCm || undefined,
        weight: data.weightKg || undefined,
        fitness_goal: data.goal ? reverseGoalMap[data.goal] : undefined,
      };

      // Check if user is authenticated first
      const isAuth = await authService.isAuthenticated();
      if (!isAuth) {
        console.log('⚠️ User not authenticated, skipping profile save');
        return;
      }

      await apiService.createOrUpdateUserProfile(profileData);
      console.log('✅ User profile saved to backend');
    } catch (error) {
      console.error('❌ Failed to save user profile:', error);
      Alert.alert('Error', 'Failed to save profile information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveHealthMetricsToBackend = async () => {
    try {
      setIsLoading(true);

      // Map frontend goals to backend format
      const healthData: HealthMetricsData = {
        height: data.heightCm || undefined,
        weight: data.weightKg || undefined,
        fitness_goal: data.goal ? reverseGoalMap[data.goal] : 'maintenance',
        activity_level: data.activityLevel || 'moderate',
        target_weight: data.targetWeight || undefined,
        dietary_preferences: data.dietaryPreferences || {},
        medical_conditions: data.medicalConditions || [],
        allergies: data.allergies || [],
      };

      // Check if user is authenticated first
      const isAuth = await authService.isAuthenticated();
      if (!isAuth) {
        Alert.alert('Authentication Required', 'Please log in to save your health metrics.');
        return;
      }

      await aiService.updateHealthMetrics(healthData);
      console.log('✅ Health metrics saved to backend');
    } catch (error) {
      console.error('❌ Failed to save health metrics:', error);
      Alert.alert('Error', 'Failed to save health metrics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return cameraStatus === 'granted' && libraryStatus === 'granted';
  };

  const pickImageFromLibrary = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'We need permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setIsLoading(true);
        const imageUri = result.assets[0].uri;

        try {
          // Upload to backend
          const formData = new FormData();
          formData.append('profile_picture', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'profile_picture.jpg',
          } as any);

          await authService.uploadProfilePicture(formData);
          setProfileImage(imageUri);
          setImagePickerVisible(false);
          Alert.alert('Success', 'Profile picture updated successfully');
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          // Still set local image even if upload fails
          setProfileImage(imageUri);
          setImagePickerVisible(false);
          Alert.alert('Partial Success', 'Profile picture set locally. Upload will retry when connection is available.');
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setIsLoading(false);
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'We need permission to access your camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setIsLoading(true);
        const imageUri = result.assets[0].uri;

        try {
          // Upload to backend
          const formData = new FormData();
          formData.append('profile_picture', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'profile_picture.jpg',
          } as any);

          await authService.uploadProfilePicture(formData);
          setProfileImage(imageUri);
          setImagePickerVisible(false);
          Alert.alert('Success', 'Profile picture updated successfully');
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          // Still set local image even if upload fails
          setProfileImage(imageUri);
          setImagePickerVisible(false);
          Alert.alert('Partial Success', 'Profile picture set locally. Upload will retry when connection is available.');
        }
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePickerPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: undefined,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhotoWithCamera();
          } else if (buttonIndex === 2) {
            pickImageFromLibrary();
          }
        }
      );
    } else {
      setImagePickerVisible(true);
    }
  };

  const handleEditStart = (field: string, value: string | number | null) => {
    setEditingField(field);
    setTempValue(value?.toString() || '');
  };

  const handleEditSave = async () => {
    if (!tempValue) {
      Alert.alert('Error', 'Field cannot be empty');
      return;
    }

    try {
      switch (editingField) {
        case 'birthday':
          setBirthday(tempValue);
          break;
        case 'heightCm':
          const height = parseFloat(tempValue);
          if (isNaN(height) || height <= 0) throw new Error('Invalid height');
          setHeightCm(height);
          break;
        case 'weightKg':
          const weight = parseFloat(tempValue);
          if (isNaN(weight) || weight <= 0) throw new Error('Invalid weight');
          setWeightKg(weight);
          break;
        case 'breakfastTime':
          setBreakfastTime(tempValue);
          break;
        case 'dinnerTime':
          setDinnerTime(tempValue);
          break;
        case 'phoneNumber':
          setPhoneNumber(tempValue);
          break;

        case 'targetWeight':
          const targetWt = parseFloat(tempValue);
          if (isNaN(targetWt) || targetWt <= 0) throw new Error('Invalid target weight');
          setTargetWeight(targetWt);
          break;
      }
      setEditingField(null);

      // Save to backend after successful local update
      if (editingField === 'phoneNumber' || editingField === 'bio' || editingField === 'location') {
        await saveUserProfileToBackend();
      } else {
        await saveHealthMetricsToBackend();
      }

      Alert.alert('Success', 'Information updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Invalid input. Please try again.');
    }
  };

  const handleGenderSelect = (gender: Gender) => {
    setGender(gender);
    setModalVisible(false);
  };

  const handleGoalSelect = async (goal: NutrioGoal) => {
    setGoal(goal);
    setModalVisible(false);

    // Save to backend after goal change
    await saveHealthMetricsToBackend();
  };

  const formatLabel = (key: string): string => {
    const labels: { [key: string]: string } = {
      gender: 'Gender',
      birthday: 'Date of Birth',
      heightCm: 'Height (cm)',
      weightKg: 'Weight (kg)',
      goal: 'Nutrition Goal',
      breakfastTime: 'Breakfast Time',
      dinnerTime: 'Dinner Time',
      phoneNumber: 'Phone Number',
      bio: 'Bio',
      location: 'Location',
      targetWeight: 'Target Weight (kg)',
    };
    return labels[key] || key;
  };

  const formatValue = (key: string, value: any): string => {
    if (!value) return 'Not set';
    if (key === 'gender') return value.charAt(0).toUpperCase() + value.slice(1);
    if (key === 'goal') return value.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    return value.toString();
  };

  const renderInfoField = (label: string, value: any, onEdit: () => void) => (
    <TouchableOpacity style={[styles.infoField, { backgroundColor: theme.cardBackground, borderColor: theme.border }]} onPress={onEdit}>
      <Text style={[styles.fieldLabel, { color: theme.text }]}>{label}</Text>
      <View style={styles.fieldValueContainer}>
        <Text style={[styles.fieldValue, { color: theme.textSecondary }]}>{value}</Text>
        <Text style={styles.editIcon}>✏️</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEditModal = () => (
    <Modal
      visible={editingField !== null && modalType === null}
      animationType="slide"
      transparent={true}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditingField(null)}>
              <Text style={[styles.cancelButton, { color: theme.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit {editingField}</Text>
            <TouchableOpacity onPress={handleEditSave}>
              <Text style={[styles.saveButton, { color: theme.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.textInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              value={tempValue}
              onChangeText={setTempValue}
              placeholder={`Enter ${editingField}`}
              placeholderTextColor={theme.textSecondary}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );

  const renderSelectionModal = () => {
    const items = modalType === 'gender' ? genderOptions : goalOptions;
    const onSelect =
      modalType === 'gender'
        ? (item: any) => handleGenderSelect(item)
        : (item: any) => handleGoalSelect(item);

    return (
      <Modal visible={modalVisible && modalType !== null} animationType="slide" transparent={true}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select {modalType === 'gender' ? 'Gender' : 'Goal'}</Text>
            </View>

            <FlatList
              data={items}
              keyExtractor={(item) => item as string}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.selectionItem,
                    { backgroundColor: theme.cardBackground, borderColor: theme.border },
                    (modalType === 'gender' ? data.gender === item : data.goal === item) && { backgroundColor: theme.primary },
                  ]}
                  onPress={() => onSelect(item)}
                >
                  <Text style={[
                    styles.selectionText,
                    { color: (modalType === 'gender' ? data.gender === item : data.goal === item) ? '#fff' : theme.text }
                  ]}>
                    {formatValue(modalType === 'gender' ? 'gender' : 'goal', item)}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalVisible(false);
                setModalType(null);
              }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderImagePickerModal = () => (
    <Modal
      visible={imagePickerVisible && Platform.OS === 'android'}
      animationType="slide"
      transparent={true}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Choose Profile Picture</Text>
          </View>

          <TouchableOpacity style={[styles.imagePickerOption, { backgroundColor: theme.cardBackground, borderColor: theme.border }]} onPress={takePhotoWithCamera}>
            <Text style={styles.imagePickerIcon}>📷</Text>
            <View style={styles.imagePickerTextContainer}>
              <Text style={[styles.imagePickerTitle, { color: theme.text }]}>Take Photo</Text>
              <Text style={[styles.imagePickerSubtitle, { color: theme.textSecondary }]}>Take a new photo with your camera</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.imagePickerOption, { backgroundColor: theme.cardBackground, borderColor: theme.border }]} onPress={pickImageFromLibrary}>
            <Text style={styles.imagePickerIcon}>🖼️</Text>
            <View style={styles.imagePickerTextContainer}>
              <Text style={[styles.imagePickerTitle, { color: theme.text }]}>Choose from Library</Text>
              <Text style={[styles.imagePickerSubtitle, { color: theme.textSecondary }]}>Select from your photo gallery</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.imagePickerOption, styles.cancelOption, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
            onPress={() => setImagePickerVisible(false)}
          >
            <Text style={[styles.imagePickerTitle, { color: theme.text }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

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
        <Text style={styles.headingTitle}>Personal Information</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={[styles.scrollView, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
        <View style={styles.profilePictureSection}>
          <View style={styles.profilePictureContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImagePlaceholder, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <Text style={styles.profileImagePlaceholderText}>📷</Text>
              </View>
            )}
            <TouchableOpacity style={[styles.editPhotoButton, { backgroundColor: theme.primary }]} onPress={handleImagePickerPress}>
              <Text style={styles.editPhotoIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.profilePictureLabel, { color: theme.textSecondary }]}>Add or change profile picture</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Basic Information</Text>

          {renderInfoField(formatLabel('gender'), formatValue('gender', data.gender), () => {
            setModalType('gender');
            setModalVisible(true);
          })}

          {renderInfoField(
            formatLabel('birthday'),
            data.birthday || 'Not set',
            () => handleEditStart('birthday', data.birthday)
          )}

          {renderInfoField(
            formatLabel('heightCm'),
            data.heightCm ? `${data.heightCm} cm` : 'Not set',
            () => handleEditStart('heightCm', data.heightCm)
          )}

          {renderInfoField(
            formatLabel('weightKg'),
            data.weightKg ? `${data.weightKg} kg` : 'Not set',
            () => handleEditStart('weightKg', data.weightKg)
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Health & Nutrition</Text>

          {renderInfoField(formatLabel('goal'), formatValue('goal', data.goal), () => {
            setModalType('goal');
            setModalVisible(true);
          })}

          {renderInfoField(
            formatLabel('breakfastTime'),
            data.breakfastTime || 'Not set',
            () => handleEditStart('breakfastTime', data.breakfastTime)
          )}

          {renderInfoField(
            formatLabel('dinnerTime'),
            data.dinnerTime || 'Not set',
            () => handleEditStart('dinnerTime', data.dinnerTime)
          )}

          {renderInfoField(
            formatLabel('phoneNumber'),
            data.phoneNumber || 'Not set',
            () => handleEditStart('phoneNumber', data.phoneNumber)
          )}

        
        </View>

        

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Goals</Text>

          {renderInfoField(
            formatLabel('targetWeight'),
            data.targetWeight ? `${data.targetWeight} kg` : 'Not set',
            () => handleEditStart('targetWeight', data.targetWeight)
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>
              You are a{data.gender ? ' ' + data.gender : 'n unspecified gender'} individual who wants to{' '}
              {data.goal ? data.goal.replace(/_/g, ' ') : 'set a nutrition goal'}.
            </Text>
            {data.heightCm && data.weightKg && (
              <Text style={styles.bmiText}>
                Your BMI: {(data.weightKg / ((data.heightCm / 100) * (data.heightCm / 100))).toFixed(1)}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {renderEditModal()}
      {renderSelectionModal()}
      {renderImagePickerModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  headingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#047857',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoField: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  fieldValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
    flex: 1,
  },
  editIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
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
    color: '#1f2937',
  },
  cancelButton: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '700',
  },
  inputContainer: {
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  selectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedItem: {
    backgroundColor: '#f0f8f9',
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  selectionText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 18,
    color: '#2E7D32',
    fontWeight: '700',
  },
  closeButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: '#f0f8f9',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1399a3',
  },
  summaryText: {
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 22,
    marginBottom: 12,
  },
  bmiText: {
    fontSize: 14,
    color: '#1399a3',
    fontWeight: '700',
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 0,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: '#1399a3',
  },
  profileImagePlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#f0f8f9',
    borderWidth: 3,
    borderColor: '#1399a3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 50,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1399a3',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  editPhotoIcon: {
    fontSize: 20,
    color: '#fff',
  },
  profilePictureLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  imagePickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  imagePickerIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  imagePickerTextContainer: {
    flex: 1,
  },
  imagePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  imagePickerSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  cancelOption: {
    marginTop: 12,
    borderBottomWidth: 0,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
});

export default PersonalInfoScreen;
