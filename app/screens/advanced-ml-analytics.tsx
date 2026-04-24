import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
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
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  insightCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  insightValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  insightDescription: {
    fontSize: 12,
    opacity: 0.8,
  },
  chartContainer: {
    marginVertical: 15,
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
    marginVertical: 2,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 5,
  },
  legendText: {
    fontSize: 10,
  },
  performanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  performanceMetric: {
    alignItems: 'center',
    flex: 1,
  },
  performanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  performanceLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  trendText: {
    fontSize: 12,
    marginLeft: 3,
  },
  adaptationStatus: {
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  adaptationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  seasonalCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  seasonalTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  seasonalTip: {
    fontSize: 12,
    marginBottom: 5,
    paddingLeft: 15,
  },
  forecastCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  forecastTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  forecastMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  forecastLabel: {
    fontSize: 12,
  },
  forecastValue: {
    fontSize: 12,
    fontWeight: '600',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

interface AdvancedMLAnalytics {
  performance_metrics: {
    total_predictions: number;
    success_rate: number;
    avg_confidence: number;
    avg_user_rating: number;
    user_satisfaction: number;
    avg_processing_time: number;
  };
  approach_distribution: {
    ml_based: number;
    rule_based: number;
    hybrid: number;
    emergency_fallback: number;
  };
  ml_vs_rule_comparison: {
    ml_success_rate: number;
    rule_success_rate: number;
    ml_avg_rating: number;
    rule_avg_rating: number;
    ml_avg_confidence: number;
    rule_avg_confidence: number;
  };
  predictive_insights: {
    trend_analysis: any;
    goal_projection: any;
    recommendation_trends: any;
    seasonal_insights: any;
    performance_forecast: any;
  };
  adaptation_status: {
    adaptation_active: boolean;
    adaptation_factor: number;
    feedback_count: number;
    last_adaptation: string;
  };
}

const AdvancedMLAnalyticsScreen = () => {
  const { theme, isDarkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AdvancedMLAnalytics | null>(null);
  const [timePeriod, setTimePeriod] = useState(30); // days

  const fetchAdvancedAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdvancedMLAnalytics(timePeriod);
      setAnalytics(response);
    } catch (error) {
      console.error('Error fetching advanced analytics:', error);
      Alert.alert('Error', 'Failed to load advanced analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvancedAnalytics();
  }, [timePeriod]);

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return '#4CAF50';
      case 'declining': return '#f44336';
      case 'stable': return '#FF9800';
      default: return '#9C27B0';
    }
  };

  const getSeasonColor = (season: string) => {
    switch (season) {
      case 'winter': return '#2196F3';
      case 'spring': return '#4CAF50';
      case 'summer': return '#FF9800';
      case 'fall': return '#795548';
      default: return '#9C27B0';
    }
  };

  const renderPerformanceForecast = () => {
    if (!analytics?.predictive_insights?.performance_forecast) return null;

    const forecast = analytics.predictive_insights.performance_forecast;

    return (
      <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Performance Forecast</Text>

        <View style={[styles.forecastCard, { backgroundColor: isDarkMode ? 'rgba(76,175,80,0.1)' : 'rgba(76,175,80,0.1)' }]}>
          <Text style={[styles.forecastTitle, { color: theme.text }]}>Confidence Score Projection</Text>
          <View style={styles.forecastMetric}>
            <Text style={[styles.forecastLabel, { color: theme.textSecondary }]}>Current:</Text>
            <Text style={[styles.forecastValue, { color: theme.text }]}>{forecast.current_confidence}</Text>
          </View>
          <View style={styles.forecastMetric}>
            <Text style={[styles.forecastLabel, { color: theme.textSecondary }]}>7-Day Forecast:</Text>
            <Text style={[styles.forecastValue, { color: theme.text }]}>{forecast.forecasted_confidence}</Text>
          </View>
          <View style={styles.trendIndicator}>
            <Text style={[styles.trendText, { color: getTrendColor(forecast.confidence_trend) }]}>
              {forecast.confidence_trend === 'improving' ? ' rising' :
                forecast.confidence_trend === 'declining' ? ' falling' : ' stable'}
            </Text>
          </View>
        </View>

        <View style={[styles.forecastCard, { backgroundColor: isDarkMode ? 'rgba(33,150,243,0.1)' : 'rgba(33,150,243,0.1)' }]}>
          <Text style={[styles.forecastTitle, { color: theme.text }]}>Processing Time Forecast</Text>
          <View style={styles.forecastMetric}>
            <Text style={[styles.forecastLabel, { color: theme.textSecondary }]}>Current:</Text>
            <Text style={[styles.forecastValue, { color: theme.text }]}>{forecast.current_processing_time}s</Text>
          </View>
          <View style={styles.forecastMetric}>
            <Text style={[styles.forecastLabel, { color: theme.textSecondary }]}>7-Day Forecast:</Text>
            <Text style={[styles.forecastValue, { color: theme.text }]}>{forecast.forecasted_processing_time}s</Text>
          </View>
        </View>

        <View style={[styles.insightCard, { backgroundColor: isDarkMode ? 'rgba(156,39,176,0.1)' : 'rgba(156,39,176,0.1)', borderLeftColor: '#9C27B0' }]}>
          <Text style={[styles.insightTitle, { color: theme.text }]}>Forecast Confidence</Text>
          <Text style={[styles.insightValue, { color: theme.text }]}>{Math.round(forecast.forecast_confidence * 100)}%</Text>
          <Text style={[styles.insightDescription, { color: theme.textSecondary }]}>
            Based on {forecast.data_points} data points
          </Text>
        </View>
      </View>
    );
  };

  const renderTrendAnalysis = () => {
    if (!analytics?.predictive_insights?.trend_analysis) return null;

    const trends = analytics.predictive_insights.trend_analysis;

    return (
      <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Nutrition Trends Analysis</Text>

        <View style={[styles.insightCard, { backgroundColor: isDarkMode ? 'rgba(255,152,0,0.1)' : 'rgba(255,152,0,0.1)', borderLeftColor: '#FF9800' }]}>
          <Text style={[styles.insightTitle, { color: theme.text }]}>Calorie Trend</Text>
          <Text style={[styles.insightValue, { color: theme.text }]}>{trends.calorie_trend}</Text>
          <Text style={[styles.insightDescription, { color: theme.textSecondary }]}>
            Average: {trends.avg_calories} calories/day
          </Text>
        </View>

        <View style={[styles.insightCard, { backgroundColor: isDarkMode ? 'rgba(76,175,80,0.1)' : 'rgba(76,175,80,0.1)', borderLeftColor: '#4CAF50' }]}>
          <Text style={[styles.insightTitle, { color: theme.text }]}>Protein Intake</Text>
          <Text style={[styles.insightValue, { color: theme.text }]}>{trends.avg_protein}g/day</Text>
          <Text style={[styles.insightDescription, { color: theme.textSecondary }]}>
            Based on {trends.data_points} meal plans
          </Text>
        </View>

        <View style={[styles.insightCard, { backgroundColor: isDarkMode ? 'rgba(33,150,243,0.1)' : 'rgba(33,150,243,0.1)', borderLeftColor: '#2196F3' }]}>
          <Text style={[styles.insightTitle, { color: theme.text }]}>ML Confidence</Text>
          <Text style={[styles.insightValue, { color: theme.text }]}>{Math.round(trends.avg_confidence * 100)}%</Text>
          <Text style={[styles.insightDescription, { color: theme.textSecondary }]}>
            Average prediction confidence
          </Text>
        </View>
      </View>
    );
  };

  const renderGoalProjection = () => {
    if (!analytics?.predictive_insights?.goal_projection) return null;

    const projection = analytics.predictive_insights.goal_projection;

    return (
      <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Goal Progress Projection</Text>

        <View style={[styles.insightCard, { backgroundColor: isDarkMode ? 'rgba(76,175,80,0.1)' : 'rgba(76,175,80,0.1)', borderLeftColor: '#4CAF50' }]}>
          <Text style={[styles.insightTitle, { color: theme.text }]}>Current Status</Text>
          <Text style={[styles.insightValue, { color: theme.text }]}>
            {projection.current_weight}kg / {projection.target_weight}kg
          </Text>
          <Text style={[styles.insightDescription, { color: theme.textSecondary }]}>
            {projection.status === 'goal_achieved' ? 'Goal achieved!' :
              projection.status === 'stable' ? 'Weight stable' :
                projection.status === 'projected' ? 'On track' : 'Insufficient data'}
          </Text>
        </View>

        {projection.days_to_goal !== null && (
          <View style={[styles.insightCard, { backgroundColor: isDarkMode ? 'rgba(255,152,0,0.1)' : 'rgba(255,152,0,0.1)', borderLeftColor: '#FF9800' }]}>
            <Text style={[styles.insightTitle, { color: theme.text }]}>Projected Timeline</Text>
            <Text style={[styles.insightValue, { color: theme.text }]}>
              {projection.days_to_goal} days
            </Text>
            <Text style={[styles.insightDescription, { color: theme.textSecondary }]}>
              Change rate: {projection.weight_change_rate}kg/day
            </Text>
          </View>
        )}

        {projection.projection_confidence && (
          <View style={[styles.insightCard, { backgroundColor: isDarkMode ? 'rgba(156,39,176,0.1)' : 'rgba(156,39,176,0.1)', borderLeftColor: '#9C27B0' }]}>
            <Text style={[styles.insightTitle, { color: theme.text }]}>Projection Confidence</Text>
            <Text style={[styles.insightValue, { color: theme.text }]}>
              {Math.round(projection.projection_confidence * 100)}%
            </Text>
            <Text style={[styles.insightDescription, { color: theme.textSecondary }]}>
              Based on historical trends
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderSeasonalInsights = () => {
    if (!analytics?.predictive_insights?.seasonal_insights) return null;

    const seasonal = analytics.predictive_insights.seasonal_insights;

    return (
      <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Seasonal Nutrition Insights</Text>

        <View style={[styles.seasonalCard, { backgroundColor: isDarkMode ? 'rgba(255,152,0,0.1)' : 'rgba(255,152,0,0.1)' }]}>
          <Text style={[styles.seasonalTitle, { color: theme.text }]}>
            Current Season: {seasonal.season?.charAt(0).toUpperCase() + seasonal.season?.slice(1)}
          </Text>
          <Text style={[styles.insightDescription, { color: theme.textSecondary }]}>
            Focus: {seasonal.recommendations?.focus?.replace('_', ' ')}
          </Text>
        </View>

        <View style={[styles.seasonalCard, { backgroundColor: isDarkMode ? 'rgba(76,175,80,0.1)' : 'rgba(76,175,80,0.1)' }]}>
          <Text style={[styles.seasonalTitle, { color: theme.text }]}>Seasonal Adjustments</Text>
          <Text style={[styles.insightDescription, { color: theme.textSecondary }]}>
            Calories: {seasonal.recommendations?.calorie_adjustment ?
              `${Math.round((seasonal.recommendations.calorie_adjustment - 1) * 100)}%` : 'No change'}
          </Text>
          <Text style={[styles.insightDescription, { color: theme.textSecondary }]}>
            Protein: {seasonal.recommendations?.protein_adjustment ?
              `${Math.round((seasonal.recommendations.protein_adjustment - 1) * 100)}%` : 'No change'}
          </Text>
        </View>

        <View style={[styles.seasonalCard, { backgroundColor: isDarkMode ? 'rgba(33,150,243,0.1)' : 'rgba(33,150,243,0.1)' }]}>
          <Text style={[styles.seasonalTitle, { color: theme.text }]}>Seasonal Tips</Text>
          {seasonal.recommendations?.tips?.map((tip: string, index: number) => (
            <Text key={index} style={[styles.seasonalTip, { color: theme.textSecondary }]}>
              {tip}
            </Text>
          ))}
        </View>

        {seasonal.next_season_change && (
          <View style={[styles.seasonalCard, { backgroundColor: isDarkMode ? 'rgba(156,39,176,0.1)' : 'rgba(156,39,176,0.1)' }]}>
            <Text style={[styles.seasonalTitle, { color: theme.text }]}>Next Season Change</Text>
            <Text style={[styles.insightDescription, { color: theme.textSecondary }]}>
              {seasonal.next_season_change.next_season?.charAt(0).toUpperCase() + seasonal.next_season_change.next_season?.slice(1)} in {seasonal.next_season_change.days_until_change} days
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderAdaptationStatus = () => {
    if (!analytics?.adaptation_status) return null;

    const adaptation = analytics.adaptation_status;

    return (
      <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Real-Time Adaptation Status</Text>

        <View style={[styles.adaptationStatus, {
          backgroundColor: adaptation.adaptation_active ?
            'rgba(76,175,80,0.2)' : 'rgba(255,152,0,0.2)'
        }]}>
          <Text style={[styles.adaptationText, {
            color: adaptation.adaptation_active ? '#4CAF50' : '#FF9800'
          }]}>
            {adaptation.adaptation_active ? 'Adaptation Active' : 'Adaptation Inactive'}
          </Text>
        </View>

        <View style={[styles.insightCard, { backgroundColor: isDarkMode ? 'rgba(33,150,243,0.1)' : 'rgba(33,150,243,0.1)', borderLeftColor: '#2196F3' }]}>
          <Text style={[styles.insightTitle, { color: theme.text }]}>Feedback Count</Text>
          <Text style={[styles.insightValue, { color: theme.text }]}>{adaptation.feedback_count}</Text>
          <Text style={[styles.insightDescription, { color: theme.textSecondary }]}>
            Minimum for adaptation: 10
          </Text>
        </View>

        {adaptation.adaptation_factor && (
          <View style={[styles.insightCard, { backgroundColor: isDarkMode ? 'rgba(156,39,176,0.1)' : 'rgba(156,39,176,0.1)', borderLeftColor: '#9C27B0' }]}>
            <Text style={[styles.insightTitle, { color: theme.text }]}>Adaptation Factor</Text>
            <Text style={[styles.insightValue, { color: theme.text }]}>
              {Math.round(adaptation.adaptation_factor * 100)}%
            </Text>
            <Text style={[styles.insightDescription, { color: theme.textSecondary }]}>
              Influence on recommendations
            </Text>
          </View>
        )}

        <View style={[styles.insightCard, { backgroundColor: isDarkMode ? 'rgba(255,152,0,0.1)' : 'rgba(255,152,0,0.1)', borderLeftColor: '#FF9800' }]}>
          <Text style={[styles.insightTitle, { color: theme.text }]}>Last Adaptation</Text>
          <Text style={[styles.insightValue, { color: theme.text }]}>
            {adaptation.last_adaptation ? 'Recently' : 'Never'}
          </Text>
          <Text style={[styles.insightDescription, { color: theme.textSecondary }]}>
            Based on user feedback
          </Text>
        </View>
      </View>
    );
  };

  const renderApproachDistribution = () => {
    if (!analytics?.approach_distribution) return null;

    const data = analytics.approach_distribution;
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);

    const pieData = [
      {
        name: 'ML Based',
        population: data.ml_based,
        color: '#4CAF50',
        legendFontColor: theme.text,
        legendFontSize: 10
      },
      {
        name: 'Rule Based',
        population: data.rule_based,
        color: '#FF9800',
        legendFontColor: theme.text,
        legendFontSize: 10
      },
      {
        name: 'Hybrid',
        population: data.hybrid,
        color: '#2196F3',
        legendFontColor: theme.text,
        legendFontSize: 10
      },
      {
        name: 'Emergency',
        population: data.emergency_fallback,
        color: '#f44336',
        legendFontColor: theme.text,
        legendFontSize: 10
      }
    ].filter(item => item.population > 0);

    return (
      <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Approach Distribution</Text>

        <View style={styles.chartContainer}>
          <PieChart
            data={pieData}
            width={screenWidth - 60}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[screenWidth / 2 - 30, 0]}
            absolute
          />
        </View>

        <View style={styles.legendContainer}>
          {pieData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={[styles.legendText, { color: theme.text }]}>
                {item.name}: {item.population}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderPerformanceMetrics = () => {
    if (!analytics?.performance_metrics) return null;

    const metrics = analytics.performance_metrics;

    return (
      <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Performance Metrics</Text>

        <View style={styles.performanceCard}>
          <View style={styles.performanceMetric}>
            <Text style={[styles.performanceValue, { color: theme.text }]}>{metrics.total_predictions}</Text>
            <Text style={[styles.performanceLabel, { color: theme.textSecondary }]}>Total Predictions</Text>
          </View>
          <View style={styles.performanceMetric}>
            <Text style={[styles.performanceValue, { color: theme.text }]}>{Math.round(metrics.success_rate * 100)}%</Text>
            <Text style={[styles.performanceLabel, { color: theme.textSecondary }]}>Success Rate</Text>
          </View>
          <View style={styles.performanceMetric}>
            <Text style={[styles.performanceValue, { color: theme.text }]}>{Math.round(metrics.avg_confidence * 100)}%</Text>
            <Text style={[styles.performanceLabel, { color: theme.textSecondary }]}>Avg Confidence</Text>
          </View>
        </View>

        <View style={styles.performanceCard}>
          <View style={styles.performanceMetric}>
            <Text style={[styles.performanceValue, { color: theme.text }]}>{metrics.avg_user_rating.toFixed(1)}</Text>
            <Text style={[styles.performanceLabel, { color: theme.textSecondary }]}>Avg Rating</Text>
          </View>
          <View style={styles.performanceMetric}>
            <Text style={[styles.performanceValue, { color: theme.text }]}>{Math.round(metrics.user_satisfaction * 100)}%</Text>
            <Text style={[styles.performanceLabel, { color: theme.textSecondary }]}>Satisfaction</Text>
          </View>
          <View style={styles.performanceMetric}>
            <Text style={[styles.performanceValue, { color: theme.text }]}>{metrics.avg_processing_time.toFixed(2)}s</Text>
            <Text style={[styles.performanceLabel, { color: theme.textSecondary }]}>Avg Processing</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={isDarkMode ? '#667eea' : theme.primary} />
        <Text style={{ color: theme.text, marginTop: 10 }}>Loading advanced analytics...</Text>
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
          <View>
            <Text style={styles.title}>Advanced ML Analytics</Text>
            <Text style={styles.subtitle}>Predictive insights and real-time adaptation</Text>
          </View>
        </LinearGradient>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {renderPerformanceMetrics()}
          {renderAdaptationStatus()}
          {renderTrendAnalysis()}
          {renderGoalProjection()}
          {renderSeasonalInsights()}
          {renderPerformanceForecast()}
          {renderApproachDistribution()}

          <View style={styles.container}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={fetchAdvancedAnalytics}
            >
              <LinearGradient
                colors={isDarkMode ? ['#667eea', '#764ba2'] : [theme.primary, theme.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 12, borderRadius: 10 }}
              >
                <Text style={styles.refreshButtonText}>Refresh Analytics</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default AdvancedMLAnalyticsScreen;
