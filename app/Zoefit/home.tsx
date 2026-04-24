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
	TouchableWithoutFeedback,
	Image,
	Alert,
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

	// Side panel animation
	const slideAnim = useRef(new Animated.Value(-screenWidth)).current;

	const [todayStats, setTodayStats] = useState({
		calories: 0,
		steps: 0,
		minutes: 0
	});
	const [todayWorkoutSessions, setTodayWorkoutSessions] = useState<any[]>([]);
	const [completedWorkoutSessions, setCompletedWorkoutSessions] = useState<any[]>([]);
	const [aiInsight, setAiInsight] = useState('');
	const [userData, setUserData] = useState<any>(null);

	// Fetch daily stats from backend (now only for reference)
	const fetchDailyStats = useCallback(async () => {
		// Skip backend daily stats since we calculate from completed workouts only
		console.log('📊 Using local calculation from completed workouts only');
		return;
	}, []);

	// Calculate accurate stats from completed workouts only
	const calculateAccurateStats = useCallback(() => {
		let totalMinutes = 0;
		let totalCalories = 0;
		let totalSteps = 0;

		completedWorkoutSessions.forEach(session => {
			totalMinutes += session.duration_minutes || 0;
			totalCalories += session.calories_burned || 0;
			// Steps are estimated per workout - use a reasonable estimate
			if (session.duration_minutes && session.duration_minutes > 0) {
				totalSteps += Math.round(session.duration_minutes * 100); // ~100 steps per minute of workout
			}
		});

		return {
			calories: totalCalories,
			steps: totalSteps,
			minutes: totalMinutes
		};
	}, [completedWorkoutSessions]);

	// Update stats when completed workouts change
	useEffect(() => {
		const accurateStats = calculateAccurateStats();
		setTodayStats(accurateStats);
		console.log('📊 Accurate stats from completed workouts:', accurateStats);
	}, [calculateAccurateStats]);

	// Fetch today's workout sessions with retry logic
	const fetchTodayWorkoutSessions = useCallback(async (retryCount = 0): Promise<void> => {
		const maxRetries = 2;

		try {
			const today = new Date().toISOString().split('T')[0];
			// Fetch all workout sessions and filter for today
			const allSessions = await apiService.getWorkoutSessions();
			const todaysSessions = allSessions.workout_sessions.filter((session: any) => {
				// Handle both created_at and start_time fields, with proper date validation
				const dateField = session.created_at || session.start_time;
				if (!dateField) return false;

				try {
					const sessionDate = new Date(dateField).toISOString().split('T')[0];
					return sessionDate === today;
				} catch (error) {
					console.warn('⚠️ Invalid date format for session:', dateField);
					return false;
				}
			});
			setTodayWorkoutSessions(todaysSessions || []);

			// Filter only completed workouts for accurate stats
			const completedSessions = (allSessions.workout_sessions || []).filter(session => session.completed === true);
			setCompletedWorkoutSessions(completedSessions);

			console.log('🏋️ Today\'s workout sessions loaded:', allSessions.workout_sessions?.length || 0);
			console.log('✅ Completed workout sessions:', completedSessions.length);
		} catch (error: any) {
			console.error('❌ Failed to fetch workout sessions:', error);

			// Retry on network failures
			if (retryCount < maxRetries &&
				(error?.message?.includes('Network request failed') ||
					error?.message?.includes('Aborted') ||
					error?.message?.includes('Failed to connect'))) {
				console.log(`🔄 Retrying workout sessions fetch (${retryCount + 1}/${maxRetries})...`);
				setTimeout(() => fetchTodayWorkoutSessions(retryCount + 1), 1000 * (retryCount + 1));
				return;
			}

			// Only redirect to login if it's a clear authentication error (not network issues)
			if (error?.message?.includes('Authentication expired') ||
				error?.message?.includes('AUTH_EXPIRED') ||
				error?.status === 401) {
				// Double-check it's not a network error masquerading as auth error
				if (!error?.message?.includes('Network request failed') &&
					!error?.message?.includes('Aborted') &&
					!error?.message?.includes('Failed to connect')) {
					console.log('🔐 Authentication expired, redirecting to login...');
					router.replace('/LoginScreen');
					return;
				}
			}

			setTodayWorkoutSessions([]);
		}
	}, [router]);

	// Fetch user data
	const fetchUserData = useCallback(async () => {
		try {
			const AsyncStorage = require('@react-native-async-storage/async-storage').default;
			const userDataStr = await AsyncStorage.getItem('user_data');
			if (userDataStr) {
				const user = JSON.parse(userDataStr);
				setUserData(user);
				console.log('👤 User data loaded:', user);
			}
		} catch (error) {
			console.warn('⚠️ Could not load user data:', error);
		}
	}, []);

	// Combined data loading function
	const loadAllData = useCallback(async () => {
		setIsLoading(true);
		try {
			// Load stats, sessions, and user data in parallel for better performance
			await Promise.all([
				fetchDailyStats().catch(err => {
					console.warn('⚠️ Failed to load daily stats:', err);
					// Don't throw, just continue
				}),
				fetchTodayWorkoutSessions().catch(err => {
					console.warn('⚠️ Failed to load workout sessions:', err);
					// Don't throw, just continue
				}),
				fetchUserData().catch(err => {
					console.warn('⚠️ Failed to load user data:', err);
					// Don't throw, just continue
				})
			]);
		} catch (error) {
			console.error('❌ Failed to load data:', error);
		} finally {
			setIsLoading(false);
		}
	}, [fetchDailyStats, fetchTodayWorkoutSessions, fetchUserData]);

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
					// Clear trigger
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
					setCompletedWorkoutSessions([]); // Clear completed workouts too
					// Update reset date
					await AsyncStorage.setItem('last_stats_reset', today);
					// Don't need to fetch from backend since we calculate locally
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

	// Only load AI insights if user has completed onboarding
	useEffect(() => {
		const loadAIInsight = async () => {
			try {
				// Check if user has completed onboarding
				const hasCompletedOnboarding = await authService.hasCompletedOnboarding();

				if (!hasCompletedOnboarding) {
					setAiInsight('Welcome to ZoeFit! Complete your profile to get personalized insights.');
					return;
				}

				const insights = await apiService.getAIInsights();
				if (insights?.insights?.length > 0) {
					setAiInsight(insights.insights[0]);
				} else {
					setAiInsight('Welcome to ZoeFit! Complete your profile to get personalized insights.');
				}
			} catch (error: any) {
				console.warn('Could not load AI insights:', error);
				// Check if error is related to missing health metrics or generic endpoint error
				if (error?.message?.includes('Health metrics not found') ||
					error?.message?.includes('health profile') ||
					error?.message?.includes('create your health profile first') ||
					error?.message?.includes('Endpoint not found: AI Insights')) {
					setAiInsight('Complete your health profile to get personalized AI insights and recommendations.');
					Alert.alert(
						'Complete Your Profile',
						'Please complete your health profile to get personalized AI insights and recommendations.',
						[
							{
								text: 'Cancel',
								style: 'cancel',
							},
							{
								text: 'Complete Profile',
								onPress: () => router.push('/screens/personal-info'),
							},
						]
					);
				} else {
					setAiInsight('Welcome to ZoeFit! Complete your profile to get personalized insights.');
				}
			}
		};

		loadAIInsight();
	}, []);

	// Removed automatic AI insights loading to prevent errors during onboarding
	// Users can access AI features through AI chatbot when ready

	// Menu handlers
	const handleMenuPress = () => {
		setShowMenu(!showMenu);
		if (!showMenu) {
			// Open side panel from left
			Animated.timing(slideAnim, {
				toValue: 0,
				duration: 300,
				useNativeDriver: false,
			}).start();
		} else {
			// Close side panel to left
			Animated.timing(slideAnim, {
				toValue: -screenWidth,
				duration: 300,
				useNativeDriver: false,
			}).start();
		}
	};

	const closeSidePanel = () => {
		setShowMenu(false);
		Animated.timing(slideAnim, {
			toValue: -screenWidth,
			duration: 300,
			useNativeDriver: false,
		}).start();
	};

	const handleAchievements = () => {
		closeSidePanel();
		router.push('/screens/achievements' as any);
	};

	const handleWorkoutHistory = () => {
		closeSidePanel();
		router.push('/screens/workout-history' as any);
	};

	const handleLogout = async () => {
		closeSidePanel();
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
								<Text style={styles.menuIcon}>☰</Text>
							</TouchableOpacity>
							<Text style={styles.logo}>Zoefit</Text>
							<View style={styles.headerButtons}>
								<TouchableOpacity onPress={handleAiChatbotPress} style={styles.aiButton}>
									<Text style={styles.aiIcon}>🤖</Text>
									{isAiActive && <Text style={styles.aiStatus}>Active</Text>}
								</TouchableOpacity>
							</View>
						</View>

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

					{/* QUOTE */}
					<LinearGradient colors={theme.headerGradient} style={styles.quoteCardGlass}>
						<Text style={styles.quote}>"The only bad workout is the one that didn't happen"</Text>
						<Text style={styles.quoteAuthor}>-Joe Cirulli</Text>
					</LinearGradient>
				</ScrollView>
			</SafeAreaView>

			{/* Side Panel Overlay */}
			{showMenu && (
				<TouchableWithoutFeedback onPress={closeSidePanel}>
					<View style={styles.overlay} />
				</TouchableWithoutFeedback>
			)}

			{/* Animated Side Panel */}
			<Animated.View
				style={[
					styles.sidePanel,
					{
						backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.85)',
						borderColor: theme.border,
						transform: [{ translateX: slideAnim }]
					}
				]}
			>
				<SafeAreaView style={styles.sidePanelSafeArea} edges={['top', 'bottom']}>
					<View style={styles.sidePanelHeader}>
						<View style={styles.userInfo}>
							<View style={[styles.profilePicture, { backgroundColor: theme.border }]}>
								{userData?.profile_picture ? (
									<Image source={{ uri: userData.profile_picture }} style={styles.profileImage} />
								) : (
									<Text style={[styles.profileInitial, { color: theme.text }]}>
										{userData?.first_name?.charAt(0)?.toUpperCase() || userData?.email?.charAt(0)?.toUpperCase() || 'U'}
									</Text>
								)}
							</View>
							<View style={styles.userDetails}>
								<Text style={[styles.userName, { color: theme.text }]}>
									{userData?.first_name ? `${userData.first_name} ${userData.last_name || ''}`.trim() : 'User'}
								</Text>
							</View>
						</View>
						<TouchableOpacity onPress={closeSidePanel} style={styles.closeButton}>
							<Text style={[styles.closeButtonText, { color: theme.text }]}>✕</Text>
						</TouchableOpacity>
					</View>

					<View style={styles.sidePanelContent}>
						<TouchableOpacity style={styles.sidePanelItem} onPress={handleAchievements}>
							<Text style={[styles.sidePanelItemText, { color: theme.text }]}>🏆 Achievements</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.sidePanelItem} onPress={handleWorkoutHistory}>
							<Text style={[styles.sidePanelItemText, { color: theme.text }]}>📋 Workout History</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.sidePanelItem} onPress={() => { closeSidePanel(); router.push('/screens/goals-settings' as any); }}>
							<Text style={[styles.sidePanelItemText, { color: theme.text }]}>🎯 Fitness Goals</Text>
						</TouchableOpacity>
						{/* <TouchableOpacity style={styles.sidePanelItem} onPress={() => { closeSidePanel(); router.push('/screens/personal-info' as any); }}>
							<Text style={[styles.sidePanelItemText, { color: theme.text }]}>👤 Personal Info</Text>
						</TouchableOpacity> */}
						<TouchableOpacity style={styles.sidePanelItem} onPress={() => { closeSidePanel(); router.push('/screens/help-support' as any); }}>
							<Text style={[styles.sidePanelItemText, { color: theme.text }]}>❓Help & Support</Text>
						</TouchableOpacity>
					</View>

					{/* Logout at bottom */}
					<View style={styles.logoutContainer}>
						<TouchableOpacity style={[styles.logoutButton, { backgroundColor: '#ff4757' }]} onPress={handleLogout}>
							<Text style={styles.logoutButtonText}>🚪 Logout</Text>
						</TouchableOpacity>
					</View>
				</SafeAreaView>
			</Animated.View>
		</View>
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
		backgroundColor: 'rgba(255,255,255,0.25)',
		borderRadius: 20,
		padding: 18,
		shadowColor: '#43e97b',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.18,
		shadowRadius: 12,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.3)',
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
		fontSize: 18,
		color: '#fff',
		fontWeight: 'bold',
	},
	// Side Panel Styles
	overlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		zIndex: 999,
	},
	sidePanel: {
		position: 'absolute',
		top: 0,
		left: 0,
		bottom: 0,
		width: screenWidth * 0.75,
		maxWidth: 300,
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderColor: '#e0e0e0',
		shadowColor: '#000',
		shadowOffset: { width: 2, height: 0 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 10,
		zIndex: 1000,
	},
	sidePanelSafeArea: {
		flex: 1,
	},
	sidePanelHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: '#e0e0e0',
	},
	userInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	profilePicture: {
		width: 50,
		height: 50,
		borderRadius: 25,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
		borderWidth: 3,
		borderColor: '#3eb088',
		shadowColor: '#3eb088',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 5,
	},
	profileImage: {
		width: 44,
		height: 44,
		borderRadius: 22,
	},
	profileInitial: {
		fontSize: 20,
		fontWeight: 'bold',
	},
	userDetails: {
		flex: 1,
	},
	userName: {
		fontSize: 16,
		fontWeight: '600',
	},
	userEmail: {
		fontSize: 12,
		marginTop: 2,
	},
	closeButton: {
		padding: 8,
		borderRadius: 15,
		backgroundColor: '#f0f0f0',
	},
	closeButtonText: {
		fontSize: 18,
		fontWeight: 'bold',
	},
	sidePanelContent: {
		flex: 1,
		padding: 20,
	},
	sidePanelItem: {
		paddingVertical: 15,
		paddingHorizontal: 20,
		borderRadius: 8,
		marginBottom: 10,
		backgroundColor: '#e7eaedff',
		borderWidth: 1,
		borderColor: '#aecdc2be',
	},
	sidePanelItemText: {
		fontSize: 16,
		fontWeight: '500',
	},
	logoutContainer: {
		padding: 20,
		borderTopWidth: 1,
		borderTopColor: '#e0e0e0',
		marginTop: 'auto',
	},
	logoutButton: {
		paddingVertical: 15,
		paddingHorizontal: 20,
		borderRadius: 8,
		backgroundColor: '#ff4757',
		alignItems: 'center',
	},
	logoutButtonText: {
		fontSize: 16,
		fontWeight: '600',
		color: '#fff',
	},
});
