-- ============================================================================
-- Attached. — initial schema
--
-- To apply in a fresh Supabase project:
--   1. Open https://app.supabase.com → your project → SQL Editor → New query
--   2. Paste the entire contents of this file
--   3. Click Run
--
-- All tables have Row Level Security enabled. Users can only read/write their
-- own rows. The service role (used by API routes) bypasses RLS.
-- ============================================================================

create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  first_name       text,
  email            text,
  attachment_style text check (attachment_style in ('secure','anxious','avoidant','disorganized')),
  quiz_answers     jsonb,
  is_paid          boolean not null default false,
  payment_tier     text check (payment_tier in ('weekly','annual','lifetime')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists profiles_email_idx on public.profiles (email);

create table if not exists public.analyses (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.profiles(id) on delete cascade,
  subject_name         text not null,
  observations         jsonb not null,
  predicted_style      text check (predicted_style in ('secure','anxious','avoidant','disorganized')),
  compatibility_score  int check (compatibility_score between 0 and 100),
  analysis_text        text,
  advice               text,
  created_at           timestamptz not null default now()
);
create index if not exists analyses_user_id_idx on public.analyses (user_id, created_at desc);

create table if not exists public.daily_insights (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  insight_text  text not null,
  insight_date  date not null default current_date,
  created_at    timestamptz not null default now(),
  unique (user_id, insight_date)
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, first_name)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'first_name', split_part(coalesce(new.email,''), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles       enable row level security;
alter table public.analyses       enable row level security;
alter table public.daily_insights enable row level security;

drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles for update using (auth.uid() = id);

drop policy if exists "profiles_public_by_id" on public.profiles;
create policy "profiles_public_by_id" on public.profiles for select using (true);

drop policy if exists "analyses_self_all" on public.analyses;
create policy "analyses_self_all" on public.analyses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "insights_self_select" on public.daily_insights;
create policy "insights_self_select" on public.daily_insights for select using (auth.uid() = user_id);
