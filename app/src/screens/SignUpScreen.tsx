import React, { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../lib/supabase';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUp() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) Alert.alert('Erreur', error.message);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CloseUp</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={styles.input} />
      <TextInput placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button title={loading ? '...' : 'Créer mon compte'} onPress={signUp} disabled={loading} />
    </View>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', padding: 24, gap: 14 }, title: { fontSize: 36, fontWeight: '700', marginBottom: 20 }, input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12 } });
