import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => { (async () => { const { data: { user } } = await supabase.auth.getUser(); if (!user) return; const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single(); setProfile(data); })(); }, []);
  return <View style={styles.container}><Text style={styles.title}>{profile?.display_name ?? 'Mon profil'}</Text><Text>{profile?.bio ?? 'Ajoute une bio dans ton profil.'}</Text><View style={{ height: 20 }} /><Button title="Se déconnecter" onPress={() => supabase.auth.signOut()} /></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, padding: 18 }, title: { fontSize: 30, fontWeight: '700', marginBottom: 10 } });
