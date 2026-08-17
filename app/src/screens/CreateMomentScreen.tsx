import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function CreateMomentScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('coffee');
  const [saving, setSaving] = useState(false);

  async function createMoment() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('moments').insert({ creator_id: user.id, title, description, category, starts_at: new Date(Date.now() + 3600000).toISOString(), ends_at: new Date(Date.now() + 7200000).toISOString(), max_participants: 6, latitude: 48.8566, longitude: 2.3522, status: 'open' });
    setSaving(false);
    if (error) Alert.alert('Erreur', error.message); else { setTitle(''); setDescription(''); Alert.alert('Moment créé'); }
  }

  return <View style={styles.container}><Text style={styles.title}>Créer un Moment</Text><TextInput placeholder="Titre" value={title} onChangeText={setTitle} style={styles.input} /><TextInput placeholder="Description" value={description} onChangeText={setDescription} style={styles.input} multiline /><TextInput placeholder="Catégorie" value={category} onChangeText={setCategory} style={styles.input} /><Button title={saving ? '...' : 'Publier'} onPress={createMoment} disabled={saving || !title.trim()} /></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, padding: 18, gap: 12 }, title: { fontSize: 26, fontWeight: '700', marginBottom: 12 }, input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12 } });
