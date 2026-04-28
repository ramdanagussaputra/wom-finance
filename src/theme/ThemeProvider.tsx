import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { ThemeColors, darkColors, lightColors } from './colors';

type ThemeMode = 'light' | 'dark';
type ThemeContextValue = { mode: ThemeMode; colors: ThemeColors };

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolve(scheme: ColorSchemeName | null | undefined): ThemeMode {
  return scheme === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(resolve(Appearance.getColorScheme()));

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => setMode(resolve(colorScheme)));
    return () => sub.remove();
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, colors: mode === 'dark' ? darkColors : lightColors }),
    [mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
