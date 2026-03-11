-- Task 9: quizzes + quiz_results + conversations

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  keyword text not null,
  questions jsonb not null,
  created_at timestamptz default now()
);

create index if not exists idx_quizzes_user on public.quizzes(user_id);

create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  answers jsonb not null,
  score int not null,
  total int not null,
  wrong_ids text[] default '{}',
  created_at timestamptz default now()
);

create index if not exists idx_quiz_results_user on public.quiz_results(user_id);
create index if not exists idx_quiz_results_quiz on public.quiz_results(quiz_id);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text,
  messages jsonb not null default '[]'::jsonb,
  explain_style text default 'friendly',
  knowledge_level text default 'intermediate',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_conversations_user on public.conversations(user_id);
