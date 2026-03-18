import { Platform } from 'react-native';

// API Configuration with dynamic IP detection and fallback
const API_CONFIG = {
  // Production URL
  production: 'https://your-production-api.com',

  // Development URLs in order of preference
  development: [
    'http://192.168.1.3:8000', // Current working machine IP (try first)
    'http://10.45.143.221:8000', // Android emulator → host machine localhost
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://172.23.148.1:8000', // Common local network
    'http://192.168.29.36:8000',
    'http://10.45.13.21:8000',
    'http://192.168.0.192:8000', // Alternative network IP
  ],

  // Timeout settings
  timeout: 3000, // Reduced timeout for faster failover

  // Retry settings
  maxRetries: 2, // Reduced retries for faster failover
  retryDelay: 500, // Reduced delay

  // Network detection settings
  networkDetectionInterval: 30000, // Check network every 30 seconds
  connectionTestEndpoint: '/api/auth/', // Endpoint to test connectivity
};

// Get the current platform
const isAndroid = Platform.OS === 'android';
const isIOS = Platform.OS === 'ios';

// Dynamic API URL resolver with enhanced network handling
export const getApiBaseUrl = async (): Promise<string> => {
  if (!__DEV__) {
    return API_CONFIG.production;
  }

  // For development, try each URL until we find a working one
  for (const url of API_CONFIG.development) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

      const response = await fetch(`${url}${API_CONFIG.connectionTestEndpoint}`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      // Consider 200, 404, and 405 as successful (server is running)
      if (response.ok || response.status === 405 || response.status === 404) {
        console.log(`✅ Connected to API at: ${url}`);
        return url;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`❌ Failed to connect to ${url}: ${errorMessage}`);
      continue;
    }
  }

  // If all URLs fail, use platform-appropriate fallback
  const fallback = isAndroid ? 'http://192.168.0.192:8000' : API_CONFIG.development[2]; // localhost for non-Android
  console.warn('⚠️ All API URLs failed, using fallback:', fallback);
  return fallback;
};

// Get API URL synchronously (for immediate use) with improved fallback logic
export const getApiBaseUrlSync = (): string => {
  if (!__DEV__) {
    return API_CONFIG.production;
  }

  // Return the most likely working URL based on platform and network patterns
  if (isAndroid) {
    // Android emulator typically uses 10.0.2.2 for host, but also try common network IPs
    return 'http://192.168.0.192:8000'; // Common Android network IP
  } else if (isIOS) {
    // iOS simulator uses localhost
    return 'http://127.0.0.1:8000';
  } else {
    // Web/other - try localhost first
    return 'http://localhost:8000';
  }
};

// Export utility function to test connectivity
export const testApiConnectivity = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    const response = await fetch(`${url}${API_CONFIG.connectionTestEndpoint}`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);
    return response.ok || response.status === 405 || response.status === 404;
  } catch (error) {
    return false;
  }
};

// Export configuration
export default API_CONFIG;
