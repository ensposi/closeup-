import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '../lib/supabase';

const CATEGORIES = ['Tous', '☕ Café', '🍸 Apéro', '🎵 Concert', '🥾 Randonnée', '🍽️ Food', '⚽ Sport'];
const categoryValue = (label: string) => label === 'Tous' ? null : label.slice(2).trim().toLowerCase();

type Moment = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  starts_at: string;
  ends_at: string;
  max_participants: number;
  status: string;
  latitude: number;
  longitude: number;
};

export default function FeedScreen() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('Tous');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const category = categoryValue(filter);
    let query = supabase.from('moments').select('*').in('status', ['open', 'full', 'started']).order('starts_at', { ascending: true });
    if (category) query = query.eq('category', category);
    const [{ data, error }, { data: participantRows }] = await Promise.all([
      query,
      user ? supabase.from('moment_participants').select('moment_id').eq('user_id', user.id) : Promise.resolve({ data: [] as { moment_id: string }[] }),
    ]);
    if (error) Alert.alert('Impossible de charger les Moments', error.message);
    setMoments((data as Moment[]) ?? []);
    setJoined(new Set((participantRows ?? []).map((row) => row.moment_id)));
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const channel = supabase.channel('feed-moments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'moments' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'moment_participants' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const join = async (id: string) => {
    const { error } = await supabase.rpc('join_moment', { p_moment_id: id });
    if (error) Alert.alert('Moment indisponible', error.message);
    else { setJoined((old) => new Set(old).add(id)); await load(); }
  };

  const header = useMemo(() => (
    <>
      <View style={styles.hero}>
        <View>
          <Text style={styles.kicker}>CLOSEUP</Text>
          <Text style={styles.title}>Des plans, pas des likes.</Text>
          <Text style={styles.subtitle}>Trouve des personnes autour de toi et rejoins un vrai Moment.</Text>
        </View>
      </View>
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        renderItem={({ item }) => (
          <Pressable onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterActive]}>
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
          </Pressable>
        )}
      />
      <Text style={styles.sectionTitle}>Près de toi</Text>
    </>
  ), [filter]);

  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator style={styles.loader} /> : null}
      <FlatList
        data={moments}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>Aucun Moment ouvert dans cette catégorie.</Text> : null}
        renderItem={({ item }) => {
          const isJoined = joined.has(item.id);
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.category}>{item.category}</Text>
                <Text style={styles.status}>{item.status === 'full' ? 'Complet' : item.status === 'started' ? 'En cours' : 'Ouvert'}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {!!item.description && <Text style={styles.description} numberOfLines={2}>{item.description}</Text>}
              <Text style={styles.date}>{format(new Date(item.starts_at), "EEEE d MMMM • HH'h'", { locale: fr })}</Text>
              <View style={styles.cardBottom}>
                <Text style={styles.meta}>Jusqu'à {item.max_participants} personnes</Text>
                <Pressable disabled={isJoined || item.status !== 'open'} onPress={() => join(item.id)} style={[styles.join, (isJoined || item.status !== 'open') && styles.joinDisabled]}>
                  <Text style={styles.joinText}>{isJoined ? '✓ Inscrit' : item.status === 'full' ? 'Complet' : 'Rejoindre'}</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F5' },
  list: { paddingBottom: 32 },
  loader: { position: 'absolute', top: 12, alignSelf: 'center', zIndex: 3 },
  hero: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 12 },
  kicker: { fontSize: 12, fontWeight: '800', letterSpacing: 2, color: '#777' },
  title: { fontSize: 31, lineHeight: 36, fontWeight: '800', marginTop: 6, color: '#111' },
  subtitle: { color: '#666', fontSize: 15, lineHeight: 21, marginTop: 8, maxWidth: 340 },
  filters: { paddingHorizontal: 20, gap: 8, paddingVertical: 10 },
  filter: { borderWidth: 1, borderColor: '#DDD', borderRadius: 22, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: '#FFF' },
  filterActive: { backgroundColor: '#111', borderColor: '#111' },
  filterText: { color: '#333', fontWeight: '600' },
  filterTextActive: { color: '#FFF' },
  sectionTitle: { fontSize: 20, fontWeight: '800', paddingHorizontal: 20, marginTop: 8, marginBottom: 10 },
  card: { marginHorizontal: 20, backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#ECECE8' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  category: { fontSize: 13, fontWeight: '700', color: '#666', textTransform: 'capitalize' },
  status: { fontSize: 12, fontWeight: '700', color: '#3C6E47' },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#111', marginTop: 10 },
  description: { color: '#666', marginTop: 6, lineHeight: 19 },
  date: { marginTop: 12, fontWeight: '700', color: '#222', textTransform: 'capitalize' },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  meta: { color: '#777', fontSize: 12 },
  join: { backgroundColor: '#111', borderRadius: 14, paddingHorizontal: 15, paddingVertical: 10 },
  joinDisabled: { backgroundColor: '#999' },
  joinText: { color: '#FFF', fontWeight: '800' },
  empty: { textAlign: 'center', color: '#777', paddingHorizontal: 40, paddingVertical: 40 },
});
