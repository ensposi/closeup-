export type AppMode = 'local' | 'traveler';
export type MomentStatus = 'draft' | 'open' | 'full' | 'started' | 'finished' | 'expired' | 'cancelled';

export type Profile = {
  id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
};

export type Moment = {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  category: string;
  starts_at: string;
  ends_at: string;
  max_participants: number;
  status: MomentStatus;
  latitude: number;
  longitude: number;
};
