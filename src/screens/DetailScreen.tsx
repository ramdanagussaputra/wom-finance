import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../services/api';
import { useTheme } from '../theme/ThemeProvider';
import { LoadingView } from '../components/LoadingView';
import { ErrorView } from '../components/ErrorView';
import { EmptyView } from '../components/EmptyView';
import { StarRating } from '../components/StarRating';
import type { DetailItem, RootStackParamList } from '../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;
type Status = 'loading' | 'success' | 'error' | 'empty' | 'fallback';

const { width: SCREEN_W } = Dimensions.get('window');
const HERO_HEIGHT = 360;

export function DetailScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const params = route.params;
  const item = params?.item;
  const id = params?.id;
  const [detail, setDetail] = useState<DetailItem | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [imageIndex, setImageIndex] = useState(0);

  const scrollY = useRef(new Animated.Value(0)).current;
  const galleryRef = useRef<ScrollView>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) {
      setStatus('empty');
      return;
    }
    setStatus('loading');
    try {
      const res = await api.get<DetailItem>(`/products/${id}`);
      if (!res.data) {
        setStatus('empty');
        return;
      }
      setDetail(res.data);
      setStatus('success');
    } catch {
      if (item) {
        setDetail(item as DetailItem);
        setStatus('fallback');
      } else {
        setStatus('error');
      }
    }
  }, [id, item]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (!item && !detail && status === 'empty') {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
        <BackButton onPress={navigation.goBack} colors={colors} />
        <EmptyView message="This item could not be found." />
      </SafeAreaView>
    );
  }
  if (status === 'loading' && !detail) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
        <BackButton onPress={navigation.goBack} colors={colors} />
        <LoadingView label="Loading item…" />
      </SafeAreaView>
    );
  }
  if (status === 'error') {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
        <BackButton onPress={navigation.goBack} colors={colors} />
        <ErrorView message="We couldn't load this item's details." onRetry={fetchDetail} />
      </SafeAreaView>
    );
  }

  const display = (detail ?? item) as DetailItem;
  const images =
    display.images && display.images.length > 0
      ? display.images
      : display.thumbnail
      ? [display.thumbnail]
      : [];

  const heroTranslateY = scrollY.interpolate({
    inputRange: [-HERO_HEIGHT, 0, HERO_HEIGHT],
    outputRange: [0, 0, -HERO_HEIGHT * 0.4],
    extrapolateRight: 'clamp',
  });
  const heroScale = scrollY.interpolate({
    inputRange: [-HERO_HEIGHT, 0],
    outputRange: [2.2, 1],
    extrapolateRight: 'clamp',
  });
  const heroOpacity = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT * 0.7, HERO_HEIGHT],
    outputRange: [1, 0.4, 0],
    extrapolate: 'clamp',
  });
  const headerBgOpacity = scrollY.interpolate({
    inputRange: [HERO_HEIGHT * 0.45, HERO_HEIGHT * 0.85],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [HERO_HEIGHT * 0.6, HERO_HEIGHT * 0.95],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const hasDiscount =
    typeof display.discountPercentage === 'number' && display.discountPercentage > 0;
  const originalPrice =
    hasDiscount && typeof display.price === 'number'
      ? display.price / (1 - (display.discountPercentage as number) / 100)
      : null;

  const stockTone =
    typeof display.stock !== 'number'
      ? null
      : display.stock <= 0
      ? 'danger'
      : display.stock < 20
      ? 'warning'
      : 'success';
  const stockBg =
    stockTone === 'danger'
      ? colors.dangerSoft
      : stockTone === 'warning'
      ? colors.warningSoft
      : stockTone === 'success'
      ? colors.successSoft
      : colors.surface;
  const stockFg =
    stockTone === 'danger'
      ? colors.danger
      : stockTone === 'warning'
      ? colors.warning
      : stockTone === 'success'
      ? colors.success
      : colors.textMuted;
  const stockLabel =
    typeof display.stock !== 'number'
      ? null
      : display.stock <= 0
      ? 'Out of stock'
      : display.stock < 20
      ? `Only ${display.stock} left`
      : `${display.stock} in stock`;

  const onGalleryScroll = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (idx !== imageIndex) setImageIndex(idx);
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      {/* Hero */}
      <Animated.View
        style={[
          styles.hero,
          {
            backgroundColor: colors.surfaceAlt,
            transform: [{ translateY: heroTranslateY }, { scale: heroScale }],
            opacity: heroOpacity,
          },
        ]}
      >
        <ScrollView
          ref={galleryRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onGalleryScroll}
          scrollEventThrottle={16}
        >
          {images.map((src, i) => (
            <Image
              key={`${src}-${i}`}
              source={{ uri: src }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ))}
          {images.length === 0 ? <View style={styles.heroImage} /> : null}
        </ScrollView>
        <View
          pointerEvents="none"
          style={[styles.heroFade, { backgroundColor: colors.background }]}
        />
        {images.length > 1 ? (
          <View style={styles.dots}>
            {images.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === imageIndex ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
                    width: i === imageIndex ? 18 : 6,
                  },
                ]}
              />
            ))}
          </View>
        ) : null}
      </Animated.View>

      {/* Content */}
      <Animated.ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: HERO_HEIGHT - 24 }]}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
      >
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          {display.brand ? (
            <Text style={[styles.brand, { color: colors.primary }]} numberOfLines={1}>
              {display.brand.toUpperCase()}
            </Text>
          ) : null}
          <Text style={[styles.title, { color: colors.text }]}>{display.title}</Text>

          <View style={styles.rowBetween}>
            {typeof display.rating === 'number' ? (
              <StarRating value={display.rating} size={14} />
            ) : (
              <View />
            )}
            {stockLabel ? (
              <View style={[styles.stockBadge, { backgroundColor: stockBg }]}>
                <View style={[styles.stockDot, { backgroundColor: stockFg }]} />
                <Text style={[styles.stockText, { color: stockFg }]}>{stockLabel}</Text>
              </View>
            ) : null}
          </View>

          {typeof display.price === 'number' ? (
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: colors.text }]}>
                ${display.price.toFixed(2)}
              </Text>
              {originalPrice ? (
                <>
                  <Text style={[styles.originalPrice, { color: colors.textMuted }]}>
                    ${originalPrice.toFixed(2)}
                  </Text>
                  <View style={[styles.savingsPill, { backgroundColor: colors.accentSoft }]}>
                    <Text style={[styles.savingsText, { color: colors.accent }]}>
                      Save {Math.round(display.discountPercentage as number)}%
                    </Text>
                  </View>
                </>
              ) : null}
            </View>
          ) : null}

          {status === 'fallback' ? (
            <View style={[styles.notice, { backgroundColor: colors.dangerSoft }]}>
              <Text style={[styles.noticeText, { color: colors.danger }]}>
                Showing cached data — extended details unavailable.
              </Text>
            </View>
          ) : null}

          {display.description ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>About this product</Text>
              <Text style={[styles.body, { color: colors.textMuted }]}>{display.description}</Text>
            </View>
          ) : null}

          <View style={styles.metaGrid}>
            {display.category ? (
              <Meta label="Category" value={display.category} />
            ) : null}
            {display.brand ? <Meta label="Brand" value={display.brand} /> : null}
            {typeof display.rating === 'number' ? (
              <Meta label="Rating" value={`${display.rating.toFixed(1)} / 5`} />
            ) : null}
            {typeof display.stock === 'number' ? (
              <Meta label="Stock" value={String(display.stock)} />
            ) : null}
          </View>

          {display.tags && display.tags.length > 0 ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Tags</Text>
              <View style={styles.tagsRow}>
                {display.tags.map((t) => (
                  <View
                    key={t}
                    style={[styles.tag, { backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }]}
                  >
                    <Text style={[styles.tagText, { color: colors.primary }]}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </Animated.ScrollView>

      {/* Floating header */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.headerBg,
          { backgroundColor: colors.background, opacity: headerBgOpacity, borderBottomColor: colors.border },
        ]}
      />
      <SafeAreaView edges={['top']} style={styles.headerSafe} pointerEvents="box-none">
        <View style={styles.headerRow} pointerEvents="box-none">
          <BackButton onPress={navigation.goBack} colors={colors} />
          <Animated.Text
            numberOfLines={1}
            style={[styles.headerTitle, { color: colors.text, opacity: headerTitleOpacity }]}
          >
            {display.title}
          </Animated.Text>
          <View style={styles.headerSpacer} />
        </View>
      </SafeAreaView>
    </View>
  );
}

function BackButton({
  onPress,
  colors,
}: {
  onPress: () => void;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Back"
      style={({ pressed }) => [
        styles.backBtn,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.7 : 1,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <Text style={[styles.backArrow, { color: colors.text }]}>‹</Text>
    </Pressable>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.metaItem, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <Text style={[styles.metaLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: colors.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT,
  },
  heroImage: { width: SCREEN_W, height: HERO_HEIGHT },
  heroFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    opacity: 0.0,
  },
  dots: {
    position: 'absolute',
    bottom: 36,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  scrollContent: { paddingBottom: 48 },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    minHeight: 600,
  },
  brand: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  title: { fontSize: 26, fontWeight: '800', marginTop: 6, letterSpacing: -0.4, lineHeight: 32 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  stockDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  stockText: { fontSize: 12, fontWeight: '700' },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 14,
    flexWrap: 'wrap',
  },
  price: { fontSize: 32, fontWeight: '900', letterSpacing: -0.6 },
  originalPrice: {
    marginLeft: 10,
    fontSize: 16,
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  savingsPill: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  savingsText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.4 },
  notice: { marginTop: 16, padding: 12, borderRadius: 12 },
  noticeText: { fontSize: 13, fontWeight: '600' },
  section: { marginTop: 22 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 10 },
  body: { fontSize: 15, lineHeight: 22 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 22, marginHorizontal: -4 },
  metaItem: {
    flexBasis: '48%',
    flexGrow: 1,
    margin: 4,
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  metaLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  metaValue: { fontSize: 15, fontWeight: '700', marginTop: 4, textTransform: 'capitalize' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
  },
  tagText: { fontSize: 12, fontWeight: '700' },
  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 96,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerSafe: { position: 'absolute', top: 0, left: 0, right: 0 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    height: 56,
  },
  headerTitle: { flex: 1, marginHorizontal: 12, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  headerSpacer: { width: 44, height: 44 },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  backArrow: { fontSize: 28, fontWeight: '600', marginTop: -2 },
});
