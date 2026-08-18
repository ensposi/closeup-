import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';

const CATEGORIES = [
  { value: 'coffee', label: '☕ Café' },
  { value: 'aperitif', label: '🍸 Apéro' },
  { value: 'concert', label: '🎵 Concert' },
  { value: 'hike', label: '🥾 Randonnée' },
  { value: 'food', label: '🍽️ Food' },
  { value: 'sport', label: '⚽ Sport' },
];

export default function CreateMomentScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('coffee');
  const [maxParticipants, setMaxParticipants] = useState('6');
  const [saving, setSaving] = useState(false);

  async function createMoment() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Session expirée.');

      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') throw new Error('La localisation est nécessaire pour placer ton Moment.');
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });

      const starts = new Date(Date.now() + 60 * 60 * 1000);
      const ends = new Date(Date.now() + 3 * 60 * 60 * 1000);
      const { error } = await supabase.from('moments').insert({
        creator_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        category,
        starts_at: starts.toISOString(),
        ends_at: ends.toISOString(),
        max_participants: Math.min(20, Math.max(2, Number(maxParticipants) || 6)),
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        location: `POINT(${position.coords.longitude} ${position.coords.latitude})`,
        status: 'open',
      });
      if (error) throw error;
      setTitle(''); setDescription('');
      Alert.alert('Moment publié', 'Il est maintenant visible autour de toi.');
    } catch (error: any) {
      Alert.alert('Impossible de publier', error?.message ?? 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.kicker}>NOUVEAU</Text>
      <Text style={styles.title}>Crée un Moment</Text>
      <Text style={styles.subtitle}>Propose quelque chose de simple. Les bonnes rencontres viennent souvent d'un plan précis.</Text>

      <Text style={styles.label}>Titre</Text>
      <TextInput placeholder="Ex. Café au Marais à 18h" value={title} onChangeText={setTitle} style={styles.input} maxLength={70} />

      <Text style={styles.label}>Catégorie</Text>
      <View style={styles.chips}>
        {CATEGORIES.map((item) => (
          <Pressable key={item.value} onPress={() => setCategory(item.value)} style={[styles.chip, category === item.value && styles.chipActive]}>
            <Text style={[styles.chipText, category === item.value && styles.chipTextActive]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Description</Text>
      <TextInput placeholder="Ambiance, lieu, ce que tu veux faire…" value={description} onChangeText={setDescription} style={[styles.input, styles.textarea]} multiline maxLength={300} />

      <Text style={styles.label}>Nombre maximum</Text>
      <TextInput value={maxParticipants} onChangeText={setMaxParticipants} keyboardType="number-pad" style={styles.input} maxLength={2} />

      <View style={styles.info}><Text style={styles.infoTitle}>📍 Position actuelle</Text><Text style={styles.infoText}>CloseUp utilisera ta position pour placer le Moment sur la carte.</Text></View>

      <Pressable disabled={saving || !title.trim()} onPress={createMoment} style={[styles.publish, (saving || !title.trim()) && styles.disabled]}>
        {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.publishText}>Publier le Moment</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F5' },
  content: { padding: 20, paddingBottom: 40 },
  kicker: { fontSize: 12, letterSpacing: 2, fontWeight: '800', color: '#777' },
  title: { fontSize: 32, fontWeight: '800', color: '#111', marginTop: 5 },
  subtitle: { color: '#666', lineHeight: 20, marginTop: 8, marginBottom: 25 },
  label: { fontSize: 14, fontWeight: '800', color: '#222', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E2DE', borderRadius: 15, padding: 14, fontSize: 16 },
  textarea: { minHeight: 110, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', borderRadius: 20, paddingHorizontal: 13, paddingVertical: 10 },
  chipActive: { backgroundColor: '#111', borderColor: '#111' },
  chipText: { color: '#333', fontWeight: '600' },
  chipTextActive: { color: '#FFF' },
  info: { backgroundColor: '#ECECE7', borderRadius: 15, padding: 14, marginTop: 18 },
  infoTitle: { fontWeight: '800' },
  infoText: { color: '#666', lineHeight: 18, marginTop: 4 },
  publish: { backgroundColor: '#111', borderRadius: 16, alignItems: 'center', padding: 16, marginTop: 22 },
  disabled: { opacity: 0.45 },
  publishText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
});
