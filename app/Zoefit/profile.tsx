import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../../services/auth';

const { width: screenWidth } = Dimensions.get('window');

const ProfileScreen = () => {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              router.replace('/LoginScreen');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const profileData = {
    name: 'Fitness Enthusiast',
    email: 'user@zoefit.com',
    memberSince: 'January 2024',
    level: 'Intermediate',
    totalWorkouts: 47,
    totalCalories: 23500,
    streak: 12,
  };

  const achievements = [
    { id: '1', name: 'First Workout', icon: '🏃‍♂️', earned: true },
    { id: '2', name: '7 Day Streak', icon: '🔥', earned: true },
    { id: '3', name: '1000 Calories', icon: '💪', earned: true },
    { id: '4', name: 'Early Bird', icon: '🌅', earned: false },
    { id: '5', name: 'Marathon Ready', icon: '🏅', earned: false },
    { id: '6', name: 'Nutrition Master', icon: '🥗', earned: false },
  ];

  const menuItems = [
    { id: '1', title: 'Personal Information', icon: '👤', screen: '/personal-info' },
    { id: '2', title: 'Fitness Goals', icon: '🎯', screen: '/goals' },
    { id: '3', title: 'Workout History', icon: '📊', screen: '/history' },
    { id: '4', title: 'Settings', icon: '⚙️', screen: '/settings' },
    { id: '5', title: 'Help & Support', icon: '❓', screen: '/help' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0f1c' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>💪</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profileData.name}</Text>
              <Text style={styles.profileEmail}>{profileData.email}</Text>
              <Text style={styles.memberSince}>Member since {profileData.memberSince}</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{profileData.totalWorkouts}</Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{profileData.totalCalories.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Calories</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{profileData.streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
            </View>
          </View>

          <View style={styles.levelContainer}>
            <Text style={styles.sectionTitle}>Fitness Level</Text>
            <View style={styles.levelCard}>
              <Text style={styles.levelText}>{profileData.level}</Text>
              <Text style={styles.levelDescription}>Keep pushing to reach Advanced!</Text>
              <View style={styles.levelProgress}>
                <View style={styles.levelProgressBar}>
                  <View style={[styles.levelProgressFill, { width: '65%' }]} />
                </View>
                <Text style={styles.levelProgressText}>65% to Advanced</Text>
              </View>
            </View>
          </View>

          <View style={styles.achievementsContainer}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievementsGrid}>
              {achievements.map((achievement) => (
                <View 
                  key={achievement.id} 
                  style={[styles.achievementCard, !achievement.earned && styles.achievementLocked]}
                >
                  <Text style={[styles.achievementIcon, !achievement.earned && styles.achievementIconLocked]}>
                    {achievement.icon}
                  </Text>
                  <Text style={[styles.achievementName, !achievement.earned && styles.achievementNameLocked]}>
                    {achievement.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.menuContainer}>
            <Text style={styles.sectionTitle}>Account</Text>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => {
                  if (item.screen === '/personal-info') {
                    router.push('/screens/personal-info');
                  } else if (item.screen === '/settings') {
                    router.push('/screens/settings');
                  } else {
                    Alert.alert('Coming Soon', `${item.title} feature is coming soon!`);
                  }
                }}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.logoutContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LinearGradient
                colors={['#ff6b6b', '#ee5a24']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoutGradient}
              >
                <Text style={styles.logoutIcon}>🚪</Text>
                <Text style={styles.logoutText}>Logout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>ZoeFit Version 1.0.0</Text>
            <Text style={styles.versionSubtext}>Made with ❤️ for your fitness journey</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 32,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textShadowColor: '#764ba2',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  profileEmail: {
    fontSize: 14,
    color: '#e0e7ff',
    marginBottom: 3,
  },
  memberSince: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 18,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  levelContainer: {
    padding: 20,
  },
  levelCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  levelText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  levelDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 15,
  },
  levelProgress: {
    alignItems: 'center',
  },
  levelProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    marginBottom: 8,
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: '#a78bfa',
    borderRadius: 4,
  },
  levelProgressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  achievementsContainer: {
    padding: 20,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '30%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  achievementLocked: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    opacity: 0.6,
  },
  achievementIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  achievementIconLocked: {
    opacity: 0.3,
  },
  achievementName: {
    fontSize: 10,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  achievementNameLocked: {
    color: 'rgba(255,255,255,0.5)',
  },
  menuContainer: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: 15,
    padding: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  menuArrow: {
    fontSize: 20,
    color: 'rgba(255,255,255,0.6)',
  },
  logoutContainer: {
    padding: 20,
    paddingTop: 0,
  },
  logoutButton: {
    borderRadius: 15,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 15,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  versionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 5,
  },
  versionSubtext: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },
});
