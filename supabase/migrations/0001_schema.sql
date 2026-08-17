-- CloseUp schema
create extension if not exists postgis;
create extension if not exists pg_cron;

do $$ begin create type moment_status as enum ('draft','open','full','started','finished','expired','cancelled'); exception when duplicate_object then null; end $$;

do $$ begin create type app_mode as enum ('local','traveler'); exception when duplicate_object then null; end $$;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  bio text,
  avatar_url text,
  gender text,
  safe_score numeric default 100,
  mode app_mode default 'local',
  created_at timestamptz default now()
);

create table if not exists moments (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  max_participants integer not null default 6,
  status moment_status not null default 'open',
  latitude double precision not null,
  longitude double precision not null,
  location geography(point,4326),
  created_at timestamptz default now()
);

create index if not exists moments_location_idx on moments using gist(location);
create index if not exists moments_status_idx on moments(status);

create table if not exists moment_participants (
  moment_id uuid references moments(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key(moment_id,user_id)
);

create table if not exists chat_rooms (
  id uuid primary key default gen_random_uuid(),
  name text,
  moment_id uuid references moments(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists chat_room_members (
  room_id uuid references chat_rooms(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  last_read_at timestamptz,
  primary key(room_id,user_id)
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references chat_rooms(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

create or replace view public_profiles as
select id, display_name, bio, avatar_url, safe_score, mode, created_at from profiles;
