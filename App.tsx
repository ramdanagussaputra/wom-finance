import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { RootNavigator } from './src/navigation/RootNavigator';

function ThemedStatusBar() {
  const { mode } = useTheme();
  return <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <ThemedStatusBar />
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
