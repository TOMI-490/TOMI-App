import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import {
  DARK_THEME,
  LIGHT_THEME,
  type TomiThemeColors,
} from '../constants/theme';

const STORAGE_KEY = '@tomi/theme-preference';

export type ThemePreference = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
  /** Resolved light/dark after applying system */
  resolvedScheme: 'light' | 'dark';
  colors: TomiThemeColors;
  toggleLightDark: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveScheme(
  preference: ThemePreference,
  system: 'light' | 'dark' | null | undefined,
): 'light' | 'dark' {
  if (preference === 'light' || preference === 'dark') return preference;
  return system === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (cancelled) return;
        if (raw === 'light' || raw === 'dark' || raw === 'system') {
          setPreferenceState(raw);
        }
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setPreference = useCallback(async (p: ThemePreference) => {
    setPreferenceState(p);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, p);
    } catch {
      /* ignore */
    }
  }, []);

  const effectivePreference = hydrated ? preference : 'system';

  const resolvedScheme = useMemo(
    () => resolveScheme(effectivePreference, systemScheme),
    [effectivePreference, systemScheme],
  );

  const colors = resolvedScheme === 'dark' ? DARK_THEME : LIGHT_THEME;

  const toggleLightDark = useCallback(() => {
    const next = resolvedScheme === 'dark' ? 'light' : 'dark';
    void setPreference(next);
  }, [resolvedScheme, setPreference]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      setPreference,
      resolvedScheme,
      colors,
      toggleLightDark,
    }),
    [preference, setPreference, resolvedScheme, colors, toggleLightDark],
  );

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar style={resolvedScheme === 'dark' ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

/** Falls back to light theme outside ThemeProvider */
export function useThemeColors(): TomiThemeColors {
  const ctx = useContext(ThemeContext);
  return ctx?.colors ?? LIGHT_THEME;
}
