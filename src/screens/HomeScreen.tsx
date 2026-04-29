import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeProvider';
import { ListItemCard } from '../components/ListItemCard';
import { SkeletonList } from '../components/SkeletonList';
import { ErrorView } from '../components/ErrorView';
import { EmptyView } from '../components/EmptyView';
import { AnimatedListItem } from '../components/AnimatedListItem';
import type { ListItem, RootStackParamList } from '../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

type Status = 'idle' | 'loading' | 'success' | 'error';

const ALL = '__all__';

const keyExtractor = (it: ListItem) => String(it.id);

export function HomeScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { state, signOut } = useAuth();
  const [items, setItems] = useState<ListItem[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(ALL);
  const refreshErrorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const headerScale = useRef(new Animated.Value(0.9)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerScale, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 6 }),
      Animated.timing(headerOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
    ]).start();
  }, [headerScale, headerOpacity]);

  const fetchList = useCallback(async (mode: 'initial' | 'refresh') => {
    if (mode === 'initial') setStatus('loading');
    else setRefreshing(true);
    try {
      const res = await api.get<{ products: ListItem[] }>('/products', { params: { limit: 50 } });
      const next = Array.isArray(res.data?.products) ? res.data.products : [];
      setItems(next);
      setStatus('success');
      setRefreshError(null);
    } catch {
      if (mode === 'initial') {
        setStatus('error');
      } else {
        setRefreshError('Refresh failed — showing cached data');
        if (refreshErrorTimer.current) clearTimeout(refreshErrorTimer.current);
        refreshErrorTimer.current = setTimeout(() => setRefreshError(null), 4000);
      }
    } finally {
      if (mode === 'refresh') setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchList('initial');
    return () => {
      if (refreshErrorTimer.current) clearTimeout(refreshErrorTimer.current);
    };
  }, [fetchList]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.category) set.add(it.category);
    });
    return [ALL, ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (activeCategory !== ALL && it.category !== activeCategory) return false;
      if (!q) return true;
      const hay = `${it.title ?? ''} ${it.brand ?? ''} ${it.category ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query, activeCategory]);

  const onItemPress = useCallback(
    (item: ListItem) => navigation.navigate('Detail', { item, id: item.id }),
    [navigation],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: ListItem; index: number }) => (
      <AnimatedListItem index={index}>
        <ListItemCard item={item} onPress={onItemPress} />
      </AnimatedListItem>
    ),
    [onItemPress],
  );

  const initial =
    state.email && state.email.length > 0 ? state.email[0]!.toUpperCase() : '?';

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View
        style={[
          styles.header,
          { opacity: headerOpacity, transform: [{ scale: headerScale }] },
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.hello, { color: colors.textMuted }]}>Hello,</Text>
          <Text style={[styles.email, { color: colors.text }]} numberOfLines={1}>
            {state.email ?? 'Welcome'}
          </Text>
        </View>
        <Pressable
          onPress={signOut}
          accessibilityRole="button"
          accessibilityLabel="Logout"
          hitSlop={8}
          style={({ pressed }) => [
            styles.logout,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={[styles.logoutText, { color: colors.text }]}>↗</Text>
        </Pressable>
      </Animated.View>

      <View style={styles.titleRow}>
        <View>
          <Text style={[styles.greetingTitle, { color: colors.text }]}>Discover</Text>
          <Text style={[styles.greetingSub, { color: colors.textMuted }]}>
            {status === 'success' ? `${filtered.length} products` : 'Loading catalog…'}
          </Text>
        </View>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.searchIcon, { color: colors.textMuted }]}>⌕</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search products, brands…"
          placeholderTextColor={colors.textMuted}
          style={[styles.search, { color: colors.text }]}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search products"
        />
        {query.length > 0 ? (
          <Pressable onPress={() => setQuery('')} hitSlop={10} style={styles.clearBtn}>
            <Text style={[styles.clearText, { color: colors.textMuted }]}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      {categories.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipsRow}
        >
          {categories.map((c) => {
            const active = c === activeCategory;
            const label = c === ALL ? 'All' : c.replace(/-/g, ' ');
            return (
              <Pressable
                key={c}
                onPress={() => setActiveCategory(c)}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: active ? colors.primary : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`Filter ${label}`}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? colors.primaryText : colors.text },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {refreshError ? (
        <View style={[styles.banner, { backgroundColor: colors.dangerSoft }]}>
          <Text style={[styles.bannerText, { color: colors.danger }]}>{refreshError}</Text>
        </View>
      ) : null}

      {status === 'loading' ? (
        <SkeletonList count={6} />
      ) : status === 'error' ? (
        <ErrorView
          message="We couldn't load products. Check your connection and try again."
          onRetry={() => fetchList('initial')}
        />
      ) : filtered.length === 0 ? (
        <EmptyView
          message={
            query || activeCategory !== ALL
              ? 'No products match your filters.'
              : 'No products available right now.'
          }
        />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          initialNumToRender={10}
          windowSize={7}
          removeClippedSubviews
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchList('refresh')}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  headerText: { flex: 1, marginLeft: 12 },
  hello: { fontSize: 12, fontWeight: '600' },
  email: { fontSize: 14, fontWeight: '700', marginTop: 1 },
  logout: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { fontSize: 18, fontWeight: '700' },
  titleRow: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  greetingTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  greetingSub: { fontSize: 13, marginTop: 2 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 4,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  searchIcon: { fontSize: 18, marginRight: 6 },
  search: { flex: 1, fontSize: 15, paddingVertical: 10 },
  clearBtn: { paddingHorizontal: 6, paddingVertical: 4 },
  clearText: { fontSize: 14, fontWeight: '700' },
  chipScroll: {
    flexGrow: 0,
    flexShrink: 0,
    marginTop: 12,
    marginBottom: 4,
  },
  chipsRow: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginHorizontal: 4,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
  banner: { marginHorizontal: 16, marginTop: 8, padding: 10, borderRadius: 10 },
  bannerText: { fontSize: 13, fontWeight: '600' },
  listContent: { paddingTop: 4, paddingBottom: 24 },
});
