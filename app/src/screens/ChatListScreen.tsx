import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

type Chat = { id: string; name: string | null; updated_at: string };

export default function ChatListScreen() {
  const navigation = useNavigation<any>();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from('chat_rooms').select('id,name,updated_at').order('updated_at', { ascending: false });
    setChats((data as Chat[]) ?? []);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    const channel = supabase.channel('chat-list').on('postgres_changes', { event: '*', schema: 'public', table: 'chat_rooms' }, load).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <Text style={styles.subtitle}>Tes conversations avec les personnes rencontrées sur CloseUp.</Text>
      {loading ? <ActivityIndicator style={{ marginTop: 30 }} /> : <FlatList data={chats} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>Tu n’as pas encore de conversation.</Text>} renderItem={({ item }) => (
        <Pressable style={styles.row} onPress={() => navigation.navigate('ChatThread', { roomId: item.id })}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{(item.name ?? 'C').slice(0, 1).toUpperCase()}</Text></View>
          <View style={{ flex: 1 }}><Text style={styles.name}>{item.name ?? 'Discussion CloseUp'}</Text><Text style={styles.preview}>Ouvrir la conversation</Text></View>
          <Text style={styles.arrow}>›</Text>
        </Pressable>
      )} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F5', paddingTop: 22 },
  title: { fontSize: 30, fontWeight: '800', color: '#111', paddingHorizontal: 20 },
  subtitle: { color: '#777', paddingHorizontal: 20, marginTop: 5, lineHeight: 19 },
  list: { padding: 20, paddingTop: 18 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#E4E4E0' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  name: { fontSize: 16, fontWeight: '800', color: '#111' },
  preview: { color: '#888', marginTop: 3 },
  arrow: { fontSize: 28, color: '#999' },
  empty: { textAlign: 'center', color: '#888', paddingVertical: 50 },
});
