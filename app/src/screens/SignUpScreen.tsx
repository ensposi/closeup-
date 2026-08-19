import React, { useState } from 'react';
import { Alert, ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function SignUpScreen() {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!email.trim() || password.length < 8 || (mode === 'signup' && !name.trim())) {
      Alert.alert('Informations manquantes', mode === 'signup' ? 'Ajoute ton prénom, ton email et un mot de passe de 8 caractères minimum.' : 'Ajoute ton email et un mot de passe de 8 caractères minimum.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
        if (error) throw error;
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { display_name: name.trim() } },
      });
      if (error) throw error;
      if (!data.user) throw new Error('Impossible de créer le compte.');
      if (!data.session) Alert.alert('Compte créé', 'Vérifie ton email pour confirmer ton compte, puis connecte-toi.');
      else Alert.alert('Bienvenue sur CloseUp', 'Ton compte est prêt.');
    } catch (error: any) {
      Alert.alert(mode === 'login' ? 'Connexion impossible' : 'Création impossible', error?.message ?? 'Une erreur est survenue.');
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
        {mode === 'signup' && <TextInput placeholder="Prénom ou pseudo" value={name} onChangeText={setName} style={styles.input} maxLength={30} />}
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
        <TextInput placeholder="Mot de passe (8 caractères minimum)" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
        <Pressable disabled={loading} onPress={submit} style={[styles.button, loading && styles.disabled]}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>{mode === 'signup' ? 'Créer mon compte' : 'Se connecter'}</Text>}
        </Pressable>
        <Pressable onPress={() => setMode(mode === 'signup' ? 'login' : 'signup')} style={styles.switch}>
          <Text style={styles.switchText}>{mode === 'signup' ? 'J’ai déjà un compte → Se connecter' : 'Pas encore de compte → Créer un compte'}</Text>
        </Pressable>
        <Text style={styles.legal}>En utilisant CloseUp, tu acceptes de respecter les autres membres et les règles de sécurité de l'application.</Text>
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
  switch: { alignItems: 'center', paddingVertical: 5 },
  switchText: { color: '#111', fontWeight: '700' },
  legal: { textAlign: 'center', color: '#888', fontSize: 11, lineHeight: 16, paddingHorizontal: 12 },
});
