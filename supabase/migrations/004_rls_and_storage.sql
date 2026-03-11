-- Task 10: RLS + storage buckets + storage policies

alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.cards enable row level security;
alter table public.documents enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_results enable row level security;
alter table public.conversations enable row level security;

drop policy if exists users_select_own on public.users;
create policy users_select_own on public.users
for select using (auth.uid() = id);

drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users
for update using (auth.uid() = id);

drop policy if exists categories_all_own on public.categories;
create policy categories_all_own on public.categories
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists cards_all_own on public.cards;
create policy cards_all_own on public.cards
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists documents_all_own on public.documents;
create policy documents_all_own on public.documents
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists quizzes_all_own on public.quizzes;
create policy quizzes_all_own on public.quizzes
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists quiz_results_all_own on public.quiz_results;
create policy quiz_results_all_own on public.quiz_results
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists conversations_all_own on public.conversations;
create policy conversations_all_own on public.conversations
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values
  ('documents', 'documents', false),
  ('illustrations', 'illustrations', true)
on conflict (id) do nothing;

drop policy if exists documents_upload on storage.objects;
create policy documents_upload on storage.objects
for insert to authenticated
with check (
  bucket_id = 'documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists documents_read on storage.objects;
create policy documents_read on storage.objects
for select to authenticated
using (
  bucket_id = 'documents'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists illustrations_upload on storage.objects;
create policy illustrations_upload on storage.objects
for insert to authenticated
with check (bucket_id = 'illustrations' and auth.role() = 'authenticated');

drop policy if exists illustrations_read on storage.objects;
create policy illustrations_read on storage.objects
for select
using (bucket_id = 'illustrations');
