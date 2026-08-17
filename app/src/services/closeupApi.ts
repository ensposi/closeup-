import { supabase } from '../lib/supabase';

export type Moment = {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  category: string;
  starts_at: string;
  ends_at: string;
  max_participants: number;
  status: 'draft' | 'open' | 'full' | 'started' | 'finished' | 'expired' | 'cancelled';
  latitude: number;
  longitude: number;
  created_at: string;
};

export async function listUpcomingMoments(limit = 50) {
  const { data, error } = await supabase
    .from('moments')
    .select('*')
    .eq('status', 'open')
    .gt('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Moment[];
}

export async function listNearbyMoments(latitude: number, longitude: number, radiusMeters = 10000, limit = 50) {
  const { data, error } = await supabase.rpc('nearby_moments', {
    p_latitude: latitude,
    p_longitude: longitude,
    p_radius_meters: radiusMeters,
    p_limit: limit,
  });

  if (error) throw error;
  return (data ?? []) as Moment[];
}

export async function createMoment(input: {
  title: string;
  description?: string;
  category: string;
  startsAt: string;
  endsAt: string;
  maxParticipants: number;
  latitude: number;
  longitude: number;
}) {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('moments')
    .insert({
      creator_id: user.id,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      category: input.category,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      max_participants: input.maxParticipants,
      latitude: input.latitude,
      longitude: input.longitude,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Moment;
}

export async function joinMoment(momentId: string) {
  const { data, error } = await supabase.rpc('join_moment', { p_moment_id: momentId });
  if (error) throw error;
  return Boolean(data);
}

export async function leaveMoment(momentId: string) {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('moment_participants')
    .delete()
    .eq('moment_id', momentId)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function toggleFavorite(momentId: string, favorite: boolean) {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) throw new Error('Not authenticated');

  if (favorite) {
    const { error } = await supabase.from('moment_favorites').upsert({ moment_id: momentId, user_id: user.id });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('moment_favorites')
      .delete()
      .eq('moment_id', momentId)
      .eq('user_id', user.id);
    if (error) throw error;
  }
}

export async function reportUser(input: { reportedUserId?: string; momentId?: string; reason: string; details?: string }) {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    reported_user_id: input.reportedUserId ?? null,
    moment_id: input.momentId ?? null,
    reason: input.reason,
    details: input.details?.trim() || null,
  });

  if (error) throw error;
}

export async function blockUser(blockedId: string) {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) throw new Error('Not authenticated');
  if (user.id === blockedId) throw new Error('You cannot block yourself');

  const { error } = await supabase.from('blocks').insert({ blocker_id: user.id, blocked_id: blockedId });
  if (error) throw error;
}
