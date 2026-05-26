-- Supabase schema for the social media app.
-- Run in the Supabase SQL editor.

-- one row per auth user, id matches auth.users.id
create table if not exists profiles (
  id         uuid primary key references auth.users on delete cascade,
  username   text not null,
  bio        text default '',
  avatar_url text default '',
  created_at timestamptz default now()
);

create table if not exists posts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users on delete cascade,
  username   text not null,
  content    text not null,
  image_url  text,
  created_at timestamptz default now()
);

create table if not exists comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid references posts on delete cascade,
  user_id    uuid references auth.users on delete cascade,
  username   text not null,
  content    text not null,
  created_at timestamptz default now()
);

create table if not exists likes (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid references posts on delete cascade,
  user_id    uuid references auth.users on delete cascade,
  created_at timestamptz default now(),
  unique (post_id, user_id)
);

create table if not exists followers (
  id           uuid primary key default gen_random_uuid(),
  follower_id  uuid references auth.users on delete cascade,
  following_id uuid references auth.users on delete cascade,
  created_at   timestamptz default now(),
  unique (follower_id, following_id)
);

-- backend uses the anon key, so RLS needs policies that allow the operations.
-- these are open for the demo. tighten before real use.
alter table profiles  enable row level security;
alter table posts     enable row level security;
alter table comments  enable row level security;
alter table likes     enable row level security;
alter table followers enable row level security;

do $$
declare t text;
begin
  foreach t in array array['profiles','posts','comments','likes','followers'] loop
    execute format('drop policy if exists "allow all" on %I', t);
    execute format('create policy "allow all" on %I for all using (true) with check (true)', t);
  end loop;
end $$;
