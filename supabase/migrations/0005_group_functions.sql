create function public.create_group_for(target_owner_id uuid, group_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_group_id uuid;
begin
  insert into public.groups (name, invite_code, owner_id)
  values (group_name, public.generate_invite_code(), target_owner_id)
  returning id into new_group_id;

  insert into public.group_members (group_id, user_id)
  values (new_group_id, target_owner_id);

  perform public.seed_starter_games(new_group_id);

  update public.profiles
  set active_group_id = new_group_id
  where id = target_owner_id;

  return new_group_id;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_display_name text;
begin
  new_display_name := btrim(left(btrim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), 40));
  if new_display_name = '' then
    new_display_name := btrim(left(split_part(coalesce(new.email, ''), '@', 1), 40));
  end if;
  if new_display_name = '' then
    new_display_name := 'Player';
  end if;

  insert into public.profiles (id, display_name)
  values (new.id, new_display_name);

  perform public.create_group_for(new.id, new_display_name || '''s group');

  return new;
end;
$$;

create function public.leave_cleanup(target_group_id uuid, target_user_id uuid)
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

create function public.create_group(group_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  clean_name text := btrim(coalesce(group_name, ''));
begin
  if caller_id is null then
    raise exception 'not_signed_in';
  end if;
  if char_length(clean_name) < 1 or char_length(clean_name) > 60 then
    raise exception 'invalid_name';
  end if;

  return public.create_group_for(caller_id, clean_name);
end;
$$;

create function public.preview_group(code text)
returns table (name text, member_count integer, is_member boolean)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;

  return query
  select
    g.name,
    (select count(*)::integer from public.group_members m where m.group_id = g.id),
    exists (
      select 1
      from public.group_members m
      where m.group_id = g.id
        and m.user_id = auth.uid()
    )
  from public.groups g
  where g.invite_code = upper(btrim(code));
end;
$$;

create function public.join_group(code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  target_group_id uuid;
begin
  if caller_id is null then
    raise exception 'not_signed_in';
  end if;

  select id into target_group_id
  from public.groups
  where invite_code = upper(btrim(code));

  if target_group_id is null then
    raise exception 'invalid_code';
  end if;

  insert into public.group_members (group_id, user_id)
  values (target_group_id, caller_id)
  on conflict do nothing;

  update public.profiles
  set active_group_id = target_group_id
  where id = caller_id;

  return target_group_id;
end;
$$;

create function public.leave_group(target_group_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  group_count integer;
  other_member_count integer;
begin
  if caller_id is null then
    raise exception 'not_signed_in';
  end if;
  if not public.is_group_member(target_group_id) then
    raise exception 'not_member';
  end if;

  select count(*) into group_count
  from public.group_members
  where user_id = caller_id;

  if group_count <= 1 then
    raise exception 'last_group';
  end if;

  select count(*) into other_member_count
  from public.group_members
  where group_id = target_group_id
    and user_id <> caller_id;

  if public.is_group_owner(target_group_id) then
    if other_member_count > 0 then
      raise exception 'owner_must_hand_over';
    end if;
    delete from public.groups where id = target_group_id;
  else
    delete from public.group_members
    where group_id = target_group_id
      and user_id = caller_id;
  end if;

  perform public.leave_cleanup(target_group_id, caller_id);
end;
$$;

create function public.remove_member(target_group_id uuid, target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
begin
  if caller_id is null then
    raise exception 'not_signed_in';
  end if;
  if not public.is_group_owner(target_group_id) then
    raise exception 'not_owner';
  end if;
  if target_user_id = caller_id then
    raise exception 'cannot_remove_self';
  end if;

  delete from public.group_members
  where group_id = target_group_id
    and user_id = target_user_id;

  if not found then
    raise exception 'not_a_member_target';
  end if;

  perform public.leave_cleanup(target_group_id, target_user_id);
end;
$$;

create function public.transfer_ownership(target_group_id uuid, new_owner_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
begin
  if caller_id is null then
    raise exception 'not_signed_in';
  end if;
  if not public.is_group_owner(target_group_id) then
    raise exception 'not_owner';
  end if;
  if not exists (
    select 1
    from public.group_members
    where group_id = target_group_id
      and user_id = new_owner_id
  ) then
    raise exception 'not_a_member_target';
  end if;

  update public.groups
  set owner_id = new_owner_id
  where id = target_group_id;
end;
$$;

create function public.reset_invite_code(target_group_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_code text;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  if not public.is_group_owner(target_group_id) then
    raise exception 'not_owner';
  end if;

  new_code := public.generate_invite_code();

  update public.groups
  set invite_code = new_code
  where id = target_group_id;

  return new_code;
end;
$$;

create function public.rename_group(target_group_id uuid, group_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_name text := btrim(coalesce(group_name, ''));
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  if not public.is_group_owner(target_group_id) then
    raise exception 'not_owner';
  end if;
  if char_length(clean_name) < 1 or char_length(clean_name) > 60 then
    raise exception 'invalid_name';
  end if;

  update public.groups
  set name = clean_name
  where id = target_group_id;
end;
$$;

create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
begin
  if caller_id is null then
    raise exception 'not_signed_in';
  end if;

  if exists (
    select 1
    from public.groups g
    where g.owner_id = caller_id
      and exists (
        select 1
        from public.group_members m
        where m.group_id = g.id
          and m.user_id <> caller_id
      )
  ) then
    raise exception 'owner_must_hand_over';
  end if;

  delete from public.groups where owner_id = caller_id;
  delete from auth.users where id = caller_id;
end;
$$;

revoke execute on function public.create_group_for(uuid, text) from public, anon, authenticated;
revoke execute on function public.leave_cleanup(uuid, uuid) from public, anon, authenticated;

revoke execute on function public.create_group(text) from public, anon;
revoke execute on function public.preview_group(text) from public, anon;
revoke execute on function public.join_group(text) from public, anon;
revoke execute on function public.leave_group(uuid) from public, anon;
revoke execute on function public.remove_member(uuid, uuid) from public, anon;
revoke execute on function public.transfer_ownership(uuid, uuid) from public, anon;
revoke execute on function public.reset_invite_code(uuid) from public, anon;
revoke execute on function public.rename_group(uuid, text) from public, anon;
revoke execute on function public.delete_my_account() from public, anon;

grant execute on function public.create_group(text) to authenticated;
grant execute on function public.preview_group(text) to authenticated;
grant execute on function public.join_group(text) to authenticated;
grant execute on function public.leave_group(uuid) to authenticated;
grant execute on function public.remove_member(uuid, uuid) to authenticated;
grant execute on function public.transfer_ownership(uuid, uuid) to authenticated;
grant execute on function public.reset_invite_code(uuid) to authenticated;
grant execute on function public.rename_group(uuid, text) to authenticated;
grant execute on function public.delete_my_account() to authenticated;
