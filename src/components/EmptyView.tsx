import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function EmptyView({ message = 'No items to show' }: { message?: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.iconWrap, { borderColor: colors.border }]}>
        <Text style={[styles.icon, { color: colors.textMuted }]}>∅</Text>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Nothing here yet</Text>
      <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: { fontSize: 28 },
  title: { fontSize: 18, fontWeight: '700' },
  message: { fontSize: 14, marginTop: 6, textAlign: 'center' },
});
