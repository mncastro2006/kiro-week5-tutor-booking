-- Initial schema for Tutor Booking App
-- Tables: profiles, availability, bookings
-- Includes conflict-prevention EXCLUDE constraint per PRD section 6.

-- Required for the EXCLUDE USING GIST constraint on bookings (equality + range overlap in one index).
create extension if not exists btree_gist;

-- =========================================================
-- profiles
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('student', 'tutor', 'admin')),
  full_name text not null default '',
  email text not null default '',
  subjects text[] not null default '{}',
  bio text not null default '',
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'App-level user profile, one row per auth.users row.';

-- =========================================================
-- availability (tutor recurring/one-off availability windows)
-- =========================================================
create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid not null references public.profiles (id) on delete cascade,
  day_of_week int check (day_of_week between 0 and 6),
  specific_date date,
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  constraint availability_valid_range check (end_time > start_time),
  constraint availability_day_or_date check (
    (day_of_week is not null and specific_date is null)
    or (day_of_week is null and specific_date is not null)
  )
);

create index if not exists availability_tutor_id_idx on public.availability (tutor_id);

comment on table public.availability is 'Tutor recurring (day_of_week) or one-off (specific_date) open windows.';

-- =========================================================
-- bookings
-- =========================================================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  tutor_id uuid not null references public.profiles (id) on delete cascade,
  subject text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected', 'cancelled', 'completed')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_valid_range check (end_at > start_at)
);

-- Generated range column used by the exclusion constraint below.
alter table public.bookings
  add column if not exists time_range tstzrange generated always as (tstzrange(start_at, end_at, '[)')) stored;

create index if not exists bookings_tutor_id_idx on public.bookings (tutor_id);
create index if not exists bookings_student_id_idx on public.bookings (student_id);
create index if not exists bookings_status_idx on public.bookings (status);

-- Critical requirement: no two CONFIRMED bookings for the same tutor may overlap.
-- Enforced at the database level regardless of what the application layer does.
alter table public.bookings
  drop constraint if exists no_overlapping_confirmed_bookings;

alter table public.bookings
  add constraint no_overlapping_confirmed_bookings
  exclude using gist (
    tutor_id with =,
    time_range with &&
  )
  where (status = 'confirmed');

comment on table public.bookings is 'Booking requests between a student and a tutor.';

-- =========================================================
-- updated_at trigger for bookings
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_set_updated_at on public.bookings;
create trigger bookings_set_updated_at
  before update on public.bookings
  for each row
  execute function public.set_updated_at();

-- =========================================================
-- auto-create profile row on signup
-- Reads role/full_name from auth.users.raw_user_meta_data, set by the
-- client at signUp() time (options.data.role / options.data.full_name).
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'student'),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
