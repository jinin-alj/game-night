create table public.game_nights (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  name text not null check (name = btrim(name) and char_length(name) between 1 and 80),
  night_date date not null,
  available_minutes integer not null default 180 check (available_minutes between 30 and 720),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (group_id, id)
);

create index game_nights_group_id_night_date_idx on public.game_nights (group_id, night_date);

create table public.night_attendees (
  night_id uuid not null,
  group_id uuid not null,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (night_id, user_id),
  foreign key (group_id, night_id) references public.game_nights (group_id, id) on delete cascade,
  foreign key (group_id, user_id) references public.group_members (group_id, user_id) on delete cascade
);

create index night_attendees_group_id_idx on public.night_attendees (group_id);

alter table public.game_nights enable row level security;
alter table public.night_attendees enable row level security;

revoke all on public.game_nights, public.night_attendees from anon, authenticated;

grant select, insert, delete on public.game_nights to authenticated;
grant update (name, night_date, available_minutes) on public.game_nights to authenticated;
grant select, insert, delete on public.night_attendees to authenticated;

create policy "Members can read their group's nights"
on public.game_nights for select
to authenticated
using (public.is_group_member(group_id));

create policy "Members can add nights to their group"
on public.game_nights for insert
to authenticated
with check (public.is_group_member(group_id) and created_by = (select auth.uid()));

create policy "Members can edit their group's nights"
on public.game_nights for update
to authenticated
using (public.is_group_member(group_id))
with check (public.is_group_member(group_id));

create policy "Members can delete their group's nights"
on public.game_nights for delete
to authenticated
using (public.is_group_member(group_id));

create policy "Members can read their group's attendees"
on public.night_attendees for select
to authenticated
using (public.is_group_member(group_id));

create policy "Members can add attendees in their group"
on public.night_attendees for insert
to authenticated
with check (public.is_group_member(group_id));

create policy "Members can remove attendees in their group"
on public.night_attendees for delete
to authenticated
using (public.is_group_member(group_id));

create function public.add_creator_as_attendee()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.created_by is not null then
    insert into public.night_attendees (night_id, group_id, user_id)
    values (new.id, new.group_id, new.created_by);
  end if;
  return new;
end;
$$;

revoke execute on function public.add_creator_as_attendee() from public, anon, authenticated;

create trigger game_nights_add_creator_as_attendee
after insert on public.game_nights
for each row execute function public.add_creator_as_attendee();
