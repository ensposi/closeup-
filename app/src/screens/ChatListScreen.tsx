import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';

export default function ChatListScreen() {
  const navigation = useNavigation<any>();
  const [chats, setChats] = useState<any[]>([]);
  useEffect(() => {
    supabase.from('chat_rooms').select('*').order('updated_at', { ascending: false }).then(({ data }) => setChats(data ?? []));
  }, []);
  return <View style={styles.container}><Text style={styles.title}>Messages</Text><FlatList data={chats} keyExtractor={(item) => item.id} renderItem={({ item }) => <Pressable style={styles.row} onPress={() => navigation.navigate('ChatThread', { roomId: item.id })}><Text style={styles.name}>{item.name ?? 'Discussion'}</Text><Text>Ouvrir la conversation</Text></Pressable>} /></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, padding: 18 }, title: { fontSize: 26, fontWeight: '700', marginBottom: 18 }, row: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }, name: { fontSize: 17, fontWeight: '600' } });
