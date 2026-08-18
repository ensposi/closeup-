-- Enable Supabase Realtime for the tables used by the mobile app.
do $$
begin
  alter publication supabase_realtime add table public.moments;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.moment_participants;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.chat_room_members;
exception when duplicate_object then null;
end $$;
