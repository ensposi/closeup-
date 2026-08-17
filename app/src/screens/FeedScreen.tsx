import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function FeedScreen() {
  const [moments, setMoments] = useState<any[]>([]);
  useEffect(() => {
    supabase.from('moments').select('*').eq('status', 'open').order('starts_at').then(({ data }) => setMoments(data ?? []));
  }, []);
  return <View style={styles.container}><Text style={styles.title}>Moments près de toi</Text><FlatList data={moments} keyExtractor={(item) => item.id} renderItem={({ item }) => <View style={styles.card}><Text style={styles.name}>{item.title}</Text><Text>{item.description ?? ''}</Text></View>} ListEmptyComponent={<Text>Aucun Moment ouvert.</Text>} /></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, padding: 18 }, title: { fontSize: 26, fontWeight: '700', marginBottom: 18 }, card: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#ddd', marginBottom: 12 }, name: { fontSize: 18, fontWeight: '600' } });
