-- Row Level Security policies per PRD section 7.

alter table public.profiles enable row level security;
alter table public.availability enable row level security;
alter table public.bookings enable row level security;

-- =========================================================
-- profiles
-- Everyone (any authenticated user) can read all profiles (public tutor directory).
-- Users can only update/insert their own row.
-- =========================================================
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
  on public.profiles
  for select
  to authenticated, anon
  using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- =========================================================
-- availability
-- Anyone can read (needed to show open slots on public tutor profile).
-- Only the owning tutor can insert/update/delete their own rows.
-- =========================================================
drop policy if exists "availability_select_all" on public.availability;
create policy "availability_select_all"
  on public.availability
  for select
  to authenticated, anon
  using (true);

drop policy if exists "availability_insert_own" on public.availability;
create policy "availability_insert_own"
  on public.availability
  for insert
  to authenticated
  with check (tutor_id = auth.uid());

drop policy if exists "availability_update_own" on public.availability;
create policy "availability_update_own"
  on public.availability
  for update
  to authenticated
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

drop policy if exists "availability_delete_own" on public.availability;
create policy "availability_delete_own"
  on public.availability
  for delete
  to authenticated
  using (tutor_id = auth.uid());

-- =========================================================
-- bookings
-- Students: select/insert where student_id = auth.uid().
-- Tutors: select where tutor_id = auth.uid().
-- Tutors: update status where tutor_id = auth.uid() (accept/reject/cancel).
-- Students: update status to 'cancelled' only, where student_id = auth.uid()
--           and current status is 'pending' or 'confirmed'.
-- =========================================================
drop policy if exists "bookings_select_own" on public.bookings;
create policy "bookings_select_own"
  on public.bookings
  for select
  to authenticated
  using (student_id = auth.uid() or tutor_id = auth.uid());

drop policy if exists "bookings_insert_student" on public.bookings;
create policy "bookings_insert_student"
  on public.bookings
  for insert
  to authenticated
  with check (student_id = auth.uid());

drop policy if exists "bookings_update_tutor" on public.bookings;
create policy "bookings_update_tutor"
  on public.bookings
  for update
  to authenticated
  using (tutor_id = auth.uid())
  with check (tutor_id = auth.uid());

drop policy if exists "bookings_update_student_cancel" on public.bookings;
create policy "bookings_update_student_cancel"
  on public.bookings
  for update
  to authenticated
  using (
    student_id = auth.uid()
    and status in ('pending', 'confirmed')
  )
  with check (
    student_id = auth.uid()
    and status = 'cancelled'
  );
