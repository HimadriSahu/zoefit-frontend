import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	Dimensions,
	TouchableOpacity,
	Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get("window").width;

const HomeScreen = () => {
  const router = useRouter();
  const [isAiActive, setIsAiActive] = useState(false);

  const handleAiPress = () => {
    setIsAiActive(!isAiActive);
    setTimeout(() => {
      setIsAiActive(false);
    }, 2000);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#eafcf7' }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* HEADER */}
          <LinearGradient colors={["#43e97b", "#38f9d7"]} style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.logo}>Zoefit</Text>
              <TouchableOpacity onPress={handleAiPress} style={styles.aiButton}>
                <Text style={styles.aiIcon}>🤖</Text>
                {isAiActive && <Text style={styles.aiStatus}>Active</Text>}
              </TouchableOpacity>
            </View>
            <View style={styles.welcomeCardGlass}>
              <Text style={styles.welcome}>Welcome Back 👋</Text>
              <Text style={styles.sub}>Ready to crush your fitness goals today?</Text>
            </View>
          </LinearGradient>

          {/* OVERVIEW RINGS */}
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.ringRow}>
            <Ring label="Calories" value="650" fill={70} color="#00e0ff" />
            <Ring label="Steps" value="4,000" fill={50} color="#43e97b" />
            <Ring label="Minutes" value="30" fill={30} color="#ff9a9e" />
          </View>

          {/* AI COACH */}
          <View style={styles.aiCardGlass}>
            <Text style={styles.aiTitle}>🤖 Smart Fitness Coach</Text>
            <Text style={styles.aiText}>Based on your progress, try a 20-min HIIT workout today.</Text>
          </View>

          {/* QUICK ACTIONS */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.grid}>
            <ActionCard icon="🏋️" title="Workout" onPress={() => router.push('/Zoefit/workout')} />
            <ActionCard icon="📊" title="Progress" onPress={() => router.push('/screens/progress')} />
            <ActionCard icon="🥗" title="Nutrition" />
            <ActionCard icon="😴" title="Sleep" />
          </View>

          {/* BADGES */}
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badgeGlass}>
              <Text>🔥 7 Day Streak</Text>
            </View>
            <View style={styles.badgeGlass}>
              <Text>👟 10,000 Steps</Text>
            </View>
          </View>

          {/* QUOTE */}
          <LinearGradient colors={["#11998e", "#38ef7d"]} style={styles.quoteCardGlass}>
            <Text style={styles.quote}>"The only bad workout is the one that didn't happen"</Text>
            <Text style={styles.quoteAuthor}>– Unknown</Text>
          </LinearGradient>
        </ScrollView>
      </SafeAreaView>
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

const Ring = ({ label, value, fill, color }: RingProps) => (
	<View style={styles.ring}>
		<View style={[styles.ringCircle, { borderColor: color }]}>
			<Text style={styles.ringText}>{value}</Text>
		</View>
		<Text style={styles.ringLabel}>{label}</Text>
	</View>
);

type ActionCardProps = {
	icon: string;
	title: string;
	onPress?: () => void;
};

const ActionCard = ({ icon, title, onPress }: ActionCardProps) => {
	const scale = useRef(new Animated.Value(1)).current;
	const onPressIn = () => {
		Animated.spring(scale, { toValue: 0.96, useNativeDriver: false }).start();
	};
	const onPressOut = () => {
		Animated.spring(scale, { toValue: 1, useNativeDriver: false }).start();
	};
	return (
		<Animated.View style={[styles.actionCard, { transform: [{ scale }] }]}> 
			<TouchableOpacity
				activeOpacity={0.8}
				onPressIn={onPressIn}
				onPressOut={onPressOut}
				onPress={onPress}
				style={{ alignItems: 'center', width: '100%' }}
			>
				<Text style={styles.actionIcon}>{icon}</Text>
				<Text style={styles.actionText}>{title}</Text>
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
		fontSize: 28,
		fontWeight: "bold",
		letterSpacing: 2,
		textShadowColor: '#38f9d7',
		textShadowOffset: { width: 0, height: 2 },
		textShadowRadius: 8,
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
	badgeRow: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginBottom: 10,
	},
	badgeGlass: {
		backgroundColor: 'rgba(255,255,255,0.18)',
		padding: 15,
		borderRadius: 15,
		elevation: 2,
		minWidth: 120,
		alignItems: 'center',
		shadowColor: '#43e97b',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.10,
		shadowRadius: 8,
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
});
