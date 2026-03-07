import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeContext';
import { aiService } from '../../services/ai';
import { authService } from '../../services/auth';
import { ChatHistory } from '../../services/api';

const { width: screenWidth } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

const AIChatbotScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadChatHistory();
    // Add welcome message
    setMessages([
      {
        id: 'welcome',
        text: "Hi! I'm your AI fitness coach. I can help you with workout plans, nutrition advice, and motivation. What would you like to know?",
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      // Check if user is authenticated first
      const isAuth = await authService.isAuthenticated();
      if (!isAuth) {
        console.log('⚠️ User not authenticated, skipping chat history load');
        return;
      }

      const history = await aiService.getChatHistory();
      setChatHistory(history);
      console.log('✅ Chat history loaded:', history.length, 'messages');
    } catch (error) {
      console.warn('⚠️ Could not load chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    // Check if user is authenticated
    const isAuth = await authService.isAuthenticated();
    if (!isAuth) {
      Alert.alert('Authentication Required', 'Please log in to use the AI chatbot.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      text: '',
      isUser: false,
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await aiService.chatWithAI(userMessage.text);

      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Show suggestions if available
      if (response.suggestions && response.suggestions.length > 0) {
        const suggestionsMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: `💡 Suggestions: ${response.suggestions.join(', ')}`,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, suggestionsMessage]);
      }

      console.log('✅ AI response received:', response);
    } catch (error) {
      console.error('❌ Failed to get AI response:', error);

      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
    setTimeout(() => sendMessage(), 100);
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const { theme } = useTheme();

    if (message.isTyping) {
      return (
        <View style={[styles.messageContainer, styles.typingContainer]}>
          <ActivityIndicator size="small" color={theme.primary} />
          <Text style={[styles.typingText, { color: theme.textSecondary }]}>
            AI Coach is thinking...
          </Text>
        </View>
      );
    }

    return (
      <View style={[
        styles.messageContainer,
        message.isUser
          ? styles.userMessageContainer
          : styles.aiMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          message.isUser
            ? [styles.userBubble, { backgroundColor: theme.primary }]
            : [styles.aiBubble, { backgroundColor: theme.cardBackground, borderColor: theme.border }]
        ]}>
          <Text style={[
            styles.messageText,
            { color: message.isUser ? '#fff' : theme.text }
          ]}>
            {message.text}
          </Text>
        </View>
        <Text style={[
          styles.messageTime,
          { color: theme.textSecondary }
        ]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    );
  };

  const quickQuestions = [
    "What's a good workout for beginners?",
    "How can I lose weight effectively?",
    "What should I eat before a workout?",
    "How do I stay motivated?",
    "What are the best protein sources?",
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <LinearGradient
          colors={theme.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>AI Fitness Coach 🤖</Text>
              <Text style={styles.headerSubtitle}>Your personal fitness assistant</Text>
            </View>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>

        {/* Quick Questions */}
        {messages.length <= 1 && (
          <View style={styles.quickQuestionsContainer}>
            <Text style={[styles.quickQuestionsTitle, { color: theme.text }]}>
              Quick Questions:
            </Text>
            <View style={styles.quickQuestionsGrid}>
              {quickQuestions.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.quickQuestionButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                  onPress={() => handleQuickQuestion(question)}
                >
                  <Text style={[styles.quickQuestionText, { color: theme.text }]}>
                    {question}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </ScrollView>

        {/* Input Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <View style={[styles.inputWrapper, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <TextInput
              style={[styles.textInput, { color: theme.text }]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me anything about fitness..."
              placeholderTextColor={theme.textSecondary}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: theme.primary },
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.sendButtonText}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  quickQuestionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  quickQuestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  quickQuestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickQuestionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickQuestionText: {
    fontSize: 12,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesContent: {
    paddingVertical: 10,
  },
  messageContainer: {
    marginBottom: 15,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: screenWidth * 0.75,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  userBubble: {
    borderBottomRightRadius: 5,
  },
  aiBubble: {
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    marginHorizontal: 5,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  typingText: {
    marginLeft: 10,
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 25,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 8,
    minHeight: 50,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingTop: 8,
  },
  sendButton: {
    marginLeft: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AIChatbotScreen;
