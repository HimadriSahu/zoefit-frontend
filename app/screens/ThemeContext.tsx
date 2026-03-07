import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  background: string;
  cardBackground: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  primaryDark: string;
  shadow: string;
  headerGradient: readonly [string, string, string];
  settingRowBackground: string;
  menuItemBackground: string;
}

export const lightTheme: ThemeColors = {
  background: '#f8fafc',
  cardBackground: '#fff',
  text: '#1f2937',
  textSecondary: '#374151',
  border: '#e5e7eb',
  primary: '#10b981',
  primaryDark: '#059669',
  shadow: '#10b981',
  headerGradient: ['#10b981', '#059669', '#047857'] as const,
  settingRowBackground: '#fff',
  menuItemBackground: '#fff',
};

export const darkTheme: ThemeColors = {
  background: '#0a0f1c',
  cardBackground: '#1a1f2e',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  border: '#334155',
  primary: '#667eea',
  primaryDark: '#764ba2',
  shadow: '#000000',
  headerGradient: ['#667eea', '#764ba2', '#f093fb'] as const,
  settingRowBackground: '#1a1f2e',
  menuItemBackground: '#1a1f2e',
};

interface ThemeContextType {
  isDarkMode: boolean;
  theme: ThemeColors;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load dark mode preference from AsyncStorage on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedPreference = await AsyncStorage.getItem('darkMode');
        if (storedPreference !== null) {
          setIsDarkMode(JSON.parse(storedPreference));
        }
      } catch (error) {
        console.error('Error loading dark mode preference:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadThemePreference();
  }, []);

  // Save dark mode preference to AsyncStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      const saveThemePreference = async () => {
        try {
          await AsyncStorage.setItem('darkMode', JSON.stringify(isDarkMode));
        } catch (error) {
          console.error('Error saving dark mode preference:', error);
        }
      };
      saveThemePreference();
    }
  }, [isDarkMode, isLoading]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const setDarkMode = (enabled: boolean) => {
    setIsDarkMode(enabled);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        theme,
        toggleDarkMode,
        setDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

// Default export to prevent expo-router from treating this as a route
export default function ThemeContextComponent() {
  return null;
}
