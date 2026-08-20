import React, { createContext, useContext } from 'react';
import colors from '../config/colors';

const THEME_PREFERENCE_KEY = 'app:themePreference';

export const lightTheme = colors;
export const darkTheme = colors;

export const ThemeContext = createContext(null);

const themeListeners = new Set();

export const subscribeToThemeChange = (listener) => {
  themeListeners.add(listener);
  return () => {
    themeListeners.delete(listener);
  };
};

const emitThemeChange = () => {
  themeListeners.forEach((listener) => {
    try {
      listener(false);
    } catch (error) {
      console.warn('Theme listener failed:', error);
    }
  });
};

export const getStoredThemePreference = async () => {
  try {
    return 'light';
  } catch (error) {
    console.warn('Unable to read saved theme preference:', error);
    return 'light';
  }
};

export const setStoredThemePreference = async (themePreference) => {
  try {
    return themePreference === 'dark' ? 'light' : 'light';
  } catch (error) {
    console.warn('Unable to save theme preference:', error);
    return 'light';
  }
};

export const ThemeProvider = ({ children }) => {
  const value = {
    colors,
    themeColors: colors,
    isDark: false,
    colorScheme: 'light',
    themePreference: 'light',
    isThemeReady: true,
    setThemePreference: async (nextTheme) => {
      const normalizedTheme = nextTheme === 'dark' ? 'light' : 'light';
      await setStoredThemePreference(normalizedTheme);
      emitThemeChange();
      return normalizedTheme;
    },
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    return {
      colors,
      themeColors: colors,
      isDark: false,
      colorScheme: 'light',
      themePreference: 'light',
      isThemeReady: true,
      setThemePreference: async () => 'light',
    };
  }

  return context;
};

export default useTheme;
