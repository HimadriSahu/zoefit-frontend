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
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeContext';
import { apiService, ChatHistory } from '../../services/api';

const { width: screenWidth } = Dimensions.get('window');

const ChatHistoryScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();

  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filterOptions = [
    { value: 'all', label: 'All Chats' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ];

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getChatHistory();
      setChatHistory(response.chat_history || []);
    } catch (error) {
      console.error('Error loading chat history:', error);
      Alert.alert('Error', 'Failed to load chat history');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadChatHistory();
  };

  const getFilteredHistory = () => {
    let filtered = [...chatHistory];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(chat =>
        chat.user_message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.ai_response.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply date filter
    const now = new Date();
    switch (selectedFilter) {
      case 'today':
        filtered = filtered.filter(chat => {
          const chatDate = new Date(chat.created_at);
          return chatDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(chat => new Date(chat.created_at) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(chat => new Date(chat.created_at) >= monthAgo);
        break;
    }

    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const getIntentIcon = (intent: string) => {
    const intentIcons: { [key: string]: string } = {
      'workout_advice': '💪',
      'nutrition_info': '🥗',
      'progress_tracking': '📊',
      'motivation': '🔥',
      'injury_concern': '🏥',
      'general_fitness': '🏋️‍♂️',
      'meal_planning': '📝',
      'exercise_technique': '🎯',
    };
    return intentIcons[intent] || '💬';
  };

  const getIntentColor = (intent: string) => {
    const intentColors: { [key: string]: string } = {
      'workout_advice': '#10b981',
      'nutrition_info': '#f59e0b',
      'progress_tracking': '#3b82f6',
      'motivation': '#ef4444',
      'injury_concern': '#8b5cf6',
      'general_fitness': '#06b6d4',
      'meal_planning': '#84cc16',
      'exercise_technique': '#f97316',
    };
    return intentColors[intent] || '#6b7280';
  };

  const handleChatPress = (chat: ChatHistory) => {
    // Navigate to chat with this conversation loaded
    router.push({
      pathname: '/screens/aiChatbot',
      params: { chatId: chat.id.toString() }
    });
  };

  const handleDeleteChat = (chatId: number) => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete chat from backend
              await apiService.deleteChatHistory(chatId);
              setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
              Alert.alert('Success', 'Chat deleted successfully');
            } catch (error) {
              console.error('Error deleting chat:', error);
              Alert.alert('Error', 'Failed to delete chat');
            }
          },
        },
      ]
    );
  };

  const handleMarkHelpful = async (chatId: number, helpful: boolean) => {
    try {
      await apiService.markChatHelpful(chatId, helpful);
      setChatHistory(prev => prev.map(chat =>
        chat.id === chatId ? { ...chat, helpful } : chat
      ));
    } catch (error) {
      console.error('Error marking chat helpful:', error);
    }
  };

  const filteredHistory = getFilteredHistory();

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
          <Text style={styles.headerTitle}>Chat History</Text>
          <TouchableOpacity onPress={() => router.push('/screens/aiChatbot')}>
            <Text style={styles.newChatButton}>+ New</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search conversations..."
              placeholderTextColor={theme.textSecondary}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearIcon}>×</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Filter Options */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filterOptions.map((filter) => (
              <TouchableOpacity
                key={filter.value}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: selectedFilter === filter.value ? theme.primary : theme.cardBackground,
                    borderColor: theme.border,
                  }
                ]}
                onPress={() => setSelectedFilter(filter.value)}
              >
                <Text style={[
                  styles.filterText,
                  { color: selectedFilter === filter.value ? '#fff' : theme.text }
                ]}>
                  {filter.label}
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
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading chat history...</Text>
            </View>
          ) : filteredHistory.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No conversations found</Text>
              <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>
                {searchQuery ? 'Try adjusting your search terms' : 'Start a new conversation with the AI chatbot'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  style={[styles.startChatButton, { backgroundColor: theme.primary }]}
                  onPress={() => router.push('/screens/aiChatbot')}
                >
                  <Text style={styles.startChatButtonText}>Start New Chat</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredHistory.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                style={[styles.chatCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                onPress={() => handleChatPress(chat)}
              >
                <View style={styles.chatHeader}>
                  <View style={styles.chatInfo}>
                    <View style={[styles.intentBadge, { backgroundColor: getIntentColor(chat.intent_detected) }]}>
                      <Text style={styles.intentIcon}>{getIntentIcon(chat.intent_detected)}</Text>
                    </View>
                    <View style={styles.chatMeta}>
                      <Text style={[styles.chatDate, { color: theme.textSecondary }]}>
                        {formatDate(chat.created_at)}
                      </Text>
                      <Text style={[styles.confidenceScore, { color: theme.textSecondary }]}>
                        {Math.round(chat.confidence_score * 100)}% confidence
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.moreButton}
                    onPress={() => {
                      Alert.alert(
                        'Chat Options',
                        'Choose an action',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete Chat',
                            style: 'destructive',
                            onPress: () => handleDeleteChat(chat.id),
                          },
                        ]
                      );
                    }}
                  >
                    <Text style={[styles.moreIcon, { color: theme.textSecondary }]}>⋯</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.chatContent}>
                  <Text style={[styles.userMessage, { color: theme.text }]} numberOfLines={2}>
                    {chat.user_message}
                  </Text>
                  <Text style={[styles.aiResponse, { color: theme.textSecondary }]} numberOfLines={2}>
                    {chat.ai_response}
                  </Text>
                </View>

                <View style={styles.chatActions}>
                  <View style={styles.helpfulSection}>
                    <Text style={[styles.helpfulLabel, { color: theme.textSecondary }]}>Helpful?</Text>
                    <View style={styles.helpfulButtons}>
                      <TouchableOpacity
                        style={[
                          styles.helpfulButton,
                          { backgroundColor: chat.helpful === true ? '#10b981' : 'transparent', borderColor: theme.border }
                        ]}
                        onPress={() => handleMarkHelpful(chat.id, true)}
                      >
                        <Text style={[styles.helpfulButtonText, { color: chat.helpful === true ? '#fff' : theme.text }]}>
                          👍 Yes
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.helpfulButton,
                          { backgroundColor: chat.helpful === false ? '#ef4444' : 'transparent', borderColor: theme.border }
                        ]}
                        onPress={() => handleMarkHelpful(chat.id, false)}
                      >
                        <Text style={[styles.helpfulButtonText, { color: chat.helpful === false ? '#fff' : theme.text }]}>
                          👎 No
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={[styles.viewFullText, { color: theme.primary }]}>View full conversation →</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
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
  newChatButton: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearIcon: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  startChatButton: {
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 24,
  },
  startChatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatCard: {
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
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  chatInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  intentBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  intentIcon: {
    fontSize: 16,
  },
  chatMeta: {
    flex: 1,
  },
  chatDate: {
    fontSize: 14,
    marginBottom: 2,
  },
  confidenceScore: {
    fontSize: 12,
  },
  moreButton: {
    padding: 4,
  },
  moreIcon: {
    fontSize: 16,
  },
  chatContent: {
    marginBottom: 12,
  },
  userMessage: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 22,
  },
  aiResponse: {
    fontSize: 14,
    lineHeight: 20,
  },
  chatActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  helpfulSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpfulLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  helpfulButtons: {
    flexDirection: 'row',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 8,
  },
  helpfulButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  viewFullText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ChatHistoryScreen;
