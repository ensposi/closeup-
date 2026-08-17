import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import type { AppMode } from '../types';

type AppState = {
  session: Session | null;
  mode: AppMode;
  setSession: (session: Session | null) => void;
  setMode: (mode: AppMode) => void;
};

export const useAppStore = create<AppState>((set) => ({
  session: null,
  mode: 'local',
  setSession: (session) => set({ session }),
  setMode: (mode) => set({ mode }),
}));
