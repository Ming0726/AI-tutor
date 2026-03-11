-- Task 8: cards + documents

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  summary text not null,
  content text not null,
  illustration_url text,
  source text default 'manual' check (source in ('manual', 'document_analysis')),
  source_document_id uuid,
  is_favorited boolean default false,
  is_starred boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_cards_user on public.cards(user_id);
create index if not exists idx_cards_category on public.cards(category_id);
create index if not exists idx_cards_created on public.cards(created_at desc);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  file_name text not null,
  file_type text not null check (file_type in ('txt', 'pdf')),
  storage_path text not null,
  file_size int,
  key_points jsonb default '[]'::jsonb,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz default now()
);

create index if not exists idx_documents_user on public.documents(user_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'fk_cards_source_document'
  ) then
    alter table public.cards
      add constraint fk_cards_source_document
      foreign key (source_document_id) references public.documents(id) on delete set null;
  end if;
end
$$;
