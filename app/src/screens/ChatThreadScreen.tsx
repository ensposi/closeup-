import React, { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { RouteProp, useRoute } from '@react-navigation/native';

type Params = { ChatThread: { roomId: string } };
export default function ChatThreadScreen() {
  const { params } = useRoute<RouteProp<Params, 'ChatThread'>>();
  const [messages, setMessages] = useState<any[]>([]);
  const [body, setBody] = useState('');
  useEffect(() => {
    load();
    const channel = supabase.channel(`room:${params.roomId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${params.roomId}` }, (payload) => setMessages((m) => [...m, payload.new])).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [params.roomId]);
  async function load() { const { data } = await supabase.from('messages').select('*').eq('room_id', params.roomId).order('created_at'); setMessages(data ?? []); }
  async function send() { const { data: { user } } = await supabase.auth.getUser(); if (!user || !body.trim()) return; await supabase.from('messages').insert({ room_id: params.roomId, sender_id: user.id, body: body.trim() }); setBody(''); }
  return <View style={styles.container}><FlatList data={messages} keyExtractor={(i) => i.id} renderItem={({ item }) => <View style={styles.msg}><Text>{item.body}</Text></View>} /><View style={styles.composer}><TextInput value={body} onChangeText={setBody} placeholder="Message" style={styles.input} /><Button title="Envoyer" onPress={send} /></View></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, padding: 12 }, msg: { padding: 12, backgroundColor: '#f2f2f2', borderRadius: 14, marginVertical: 5 }, composer: { flexDirection: 'row', gap: 8, alignItems: 'center' }, input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12 } });
