// Types alignés sur le schéma SQL (supabase/migrations/0001_schema.sql)
// Toujours garder ce fichier synchronisé avec la base : c'est la source de vérité
// pour le contrat de données entre client et serveur.

export type UserMode = 'local' | 'traveler';

export type MomentCategory =
  | 'cafe'
  | 'balade'
  | 'resto'
  | 'sport'
  | 'afterwork'
  | 'culture'
  | 'autre';

export type MomentStatus = 'scheduled' | 'active' | 'full' | 'finished' | 'archived';

export interface PublicProfile {
  id: string;
  first_name: string;
  birth_date: string;
  bio: string;
  languages: string[];
  home_city: string;
  avatar_url: string | null;
  safe_score: number;
  created_at: string;
}

export interface Moment {
  id: string;
  creator_id: string;
  category: MomentCategory;
  description: string;
  address_label: string | null;
  starts_at: string;
  duration_minutes: number;
  expires_at: string;
  max_participants: number;
  age_min: number;
  age_max: number;
  languages: string[];
  status: MomentStatus;
  created_at: string;
  creator?: PublicProfile;
  participant_count?: number;
  distance_m?: number;
  lng?: number;
  lat?: number;
}

export interface ConversationSummary {
  id: string;
  type: 'dm' | 'group';
  moment_id: string | null;
  archived_at: string | null;
  title: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  sent_at: string;
}

export interface CreateMomentInput {
  category: MomentCategory;
  description: string;
  lng: number;
  lat: number;
  address_label: string;
  starts_at: string;
  duration_minutes: number;
  max_participants: number;
  age_min: number;
  age_max: number;
  languages: string[];
}
