import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../theme/ThemeProvider';
import { ListItemCard } from '../components/ListItemCard';
import { LoadingView } from '../components/LoadingView';
import { ErrorView } from '../components/ErrorView';
import { EmptyView } from '../components/EmptyView';
import type { ListItem, RootStackParamList } from '../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

type Status = 'idle' | 'loading' | 'success' | 'error';

const keyExtractor = (it: ListItem) => String(it.id);

export function HomeScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { state, signOut } = useAuth();
  const [items, setItems] = useState<ListItem[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const refreshErrorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchList = useCallback(async (mode: 'initial' | 'refresh') => {
    if (mode === 'initial') setStatus('loading');
    else setRefreshing(true);
    try {
      const res = await api.get<{ products: ListItem[] }>('/products', { params: { limit: 30 } });
      const next = Array.isArray(res.data?.products) ? res.data.products : [];
      setItems(next);
      setStatus('success');
      setRefreshError(null);
    } catch (err) {
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

  const onItemPress = useCallback(
    (item: ListItem) => navigation.navigate('Detail', { item, id: item.id }),
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => <ListItemCard item={item} onPress={onItemPress} />,
    [onItemPress],
  );

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerText}>
          <Text style={[styles.hello, { color: colors.textMuted }]}>Signed in as</Text>
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
            { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={[styles.logoutText, { color: colors.primary }]}>Logout</Text>
        </Pressable>
      </View>

      {refreshError ? (
        <View style={[styles.banner, { backgroundColor: colors.danger + '22' }]}>
          <Text style={[styles.bannerText, { color: colors.danger }]}>{refreshError}</Text>
        </View>
      ) : null}

      {status === 'loading' ? (
        <LoadingView label="Fetching products…" />
      ) : status === 'error' ? (
        <ErrorView
          message="We couldn't load products. Check your connection and try again."
          onRetry={() => fetchList('initial')}
        />
      ) : items.length === 0 ? (
        <EmptyView message="No products available right now." />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          initialNumToRender={10}
          windowSize={7}
          removeClippedSubviews
          contentContainerStyle={styles.listContent}
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
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerText: { flex: 1 },
  hello: { fontSize: 12 },
  email: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  logout: {
    minHeight: 44,
    minWidth: 76,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { fontWeight: '700' },
  banner: { marginHorizontal: 16, marginTop: 8, padding: 10, borderRadius: 8 },
  bannerText: { fontSize: 13, fontWeight: '600' },
  listContent: { paddingVertical: 8 },
});
