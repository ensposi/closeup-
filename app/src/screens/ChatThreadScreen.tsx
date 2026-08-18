import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

type Params = { ChatThread: { roomId: string } };
type Message = { id: string; room_id: string; sender_id: string; body: string; created_at: string };

export default function ChatThreadScreen() {
  const { params } = useRoute<RouteProp<Params, 'ChatThread'>>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState('');
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel>;
    let alive = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!alive) return;
      setUserId(user?.id ?? null);
      const { data } = await supabase.from('messages').select('*').eq('room_id', params.roomId).order('created_at', { ascending: true });
      if (alive) setMessages((data as Message[]) ?? []);

      channel = supabase.channel(`chat:${params.roomId}`, { config: { presence: { key: user?.id ?? 'anonymous' } } })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${params.roomId}` }, (payload) => {
          setMessages((current) => current.some((m) => m.id === payload.new.id) ? current : [...current, payload.new as Message]);
        })
        .on('broadcast', { event: 'typing' }, ({ payload }) => {
          if (payload.userId !== user?.id) {
            setTyping(Boolean(payload.typing));
            if (payload.typing) setTimeout(() => setTyping(false), 1800);
          }
        })
        .subscribe();
    })();
    return () => { alive = false; if (channel) supabase.removeChannel(channel); };
  }, [params.roomId]);

  async function send() {
    const text = body.trim();
    if (!userId || !text || sending) return;
    setSending(true);
    const { error } = await supabase.from('messages').insert({ room_id: params.roomId, sender_id: userId, body: text });
    if (!error) setBody('');
    setSending(false);
  }

  function onChangeText(value: string) {
    setBody(value);
    supabase.channel(`chat:${params.roomId}`).send({ type: 'broadcast', event: 'typing', payload: { userId, typing: value.length > 0 } });
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <View style={styles.header}><Text style={styles.title}>Discussion</Text><Text style={styles.live}>{typing ? 'quelqu’un écrit…' : 'Conversation du Moment'}</Text></View>
      <FlatList ref={listRef} data={messages} keyExtractor={(item) => item.id} contentContainerStyle={styles.messages} onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })} renderItem={({ item }) => {
        const mine = item.sender_id === userId;
        return <View style={[styles.message, mine ? styles.mine : styles.theirs]}><Text style={mine ? styles.mineText : styles.theirText}>{item.body}</Text></View>;
      }} ListEmptyComponent={<Text style={styles.empty}>Commencez la conversation.</Text>} />
      <View style={styles.composer}>
        <TextInput value={body} onChangeText={onChangeText} placeholder="Écrire un message…" style={styles.input} multiline maxLength={500} />
        <Pressable onPress={send} disabled={!body.trim() || sending} style={[styles.send, (!body.trim() || sending) && styles.disabled]}>{sending ? <ActivityIndicator color="#FFF" /> : <Text style={styles.sendText}>↑</Text>}</Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F5' },
  header: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E6E6E2', backgroundColor: '#FFF' },
  title: { fontSize: 22, fontWeight: '800', color: '#111' },
  live: { fontSize: 12, color: '#777', marginTop: 3 },
  messages: { padding: 16, flexGrow: 1, justifyContent: 'flex-end' },
  message: { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, marginVertical: 4 },
  mine: { alignSelf: 'flex-end', backgroundColor: '#111', borderBottomRightRadius: 5 },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#FFF', borderBottomLeftRadius: 5 },
  mineText: { color: '#FFF', fontSize: 15 },
  theirText: { color: '#111', fontSize: 15 },
  empty: { alignSelf: 'center', color: '#888', marginBottom: 20 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 10, borderTopWidth: 1, borderTopColor: '#E6E6E2', backgroundColor: '#FFF' },
  input: { flex: 1, maxHeight: 100, backgroundColor: '#F2F2EF', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 11 },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.35 },
  sendText: { color: '#FFF', fontSize: 24, fontWeight: '800', marginTop: -3 },
});
