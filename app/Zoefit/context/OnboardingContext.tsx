// Re-export from the correct location
export {
  OnboardingProvider,
  useOnboarding, type Gender,
  type NutrioGoal, type OnboardingData
} from '../../../context/OnboardingContext';

// Import for default export
import { OnboardingProvider } from '../../../context/OnboardingContext';

// Default export for React component compatibility
export default OnboardingProvider;
