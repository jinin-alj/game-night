create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (name = btrim(name) and char_length(name) between 1 and 60),
  invite_code text not null unique check (invite_code ~ '^[A-HJ-NP-Z2-9]{10}$'),
  owner_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (
    display_name = btrim(display_name) and char_length(display_name) between 1 and 40
  ),
  active_group_id uuid references public.groups (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index group_members_user_id_idx on public.group_members (user_id);

create table public.games (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  title text not null check (title = btrim(title) and char_length(title) between 1 and 100),
  copy_owner_id uuid references auth.users (id) on delete cascade,
  min_players integer not null default 2 check (min_players between 1 and 20),
  max_players integer not null default 4 check (max_players between 1 and 20),
  playtime_minutes integer not null default 60 check (playtime_minutes between 5 and 600),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  check (max_players >= min_players),
  unique (group_id, id)
);
