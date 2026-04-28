import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { api } from '../services/api';
import { useTheme } from '../theme/ThemeProvider';
import { ListItemCard } from '../components/ListItemCard';
import { LoadingView } from '../components/LoadingView';
import { ErrorView } from '../components/ErrorView';
import { EmptyView } from '../components/EmptyView';
import type { DetailItem, RootStackParamList } from '../types/models';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

type Status = 'loading' | 'success' | 'error' | 'empty' | 'fallback';

export function DetailScreen({ route }: Props) {
  const { colors } = useTheme();
  const params = route.params;
  const item = params?.item;
  const id = params?.id;
  const [detail, setDetail] = useState<DetailItem | null>(null);
  const [status, setStatus] = useState<Status>('loading');

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
        <EmptyView message="This item could not be found." />
      </SafeAreaView>
    );
  }

  if (status === 'loading' && !detail) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
        <LoadingView label="Loading item…" />
      </SafeAreaView>
    );
  }

  if (status === 'error') {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]}>
        <ErrorView message="We couldn't load this item's details." onRetry={fetchDetail} />
      </SafeAreaView>
    );
  }

  const display = (detail ?? item) as DetailItem;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ListItemCard item={display} variant="header" />

        {status === 'fallback' ? (
          <View style={[styles.notice, { backgroundColor: colors.danger + '22' }]}>
            <Text style={[styles.noticeText, { color: colors.danger }]}>
              Showing cached data — extended details unavailable.
            </Text>
          </View>
        ) : null}

        <View style={styles.section}>
          {display.description ? (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
              <Text style={[styles.body, { color: colors.textMuted }]}>{display.description}</Text>
            </>
          ) : null}

          <View style={styles.metaGrid}>
            {typeof display.rating === 'number' ? (
              <Meta label="Rating" value={display.rating.toFixed(1)} />
            ) : null}
            {typeof display.stock === 'number' ? (
              <Meta label="Stock" value={String(display.stock)} />
            ) : null}
            {display.brand ? <Meta label="Brand" value={display.brand} /> : null}
            {display.category ? <Meta label="Category" value={display.category} /> : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.metaItem, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <Text style={[styles.metaLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: 32 },
  notice: { marginHorizontal: 16, marginTop: 8, padding: 10, borderRadius: 8 },
  noticeText: { fontSize: 13, fontWeight: '600' },
  section: { paddingHorizontal: 16, paddingTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 12, marginBottom: 8 },
  body: { fontSize: 15, lineHeight: 22 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, marginHorizontal: -4 },
  metaItem: {
    flexBasis: '48%',
    flexGrow: 1,
    margin: 4,
    padding: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  metaLabel: { fontSize: 12, fontWeight: '600' },
  metaValue: { fontSize: 16, fontWeight: '700', marginTop: 4 },
});
