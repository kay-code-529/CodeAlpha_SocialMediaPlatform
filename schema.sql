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

-- RLS. reads are public, writes only to your own rows.
-- needs the caller's JWT forwarded so auth.uid() resolves.
alter table profiles  enable row level security;
alter table posts     enable row level security;
alter table comments  enable row level security;
alter table likes     enable row level security;
alter table followers enable row level security;

-- drop the old open policies if they exist
do $$
declare t text;
begin
  foreach t in array array['profiles','posts','comments','likes','followers'] loop
    execute format('drop policy if exists "allow all" on %I', t);
  end loop;
end $$;

-- profiles: anyone can read, you manage only your own row
drop policy if exists profiles_read   on profiles;
drop policy if exists profiles_insert on profiles;
drop policy if exists profiles_update on profiles;
create policy profiles_read   on profiles for select using (true);
create policy profiles_insert on profiles for insert with check (id = auth.uid());
create policy profiles_update on profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- posts: public read, you create and delete only your own
drop policy if exists posts_read   on posts;
drop policy if exists posts_insert on posts;
drop policy if exists posts_delete on posts;
create policy posts_read   on posts for select using (true);
create policy posts_insert on posts for insert with check (user_id = auth.uid());
create policy posts_delete on posts for delete using (user_id = auth.uid());

-- comments: public read, you create and delete only your own
drop policy if exists comments_read   on comments;
drop policy if exists comments_insert on comments;
drop policy if exists comments_delete on comments;
create policy comments_read   on comments for select using (true);
create policy comments_insert on comments for insert with check (user_id = auth.uid());
create policy comments_delete on comments for delete using (user_id = auth.uid());

-- likes: public read, you like and unlike only as yourself
drop policy if exists likes_read   on likes;
drop policy if exists likes_insert on likes;
drop policy if exists likes_delete on likes;
create policy likes_read   on likes for select using (true);
create policy likes_insert on likes for insert with check (user_id = auth.uid());
create policy likes_delete on likes for delete using (user_id = auth.uid());

-- followers: public read, you follow and unfollow only as yourself
drop policy if exists followers_read   on followers;
drop policy if exists followers_insert on followers;
drop policy if exists followers_delete on followers;
create policy followers_read   on followers for select using (true);
create policy followers_insert on followers for insert with check (follower_id = auth.uid());
create policy followers_delete on followers for delete using (follower_id = auth.uid());
