import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorView({ message = 'Something went wrong.', onRetry }: Props) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.danger + '22' }]}>
        <Text style={[styles.icon, { color: colors.danger }]}>!</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Couldn't load data</Text>
      <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [
            styles.retry,
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          <Text style={[styles.retryText, { color: colors.primaryText }]}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: { fontSize: 32, fontWeight: '800' },
  title: { fontSize: 18, fontWeight: '700' },
  message: { fontSize: 14, marginTop: 6, textAlign: 'center' },
  retry: {
    marginTop: 20,
    paddingHorizontal: 24,
    minHeight: 44,
    minWidth: 120,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: { fontWeight: '700' },
});
