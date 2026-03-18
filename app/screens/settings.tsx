import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from './OnboardingContext';
import { useTheme } from './ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const SettingsScreen = () => {
  const router = useRouter();
  const { reset } = useOnboarding();
  const { isDarkMode, theme, setDarkMode } = useTheme();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [mealReminders, setMealReminders] = useState(true);
  const [progressUpdates, setProgressUpdates] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [autoPlayVideos, setAutoPlayVideos] = useState(false);
  const [dataUsage, setDataUsage] = useState('wifi');

  const handleReset = async () => {
    Alert.alert(
      'Reset Onboarding',
      'Are you sure you want to clear your onboarding data? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await reset();
              Alert.alert('Success', 'Onboarding information has been cleared.');
              router.replace('/onboarding');
            } catch (error) {
              console.error('Reset error', error);
              Alert.alert('Error', 'Could not reset data.');
            }
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear temporary data and may require you to download content again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Cache cleared successfully.');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your data will be exported and sent to your email. This may take a few minutes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            Alert.alert('Success', 'Data export request submitted. You\'ll receive it via email soon.');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deletion', 'For security reasons, please contact support to delete your account.');
          },
        },
      ]
    );
  };

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
          <Text style={styles.headingTitle}>Settings</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Notifications Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Notifications</Text>
            <View style={[styles.settingRow, { backgroundColor: theme.settingRowBackground, borderColor: theme.border }]}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Push Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={notificationsEnabled ? '#fff' : '#9ca3af'}
              />
            </View>
            {notificationsEnabled && (
              <>
                <View style={[styles.settingRow, { backgroundColor: theme.settingRowBackground, borderColor: theme.border }]}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>Workout Reminders</Text>
                  <Switch
                    value={workoutReminders}
                    onValueChange={setWorkoutReminders}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor={workoutReminders ? '#fff' : '#9ca3af'}
                  />
                </View>
                <View style={[styles.settingRow, { backgroundColor: theme.settingRowBackground, borderColor: theme.border }]}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>Meal Reminders</Text>
                  <Switch
                    value={mealReminders}
                    onValueChange={setMealReminders}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor={mealReminders ? '#fff' : '#9ca3af'}
                  />
                </View>
                <View style={[styles.settingRow, { backgroundColor: theme.settingRowBackground, borderColor: theme.border }]}>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>Progress Updates</Text>
                  <Switch
                    value={progressUpdates}
                    onValueChange={setProgressUpdates}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor={progressUpdates ? '#fff' : '#9ca3af'}
                  />
                </View>
              </>
            )}
          </View>

          {/* Appearance Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
            <View style={[styles.settingRow, { backgroundColor: theme.settingRowBackground, borderColor: theme.border }]}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
              <Switch
                value={isDarkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={isDarkMode ? '#fff' : '#9ca3af'}
              />
            </View>
            {/* <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.menuItemBackground, borderColor: theme.border }]}>
              <Text style={styles.menuIcon}>🎨</Text>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Theme Color</Text>
              <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.menuItemBackground, borderColor: theme.border }]}>
              <Text style={styles.menuIcon}>📝</Text>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Font Size</Text>
              <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
            </TouchableOpacity> */}
          </View>

          {/* App Preferences */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>App Preferences</Text>
            <View style={[styles.settingRow, { backgroundColor: theme.settingRowBackground, borderColor: theme.border }]}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Sound Effects</Text>
              <Switch
                value={soundEffects}
                onValueChange={setSoundEffects}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={soundEffects ? '#fff' : '#9ca3af'}
              />
            </View>
            <View style={[styles.settingRow, { backgroundColor: theme.settingRowBackground, borderColor: theme.border }]}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Haptic Feedback</Text>
              <Switch
                value={hapticFeedback}
                onValueChange={setHapticFeedback}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={hapticFeedback ? '#fff' : '#9ca3af'}
              />
            </View>
            <View style={[styles.settingRow, { backgroundColor: theme.settingRowBackground, borderColor: theme.border }]}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Auto-play Videos</Text>
              <Switch
                value={autoPlayVideos}
                onValueChange={setAutoPlayVideos}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={autoPlayVideos ? '#fff' : '#9ca3af'}
              />
            </View>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.menuItemBackground, borderColor: theme.border }]}>
              <Text style={styles.menuIcon}>📊</Text>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Data Usage</Text>
              <Text style={[styles.menuValue, { color: theme.textSecondary }]}>{dataUsage === 'wifi' ? 'WiFi Only' : 'All Networks'}</Text>
            </TouchableOpacity>
          </View>

          {/* Account Management */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Account Management</Text>
            {/* <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.menuItemBackground, borderColor: theme.border }]} onPress={() => router.push('/screens/personal-info')}>
              <Text style={styles.menuIcon}>👤</Text>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Personal Information</Text>
              <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.menuItemBackground, borderColor: theme.border }]} onPress={() => router.push('/screens/goals-settings')}>
              <Text style={styles.menuIcon}>🎯</Text>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Goals Settings</Text>
              <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
            </TouchableOpacity> */}
            {/* <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.menuItemBackground, borderColor: theme.border }]} onPress={() => router.push('/screens/achievements')}>
              <Text style={styles.menuIcon}>🏆</Text>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Achievements</Text>
              <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
            </TouchableOpacity> */}

            {/* <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.menuItemBackground, borderColor: theme.border }]} onPress={() => router.push('/screens/workout-history')}>
              <Text style={styles.menuIcon}>📋</Text>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Workout History</Text>
              <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
            </TouchableOpacity> */}
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.menuItemBackground, borderColor: theme.border }]}>
              <Text style={styles.menuIcon}>🔐</Text>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Change Password</Text>
              <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.menuItemBackground, borderColor: theme.border }]}>
              <Text style={styles.menuIcon}>📧</Text>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Email Preferences</Text>
              <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.menuItemBackground, borderColor: theme.border }]}>
              <Text style={styles.menuIcon}>🔗</Text>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Connected Apps</Text>
              <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Data & Storage */}
          {/* <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Data & Storage</Text>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.menuItemBackground, borderColor: theme.border }]} onPress={handleExportData}>
              <Text style={styles.menuIcon}>📤</Text>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Export My Data</Text>
              <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.menuItemBackground, borderColor: theme.border }]} onPress={handleClearCache}>
              <Text style={styles.menuIcon}>🗑️</Text>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Clear Cache</Text>
              <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.menuItemBackground, borderColor: theme.border }]}>
              <Text style={styles.menuIcon}>💾</Text>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Backup Settings</Text>
              <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
            </TouchableOpacity>
          </View> */}

          {/* Support */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Support</Text>
            {/* <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.menuItemBackground, borderColor: theme.border }]} onPress={() => router.push('/screens/help-support')}>
              <Text style={styles.menuIcon}>❓</Text>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Help & Support</Text>
              <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
            </TouchableOpacity> */}
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.menuItemBackground, borderColor: theme.border }]} onPress={() => Linking.openURL('https://zoefit.com/privacy')}>
              <Text style={styles.menuIcon}>🔒</Text>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Privacy Policy</Text>
              <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.menuItemBackground, borderColor: theme.border }]} onPress={() => Linking.openURL('https://zoefit.com/terms')}>
              <Text style={styles.menuIcon}>📋</Text>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Terms of Service</Text>
              <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.menuItemBackground, borderColor: theme.border }]}>
              <Text style={styles.menuIcon}>⭐</Text>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Rate App</Text>
              <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Advanced */}
          {/* <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Advanced</Text>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.menuItemBackground, borderColor: theme.border }]} onPress={handleReset}>
              <Text style={styles.menuIcon}>♻️</Text>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Reset Onboarding Data</Text>
              <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.menuItemBackground, borderColor: theme.border }]}>
              <Text style={styles.menuIcon}>🔧</Text>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Developer Options</Text>
              <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { backgroundColor: theme.menuItemBackground, borderColor: theme.border }]} onPress={() => router.push('/screens/analytics')}>
              <Text style={styles.menuIcon}>📊</Text>
              <Text style={[styles.menuTitle, { color: theme.text }]}>Analytics & Insights</Text>
              <Text style={[styles.menuArrow, { color: theme.textSecondary }]}>›</Text>
            </TouchableOpacity>
          </View> */}

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Account Actions</Text>
            <TouchableOpacity style={[styles.dangerItem, { backgroundColor: '#fef2f2', borderColor: '#ef4444' }]}>
              <Text style={styles.dangerIcon}>⏸️</Text>
              <Text style={[styles.dangerTitle, { color: '#dc2626' }]}>Pause Account</Text>
              <Text style={[styles.menuArrow, { color: '#dc2626' }]}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dangerItem, { backgroundColor: '#fef2f2', borderColor: '#ef4444' }]} onPress={handleDeleteAccount}>
              <Text style={styles.dangerIcon}>🗑️</Text>
              <Text style={[styles.dangerTitle, { color: '#dc2626' }]}>Delete Account</Text>
              <Text style={[styles.menuArrow, { color: '#dc2626' }]}>›</Text>
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View style={styles.infoContainer}>
            <Text style={[styles.versionText, { color: theme.textSecondary }]}>ZoeFit Version 1.0.0</Text>
            <Text style={[styles.buildText, { color: theme.textSecondary }]}>Build 2026.03.05</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 20,
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#047857',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  menuIcon: {
    fontSize: 20,
    width: 30,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  menuArrow: {
    fontSize: 18,
  },
  menuValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  dangerIcon: {
    fontSize: 20,
    width: 30,
  },
  dangerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  versionText: {
    fontSize: 12,
    marginBottom: 4,
  },
  buildText: {
    fontSize: 10,
  },
});

export default SettingsScreen;
