import React, { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import type { ListItem } from '../types/models';

type Props = {
  item: ListItem;
  onPress?: (item: ListItem) => void;
  variant?: 'list' | 'header';
};

function ListItemCardImpl({ item, onPress, variant = 'list' }: Props) {
  const { colors } = useTheme();
  const interactive = !!onPress;
  const isHeader = variant === 'header';

  const content = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          padding: isHeader ? 16 : 12,
        },
      ]}
    >
      {item.thumbnail ? (
        <Image
          source={{ uri: item.thumbnail }}
          style={[styles.thumb, isHeader && styles.thumbHeader]}
          resizeMode="cover"
        />
      ) : (
        <View
          style={[
            styles.thumb,
            isHeader && styles.thumbHeader,
            { backgroundColor: colors.surface },
          ]}
        />
      )}
      <View style={styles.body}>
        <Text
          style={[styles.title, { color: colors.text, fontSize: isHeader ? 20 : 16 }]}
          numberOfLines={isHeader ? 3 : 2}
        >
          {item.title}
        </Text>
        {item.category ? (
          <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>
            {item.category}
          </Text>
        ) : null}
        {typeof item.price === 'number' ? (
          <Text style={[styles.price, { color: colors.primary }]}>${item.price.toFixed(2)}</Text>
        ) : null}
      </View>
    </View>
  );

  if (!interactive) return content;

  return (
    <Pressable
      onPress={() => onPress!(item)}
      android_ripple={{ color: colors.overlay }}
      style={({ pressed }) => [pressed && { opacity: 0.7 }]}
      accessibilityRole="button"
      accessibilityLabel={item.title}
      hitSlop={4}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
    marginVertical: 6,
    minHeight: 64,
    alignItems: 'center',
  },
  thumb: { width: 64, height: 64, borderRadius: 8 },
  thumbHeader: { width: 96, height: 96, borderRadius: 12 },
  body: { flex: 1, marginLeft: 12 },
  title: { fontWeight: '600' },
  meta: { marginTop: 2, fontSize: 12, textTransform: 'capitalize' },
  price: { marginTop: 4, fontSize: 14, fontWeight: '700' },
});

export const ListItemCard = memo(ListItemCardImpl);
