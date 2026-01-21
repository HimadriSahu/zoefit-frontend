import { Platform } from 'react-native';

// Network utility functions for ZoeFit
export const NetworkUtils = {
  /**
   * Get the current IP address for development
   * This helps users identify their current network configuration
   */
  getCurrentIpInfo(): string {
    const isAndroid = Platform.OS === 'android';
    const isIOS = Platform.OS === 'ios';
    
    return `
🔧 ZoeFit Network Debug Info:
Platform: ${Platform.OS}
Development Mode: ${__DEV__ ? 'Yes' : 'No'}

Common Development URLs:
- Localhost: http://localhost:8000
- 127.0.0.1: http://127.0.0.1:8000
- Android Emulator: http://10.0.2.2:8000
- iOS Simulator: http://localhost:8000
- Your Network IP: http://10.253.108.221:8000

📱 Testing Tips:
- For Android Emulator: Use 10.0.2.2
- For iOS Simulator: Use localhost
- For Physical Device: Use your computer's IP address
- Make sure your Django server is running on port 8000
- Check that firewall allows connections on port 8000
    `;
  },

  /**
   * Test if a URL is reachable
   */
  async testConnection(url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${url}/api/auth/`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      return response.ok || response.status === 405; // 405 means server is running
    } catch (error) {
      console.log(`❌ Connection test failed for ${url}:`, error instanceof Error ? error.message : String(error));
      return false;
    }
  },

  /**
   * Get all possible development URLs to test
   */
  getDevelopmentUrls(): string[] {
    return [
      'http://localhost:8000',
      'http://127.0.0.1:8000',
      'http://10.0.2.2:8000', // Android emulator
      'http://192.168.1.5:8000', // Common local network
      'http://10.253.108.221:8000', // Your current IP
    ];
  }
};

export default NetworkUtils;
