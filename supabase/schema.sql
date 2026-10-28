-- فسحة — مخطط قاعدة البيانات
-- الصقه كاملاً في Supabase: SQL Editor ثم New query ثم Run. آمن للتشغيل أكثر من مرة.

-- ── الجداول ─────────────────────────────────────────────
create table if not exists public.content (
  id           text primary key,
  title        text not null,
  subtitle     text,
  category     text not null check (category in ('stories','prophets','nasheeds','quran','podcast','letters')),
  duration     text,
  age_min      int,
  age_max      int,
  is_premium   boolean not null default false,
  emoji        text,
  cover_color  text,
  description  text,
  body         text,
  audio_url    text,
  voice_id     text,
  sort_order   int,
  is_new       boolean not null default false,
  is_trending  boolean not null default false,
  created_at   timestamptz not null default now()
);

create table if not exists public.letter_audio (
  letter_id   text primary key,
  audio_url   text not null,
  updated_at  timestamptz not null default now()
);

create table if not exists public.images (
  key         text primary key,
  url         text not null,
  updated_at  timestamptz not null default now()
);

alter table public.content add column if not exists image_url text;

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- ── دالة التحقق من المشرف ────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ── صلاحيات الصفوف (RLS) ─────────────────────────────────
alter table public.content      enable row level security;
alter table public.letter_audio enable row level security;
alter table public.admins       enable row level security;
alter table public.images       enable row level security;

drop policy if exists "images read"  on public.images;
drop policy if exists "images write" on public.images;
create policy "images read"  on public.images for select to anon, authenticated using (true);
create policy "images write" on public.images for all    to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "content read"   on public.content;
drop policy if exists "content write"  on public.content;
create policy "content read"  on public.content for select to anon, authenticated using (true);
create policy "content write" on public.content for all    to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "letter_audio read"  on public.letter_audio;
drop policy if exists "letter_audio write" on public.letter_audio;
create policy "letter_audio read"  on public.letter_audio for select to anon, authenticated using (true);
create policy "letter_audio write" on public.letter_audio for all    to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins self read" on public.admins;
create policy "admins self read" on public.admins for select to authenticated using (user_id = auth.uid());

-- ── تخزين الملفات الصوتية ────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit)
values ('audio', 'audio', true, 52428800)
on conflict (id) do update set public = true, file_size_limit = 52428800;

insert into storage.buckets (id, name, public, file_size_limit)
values ('images', 'images', true, 10485760)
on conflict (id) do update set public = true, file_size_limit = 10485760;

drop policy if exists "images admin insert" on storage.objects;
drop policy if exists "images admin update" on storage.objects;
drop policy if exists "images admin delete" on storage.objects;
create policy "images admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'images' and public.is_admin());
create policy "images admin update" on storage.objects for update to authenticated using (bucket_id = 'images' and public.is_admin());
create policy "images admin delete" on storage.objects for delete to authenticated using (bucket_id = 'images' and public.is_admin());

drop policy if exists "audio admin insert" on storage.objects;
drop policy if exists "audio admin update" on storage.objects;
drop policy if exists "audio admin delete" on storage.objects;
create policy "audio admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'audio' and public.is_admin());
create policy "audio admin update" on storage.objects for update to authenticated using (bucket_id = 'audio' and public.is_admin());
create policy "audio admin delete" on storage.objects for delete to authenticated using (bucket_id = 'audio' and public.is_admin());
