create or replace function join_moment(p_moment_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  current_user_id uuid := auth.uid();
  m moments%rowtype;
  n integer;
begin
  select * into m from moments where id = p_moment_id for update;
  if not found then raise exception 'Moment introuvable'; end if;
  if m.status <> 'open' then raise exception 'Moment non disponible'; end if;
  select count(*) into n from moment_participants where moment_id = p_moment_id;
  if n >= m.max_participants then raise exception 'Moment complet'; end if;
  insert into moment_participants(moment_id,user_id) values (p_moment_id,current_user_id) on conflict do nothing;
  if not found then raise exception 'Déjà inscrit'; end if;
  if n + 1 >= m.max_participants then update moments set status='full' where id=p_moment_id; end if;
  return jsonb_build_object('ok',true,'participants',n+1);
end;
$$;

create or replace function advance_moment_statuses()
returns void
language plpgsql
security definer
as $$
begin
  update moments set status='started' where status in ('open','full') and starts_at <= now() and ends_at > now();
  update moments set status='finished' where status='started' and ends_at <= now();
  update moments set status='expired' where status in ('open','full') and ends_at <= now();
end;
$$;

create or replace function recalculate_safe_score(p_user_id uuid)
returns numeric
language plpgsql
security definer
as $$
declare score numeric := 100;
begin
  select greatest(0,100 - least(60, count(*) * 5)) into score
  from moment_participants mp
  join moments m on m.id=mp.moment_id
  where mp.user_id=p_user_id and m.status='cancelled';
  update profiles set safe_score=coalesce(score,100) where id=p_user_id;
  return coalesce(score,100);
end;
$$;

select cron.schedule('closeup-advance-moments','* * * * *','select public.advance_moment_statuses()');
