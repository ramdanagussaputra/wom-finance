import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  value: number;
  size?: number;
  showNumber?: boolean;
};

function StarRatingImpl({ value, size = 12, showNumber = true }: Props) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(5, value));
  const full = Math.floor(clamped);
  const hasHalf = clamped - full >= 0.5;

  return (
    <View style={styles.row}>
      <View style={styles.stars}>
        {[0, 1, 2, 3, 4].map((i) => {
          const filled = i < full || (i === full && hasHalf);
          return (
            <Text
              key={i}
              style={[
                styles.star,
                {
                  fontSize: size,
                  color: filled ? colors.star : colors.border,
                },
              ]}
            >
              {'★'}
            </Text>
          );
        })}
      </View>
      {showNumber ? (
        <Text style={[styles.num, { color: colors.textMuted, fontSize: size }]}>
          {clamped.toFixed(1)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  stars: { flexDirection: 'row', alignItems: 'center' },
  star: { marginRight: 1 },
  num: { marginLeft: 4, fontWeight: '600' },
});

export const StarRating = memo(StarRatingImpl);
