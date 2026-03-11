-- Task 7: users + categories + new user trigger

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  preferences jsonb default '{"explainStyle":"friendly","knowledgeLevel":"intermediate"}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  color text default '#F5A623',
  sort_order int default 0,
  is_default boolean default false,
  created_at timestamptz default now(),
  unique(user_id, name)
);

create index if not exists idx_categories_user on public.categories(user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.categories (user_id, name, is_default, sort_order)
  values
    (new.id, 'General', true, 0),
    (new.id, 'Ergonomic', true, 1),
    (new.id, 'MPD', true, 2),
    (new.id, 'Statistic', true, 3)
  on conflict (user_id, name) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
