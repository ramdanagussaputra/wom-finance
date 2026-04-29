import React, { memo, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { ListItem } from '../types/models';
import { StarRating } from './StarRating';

type Props = {
  item: ListItem;
  onPress?: (item: ListItem) => void;
  variant?: 'list' | 'header';
};

function getStockTone(stock: number): 'success' | 'warning' | 'danger' {
  if (stock <= 0) return 'danger';
  if (stock < 20) return 'warning';
  return 'success';
}

function ListItemCardImpl({ item, onPress, variant = 'list' }: Props) {
  const { colors } = useTheme();
  const interactive = !!onPress;
  const isHeader = variant === 'header';
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 25, bounciness: 8 }).start();
  };

  const hasDiscount =
    typeof item.discountPercentage === 'number' && item.discountPercentage > 0;
  const originalPrice =
    hasDiscount && typeof item.price === 'number'
      ? item.price / (1 - (item.discountPercentage as number) / 100)
      : null;

  const stockTone = typeof item.stock === 'number' ? getStockTone(item.stock) : null;
  const stockLabel =
    typeof item.stock === 'number'
      ? item.stock <= 0
        ? 'Out of stock'
        : item.stock < 20
        ? `Only ${item.stock} left`
        : 'In stock'
      : null;

  const stockBg =
    stockTone === 'danger'
      ? colors.dangerSoft
      : stockTone === 'warning'
      ? colors.warningSoft
      : colors.successSoft;
  const stockFg =
    stockTone === 'danger'
      ? colors.danger
      : stockTone === 'warning'
      ? colors.warning
      : colors.success;

  const content = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
        isHeader && styles.containerHeader,
      ]}
    >
      <View style={styles.thumbWrap}>
        {item.thumbnail ? (
          <Image
            source={{ uri: item.thumbnail }}
            style={[styles.thumb, isHeader && styles.thumbHeader, { backgroundColor: colors.surfaceAlt }]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.thumb,
              isHeader && styles.thumbHeader,
              { backgroundColor: colors.surfaceAlt },
            ]}
          />
        )}
        {hasDiscount ? (
          <View style={[styles.discountBadge, { backgroundColor: colors.accent }]}>
            <Text style={styles.discountText}>-{Math.round(item.discountPercentage as number)}%</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        {item.brand ? (
          <Text style={[styles.brand, { color: colors.primary }]} numberOfLines={1}>
            {item.brand.toUpperCase()}
          </Text>
        ) : null}
        <Text
          style={[styles.title, isHeader && styles.titleHeader, { color: colors.text }]}
          numberOfLines={isHeader ? 3 : 2}
        >
          {item.title}
        </Text>

        {typeof item.rating === 'number' ? (
          <View style={styles.ratingRow}>
            <StarRating value={item.rating} size={isHeader ? 14 : 12} />
          </View>
        ) : null}

        <View style={styles.bottomRow}>
          {typeof item.price === 'number' ? (
            <View style={styles.priceCol}>
              <Text style={[styles.price, isHeader && styles.priceHeader, { color: colors.text }]}>
                ${item.price.toFixed(2)}
              </Text>
              {originalPrice ? (
                <Text style={[styles.originalPrice, { color: colors.textMuted }]}>
                  ${originalPrice.toFixed(2)}
                </Text>
              ) : null}
            </View>
          ) : (
            <View />
          )}

          {stockLabel ? (
            <View style={[styles.stockBadge, { backgroundColor: stockBg }]}>
              <View style={[styles.stockDot, { backgroundColor: stockFg }]} />
              <Text style={[styles.stockText, { color: stockFg }]} numberOfLines={1}>
                {stockLabel}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );

  if (!interactive) return content;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={() => onPress!(item)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        android_ripple={{ color: colors.overlay }}
        accessibilityRole="button"
        accessibilityLabel={item.title}
      >
        {content}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
    marginVertical: 6,
    minHeight: 96,
    alignItems: 'center',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    padding: 12,
  },
  containerHeader: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
  },
  thumbWrap: { position: 'relative' },
  thumb: { width: 80, height: 80, borderRadius: 12 },
  thumbHeader: { width: 110, height: 110, borderRadius: 16 },
  discountBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  discountText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  body: { flex: 1, marginLeft: 14, justifyContent: 'space-between', minHeight: 80 },
  brand: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 2 },
  title: { fontSize: 15, fontWeight: '700', lineHeight: 20 },
  titleHeader: { fontSize: 20 },
  ratingRow: { marginTop: 6 },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  priceCol: { flexDirection: 'row', alignItems: 'baseline' },
  price: { fontSize: 16, fontWeight: '800' },
  priceHeader: { fontSize: 22 },
  originalPrice: {
    marginLeft: 6,
    fontSize: 12,
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    maxWidth: 130,
  },
  stockDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  stockText: { fontSize: 11, fontWeight: '700' },
});

export const ListItemCard = memo(ListItemCardImpl);
