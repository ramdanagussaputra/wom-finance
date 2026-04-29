import React, { useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
  style?: ViewStyle;
};

export function Button({ title, onPress, loading, disabled, variant = 'primary', style }: Props) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const isDisabled = !!(disabled || loading);
  const bg =
    variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : 'transparent';
  const fg =
    variant === 'ghost' ? colors.primary : variant === 'danger' ? '#FFFFFF' : colors.primaryText;
  const borderColor = variant === 'ghost' ? colors.borderStrong : 'transparent';

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        style={[
          styles.btn,
          variant === 'primary' && {
            shadowColor: colors.primary,
            shadowOpacity: 0.35,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          },
          { backgroundColor: bg, borderColor, opacity: isDisabled ? 0.5 : 1 },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          <Text style={[styles.text, { color: fg }]}>{title}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 52,
    paddingHorizontal: 22,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
