import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

function Shimmer({ style }: { style?: any }) {
  const { colors } = useTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1100,
        useNativeDriver: false,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const backgroundColor = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.skeleton, colors.skeletonHighlight],
  });

  return <Animated.View style={[{ backgroundColor }, style]} />;
}

function SkeletonCard() {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <Shimmer style={styles.thumb} />
      <View style={styles.body}>
        <Shimmer style={styles.lineShort} />
        <Shimmer style={styles.lineLong} />
        <Shimmer style={styles.lineMid} />
        <View style={styles.row}>
          <Shimmer style={styles.priceBlock} />
          <Shimmer style={styles.badgeBlock} />
        </View>
      </View>
    </View>
  );
}

export function SkeletonList({ count = 6 }: { count?: number }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 8 },
  card: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    minHeight: 96,
    alignItems: 'center',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  thumb: { width: 80, height: 80, borderRadius: 12 },
  body: { flex: 1, marginLeft: 14, justifyContent: 'space-between', minHeight: 80 },
  lineShort: { height: 8, width: '30%', borderRadius: 4 },
  lineLong: { height: 14, width: '85%', borderRadius: 4, marginTop: 8 },
  lineMid: { height: 10, width: '60%', borderRadius: 4, marginTop: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  priceBlock: { height: 16, width: 70, borderRadius: 4 },
  badgeBlock: { height: 18, width: 80, borderRadius: 9 },
});
