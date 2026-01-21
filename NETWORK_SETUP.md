# ZoeFit Network Configuration Guide

## 🚀 Quick Fix for Network Issues

The app now automatically handles different IP addresses and network configurations. Here's what was implemented:

### ✅ What's Fixed

1. **Dynamic IP Detection**: The app automatically tries multiple URLs to find your running Django server
2. **Automatic Retry**: If a network request fails, it tries different URLs automatically
3. **Platform-Specific URLs**: Uses the correct URL based on your platform (Android/iOS)
4. **Fallback Mechanism**: Always has a working URL as backup

### 🔧 How It Works

The new `apiConfig.ts` automatically tests these URLs in order:
- `http://localhost:8000` (iOS Simulator)
- `http://127.0.0.1:8000` (Local development)
- `http://10.0.2.2:8000` (Android Emulator)
- `http://192.168.1.5:8000` (Common local network)
- `http://10.253.108.221:8000` (Your current IP)

### 📱 Platform-Specific Setup

#### For Android Development:
- **Emulator**: Uses `10.0.2.2` automatically
- **Physical Device**: Make sure your phone and computer are on the same WiFi network

#### For iOS Development:
- **Simulator**: Uses `localhost` automatically
- **Physical Device**: Use your computer's IP address

### 🔍 Debug Network Issues

Use the NetworkUtils to debug connection problems:

```typescript
import NetworkUtils from '../utils/networkUtils';

// Get network info
console.log(NetworkUtils.getCurrentIpInfo());

// Test specific URL
const isWorking = await NetworkUtils.testConnection('http://localhost:8000');
console.log('Connection working:', isWorking);

// Get all possible URLs
const urls = NetworkUtils.getDevelopmentUrls();
console.log('Available URLs:', urls);
```

### ⚡ Quick Troubleshooting

1. **Django Server Not Running**: Make sure your Django server is running on port 8000
   ```bash
   cd backend
   python manage.py runserver 0.0.0.0:8000
   ```

2. **Firewall Issues**: Allow connections on port 8000 in your firewall

3. **Network Configuration**: Ensure your device and computer are on the same network

4. **IP Address Changed**: The app will automatically detect and use the new IP

### 🛠️ Manual Configuration (If Needed)

If you need to manually set a specific IP address, you can modify `config/apiConfig.ts`:

```typescript
development: [
  'http://localhost:8000',
  'http://127.0.0.1:8000', 
  'http://10.0.2.2:8000',
  'http://192.168.1.5:8000',
  'http://YOUR_NEW_IP:8000', // Add your IP here
],
```

### 📋 Common Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Network request failed` | Wrong IP or server not running | Check Django server is running on port 8000 |
| `Connection refused` | Firewall blocking connection | Allow port 8000 in firewall |
| `Timeout` | Server taking too long | Check server performance and network |

### 🎯 Production Setup

For production, update the production URL in `config/apiConfig.ts`:

```typescript
production: 'https://your-production-api.com',
```

---

## 🚀 You're All Set!

The app will now automatically handle network configuration changes. No more manual IP updates needed!

If you still experience issues, check the console logs for detailed error messages and connection attempts.
