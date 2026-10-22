create table public.night_guests (
  id uuid primary key default gen_random_uuid(),
  night_id uuid not null,
  group_id uuid not null,
  name text not null check (name = btrim(name) and char_length(name) between 1 and 40),
  created_at timestamptz not null default now(),
  foreign key (group_id, night_id) references public.game_nights (group_id, id) on delete cascade
);

create index night_guests_night_id_idx on public.night_guests (night_id);

alter table public.night_guests enable row level security;

revoke all on public.night_guests from anon, authenticated;

grant select, insert, delete on public.night_guests to authenticated;
grant update (name) on public.night_guests to authenticated;

create policy "Members can read their group's guests"
on public.night_guests for select
to authenticated
using (public.is_group_member(group_id));

create policy "Members can add guests in their group"
on public.night_guests for insert
to authenticated
with check (public.is_group_member(group_id));

create policy "Members can rename guests in their group"
on public.night_guests for update
to authenticated
using (public.is_group_member(group_id))
with check (public.is_group_member(group_id));

create policy "Members can remove guests in their group"
on public.night_guests for delete
to authenticated
using (public.is_group_member(group_id));
