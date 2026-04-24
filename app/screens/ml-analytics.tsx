import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../../services/api';
import { useTheme } from './ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textShadowColor: '#764ba2',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    fontWeight: '500',
  },
  container: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    marginTop: 5,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  comparisonContainer: {
    marginBottom: 20,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  comparisonLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  comparisonValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  chartContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  chartBar: {
    width: 60,
    marginHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 8,
    minHeight: 20,
  },
  chartLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
  chartValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
  },
  refreshButton: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

interface MLPerformanceMetrics {
  period_days: number;
  total_predictions: number;
  success_rate: number;
  avg_processing_time_ms: number;
  approach_distribution: Record<string, number>;
  avg_confidence_score: number;
  avg_user_rating: number;
  user_satisfaction_rate: number;
}

interface MLComparisonData {
  period_days: number;
  ml_based: {
    total_predictions: number;
    success_rate: number;
    avg_confidence: number;
    avg_user_rating: number;
    user_satisfaction: number;
  };
  rule_based: {
    total_predictions: number;
    success_rate: number;
    avg_user_rating: number;
    user_satisfaction: number;
  };
  hybrid: {
    total_predictions: number;
    success_rate: number;
    avg_confidence: number;
    avg_user_rating: number;
    user_satisfaction: number;
  };
  recommendation: string;
}

const MLAnalyticsScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [performanceMetrics, setPerformanceMetrics] = useState<MLPerformanceMetrics | null>(null);
  const [comparisonData, setComparisonData] = useState<MLComparisonData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(7);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch performance metrics
      const metrics = await apiService.getMLPerformanceMetrics('nutrition', selectedPeriod);
      setPerformanceMetrics(metrics);

      // Fetch comparison data
      const comparison = await apiService.getMLVsRuleComparison('nutrition', 30);
      setComparisonData(comparison);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      Alert.alert('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const getApproachColor = (approach: string) => {
    switch (approach) {
      case 'ml_based': return '#4CAF50';
      case 'rule_based': return '#FF9800';
      case 'hybrid': return '#2196F3';
      default: return '#9C27B0';
    }
  };

  const getPerformanceColor = (value: number, type: 'success' | 'rating' | 'satisfaction') => {
    if (type === 'success') {
      if (value >= 0.9) return '#4CAF50';
      if (value >= 0.7) return '#FF9800';
      return '#f44336';
    } else if (type === 'rating') {
      if (value >= 4.5) return '#4CAF50';
      if (value >= 3.5) return '#FF9800';
      return '#f44336';
    } else {
      if (value >= 0.85) return '#4CAF50';
      if (value >= 0.7) return '#FF9800';
      return '#f44336';
    }
  };

  const renderChart = () => {
    if (!comparisonData) return null;

    const data = [
      { label: 'ML', value: comparisonData.ml_based?.success_rate || 0, color: '#4CAF50' },
      { label: 'Rules', value: comparisonData.rule_based?.success_rate || 0, color: '#FF9800' },
      { label: 'Hybrid', value: comparisonData.hybrid?.success_rate || 0, color: '#2196F3' },
    ];

    const maxValue = Math.max(...data.map(d => d.value));

    return (
      <View style={styles.chartContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' }}>
          {data.map((item, index) => (
            <View key={index} style={styles.chartBar}>
              <Text style={[styles.chartValue, { color: isDarkMode ? '#fff' : theme.text }]}>
                {Math.round(item.value * 100)}%
              </Text>
              <View
                style={[
                  styles.chartBarFill,
                  {
                    height: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color
                  }
                ]}
              />
              <Text style={[styles.chartLabel, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top']}>
          <LinearGradient
            colors={isDarkMode ? ['#667eea', '#764ba2', '#f093fb'] : theme.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <Text style={styles.title}>ML Analytics</Text>
            <Text style={styles.subtitle}>Performance insights</Text>
          </LinearGradient>
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.text }]}>Loading analytics...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top']}>
        <LinearGradient
          colors={isDarkMode ? ['#667eea', '#764ba2', '#f093fb'] : theme.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.title}>ML Analytics</Text>
          <Text style={styles.subtitle}>Performance insights</Text>
        </LinearGradient>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            {/* Period Selector */}
            <View style={[styles.section, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.cardBackground, borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : theme.border }]}>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : theme.text }]}>Time Period</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {[7, 30, 90].map((period) => (
                  <TouchableOpacity
                    key={period}
                    style={[
                      styles.refreshButton,
                      {
                        backgroundColor: selectedPeriod === period ? '#667eea' : 'rgba(255,255,255,0.1)',
                        borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : theme.border,
                        borderWidth: 1
                      }
                    ]}
                    onPress={() => setSelectedPeriod(period)}
                  >
                    <Text style={[styles.refreshButtonText, { color: selectedPeriod === period ? '#fff' : theme.text }]}>
                      {period} days
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Performance Metrics */}
            {performanceMetrics && (
              <View style={[styles.section, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.cardBackground, borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : theme.border }]}>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : theme.text }]}>Performance Metrics</Text>

                <View style={styles.metricRow}>
                  <Text style={[styles.metricLabel, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>Total Predictions</Text>
                  <Text style={[styles.metricValue, { color: isDarkMode ? '#fff' : theme.text }]}>{performanceMetrics.total_predictions}</Text>
                </View>

                <View style={styles.metricRow}>
                  <Text style={[styles.metricLabel, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>Success Rate</Text>
                  <Text style={[styles.metricValue, { color: getPerformanceColor(performanceMetrics.success_rate, 'success') }]}>
                    {Math.round(performanceMetrics.success_rate * 100)}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${performanceMetrics.success_rate * 100}%`, backgroundColor: getPerformanceColor(performanceMetrics.success_rate, 'success') }]} />
                </View>

                <View style={styles.metricRow}>
                  <Text style={[styles.metricLabel, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>Avg Confidence</Text>
                  <Text style={[styles.metricValue, { color: isDarkMode ? '#fff' : theme.text }]}>
                    {Math.round(performanceMetrics.avg_confidence_score * 100)}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${performanceMetrics.avg_confidence_score * 100}%`, backgroundColor: '#667eea' }]} />
                </View>

                <View style={styles.metricRow}>
                  <Text style={[styles.metricLabel, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>Avg User Rating</Text>
                  <Text style={[styles.metricValue, { color: getPerformanceColor(performanceMetrics.avg_user_rating, 'rating') }]}>
                    {performanceMetrics.avg_user_rating.toFixed(1)} / 5.0
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${(performanceMetrics.avg_user_rating / 5) * 100}%`, backgroundColor: getPerformanceColor(performanceMetrics.avg_user_rating, 'rating') }]} />
                </View>

                <View style={styles.metricRow}>
                  <Text style={[styles.metricLabel, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>User Satisfaction</Text>
                  <Text style={[styles.metricValue, { color: getPerformanceColor(performanceMetrics.user_satisfaction_rate, 'satisfaction') }]}>
                    {Math.round(performanceMetrics.user_satisfaction_rate * 100)}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${performanceMetrics.user_satisfaction_rate * 100}%`, backgroundColor: getPerformanceColor(performanceMetrics.user_satisfaction_rate, 'satisfaction') }]} />
                </View>

                <View style={styles.metricRow}>
                  <Text style={[styles.metricLabel, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>Avg Processing Time</Text>
                  <Text style={[styles.metricValue, { color: isDarkMode ? '#fff' : theme.text }]}>
                    {performanceMetrics.avg_processing_time_ms.toFixed(0)}ms
                  </Text>
                </View>
              </View>
            )}

            {/* Approach Distribution */}
            {performanceMetrics && (
              <View style={[styles.section, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.cardBackground, borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : theme.border }]}>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : theme.text }]}>Approach Distribution</Text>
                {Object.entries(performanceMetrics.approach_distribution).map(([approach, count]) => (
                  <View key={approach} style={styles.metricRow}>
                    <Text style={[styles.metricLabel, { color: isDarkMode ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>
                      {approach.replace('_', ' ').toUpperCase()}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={[styles.progressFill, {
                        width: 30,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: getApproachColor(approach),
                        marginRight: 10
                      }]} />
                      <Text style={[styles.metricValue, { color: isDarkMode ? '#fff' : theme.text }]}>{count}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* ML vs Rule-Based Comparison */}
            {comparisonData && (
              <View style={[styles.section, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.cardBackground, borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : theme.border }]}>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : theme.text }]}>ML vs Rule-Based Comparison</Text>

                {renderChart()}

                <View style={styles.comparisonContainer}>
                  <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : theme.text, fontSize: 16 }]}>Success Rates</Text>
                  <View style={styles.comparisonRow}>
                    <Text style={[styles.comparisonLabel, { color: '#4CAF50' }]}>ML Based</Text>
                    <Text style={[styles.comparisonValue, { color: isDarkMode ? '#fff' : theme.text }]}>
                      {Math.round((comparisonData.ml_based?.success_rate || 0) * 100)}%
                    </Text>
                  </View>
                  <View style={styles.comparisonRow}>
                    <Text style={[styles.comparisonLabel, { color: '#FF9800' }]}>Rule Based</Text>
                    <Text style={[styles.comparisonValue, { color: isDarkMode ? '#fff' : theme.text }]}>
                      {Math.round((comparisonData.rule_based?.success_rate || 0) * 100)}%
                    </Text>
                  </View>
                  <View style={styles.comparisonRow}>
                    <Text style={[styles.comparisonLabel, { color: '#2196F3' }]}>Hybrid</Text>
                    <Text style={[styles.comparisonValue, { color: isDarkMode ? '#fff' : theme.text }]}>
                      {Math.round((comparisonData.hybrid?.success_rate || 0) * 100)}%
                    </Text>
                  </View>
                </View>

                <View style={styles.comparisonContainer}>
                  <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : theme.text, fontSize: 16 }]}>User Ratings</Text>
                  <View style={styles.comparisonRow}>
                    <Text style={[styles.comparisonLabel, { color: '#4CAF50' }]}>ML Based</Text>
                    <Text style={[styles.comparisonValue, { color: isDarkMode ? '#fff' : theme.text }]}>
                      {comparisonData.ml_based?.avg_user_rating?.toFixed(1) || 'N/A'} / 5.0
                    </Text>
                  </View>
                  <View style={styles.comparisonRow}>
                    <Text style={[styles.comparisonLabel, { color: '#FF9800' }]}>Rule Based</Text>
                    <Text style={[styles.comparisonValue, { color: isDarkMode ? '#fff' : theme.text }]}>
                      {comparisonData.rule_based?.avg_user_rating?.toFixed(1) || 'N/A'} / 5.0
                    </Text>
                  </View>
                  <View style={styles.comparisonRow}>
                    <Text style={[styles.comparisonLabel, { color: '#2196F3' }]}>Hybrid</Text>
                    <Text style={[styles.comparisonValue, { color: isDarkMode ? '#fff' : theme.text }]}>
                      {comparisonData.hybrid?.avg_user_rating?.toFixed(1) || 'N/A'} / 5.0
                    </Text>
                  </View>
                </View>

                {comparisonData.recommendation && (
                  <View style={[styles.section, { backgroundColor: 'rgba(76,175,80,0.1)', borderColor: '#4CAF50' }]}>
                    <Text style={[styles.sectionTitle, { color: '#4CAF50' }]}>Recommendation</Text>
                    <Text style={[{ fontSize: 14, lineHeight: 20 }, { color: isDarkMode ? 'rgba(255,255,255,0.9)' : theme.text }]}>
                      {comparisonData.recommendation}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Refresh Button */}
            <TouchableOpacity
              style={[styles.refreshButton, { backgroundColor: '#667eea' }]}
              onPress={fetchAnalyticsData}
            >
              <Text style={styles.refreshButtonText}>Refresh Data</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default MLAnalyticsScreen;
