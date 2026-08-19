-- When a user joins a Moment, create/find its group chat and add the user.
create or replace function public.join_moment(p_moment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  m moments%rowtype;
  n integer;
  room_id uuid;
begin
  if current_user_id is null then raise exception 'Non authentifié'; end if;

  select * into m from moments where id = p_moment_id for update;
  if not found then raise exception 'Moment introuvable'; end if;
  if m.status <> 'open' then raise exception 'Moment non disponible'; end if;

  select count(*) into n from moment_participants where moment_id = p_moment_id;
  if n >= m.max_participants then raise exception 'Moment complet'; end if;

  insert into moment_participants(moment_id, user_id)
  values (p_moment_id, current_user_id)
  on conflict (moment_id, user_id) do nothing;

  if not found then raise exception 'Déjà inscrit'; end if;

  if n + 1 >= m.max_participants then
    update moments set status = 'full' where id = p_moment_id;
  end if;

  select id into room_id from chat_rooms where moment_id = p_moment_id limit 1;
  if room_id is null then
    insert into chat_rooms(name, moment_id)
    values (m.title, p_moment_id)
    returning id into room_id;
  end if;

  insert into chat_room_members(room_id, user_id)
  values (room_id, current_user_id)
  on conflict (room_id, user_id) do nothing;

  return jsonb_build_object('ok', true, 'participants', n + 1, 'room_id', room_id);
end;
$$;
