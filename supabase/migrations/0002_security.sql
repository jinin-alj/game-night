create function public.is_group_member(target_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.group_members
    where group_id = target_group_id
      and user_id = (select auth.uid())
  );
$$;

create function public.is_group_owner(target_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.groups
    where id = target_group_id
      and owner_id = (select auth.uid())
  );
$$;

create function public.shares_group_with(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.group_members as mine
    join public.group_members as theirs on theirs.group_id = mine.group_id
    where mine.user_id = (select auth.uid())
      and theirs.user_id = target_user_id
  );
$$;

revoke execute on function public.is_group_member(uuid) from public, anon;
revoke execute on function public.is_group_owner(uuid) from public, anon;
revoke execute on function public.shares_group_with(uuid) from public, anon;
grant execute on function public.is_group_member(uuid) to authenticated;
grant execute on function public.is_group_owner(uuid) to authenticated;
grant execute on function public.shares_group_with(uuid) to authenticated;

alter table public.groups enable row level security;
alter table public.profiles enable row level security;
alter table public.group_members enable row level security;
alter table public.games enable row level security;

revoke all on public.groups, public.profiles, public.group_members, public.games from anon, authenticated;

grant select on public.groups to authenticated;
grant select on public.group_members to authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, active_group_id) on public.profiles to authenticated;
grant select, insert, delete on public.games to authenticated;
grant update (title, copy_owner_id, min_players, max_players, playtime_minutes) on public.games to authenticated;

create policy "Members can read their groups"
on public.groups for select
to authenticated
using (public.is_group_member(id));

create policy "Members can read the members of their groups"
on public.group_members for select
to authenticated
using (public.is_group_member(group_id));

create policy "Users can read their own profile and their group mates"
on public.profiles for select
to authenticated
using (id = (select auth.uid()) or public.shares_group_with(id));

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (
  id = (select auth.uid())
  and (active_group_id is null or public.is_group_member(active_group_id))
);

create policy "Members can read their group's games"
on public.games for select
to authenticated
using (public.is_group_member(group_id));

create policy "Members can add games to their group"
on public.games for insert
to authenticated
with check (public.is_group_member(group_id) and created_by = (select auth.uid()));

create policy "Members can edit their group's games"
on public.games for update
to authenticated
using (public.is_group_member(group_id))
with check (public.is_group_member(group_id));

create policy "Members can delete their group's games"
on public.games for delete
to authenticated
using (public.is_group_member(group_id));

create function public.check_copy_owner_is_member()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.copy_owner_id is not null and not exists (
    select 1
    from public.group_members
    where group_id = new.group_id
      and user_id = new.copy_owner_id
  ) then
    raise exception 'The owner of a copy must be a member of the group';
  end if;
  return new;
end;
$$;

revoke execute on function public.check_copy_owner_is_member() from public, anon, authenticated;

create trigger games_copy_owner_is_member
before insert or update of copy_owner_id on public.games
for each row execute function public.check_copy_owner_is_member();
