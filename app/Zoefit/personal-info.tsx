import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOnboarding, Gender, NutrioGoal } from '../../context/OnboardingContext';
import * as ImagePicker from 'expo-image-picker';

const PersonalInfoScreen = () => {
  const router = useRouter();
  const { data, setGender, setBirthday, setHeightCm, setWeightKg, setGoal, setBreakfastTime, setDinnerTime } =
    useOnboarding();

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'gender' | 'goal' | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);

  const genderOptions: Gender[] = ['male', 'female', 'other'];
  const goalOptions: NutrioGoal[] = ['lose_weight', 'maintain', 'gain_muscle', 'eat_healthier'];

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
        setProfileImage(result.assets[0].uri);
        setImagePickerVisible(false);
        Alert.alert('Success', 'Profile picture updated successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
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
        setProfileImage(result.assets[0].uri);
        setImagePickerVisible(false);
        Alert.alert('Success', 'Profile picture updated successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
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

  const handleEditSave = () => {
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
      }
      setEditingField(null);
      Alert.alert('Success', 'Information updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Invalid input. Please try again.');
    }
  };

  const handleGenderSelect = (gender: Gender) => {
    setGender(gender);
    setModalVisible(false);
  };

  const handleGoalSelect = (goal: NutrioGoal) => {
    setGoal(goal);
    setModalVisible(false);
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
    <TouchableOpacity style={styles.infoField} onPress={onEdit}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldValueContainer}>
        <Text style={styles.fieldValue}>{value}</Text>
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
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditingField(null)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit {editingField}</Text>
            <TouchableOpacity onPress={handleEditSave}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={tempValue}
              onChangeText={setTempValue}
              placeholder={`Enter ${editingField}`}
              placeholderTextColor="#999"
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
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {modalType === 'gender' ? 'Gender' : 'Goal'}</Text>
            </View>

            <FlatList
              data={items}
              keyExtractor={(item) => item as string}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.selectionItem,
                    (modalType === 'gender' ? data.gender === item : data.goal === item) &&
                      styles.selectedItem,
                  ]}
                  onPress={() => onSelect(item)}
                >
                  <Text style={styles.selectionText}>{formatValue(modalType || '', item)}</Text>
                  {(modalType === 'gender' ? data.gender === item : data.goal === item) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
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
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Profile Picture</Text>
          </View>

          <TouchableOpacity style={styles.imagePickerOption} onPress={takePhotoWithCamera}>
            <Text style={styles.imagePickerIcon}>📷</Text>
            <View style={styles.imagePickerTextContainer}>
              <Text style={styles.imagePickerTitle}>Take Photo</Text>
              <Text style={styles.imagePickerSubtitle}>Take a new photo with your camera</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.imagePickerOption} onPress={pickImageFromLibrary}>
            <Text style={styles.imagePickerIcon}>🖼️</Text>
            <View style={styles.imagePickerTextContainer}>
              <Text style={styles.imagePickerTitle}>Choose from Library</Text>
              <Text style={styles.imagePickerSubtitle}>Select from your photo gallery</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.imagePickerOption, styles.cancelOption]}
            onPress={() => setImagePickerVisible(false)}
          >
            <Text style={styles.imagePickerTitle}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headingTitle}>Personal Information</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profilePictureSection}>
          <View style={styles.profilePictureContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImagePlaceholderText}>📷</Text>
              </View>
            )}
            <TouchableOpacity style={styles.editPhotoButton} onPress={handleImagePickerPress}>
              <Text style={styles.editPhotoIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.profilePictureLabel}>Add or change profile picture</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

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
          <Text style={styles.sectionTitle}>Health & Nutrition</Text>

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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
  },
  headingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
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
    color: '#333',
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
    color: '#333',
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
    color: '#333',
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
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
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
    color: '#333',
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
    color: '#333',
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
    color: '#333',
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
