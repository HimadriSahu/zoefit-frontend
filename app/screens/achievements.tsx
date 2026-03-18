import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeContext';
import { apiService } from '../../services/api';

const { width: screenWidth } = Dimensions.get('window');

// Achievement interface based on backend model
interface Achievement {
  id: number;
  achievement_type: string;
  title: string;
  description: string;
  badge_icon: string;
  points_awarded: number;
  earned_date: string;
  is_displayed: boolean;
}

const AchievementsScreen = () => {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stats, setStats] = useState({
    totalAchievements: 0,
    totalPoints: 0,
    recentCount: 0,
  });

  // Achievement categories based on backend model
  const categories = [
    { id: 'all', name: 'All', icon: '🏆' },
    { id: 'workout', name: 'Workouts', icon: '💪' },
    { id: 'streak', name: 'Streaks', icon: '🔥' },
    { id: 'progress', name: 'Progress', icon: '📈' },
    { id: 'special', name: 'Special', icon: '⭐' },
  ];

  // Fetch achievements from backend
  const fetchAchievements = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      
      // Fetch all achievements
      const response = await apiService.getAchievements('true'); // Get displayed achievements
      const achievementsData = response.results || [];
      
      // Sort by earned date (most recent first)
      const sortedAchievements = achievementsData.sort((a: Achievement, b: Achievement) => 
        new Date(b.earned_date).getTime() - new Date(a.earned_date).getTime()
      );
      
      setAchievements(sortedAchievements);
      
      // Calculate stats
      const totalPoints = sortedAchievements.reduce((sum: number, achievement: Achievement) => 
        sum + achievement.points_awarded, 0
      );
      
      const recentCount = sortedAchievements.filter((achievement: Achievement) => {
        const earnedDate = new Date(achievement.earned_date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return earnedDate > weekAgo;
      }).length;
      
      setStats({
        totalAchievements: sortedAchievements.length,
        totalPoints,
        recentCount,
      });
      
    } catch (error: any) {
      console.error('❌ Failed to fetch achievements:', error);
      
      // Handle authentication errors
      if (error?.message?.includes('Authentication expired') ||
          error?.message?.includes('AUTH_EXPIRED') ||
          error?.status === 401) {
        Alert.alert('Session Expired', 'Please log in again to view your achievements.');
        router.replace('/LoginScreen');
        return;
      }
      
      // Show mock data for development/demo
      const mockAchievements: Achievement[] = [
        {
          id: 1,
          achievement_type: 'workout',
          title: 'First Workout',
          description: 'Complete your first workout session',
          badge_icon: '🏃‍♂️',
          points_awarded: 10,
          earned_date: new Date(Date.now() - 86400000).toISOString(),
          is_displayed: true,
        },
        {
          id: 2,
          achievement_type: 'streak',
          title: '7 Day Streak',
          description: 'Maintain a 7-day workout streak',
          badge_icon: '🔥',
          points_awarded: 50,
          earned_date: new Date(Date.now() - 172800000).toISOString(),
          is_displayed: true,
        },
        {
          id: 3,
          achievement_type: 'progress',
          title: '1000 Calories',
          description: 'Burn 1000 total calories',
          badge_icon: '💪',
          points_awarded: 25,
          earned_date: new Date(Date.now() - 259200000).toISOString(),
          is_displayed: true,
        },
        {
          id: 4,
          achievement_type: 'special',
          title: 'Early Bird',
          description: 'Complete 5 workouts before 8 AM',
          badge_icon: '🌅',
          points_awarded: 30,
          earned_date: new Date(Date.now() - 432000000).toISOString(),
          is_displayed: true,
        },
        {
          id: 5,
          achievement_type: 'workout',
          title: 'Workout Warrior',
          description: 'Complete 20 total workouts',
          badge_icon: '⚔️',
          points_awarded: 100,
          earned_date: new Date(Date.now() - 604800000).toISOString(),
          is_displayed: true,
        },
      ];
      
      setAchievements(mockAchievements);
      setStats({
        totalAchievements: mockAchievements.length,
        totalPoints: mockAchievements.reduce((sum, a) => sum + a.points_awarded, 0),
        recentCount: 2,
      });
      
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [router]);

  // Pull-to-refresh functionality
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAchievements(false);
    setRefreshing(false);
  }, [fetchAchievements]);

  // Load achievements on component mount
  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  // Filter achievements by category
  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(achievement => achievement.achievement_type === selectedCategory);

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : '🏆';
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <LinearGradient
          colors={isDarkMode ? ['#667eea', '#764ba2', '#f093fb'] : theme.headerGradient}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>🏆 Achievements</Text>
            <View style={{ width: 60 }} />
          </View>
          
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalAchievements}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalPoints}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.recentCount}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Category Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                selectedCategory === category.id && styles.categoryTabActive,
                { backgroundColor: selectedCategory === category.id ? theme.primary : theme.cardBackground }
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryText,
                { color: selectedCategory === category.id ? '#fff' : theme.text }
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Achievements List */}
        <ScrollView
          style={styles.achievementsContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Loading achievements...
              </Text>
            </View>
          ) : filteredAchievements.length > 0 ? (
            <View style={styles.achievementsList}>
              {filteredAchievements.map((achievement, index) => (
                <Animated.View
                  key={achievement.id}
                  style={[
                    styles.achievementCard,
                    { backgroundColor: theme.cardBackground, borderColor: theme.border }
                  ]}
                >
                  <View style={styles.achievementLeft}>
                    <View style={[styles.achievementIconContainer, { backgroundColor: theme.primary + '20' }]}>
                      <Text style={styles.achievementIcon}>{achievement.badge_icon}</Text>
                    </View>
                    <View style={styles.achievementInfo}>
                      <Text style={[styles.achievementTitle, { color: theme.text }]}>
                        {achievement.title}
                      </Text>
                      <Text style={[styles.achievementDescription, { color: theme.textSecondary }]}>
                        {achievement.description}
                      </Text>
                      <View style={styles.achievementMeta}>
                        <Text style={[styles.achievementDate, { color: theme.textSecondary }]}>
                          {formatDate(achievement.earned_date)}
                        </Text>
                        <View style={styles.pointsContainer}>
                          <Text style={styles.pointsText}>+{achievement.points_awarded}</Text>
                          <Text style={styles.pointsLabel}>pts</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={[styles.achievementTypeContainer, { backgroundColor: theme.primary + '15' }]}>
                    <Text style={styles.achievementTypeIcon}>
                      {getCategoryIcon(achievement.achievement_type)}
                    </Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🏆</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No Achievements Yet
              </Text>
              <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>
                Start working out and tracking your progress to unlock achievements!
              </Text>
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: theme.primary }]}
                onPress={() => router.push('/StartWorkout')}
              >
                <Text style={styles.emptyButtonText}>Start Your First Workout</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#43e97b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(56, 249, 215, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    padding: 15,
    minWidth: 80,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  categoriesContainer: {
    maxHeight: 80,
    marginVertical: 15,
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryTabActive: {
    borderColor: '#43e97b',
    shadowColor: '#43e97b',
    shadowOpacity: 0.3,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  achievementsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
  },
  achievementsList: {
    paddingBottom: 20,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  achievementIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  achievementIcon: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 18,
  },
  achievementMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievementDate: {
    fontSize: 12,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#43e97b20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#43e97b',
    marginRight: 2,
  },
  pointsLabel: {
    fontSize: 10,
    color: '#43e97b',
  },
  achievementTypeContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  achievementTypeIcon: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  emptyButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: '#43e97b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AchievementsScreen;
