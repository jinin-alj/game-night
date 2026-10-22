create function public.generate_invite_code()
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  random_bytes bytea;
  new_code text;
begin
  loop
    random_bytes := extensions.gen_random_bytes(10);
    new_code := '';
    for character_index in 0..9 loop
      -- 256 is a multiple of 32, so every character is equally likely.
      new_code := new_code || substr(alphabet, (get_byte(random_bytes, character_index) % 32) + 1, 1);
    end loop;

    if not exists (select 1 from public.groups where invite_code = new_code) then
      return new_code;
    end if;
  end loop;
end;
$$;

create function public.seed_starter_games(target_group_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.games (group_id, title, min_players, max_players, playtime_minutes, created_by)
  values
    (target_group_id, 'Dune', 2, 4, 120, null),
    (target_group_id, 'Scythe', 1, 7, 180, null),
    (target_group_id, 'Catan', 2, 6, 60, null),
    (target_group_id, 'Libertalia', 1, 6, 120, null),
    (target_group_id, 'Parks', 2, 5, 60, null),
    (target_group_id, 'Small World', 3, 5, 120, null),
    (target_group_id, 'Citadels', 3, 8, 60, null),
    (target_group_id, 'Beast', 2, 4, 120, null);
$$;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_display_name text;
  new_group_id uuid;
begin
  new_display_name := btrim(left(btrim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), 40));
  if new_display_name = '' then
    new_display_name := btrim(left(split_part(coalesce(new.email, ''), '@', 1), 40));
  end if;
  if new_display_name = '' then
    new_display_name := 'Player';
  end if;

  insert into public.groups (name, invite_code, owner_id)
  values (new_display_name || '''s group', public.generate_invite_code(), new.id)
  returning id into new_group_id;

  insert into public.profiles (id, display_name, active_group_id)
  values (new.id, new_display_name, new_group_id);

  insert into public.group_members (group_id, user_id)
  values (new_group_id, new.id);

  perform public.seed_starter_games(new_group_id);

  return new;
end;
$$;

revoke execute on function public.generate_invite_code() from public, anon, authenticated;
revoke execute on function public.seed_starter_games(uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
