alter table profiles enable row level security;
alter table moments enable row level security;
alter table moment_participants enable row level security;
alter table chat_rooms enable row level security;
alter table chat_room_members enable row level security;
alter table messages enable row level security;

create policy "public profiles readable" on profiles for select using (true);
create policy "own profile insert" on profiles for insert with check (auth.uid()=id);
create policy "own profile update" on profiles for update using (auth.uid()=id);

create policy "open moments readable" on moments for select using (status <> 'draft');
create policy "creator creates moments" on moments for insert with check (auth.uid()=creator_id);
create policy "creator updates moments" on moments for update using (auth.uid()=creator_id);

create policy "participants readable" on moment_participants for select using (auth.uid()=user_id or exists(select 1 from moments m where m.id=moment_id and m.creator_id=auth.uid()));
create policy "users join" on moment_participants for insert with check (auth.uid()=user_id);
create policy "users leave" on moment_participants for delete using (auth.uid()=user_id);

create policy "room members readable" on chat_room_members for select using (auth.uid()=user_id);
create policy "own room membership" on chat_room_members for insert with check (auth.uid()=user_id);
create policy "own room membership update" on chat_room_members for update using (auth.uid()=user_id);

create policy "messages by members" on messages for select using (exists(select 1 from chat_room_members crm where crm.room_id=messages.room_id and crm.user_id=auth.uid()));
create policy "members send messages" on messages for insert with check (auth.uid()=sender_id and exists(select 1 from chat_room_members crm where crm.room_id=messages.room_id and crm.user_id=auth.uid()));

create policy "rooms by members" on chat_rooms for select using (exists(select 1 from chat_room_members crm where crm.room_id=id and crm.user_id=auth.uid()));
