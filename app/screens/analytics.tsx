import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeContext';
import { apiService } from '../../services/api';

const { width: screenWidth } = Dimensions.get('window');

interface AnalyticsData {
  overview: {
    totalWorkouts: number;
    totalCalories: number;
    totalMinutes: number;
    currentStreak: number;
    longestStreak: number;
    completionRate: number;
  };
  trends: {
    weight: Array<{ date: string; value: number }>;
    workouts: Array<{ date: string; count: number }>;
    calories: Array<{ date: string; value: number }>;
  };
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    earnedAt: string;
    icon: string;
  }>;
  insights: string[];
  recommendations: string[];
}

const AnalyticsScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const periodOptions = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'quarter', label: 'Quarter' },
    { value: 'year', label: 'Year' },
  ];

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getUserAnalytics();
      setAnalyticsData(response.analytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
  };

  const mockAnalyticsData: AnalyticsData = {
    overview: {
      totalWorkouts: 47,
      totalCalories: 23500,
      totalMinutes: 2820,
      currentStreak: 12,
      longestStreak: 21,
      completionRate: 85,
    },
    trends: {
      weight: [
        { date: '2026-02-01', value: 75.5 },
        { date: '2026-02-08', value: 75.2 },
        { date: '2026-02-15', value: 74.8 },
        { date: '2026-02-22', value: 74.5 },
        { date: '2026-03-01', value: 74.2 },
        { date: '2026-03-05', value: 74.0 },
      ],
      workouts: [
        { date: '2026-02-01', count: 3 },
        { date: '2026-02-08', count: 4 },
        { date: '2026-02-15', count: 5 },
        { date: '2026-02-22', count: 4 },
        { date: '2026-03-01', count: 3 },
        { date: '2026-03-05', count: 2 },
      ],
      calories: [
        { date: '2026-02-01', value: 1800 },
        { date: '2026-02-08', value: 2100 },
        { date: '2026-02-15', value: 2300 },
        { date: '2026-02-22', value: 2000 },
        { date: '2026-03-01', value: 1900 },
        { date: '2026-03-05', value: 1700 },
      ],
    },
    achievements: [
      {
        id: '1',
        name: '7 Day Streak',
        description: 'Completed workouts for 7 consecutive days',
        earnedAt: '2026-02-15',
        icon: '🔥',
      },
      {
        id: '2',
        name: '1000 Calories',
        description: 'Burned 1000+ calories in a single week',
        earnedAt: '2026-02-22',
        icon: '🔥',
      },
      {
        id: '3',
        name: 'Early Bird',
        description: 'Completed 5 morning workouts',
        earnedAt: '2026-03-01',
        icon: '🌅',
      },
    ],
    insights: [
      'Your workout consistency has improved by 25% this month',
      'You burn the most calories on Tuesday workouts',
      'Your strength gains are strongest in upper body exercises',
    ],
    recommendations: [
      'Try adding 10 minutes to your cardio sessions for better endurance',
      'Consider increasing protein intake on workout days',
      'Your rest days could benefit from light stretching or yoga',
    ],
  };

  const data = analyticsData || mockAnalyticsData;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
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
          <Text style={styles.headerTitle}>Analytics Dashboard</Text>
          <TouchableOpacity onPress={() => router.push('/screens/settings')}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Period Selector */}
        <View style={styles.periodContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {periodOptions.map((period) => (
              <TouchableOpacity
                key={period.value}
                style={[
                  styles.periodChip,
                  {
                    backgroundColor: selectedPeriod === period.value ? theme.primary : theme.cardBackground,
                    borderColor: theme.border,
                  }
                ]}
                onPress={() => setSelectedPeriod(period.value)}
              >
                <Text style={[
                  styles.periodText,
                  { color: selectedPeriod === period.value ? '#fff' : theme.text }
                ]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
          }
        >
          {/* Overview Stats */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Overview</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <Text style={styles.statIcon}>💪</Text>
                <Text style={[styles.statNumber, { color: theme.text }]}>{data.overview.totalWorkouts}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Workouts</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <Text style={styles.statIcon}>🔥</Text>
                <Text style={[styles.statNumber, { color: theme.text }]}>{data.overview.totalCalories.toLocaleString()}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Calories Burned</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <Text style={styles.statIcon}>⏱️</Text>
                <Text style={[styles.statNumber, { color: theme.text }]}>{formatDuration(data.overview.totalMinutes)}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Time</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <Text style={styles.statIcon}>📈</Text>
                <Text style={[styles.statNumber, { color: theme.text }]}>{data.overview.completionRate}%</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completion Rate</Text>
              </View>
            </View>
          </View>

          {/* Streaks */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Streaks</Text>
            <View style={[styles.streakCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <View style={styles.streakItem}>
                <Text style={styles.streakIcon}>🔥</Text>
                <View style={styles.streakInfo}>
                  <Text style={[styles.streakNumber, { color: theme.text }]}>{data.overview.currentStreak}</Text>
                  <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>Current Streak</Text>
                </View>
              </View>
              <View style={styles.streakDivider} />
              <View style={styles.streakItem}>
                <Text style={styles.streakIcon}>🏆</Text>
                <View style={styles.streakInfo}>
                  <Text style={[styles.streakNumber, { color: theme.text }]}>{data.overview.longestStreak}</Text>
                  <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>Longest Streak</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Progress Trends */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Progress Trends</Text>

            <View style={[styles.trendCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <View style={styles.trendHeader}>
                <Text style={styles.trendIcon}>⚖️</Text>
                <Text style={[styles.trendTitle, { color: theme.text }]}>Weight Progress</Text>
                <Text style={[styles.trendValue, { color: theme.primary }]}>
                  -1.5 kg this month
                </Text>
              </View>
              <View style={styles.trendChart}>
                {data.trends.weight.map((point, index) => (
                  <View key={index} style={styles.chartPoint}>
                    <View style={[
                      styles.chartBar,
                      {
                        height: `${(point.value / 80) * 100}%`,
                        backgroundColor: getProgressColor((1 - (point.value - 70) / 15) * 100)
                      }
                    ]} />
                    <Text style={[styles.chartLabel, { color: theme.textSecondary }]}>
                      {new Date(point.date).getDate()}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={[styles.trendCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <View style={styles.trendHeader}>
                <Text style={styles.trendIcon}>💪</Text>
                <Text style={[styles.trendTitle, { color: theme.text }]}>Workout Frequency</Text>
                <Text style={[styles.trendValue, { color: theme.primary }]}>
                  4.2 per week avg
                </Text>
              </View>
              <View style={styles.trendChart}>
                {data.trends.workouts.map((point, index) => (
                  <View key={index} style={styles.chartPoint}>
                    <View style={[
                      styles.chartBar,
                      {
                        height: `${(point.count / 5) * 100}%`,
                        backgroundColor: theme.primary
                      }
                    ]} />
                    <Text style={[styles.chartLabel, { color: theme.textSecondary }]}>
                      {new Date(point.date).getDate()}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Recent Achievements */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Achievements</Text>
            <View style={styles.achievementsList}>
              {data.achievements.map((achievement) => (
                <View key={achievement.id} style={[styles.achievementCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <View style={styles.achievementInfo}>
                    <Text style={[styles.achievementName, { color: theme.text }]}>{achievement.name}</Text>
                    <Text style={[styles.achievementDescription, { color: theme.textSecondary }]}>
                      {achievement.description}
                    </Text>
                    <Text style={[styles.achievementDate, { color: theme.textSecondary }]}>
                      {new Date(achievement.earnedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* AI Insights */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>AI Insights</Text>
            <View style={[styles.insightsCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              {data.insights.map((insight, index) => (
                <View key={index} style={styles.insightItem}>
                  <Text style={styles.insightIcon}>💡</Text>
                  <Text style={[styles.insightText, { color: theme.text }]}>{insight}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Recommendations */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recommendations</Text>
            <View style={[styles.recommendationsCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              {data.recommendations.map((recommendation, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.recommendationIcon}>🎯</Text>
                  <Text style={[styles.recommendationText, { color: theme.text }]}>{recommendation}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Last updated: {new Date().toLocaleString()}
            </Text>
          </View>
        </ScrollView>
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
  settingsIcon: {
    fontSize: 20,
  },
  periodContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  periodChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  streakCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    borderWidth: 1,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  streakItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 14,
  },
  streakDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 20,
  },
  trendCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  trendIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  trendTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  trendValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  trendChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
  },
  chartPoint: {
    flex: 1,
    alignItems: 'center',
  },
  chartBar: {
    width: 20,
    borderRadius: 4,
    marginBottom: 4,
  },
  chartLabel: {
    fontSize: 10,
  },
  achievementsList: {
    marginBottom: 16,
  },
  achievementCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 12,
  },
  insightsCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  insightIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  recommendationsCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});

export default AnalyticsScreen;
