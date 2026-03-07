import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../../services/api';

const { width: screenWidth } = Dimensions.get('window');

interface MealPlanRatingProps {
  mealId: string;
  mealName: string;
  visible: boolean;
  onClose: () => void;
  onRatingSubmitted?: (rating: number, feedback?: string) => void;
}

const MealPlanRating: React.FC<MealPlanRatingProps> = ({
  mealId,
  mealName,
  visible,
  onClose,
  onRatingSubmitted,
}) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ratingStars = [1, 2, 3, 4, 5];

  const ratingDescriptions = {
    1: 'Poor - Didn\'t like it at all',
    2: 'Fair - Below expectations',
    3: 'Good - Met expectations',
    4: 'Very Good - Above expectations',
    5: 'Excellent - Loved it!',
  };

  const handleStarPress = (starRating: number) => {
    setRating(starRating);
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit rating to backend
      await apiService.updateMealPlanRating(mealId, rating, feedback);
      
      Alert.alert(
        'Thank You!',
        'Your feedback helps us improve your meal recommendations.',
        [{ text: 'OK', onPress: () => {
          onRatingSubmitted?.(rating, feedback);
          handleClose();
        }}]
      );
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setFeedback('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <LinearGradient
          colors={['#10b981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rate Meal Plan</Text>
          <View style={{ width: 30 }} />
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.mealInfo}>
            <Text style={styles.mealName}>{mealName}</Text>
            <Text style={styles.mealQuestion}>How did you like this meal?</Text>
          </View>

          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {ratingStars.map((star) => (
                <TouchableOpacity
                  key={star}
                  style={styles.starButton}
                  onPress={() => handleStarPress(star)}
                >
                  <Text style={[
                    styles.star,
                    { color: star <= rating ? '#fbbf24' : '#d1d5db' }
                  ]}>
                    {star <= rating ? '⭐' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {rating > 0 && (
              <Text style={styles.ratingDescription}>
                {ratingDescriptions[rating as keyof typeof ratingDescriptions]}
              </Text>
            )}
          </View>

          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackLabel}>Additional Feedback (Optional)</Text>
            <TextInput
              style={styles.feedbackInput}
              value={feedback}
              onChangeText={setFeedback}
              placeholder="Tell us what you liked or didn't like about this meal..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.quickFeedbackContainer}>
            <Text style={styles.quickFeedbackLabel}>Quick Feedback</Text>
            <View style={styles.quickFeedbackGrid}>
              {[
                'Too bland', 'Too spicy', 'Perfect portion', 'Needs more protein',
                'Too many carbs', 'Great taste', 'Easy to prepare', 'Would make again'
              ].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.quickFeedbackButton,
                    { backgroundColor: feedback.includes(option) ? '#10b981' : '#f3f4f6' }
                  ]}
                  onPress={() => {
                    if (feedback.includes(option)) {
                      setFeedback(feedback.replace(option, '').trim());
                    } else {
                      setFeedback(feedback ? `${feedback}, ${option}` : option);
                    }
                  }}
                >
                  <Text style={[
                    styles.quickFeedbackText,
                    { color: feedback.includes(option) ? '#fff' : '#374151' }
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.nutritionFeedbackContainer}>
            <Text style={styles.nutritionFeedbackLabel}>Nutrition Feedback</Text>
            <View style={styles.nutritionOptions}>
              {[
                { id: 'calories', label: 'Calories were appropriate' },
                { id: 'protein', label: 'Good protein content' },
                { id: 'carbs', label: 'Right amount of carbs' },
                { id: 'fat', label: 'Healthy fat balance' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.nutritionOption,
                    { backgroundColor: feedback.includes(option.label) ? '#10b981' : '#f3f4f6' }
                  ]}
                  onPress={() => {
                    if (feedback.includes(option.label)) {
                      setFeedback(feedback.replace(option.label, '').trim());
                    } else {
                      setFeedback(feedback ? `${feedback}, ${option.label}` : option.label);
                    }
                  }}
                >
                  <Text style={[
                    styles.nutritionOptionText,
                    { color: feedback.includes(option.label) ? '#fff' : '#374151' }
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: '#d1d5db' }]}
            onPress={handleClose}
          >
            <Text style={[styles.cancelButtonText, { color: '#6b7280' }]}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.submitButton, { opacity: isSubmitting ? 0.6 : 1 }]}
            onPress={handleSubmitRating}
            disabled={isSubmitting}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButtonGradient}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit Rating'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#047857',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  mealInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mealName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  mealQuestion: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  starButton: {
    padding: 8,
  },
  star: {
    fontSize: 40,
  },
  ratingDescription: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  feedbackContainer: {
    marginBottom: 24,
  },
  feedbackLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  feedbackInput: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 100,
  },
  quickFeedbackContainer: {
    marginBottom: 24,
  },
  quickFeedbackLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  quickFeedbackGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickFeedbackButton: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  quickFeedbackText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  nutritionFeedbackContainer: {
    marginBottom: 24,
  },
  nutritionFeedbackLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  nutritionOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionOption: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  nutritionOptionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  cancelButton: {
    width: '30%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    width: '65%',
    borderRadius: 12,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonGradient: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MealPlanRating;
