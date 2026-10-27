import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES, Theme, ThemeName } from '../theme/themes';

const STORAGE_KEY = 'kitaphane.theme';

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const readStored = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return window.localStorage.getItem(STORAGE_KEY);
    }
    return await AsyncStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const writeStored = async (value: string) => {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, value);
      return;
    }
    await AsyncStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Tema tercihi kaydedilemese de uygulama çalışmaya devam eder
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeNameState] = useState<ThemeName>('latte');

  useEffect(() => {
    readStored().then((stored) => {
      if (stored && stored in THEMES) setThemeNameState(stored as ThemeName);
    });
  }, []);

  const setThemeName = (name: ThemeName) => {
    setThemeNameState(name);
    writeStored(name);
  };

  const value = useMemo(
    () => ({ theme: THEMES[themeName], themeName, setThemeName }),
    [themeName]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};

/** Temaya bağlı StyleSheet üretir; tema değişince yeniden hesaplanır. */
export function useStyles<T>(factory: (t: Theme) => T): T {
  const { theme } = useTheme();
  return useMemo(() => factory(theme), [theme]);
}
