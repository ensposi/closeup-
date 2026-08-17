import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { UserMode } from '../types';

interface AppState {
  userId: string | null;
  mode: UserMode;
  modeOverrideActive: boolean;
  setUserId: (id: string | null) => void;
  refreshMode: () => Promise<void>;
  setModeOverride: (mode: UserMode | null) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  userId: null,
  mode: 'local',
  modeOverrideActive: false,
  setUserId: (id) => set({ userId: id }),
  refreshMode: async () => {
    const userId = get().userId;
    if (!userId) return;
    const { data, error } = await supabase.rpc('get_user_mode', { p_user_id: userId });
    if (error) {
      console.warn('refreshMode failed', error);
      return;
    }
    const { data: profile } = await supabase
      .from('users')
      .select('mode_override')
      .eq('id', userId)
      .single();
    set({ mode: data as UserMode, modeOverrideActive: !!profile?.mode_override });
  },
  setModeOverride: async (mode) => {
    const userId = get().userId;
    if (!userId) return;
    await supabase.from('users').update({ mode_override: mode }).eq('id', userId);
    await get().refreshMode();
  },
}));
