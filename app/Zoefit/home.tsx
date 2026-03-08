import { useRouter } from 'expo-router';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	Dimensions,
	TouchableOpacity,
	Animated,
	ActivityIndicator,
	RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../screens/ThemeContext';
import { authService } from '../../services/auth';
import { apiService, DailyStats } from '../../services/api';

const screenWidth = Dimensions.get("window").width;

const HomeScreen = () => {
	const router = useRouter();
	const { theme, isDarkMode } = useTheme();
	const [isAiActive, setIsAiActive] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [showMenu, setShowMenu] = useState(false);
	const [todayStats, setTodayStats] = useState({
		calories: 0,
		steps: 0,
		minutes: 0
	});
	const [todayWorkoutSessions, setTodayWorkoutSessions] = useState<any[]>([]);
	const [aiInsight, setAiInsight] = useState('');

	// Fetch daily stats from backend
	const fetchDailyStats = useCallback(async () => {
		try {
			const stats: DailyStats = await apiService.getDailyStats();
			setTodayStats({
				calories: stats.calories_burned,
				steps: stats.estimated_steps,
				minutes: stats.workout_minutes
			});
			console.log('📊 Daily stats updated:', {
				calories: stats.calories_burned,
				steps: stats.estimated_steps,
				minutes: stats.workout_minutes,
				lastUpdated: stats.last_updated
			});
		} catch (error) {
			console.error('❌ Failed to fetch daily stats:', error);
			// Keep default values on error (resets to 0)
			setTodayStats({
				calories: 0,
				steps: 0,
				minutes: 0
			});
		}
	}, []);

	// Fetch today's workout sessions
	const fetchTodayWorkoutSessions = useCallback(async () => {
		try {
			const today = new Date().toISOString().split('T')[0];
			const sessions = await apiService.getWorkoutSessions(today, today);
			setTodayWorkoutSessions(sessions.results || []);
			console.log('🏋️ Today\'s workout sessions loaded:', sessions.results?.length || 0);
		} catch (error) {
			console.error('❌ Failed to fetch workout sessions:', error);
			setTodayWorkoutSessions([]);
		}
	}, []);

	// Combined data loading function
	const loadAllData = useCallback(async () => {
		setIsLoading(true);
		try {
			// Load both stats and sessions in parallel for better performance
			await Promise.all([
				fetchDailyStats().catch(err => {
					console.warn('⚠️ Failed to load daily stats:', err);
					// Don't throw, just continue
				}),
				fetchTodayWorkoutSessions().catch(err => {
					console.warn('⚠️ Failed to load workout sessions:', err);
					// Don't throw, just continue
				})
			]);
		} catch (error) {
			console.error('❌ Failed to load data:', error);
		} finally {
			setIsLoading(false);
		}
	}, [fetchDailyStats, fetchTodayWorkoutSessions]);

	// Initial load and refresh
	useEffect(() => {
		loadAllData();
	}, [loadAllData]);

	// Listen for workout completion events and handle 24-hour reset
	useEffect(() => {
		const checkForWorkoutCompletion = async () => {
			try {
				const AsyncStorage = require('@react-native-async-storage/async-storage').default;
				const workoutCompleted = await AsyncStorage.getItem('workout_completed');

				if (workoutCompleted) {
					console.log('🔄 Workout completion detected, refreshing stats...');
					await loadAllData();
					// Clear the trigger
					await AsyncStorage.removeItem('workout_completed');
				}
			} catch (error) {
				console.warn('⚠️ Could not check for workout completion:', error);
			}
		};

		// Check for 24-hour reset (new day)
		const checkForDayReset = async () => {
			try {
				const AsyncStorage = require('@react-native-async-storage/async-storage').default;
				const lastResetDate = await AsyncStorage.getItem('last_stats_reset');
				const today = new Date().toDateString();

				if (lastResetDate !== today) {
					console.log('🌅 New day detected, resetting stats...');
					// Reset to initial values
					setTodayStats({
						calories: 0,
						steps: 0,
						minutes: 0
					});
					// Update reset date
					await AsyncStorage.setItem('last_stats_reset', today);
					// Fetch fresh stats for new day
					await fetchDailyStats();
				}
			} catch (error) {
				console.warn('⚠️ Could not check for day reset:', error);
			}
		};

		// Check immediately and then every 5 seconds
		checkForWorkoutCompletion();
		checkForDayReset();

		const workoutInterval = setInterval(checkForWorkoutCompletion, 5000);
		const dayResetInterval = setInterval(checkForDayReset, 60000); // Check every minute for day change

		return () => {
			clearInterval(workoutInterval);
			clearInterval(dayResetInterval);
		};
	}, [fetchDailyStats]);

	// Pull-to-refresh functionality
	const handleRefresh = useCallback(async () => {
		setRefreshing(true);
		await loadAllData();
		setRefreshing(false);
	}, [loadAllData]);

	// Don't load AI insights automatically to prevent errors during onboarding
	// User can access AI features from the AI chatbot when ready
	useEffect(() => {
		setAiInsight('Welcome to ZoeFit! Complete your profile to get personalized insights.');
	}, []);

	// Removed automatic AI insights loading to prevent errors during onboarding
	// Users can access AI features through the AI chatbot when ready

	// Menu handlers
	const handleMenuPress = () => {
		setShowMenu(!showMenu);
	};

	const handleAchievements = () => {
		setShowMenu(false);
		// For now, show a placeholder message
		alert('Achievements section coming soon!');
	};

	const handleWorkoutHistory = () => {
		setShowMenu(false);
		router.push('/screens/workout-history' as any);
	};

	const handleLogout = async () => {
		setShowMenu(false);
		try {
			await authService.logout();
			router.replace('/screens/welcomePage' as any);
		} catch (error) {
			console.error('Logout error:', error);
		}
	};

	const handleAiChatbotPress = () => {
		router.push('/screens/aiChatbot' as any);
	};

	const updateCalories = (newCalories: number) => {
		setTodayStats(prev => ({ ...prev, calories: newCalories }));
	};

	const updateSteps = (newSteps: number) => {
		setTodayStats(prev => ({ ...prev, steps: newSteps }));
	};

	const updateMinutes = (newMinutes: number) => {
		setTodayStats(prev => ({ ...prev, minutes: newMinutes }));
	};

	return (
		<View style={{ flex: 1, backgroundColor: theme.background }}>
			<SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top']}>
				<ScrollView
					style={[styles.container, { backgroundColor: theme.background }]}
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
					}
				>
					{/* HEADER */}
					<LinearGradient colors={isDarkMode ? ['#667eea', '#764ba2', '#f093fb'] : theme.headerGradient} style={styles.header}>
						<View style={styles.headerTop}>
					    <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
									<Text style={styles.menuIcon}>⋮</Text>
								</TouchableOpacity>
							<Text style={styles.logo}>Zoefit</Text>
							<View style={styles.headerButtons}>
								<TouchableOpacity onPress={handleAiChatbotPress} style={styles.aiButton}>
									<Text style={styles.aiIcon}>🤖</Text>
									{isAiActive && <Text style={styles.aiStatus}>Active</Text>}
								</TouchableOpacity>
								
							</View>
						</View>
						
						{/* Menu Dropdown */}
						{showMenu && (
							<View style={[styles.menuDropdown, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
								<TouchableOpacity style={styles.menuItem} onPress={handleAchievements}>
									<Text style={[styles.menuItemText, { color: theme.text }]}>🏆 Achievements</Text>
								</TouchableOpacity>
								<TouchableOpacity style={styles.menuItem} onPress={handleWorkoutHistory}>
									<Text style={[styles.menuItemText, { color: theme.text }]}>📋 Workout History</Text>
								</TouchableOpacity>
								<TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
									<Text style={[styles.menuItemText, { color: theme.text }]}>🚪 Logout</Text>
								</TouchableOpacity>
							</View>
						)}
						
						<View style={styles.welcomeCardGlass}>
							<Text style={styles.welcome}>Welcome Back 👋</Text>
							<Text style={styles.sub}>Ready to crush your fitness goals today?</Text>
						</View>
					</LinearGradient>

					{/* OVERVIEW RINGS */}
					<Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Overview</Text>
					{isLoading ? (
						<View style={styles.ringRow}>
							<ActivityIndicator size="large" color="#00e0ff" />
						</View>
					) : (
						<View style={styles.ringRow}>
							<Ring label="Calories" value={todayStats.calories} fill={Math.min((todayStats.calories / 2000) * 100, 100)} color="#00e0ff" />
							<Ring label="Steps" value={todayStats.steps.toLocaleString()} fill={Math.min((todayStats.steps / 10000) * 100, 100)} color="#43e97b" />
							<Ring label="Minutes" value={todayStats.minutes} fill={Math.min((todayStats.minutes / 60) * 100, 100)} color="#ff9a9e" />
						</View>
					)}

					{/* TODAY'S WORKOUT SESSIONS */}
					<Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Workouts</Text>
					{todayWorkoutSessions.length > 0 ? (
						<View style={styles.workoutSessionsContainer}>
							{todayWorkoutSessions.map((session, index) => (
								<View key={index} style={[styles.workoutSessionCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
									<View style={styles.workoutSessionHeader}>
										<Text style={[styles.workoutType, { color: theme.text }]}>
											{session.workout_plan?.workout_type || 'Workout'}
										</Text>
										<Text style={[styles.workoutDuration, { color: theme.textSecondary }]}>
											{session.duration_minutes || 0} min
										</Text>
									</View>
									<View style={styles.workoutSessionDetails}>
										<Text style={[styles.workoutCalories, { color: theme.textSecondary }]}>
											🔥 {session.calories_burned || 0} cal
										</Text>
										<Text style={[styles.workoutStatus, {
											color: session.completed ? '#43e97b' : '#ffa726'
										}]}>
											{session.completed ? '✅ Completed' : '⏳ In Progress'}
										</Text>
									</View>
									{session.exercises_completed && session.exercises_completed.length > 0 && (
										<Text style={[styles.exercisesText, { color: theme.textSecondary }]}>
											{session.exercises_completed.length} exercises completed
										</Text>
									)}
								</View>
							))}
						</View>
					) : (
						<View style={[styles.emptyWorkoutCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
							<Text style={[styles.emptyWorkoutText, { color: theme.textSecondary }]}>
								No workouts yet today. Start one to see your progress!
							</Text>
						</View>
					)}

					{/* AI COACH */}
					<TouchableOpacity
						style={[styles.aiCardGlass, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
						onPress={() => router.push('/screens/aiChatbot' as any)}
					>
						<Text style={[styles.aiTitle, { color: theme.text }]}>🤖 Smart Fitness Coach</Text>
						<Text style={[styles.aiText, { color: theme.textSecondary }]}>{aiInsight}</Text>
					</TouchableOpacity>

					{/* QUICK ACTIONS */}
					<Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
					<View style={styles.grid}>
						<ActionCard icon="🏋️" title="Workout" onPress={() => router.push('/StartWorkout')} />
						<ActionCard icon="📊" title="Progress" onPress={() => router.push('/screens/progress')} />
						<ActionCard icon="🥗" title="Nutrition" />
						<ActionCard icon="😴" title="Sleep" />
					</View>

					{/* BADGES */}
					{/*<Text style={[styles.sectionTitle, { color: theme.text }]}>Your Progress</Text>
					<View style={styles.badgeRow}>
						<View style={[styles.badgeGlass, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
							<Text style={[styles.badgeText, { color: theme.text }]}>🔥 7 Day Streak</Text>
						</View>
						<View style={[styles.badgeGlass, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
							<Text style={[styles.badgeText, { color: theme.text }]}>👟 10,000 Steps</Text>
						</View>
					</View>*/}

					{/* QUOTE */}
					<LinearGradient colors={theme.headerGradient} style={styles.quoteCardGlass}>
						<Text style={styles.quote}>"The only bad workout is the one that didn't happen"</Text>
						<Text style={styles.quoteAuthor}>-Joe Cirulli</Text>
					</LinearGradient>
				</ScrollView>
			</SafeAreaView>
		</View >

	);
};

// ----------------
// Components
// ----------------
type RingProps = {
	label: string;
	value: string | number;
	fill: number;
	color: string;
};

const Ring = ({ label, value, fill, color }: RingProps) => {
	const { theme } = useTheme();
	return (
		<View style={[styles.ring, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
			<View style={[styles.ringCircle, { borderColor: color, backgroundColor: theme.cardBackground }]}>
				<Text style={[styles.ringText, { color: theme.text }]}>{value}</Text>
			</View>
			<Text style={[styles.ringLabel, { color: theme.textSecondary }]}>{label}</Text>
		</View>
	);
};

type ActionCardProps = {
	icon: string;
	title: string;
	onPress?: () => void;
};

const ActionCard = ({ icon, title, onPress }: ActionCardProps) => {
	const { theme } = useTheme();
	const scale = useRef(new Animated.Value(1)).current;
	const onPressIn = () => {
		Animated.spring(scale, { toValue: 0.96, useNativeDriver: false }).start();
	};
	const onPressOut = () => {
		Animated.spring(scale, { toValue: 1, useNativeDriver: false }).start();
	};
	return (
		<Animated.View style={[styles.actionCard, { backgroundColor: theme.cardBackground, borderColor: theme.border, transform: [{ scale }] }]}>
			<TouchableOpacity
				activeOpacity={0.8}
				onPressIn={onPressIn}
				onPressOut={onPressOut}
				onPress={onPress}
				style={{ alignItems: 'center', width: '100%' }}
			>
				<Text style={styles.actionIcon}>{icon}</Text>
				<Text style={[styles.actionText, { color: theme.text }]}>{title}</Text>
			</TouchableOpacity>
		</Animated.View>
	);
};

// ----------------
// Bottom Navigation
// ----------------
type BottomNavProps = {
	router: any;
};

// const BottomNav = ({ router }: BottomNavProps) => (
// 	<View style={styles.bottomNav}>
// 		<TouchableOpacity style={styles.navItem}>
// 			<Text style={styles.navIcon}>🏠</Text>
// 			<Text style={styles.navLabel}>Home</Text>
// 		</TouchableOpacity>
// 		<TouchableOpacity style={styles.navItem} onPress={() => router.push('/Zoefit/workout')}>
// 			<Text style={styles.navIcon}>💪</Text>
// 			<Text style={styles.navLabel}>Workout</Text>
// 		</TouchableOpacity>
// 		<TouchableOpacity style={styles.navItem}>
// 			<Text style={styles.navIcon}>🍽️</Text>
// 			<Text style={styles.navLabel}>Nutrition</Text>
// 		</TouchableOpacity>
// 		<TouchableOpacity style={styles.navItem}>
// 			<Text style={styles.navIcon}>👤</Text>
// 			<Text style={styles.navLabel}>Profile</Text>
// 		</TouchableOpacity>
// 	</View>
// );

export default HomeScreen;

// ----------------
// Styles
// ----------------
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#eafcf7",
	},
	header: {
		padding: 20,
		borderBottomLeftRadius: 30,
		borderBottomRightRadius: 30,
		shadowColor: '#43e97b',
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.2,
		shadowRadius: 16,
		elevation: 10,
		overflow: 'hidden',
	},
	headerTop: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	logo: {
		color: "#fff",
		fontSize: 32,
		fontWeight: "800",
		// letterSpacing: 1,
		fontFamily: 'System',
		textShadowColor: 'rgba(56, 249, 215, 0.4)',
		textShadowOffset: { width: 0, height: 3 },
		textShadowRadius: 12,
		lineHeight: 38,
	},
	aiButton: {
		backgroundColor: 'rgba(255,255,255,0.18)',
		borderRadius: 20,
		padding: 8,
		alignItems: 'center',
		shadowColor: '#43e97b',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.12,
		shadowRadius: 8,
	},
	aiIcon: {
		fontSize: 24,
		color: '#fff',
	},
	aiStatus: {
		fontSize: 10,
		color: '#FFD43B',
		fontWeight: 'bold',
		marginTop: 2,
	},
	welcomeCardGlass: {
		marginTop: 15,
		backgroundColor: 'rgba(255,255,255,0.18)',
		borderRadius: 20,
		padding: 18,
		shadowColor: '#43e97b',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.12,
		shadowRadius: 12,
	},
	welcome: {
		fontSize: 26,
		color: "#fff",
		fontWeight: "bold",
		letterSpacing: 1,
	},
	sub: {
		color: "#eafff5",
		marginTop: 5,
		fontSize: 15,
		fontWeight: '500',
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "bold",
		margin: 15,
		color: '#2e7d32',
		letterSpacing: 0.5,
	},
	// Workout Sessions Styles
	workoutSessionsContainer: {
		marginHorizontal: 15,
		marginBottom: 20,
	},
	workoutSessionCard: {
		padding: 15,
		borderRadius: 12,
		borderWidth: 1,
		marginBottom: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	workoutSessionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 8,
	},
	workoutType: {
		fontSize: 16,
		fontWeight: 'bold',
	},
	workoutDuration: {
		fontSize: 14,
	},
	workoutSessionDetails: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 5,
	},
	workoutCalories: {
		fontSize: 13,
	},
	workoutStatus: {
		fontSize: 12,
		fontWeight: '600',
	},
	exercisesText: {
		fontSize: 12,
		fontStyle: 'italic',
		marginTop: 5,
	},
	emptyWorkoutCard: {
		padding: 20,
		borderRadius: 12,
		borderWidth: 1,
		marginHorizontal: 15,
		marginBottom: 20,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 2,
		elevation: 1,
	},
	emptyWorkoutText: {
		fontSize: 14,
		textAlign: 'center',
		fontStyle: 'italic',
	},
	ringRow: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginBottom: 10,
	},
	ring: {
		alignItems: "center",
		backgroundColor: 'rgba(255,255,255,0.18)',
		borderRadius: 18,
		padding: 10,
		marginHorizontal: 4,
		shadowColor: '#43e97b',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.10,
		shadowRadius: 8,
		elevation: 8,
		borderWidth: 1,
		borderColor: 'rgba(67,233,123,0.08)',
	},
	ringCircle: {
		width: 80,
		height: 80,
		borderRadius: 40,
		borderWidth: 8,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#fff',
	},
	ringText: {
		fontWeight: "bold",
		fontSize: 18,
		color: '#00b894',
		textShadowColor: '#eafff5',
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 4,
	},
	ringLabel: {
		marginTop: 5,
		color: "#555",
		fontWeight: '600',
		fontSize: 13,
	},
	aiCardGlass: {
		backgroundColor: 'rgba(255,255,255,0.18)',
		margin: 15,
		padding: 18,
		borderRadius: 20,
		shadowColor: '#43e97b',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.12,
		shadowRadius: 12,
		alignItems: 'center',
	},
	aiTitle: {
		fontWeight: "bold",
		marginBottom: 5,
		fontSize: 18,
		color: '#2e7d32',
	},
	aiText: {
		color: "#555",
		fontSize: 15,
		fontWeight: '500',
		textAlign: 'center',
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-around",
		marginBottom: 10,
	},
	actionCard: {
		width: "44%",
		backgroundColor: 'rgba(255,255,255,0.18)',
		padding: 20,
		borderRadius: 18,
		alignItems: "center",
		marginVertical: 10,
		elevation: 3,
		shadowColor: '#43e97b',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.10,
		shadowRadius: 8,
	},
	actionIcon: {
		fontSize: 32,
		marginBottom: 6,
	},
	actionText: {
		marginTop: 5,
		fontWeight: "bold",
		fontSize: 15,
		color: '#2e7d32',
	},
	
	quoteCardGlass: {
		margin: 15,
		padding: 20,
		borderRadius: 20,
		alignItems: "center",
		backgroundColor: 'rgba(255,255,255,0.18)',
		shadowColor: '#43e97b',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.10,
		shadowRadius: 8,
	},
	quote: {
		color: "#fff",
		fontStyle: "italic",
		textAlign: "center",
		fontSize: 16,
		fontWeight: '600',
		textShadowColor: '#38ef7d',
		textShadowOffset: { width: 0, height: 1 },
		textShadowRadius: 4,
	},
	quoteAuthor: {
		color: "#eafff5",
		marginTop: 5,
		fontSize: 13,
		fontWeight: '500',
	},
	fab: {
		position: 'absolute',
		bottom: 32,
		right: 28,
		zIndex: 100,
		shadowColor: '#43e97b',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.18,
		shadowRadius: 12,
		elevation: 8,
	},
	fabGradient: {
		width: 64,
		height: 64,
		borderRadius: 32,
		alignItems: 'center',
		justifyContent: 'center',
	},
	fabIcon: {
		color: '#fff',
		fontSize: 36,
		fontWeight: 'bold',
		textShadowColor: '#38f9d7',
		textShadowOffset: { width: 0, height: 2 },
		textShadowRadius: 8,
	},
	bottomNav: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		backgroundColor: 'rgba(255,255,255,0.85)',
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		paddingVertical: 10,
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		shadowColor: '#43e97b',
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 12,
		zIndex: 200,
	},
	navItem: {
		alignItems: 'center',
		flex: 1,
	},
	navIcon: {
		fontSize: 24,
		marginBottom: 2,
	},
	navLabel: {
		fontSize: 12,
		color: '#2e7d32',
		fontWeight: '600',
	},
	headerButtons: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	menuButton: {
		backgroundColor: 'rgba(255,255,255,0.3)',
		borderRadius: 20,
		padding: 10,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#43e97b',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.12,
		shadowRadius: 8,
		minWidth: 45,
		minHeight: 28,
	},
	menuIcon: {
		fontSize: 24,
		color: '#fff',
		fontWeight: 'bold',
	},
	menuDropdown: {
		position: 'absolute',
		top: 40,
		left: 20,
		backgroundColor: 'rgba(255,255,255,0.95)',
		borderRadius: 12,
		padding: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 8,
		zIndex: 1000,
		minWidth: 180,
	},
	menuItem: {
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 8,
		marginVertical: 2,
	},
	menuItemText: {
		fontSize: 16,
		fontWeight: '500',
	},
});
