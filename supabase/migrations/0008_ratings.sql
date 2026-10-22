create table public.ratings (
  user_id uuid not null references auth.users (id) on delete cascade,
  game_id uuid not null,
  group_id uuid not null,
  score integer not null check (score between 1 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, game_id),
  foreign key (group_id, game_id) references public.games (group_id, id) on delete cascade
);

create index ratings_group_id_idx on public.ratings (group_id);

alter table public.ratings enable row level security;

revoke all on public.ratings from anon, authenticated;

grant select on public.ratings to authenticated;

create policy "Members can read their group's ratings"
on public.ratings for select
to authenticated
using (public.is_group_member(group_id));

create function public.rate_game(target_game_id uuid, new_score integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  game_group_id uuid;
begin
  if caller_id is null then
    raise exception 'not_signed_in';
  end if;
  if new_score is null or new_score < 1 or new_score > 10 then
    raise exception 'invalid_score';
  end if;

  select group_id into game_group_id
  from public.games
  where id = target_game_id;

  if game_group_id is null then
    raise exception 'game_not_found';
  end if;
  if not public.is_group_member(game_group_id) then
    raise exception 'not_member';
  end if;

  insert into public.ratings (user_id, game_id, group_id, score)
  values (caller_id, target_game_id, game_group_id, new_score)
  on conflict (user_id, game_id) do update
  set score = excluded.score,
      updated_at = now();
end;
$$;

revoke execute on function public.rate_game(uuid, integer) from public, anon;
grant execute on function public.rate_game(uuid, integer) to authenticated;

create or replace function public.leave_cleanup(target_group_id uuid, target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_group_id uuid;
  member_name text;
begin
  delete from public.games
  where group_id = target_group_id
    and copy_owner_id = target_user_id;

  delete from public.ratings
  where group_id = target_group_id
    and user_id = target_user_id;

  if exists (
    select 1
    from public.profiles
    where id = target_user_id
      and (active_group_id is null or active_group_id = target_group_id)
  ) then
    select group_id into next_group_id
    from public.group_members
    where user_id = target_user_id
    order by joined_at
    limit 1;

    if next_group_id is null then
      select display_name into member_name
      from public.profiles
      where id = target_user_id;

      perform public.create_group_for(target_user_id, member_name || '''s group');
    else
      update public.profiles
      set active_group_id = next_group_id
      where id = target_user_id;
    end if;
  end if;
end;
$$;
