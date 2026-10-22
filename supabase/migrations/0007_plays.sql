create table public.plays (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null,
  night_id uuid not null,
  game_id uuid,
  game_title text not null check (char_length(game_title) between 1 and 100),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (group_id, night_id) references public.game_nights (group_id, id) on delete cascade,
  foreign key (group_id, game_id) references public.games (group_id, id) on delete set null (game_id),
  unique (night_id, game_id)
);

create index plays_group_id_idx on public.plays (group_id);

create function public.prepare_play()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  night_day date;
  game_name text;
begin
  select night_date into night_day
  from public.game_nights
  where id = new.night_id
    and group_id = new.group_id;

  if night_day > (now() at time zone 'Europe/Madrid')::date then
    raise exception 'night_in_future';
  end if;

  select title into game_name
  from public.games
  where id = new.game_id
    and group_id = new.group_id;

  if game_name is null then
    raise exception 'game_not_found';
  end if;

  new.game_title := game_name;
  return new;
end;
$$;

revoke execute on function public.prepare_play() from public, anon, authenticated;

create trigger plays_prepare
before insert on public.plays
for each row execute function public.prepare_play();

alter table public.plays enable row level security;

revoke all on public.plays from anon, authenticated;

grant select, insert, delete on public.plays to authenticated;

create policy "Members can read their group's plays"
on public.plays for select
to authenticated
using (public.is_group_member(group_id));

create policy "Members can log plays in their group"
on public.plays for insert
to authenticated
with check (public.is_group_member(group_id) and created_by = (select auth.uid()));

create policy "Members can undo plays in their group"
on public.plays for delete
to authenticated
using (public.is_group_member(group_id));
