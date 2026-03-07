import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from './ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const HelpSupportScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [supportMessage, setSupportMessage] = useState('');
  const [subject, setSubject] = useState('');

  const helpCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: '🚀',
      description: 'Learn the basics of ZoeFit',
      color: '#10b981',
    },
    {
      id: 'workouts',
      title: 'Workouts',
      icon: '💪',
      description: 'Workout plans and exercises',
      color: '#f59e0b',
    },
    {
      id: 'nutrition',
      title: 'Nutrition',
      icon: '🥗',
      description: 'Meal plans and dietary guidance',
      color: '#ef4444',
    },
    {
      id: 'tracking',
      title: 'Progress Tracking',
      icon: '📊',
      description: 'Monitor your fitness journey',
      color: '#8b5cf6',
    },
    {
      id: 'account',
      title: 'Account & Settings',
      icon: '⚙️',
      description: 'Manage your profile and preferences',
      color: '#3b82f6',
    },
    {
      id: 'technical',
      title: 'Technical Issues',
      icon: '🔧',
      description: 'Troubleshooting and bug reports',
      color: '#6b7280',
    },
  ];

  const faqData = {
    'getting-started': [
      {
        question: 'How do I start my fitness journey with ZoeFit?',
        answer: 'Begin by completing the onboarding process where you\'ll tell us about your goals, fitness level, and preferences. This helps us create personalized workout and meal plans just for you.'
      },
      {
        question: 'What information do I need to provide during onboarding?',
        answer: 'We\'ll ask for basic information like your age, height, weight, fitness goals, activity level, and dietary preferences. All information is kept private and used only to personalize your experience.'
      },
      {
        question: 'Can I change my goals later?',
        answer: 'Yes! You can update your goals and preferences anytime in the Goals Settings section of the app.'
      }
    ],
    workouts: [
      {
        question: 'How are workout plans generated?',
        answer: 'Our AI creates personalized workout plans based on your fitness level, goals, available equipment, and preferences. Each plan is designed to help you progress safely and effectively.'
      },
      {
        question: 'Can I modify my workout plan?',
        answer: 'While the AI generates the initial plan, you can provide feedback and request adaptations. The more you use the app, the better it understands your preferences.'
      },
      {
        question: 'What if I don\'t have equipment?',
        answer: 'ZoeFit offers bodyweight workout options that require no equipment. You can also select the equipment you have available during onboarding.'
      }
    ],
    nutrition: [
      {
        question: 'How are meal plans created?',
        answer: 'Our AI considers your dietary preferences, restrictions, allergies, and fitness goals to create balanced meal plans that support your objectives.'
      },
      {
        question: 'Can I accommodate dietary restrictions?',
        answer: 'Absolutely! During onboarding, you can specify dietary preferences (vegetarian, vegan, gluten-free, etc.) and allergies. All meal plans will respect these restrictions.'
      },
      {
        question: 'How do I rate my meal plans?',
        answer: 'After trying a meal plan, you can rate it and provide feedback. This helps our AI learn your preferences and create better future plans.'
      }
    ],
    tracking: [
      {
        question: 'How do I track my progress?',
        answer: 'ZoeFit automatically tracks your completed workouts and meal plan ratings. You can also manually log weight, body measurements, and other metrics in the Progress section.'
      },
      {
        question: 'What insights does the AI provide?',
        answer: 'Our AI analyzes your progress patterns and provides personalized insights, recommendations, and predictions to help you reach your goals faster.'
      },
      {
        question: 'Can I export my progress data?',
        answer: 'Yes, you can export your progress data from the Analytics section. This is useful for sharing with healthcare providers or personal trainers.'
      }
    ],
    account: [
      {
        question: 'How do I update my profile information?',
        answer: 'Navigate to the Personal Information section in Settings to update your profile details, including photos, bio, and contact information.'
      },
      {
        question: 'Is my data secure?',
        answer: 'Yes, we take data security seriously. All your personal information is encrypted and stored securely. We never share your data with third parties without your consent.'
      },
      {
        question: 'Can I delete my account?',
        answer: 'Yes, you can delete your account from the Settings page. Please note this action is permanent and cannot be undone.'
      }
    ],
    technical: [
      {
        question: 'The app is running slowly, what can I do?',
        answer: 'Try clearing the app cache, ensuring you have a stable internet connection, and updating to the latest version of the app.'
      },
      {
        question: 'How do I report a bug?',
        answer: 'Use the Contact Support section below to describe the issue. Include details about your device, app version, and steps to reproduce the problem.'
      },
      {
        question: 'Why can\'t I sync my data?',
        answer: 'Check your internet connection and ensure you\'re logged in. If issues persist, try logging out and back in, or contact support.'
      }
    ]
  };

  const contactOptions = [
    {
      title: 'Email Support',
      description: 'Get help via email',
      icon: '📧',
      action: () => Linking.openURL('mailto:support@zoefit.com'),
    },
    {
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: '💬',
      action: () => Alert.alert('Live Chat', 'Chat feature coming soon!'),
    },
    {
      title: 'Help Center',
      description: 'Browse our knowledge base',
      icon: '📚',
      action: () => Linking.openURL('https://help.zoefit.com'),
    },
    {
      title: 'Community Forum',
      description: 'Connect with other users',
      icon: '👥',
      action: () => Linking.openURL('https://community.zoefit.com'),
    },
  ];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setExpandedFAQ(null);
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const sendSupportMessage = () => {
    if (!subject.trim() || !supportMessage.trim()) {
      Alert.alert('Error', 'Please fill in both subject and message fields.');
      return;
    }

    // Here you would typically send the message to your backend
    Alert.alert(
      'Message Sent',
      'We\'ll get back to you within 24 hours.',
      [
        { text: 'OK', onPress: () => {
          setSubject('');
          setSupportMessage('');
        }}
      ]
    );
  };

  const renderCategoryCard = (category: any) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryCard,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
          borderWidth: selectedCategory === category.id ? 2 : 1,
        }
      ]}
      onPress={() => handleCategorySelect(category.id)}
    >
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryIcon}>{category.icon}</Text>
        <View style={styles.categoryInfo}>
          <Text style={[styles.categoryTitle, { color: theme.text }]}>
            {category.title}
          </Text>
          <Text style={[styles.categoryDescription, { color: theme.textSecondary }]}>
            {category.description}
          </Text>
        </View>
        {selectedCategory === category.id && (
          <View style={[styles.selectedIndicator, { backgroundColor: category.color }]}>
            <Text style={styles.selectedText}>✓</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFAQItem = (faq: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.faqItem,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
        }
      ]}
      onPress={() => toggleFAQ(index)}
    >
      <View style={styles.faqQuestion}>
        <Text style={[styles.faqQuestionText, { color: theme.text }]}>
          {faq.question}
        </Text>
        <Text style={styles.faqToggleIcon}>
          {expandedFAQ === index ? '−' : '+'}
        </Text>
      </View>
      
      {expandedFAQ === index && (
        <View style={styles.faqAnswer}>
          <Text style={[styles.faqAnswerText, { color: theme.textSecondary }]}>
            {faq.answer}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderContactOption = (option: any) => (
    <TouchableOpacity
      key={option.title}
      style={[
        styles.contactOption,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
        }
      ]}
      onPress={option.action}
    >
      <Text style={styles.contactIcon}>{option.icon}</Text>
      <View style={styles.contactInfo}>
        <Text style={[styles.contactTitle, { color: theme.text }]}>
          {option.title}
        </Text>
        <Text style={[styles.contactDescription, { color: theme.textSecondary }]}>
          {option.description}
        </Text>
      </View>
      <Text style={styles.contactArrow}>→</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={theme.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 60 }} />
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Quick Help Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>How can we help?</Text>
          <View style={styles.categoriesContainer}>
            {helpCategories.map(renderCategoryCard)}
          </View>
        </View>

        {/* FAQ Section */}
        {selectedCategory && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Frequently Asked Questions
            </Text>
            <View style={styles.faqContainer}>
              {(faqData[selectedCategory as keyof typeof faqData] || []).map((faq, index) =>
                renderFAQItem(faq, index)
              )}
            </View>
          </View>
        )}

        {/* Contact Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Contact Us</Text>
          <View style={styles.contactContainer}>
            {contactOptions.map(renderContactOption)}
          </View>
        </View>

        {/* Support Form */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Send us a message</Text>
          <View style={[styles.supportForm, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="Subject"
              placeholderTextColor={theme.textSecondary}
              value={subject}
              onChangeText={setSubject}
            />
            
            <TextInput
              style={[styles.textArea, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              placeholder="Describe your issue or question..."
              placeholderTextColor={theme.textSecondary}
              value={supportMessage}
              onChangeText={setSupportMessage}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: theme.primary }]}
              onPress={sendSupportMessage}
            >
              <Text style={styles.sendButtonText}>Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Additional Resources */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Additional Resources</Text>
          <View style={styles.resourcesContainer}>
            <TouchableOpacity
              style={[styles.resourceItem, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              onPress={() => Linking.openURL('https://zoefit.com/privacy')}
            >
              <Text style={styles.resourceIcon}>🔒</Text>
              <Text style={[styles.resourceText, { color: theme.text }]}>Privacy Policy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.resourceItem, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              onPress={() => Linking.openURL('https://zoefit.com/terms')}
            >
              <Text style={styles.resourceIcon}>📋</Text>
              <Text style={[styles.resourceText, { color: theme.text }]}>Terms of Service</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.resourceItem, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              onPress={() => Linking.openURL('https://zoefit.com/blog')}
            >
              <Text style={styles.resourceIcon}>📖</Text>
              <Text style={[styles.resourceText, { color: theme.text }]}>Fitness Blog</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  faqContainer: {
    gap: 12,
  },
  faqItem: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  faqToggleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  faqAnswer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  contactContainer: {
    gap: 12,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  contactArrow: {
    fontSize: 18,
    color: '#6b7280',
  },
  supportForm: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 100,
  },
  sendButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resourcesContainer: {
    gap: 12,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resourceIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  resourceText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HelpSupportScreen;
