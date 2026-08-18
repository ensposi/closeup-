import React, { useState } from 'react';
import { Alert, ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUp() {
    if (!name.trim() || !email.trim() || password.length < 8) {
      Alert.alert('Informations manquantes', 'Ajoute ton prénom, un email et un mot de passe de 8 caractères minimum.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw error;
      if (!data.user) throw new Error('Impossible de créer le compte.');

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        display_name: name.trim(),
        safe_score: 100,
        mode: 'local',
      });
      if (profileError) throw profileError;

      if (!data.session) {
        Alert.alert('Compte créé', 'Vérifie ton email pour confirmer ton compte, puis reconnecte-toi.');
      }
    } catch (error: any) {
      Alert.alert('Création impossible', error?.message ?? 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.logo}>CloseUp</Text>
        <Text style={styles.tagline}>Des plans, pas des likes.</Text>
        <Text style={styles.subtitle}>Rencontre des gens près de toi autour de vrais Moments.</Text>
      </View>
      <View style={styles.form}>
        <TextInput placeholder="Prénom ou pseudo" value={name} onChangeText={setName} style={styles.input} maxLength={30} />
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
        <TextInput placeholder="Mot de passe (8 caractères minimum)" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
        <Pressable disabled={loading} onPress={signUp} style={[styles.button, loading && styles.disabled]}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Créer mon compte</Text>}
        </Pressable>
        <Text style={styles.legal}>En continuant, tu acceptes de respecter les autres membres et les règles de sécurité de CloseUp.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: 26, paddingTop: 90, paddingBottom: 34, backgroundColor: '#F7F7F5' },
  logo: { fontSize: 44, fontWeight: '900', letterSpacing: -2, color: '#111' },
  tagline: { fontSize: 22, fontWeight: '800', marginTop: 12, color: '#111' },
  subtitle: { fontSize: 15, lineHeight: 21, color: '#666', marginTop: 8, maxWidth: 330 },
  form: { gap: 12 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E1E1DD', borderRadius: 15, padding: 15, fontSize: 16 },
  button: { backgroundColor: '#111', borderRadius: 15, alignItems: 'center', padding: 16, marginTop: 4 },
  disabled: { opacity: 0.5 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  legal: { textAlign: 'center', color: '#888', fontSize: 11, lineHeight: 16, paddingHorizontal: 12 },
});
