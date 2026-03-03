import { Platform } from 'react-native';

// API Configuration with dynamic IP detection and fallback
const API_CONFIG = {
  // Production URL
  production: 'https://your-production-api.com',
  
// Development URLs in order of preference
  development: [
    'http://10.0.2.2:8000', // Android emulator → host machine localhost (try first when on Android)
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://192.168.1.4:8000', // Current machine IP
    'http://172.23.148.1:8000', // Common local network
    'http://192.168.0.192:8000',
    'http://10.189.95.1:8001',
    
  ],
  
  // Timeout settings
  timeout: 10000,
  
  // Retry settings
  maxRetries: 3,
  retryDelay: 1000,
};

// Get the current platform
const isAndroid = Platform.OS === 'android';
const isIOS = Platform.OS === 'ios';

// Dynamic API URL resolver
export const getApiBaseUrl = async (): Promise<string> => {
  if (!__DEV__) {
    return API_CONFIG.production;
  }

  // For development, try each URL until we find a working one
  for (const url of API_CONFIG.development) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
      
      const response = await fetch(`${url}/api/auth/`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok || response.status === 405) { // 405 means server is running but method not allowed
        console.log(`✅ Connected to API at: ${url}`);
        return url;
      }
    } catch (error) {
      console.log(`❌ Failed to connect to ${url}:`, error instanceof Error ? error.message : String(error));
      continue;
    }
  }
  
  // If all URLs fail, use platform-appropriate fallback
  const fallback = isAndroid ? 'http://10.0.2.2:8000' : API_CONFIG.development[0];
  console.warn('⚠️ All API URLs failed, using fallback:', fallback);
  return fallback;
};

// Get API URL synchronously (for immediate use)
export const getApiBaseUrlSync = (): string => {
  if (!__DEV__) {
    return API_CONFIG.production;
  }
  
  // Return the most likely working URL based on platform
  if (isAndroid) {
    return 'http://10.0.2.2:8000'; // Android emulator localhost
  } else if (isIOS) {
    return 'http://127.0.0.1:8000'; // iOS simulator localhost
  }
  
  return API_CONFIG.development[0]; // Web/other - localhost:8000
};

// Export configuration
export default API_CONFIG;
