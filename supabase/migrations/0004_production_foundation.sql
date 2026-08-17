-- CloseUp production foundation
-- Adds safety, notifications, favorites, verification metadata and atomic RPCs.

alter table public.profiles
  add column if not exists username text,
  add column if not exists birth_date date,
  add column if not exists city text,
  add column if not exists country_code text,
  add column if not exists is_verified boolean not null default false,
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists profiles_username_unique_idx
  on public.profiles(lower(username)) where username is not null;

create index if not exists moments_starts_at_idx on public.moments(starts_at);
create index if not exists moments_creator_idx on public.moments(creator_id);
create index if not exists participants_user_idx on public.moment_participants(user_id);
create index if not exists messages_room_created_idx on public.messages(room_id, created_at desc);

create table if not exists public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete cascade,
  moment_id uuid references public.moments(id) on delete set null,
  message_id uuid references public.messages(id) on delete set null,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists reports_status_idx on public.reports(status, created_at desc);
create index if not exists reports_reported_user_idx on public.reports(reported_user_id);

create table if not exists public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token text not null,
  platform text not null check (platform in ('ios','android','web')),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, token)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications(user_id, created_at desc);
create index if not exists device_tokens_user_idx on public.device_tokens(user_id) where enabled;

create table if not exists public.moment_favorites (
  moment_id uuid not null references public.moments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(moment_id, user_id)
);

alter table public.blocks enable row level security;
alter table public.reports enable row level security;
alter table public.device_tokens enable row level security;
alter table public.notifications enable row level security;
alter table public.moment_favorites enable row level security;

create policy "users manage own blocks" on public.blocks
  for all using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);

create policy "users create reports" on public.reports
  for insert with check (auth.uid() = reporter_id);

create policy "users read own reports" on public.reports
  for select using (auth.uid() = reporter_id);

create policy "users manage own device tokens" on public.device_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users read own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "users update own notifications" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users manage own favorites" on public.moment_favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Atomic join prevents two users from taking the last available slot concurrently.
create or replace function public.join_moment(p_moment_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_capacity integer;
  v_count integer;
  v_status moment_status;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;

  select max_participants, status into v_capacity, v_status
  from public.moments
  where id = p_moment_id
  for update;

  if not found then raise exception 'moment not found'; end if;
  if v_status <> 'open' then raise exception 'moment is not open'; end if;

  select count(*) into v_count from public.moment_participants where moment_id = p_moment_id;
  if v_count >= v_capacity then raise exception 'moment is full'; end if;

  insert into public.moment_participants(moment_id, user_id)
  values (p_moment_id, auth.uid())
  on conflict do nothing;

  return true;
end;
$$;

revoke all on function public.join_moment(uuid) from public;
grant execute on function public.join_moment(uuid) to authenticated;

create or replace function public.nearby_moments(
  p_latitude double precision,
  p_longitude double precision,
  p_radius_meters integer default 10000,
  p_limit integer default 50
)
returns setof public.moments
language sql
stable
security invoker
as $$
  select m.*
  from public.moments m
  where m.status = 'open'
    and m.starts_at > now()
    and st_dwithin(
      coalesce(m.location, st_setsrid(st_makepoint(m.longitude, m.latitude), 4326)::geography),
      st_setsrid(st_makepoint(p_longitude, p_latitude), 4326)::geography,
      least(greatest(p_radius_meters, 100), 50000)
    )
  order by st_distance(
    coalesce(m.location, st_setsrid(st_makepoint(m.longitude, m.latitude), 4326)::geography),
    st_setsrid(st_makepoint(p_longitude, p_latitude), 4326)::geography
  )
  limit least(greatest(p_limit, 1), 100);
$$;

-- Keep location geography synchronized with latitude/longitude.
create or replace function public.sync_moment_location()
returns trigger
language plpgsql
as $$
begin
  new.location := st_setsrid(st_makepoint(new.longitude, new.latitude), 4326)::geography;
  return new;
end;
$$;

drop trigger if exists moments_sync_location on public.moments;
create trigger moments_sync_location
before insert or update of latitude, longitude on public.moments
for each row execute function public.sync_moment_location();
