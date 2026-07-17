# PRD: Tutor Booking App

## 1. Overview
A web application where students can browse tutors, book tutoring sessions, and tutors can accept or decline requests. The system prevents double-booking by enforcing schedule conflict checks at the data and application layers.

**Tech stack:** Next.js (App Router), Supabase (Postgres, Auth, Row Level Security, Realtime).

## 2. Goals
- Students can find tutors and request a session at a specific time.
- Tutors can review incoming requests and accept or reject them.
- No tutor can end up with two overlapping confirmed sessions.
- Both parties can see their upcoming schedule.

## 3. Non-Goals (v1)
- Payments/billing integration.
- Video call hosting (link to external tool like Zoom/Meet is enough).
- Recurring/repeating bookings.
- Group sessions (1:1 only for v1).

## 4. User Roles
- **Student**: browses tutors, requests bookings, views own sessions, cancels own pending/confirmed sessions.
- **Tutor**: sets availability, reviews/accepts/rejects booking requests, views own sessions, cancels confirmed sessions.
- **Admin** (optional, stretch): can view all bookings, manage users.

## 5. Core User Flows

### 5.1 Student books a session
1. Student browses tutor list/profile, sees tutor's availability.
2. Student picks a subject, date, and time slot.
3. App checks the slot doesn't conflict with the tutor's existing confirmed sessions or blocked availability.
4. Booking is created with status `pending`.
5. Tutor is notified (in-app, optionally email).

### 5.2 Tutor accepts/rejects a session
1. Tutor views pending requests.
2. On **Accept**: system re-validates no conflict exists (race-condition guard), sets status to `confirmed`.
3. On **Reject**: status set to `rejected`, student notified.
4. If two students requested overlapping slots, accepting one auto-rejects (or flags) the other overlapping pending request.

### 5.3 Cancellation
- Either party can cancel a `pending` or `confirmed` session before it starts.
- Cancelled sessions free up the time slot.

## 6. Data Model (Supabase / Postgres)

### `profiles`
| column | type | notes |
|---|---|---|
| id | uuid (PK, FK -> auth.users.id) | |
| role | text | `student` \| `tutor` \| `admin` |
| full_name | text | |
| email | text | |
| subjects | text[] | tutor only, subjects taught |
| bio | text | tutor only |
| created_at | timestamptz | default now() |

### `availability` (tutor recurring/one-off availability windows)
| column | type | notes |
|---|---|---|
| id | uuid (PK) | |
| tutor_id | uuid (FK -> profiles.id) | |
| day_of_week | int | 0-6, nullable if one-off |
| specific_date | date | nullable, for one-off overrides |
| start_time | time | |
| end_time | time | |
| created_at | timestamptz | |

### `bookings`
| column | type | notes |
|---|---|---|
| id | uuid (PK) | |
| student_id | uuid (FK -> profiles.id) | |
| tutor_id | uuid (FK -> profiles.id) | |
| subject | text | |
| start_at | timestamptz | session start (UTC) |
| end_at | timestamptz | session end (UTC) |
| status | text | `pending` \| `confirmed` \| `rejected` \| `cancelled` \| `completed` |
| notes | text | optional message from student |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Conflict prevention (critical requirement):**
- Add a Postgres `EXCLUDE` constraint using the `btree_gist` extension so overlapping `confirmed` bookings for the same `tutor_id` are impossible at the database level:

```sql
create extension if not exists btree_gist;

alter table bookings
  add column time_range tstzrange generated always as (tstzrange(start_at, end_at, '[)')) stored;

alter table bookings
  add constraint no_overlapping_confirmed_bookings
  exclude using gist (
    tutor_id with =,
    time_range with &&
  )
  where (status = 'confirmed');
```

- Application layer also checks for conflicts before insert/update (against `confirmed` bookings and the tutor's `availability`) to give a fast, friendly error message instead of relying solely on the DB error.
- Accepting a booking runs inside a transaction: re-check no overlapping `confirmed` booking exists, then update status to `confirmed`. If the DB constraint rejects it (race condition), return a clear "slot no longer available" error.

## 7. Row Level Security (RLS)
- `profiles`: users can read all profiles (public tutor directory), but only update their own row.
- `availability`: tutors can insert/update/delete their own rows; anyone can read.
- `bookings`:
  - Students can `select`/`insert` where `student_id = auth.uid()`.
  - Tutors can `select` where `tutor_id = auth.uid()`.
  - Tutors can `update` status only where `tutor_id = auth.uid()`.
  - Students can `update` status to `cancelled` only where `student_id = auth.uid()` and current status is `pending` or `confirmed`.

## 8. API / Server Actions (Next.js App Router)
- `POST /api/bookings` — create a booking request (student). Validates slot against availability + existing confirmed bookings before insert.
- `PATCH /api/bookings/[id]/accept` — tutor accepts (transactional conflict re-check).
- `PATCH /api/bookings/[id]/reject` — tutor rejects.
- `PATCH /api/bookings/[id]/cancel` — either party cancels.
- `GET /api/tutors` — list tutors with subjects/availability.
- `GET /api/tutors/[id]/availability?date=` — computed open slots (availability minus existing confirmed bookings).
- Use Supabase client directly from Server Components/Actions where possible instead of custom REST routes, per Next.js + Supabase conventions.

## 9. Pages (Next.js App Router)
- `/` — landing page.
- `/tutors` — browse/search tutors.
- `/tutors/[id]` — tutor profile + booking widget (calendar of open slots).
- `/dashboard/student` — student's bookings (pending/confirmed/history).
- `/dashboard/tutor` — tutor's incoming requests + confirmed schedule + availability editor.
- `/login`, `/signup` — Supabase Auth (email/password, optionally OAuth).

## 10. Notifications (v1 scope)
- In-app notification badge for tutors (new pending requests) and students (status changes).
- Stretch: email via Supabase Edge Function + Resend/SendGrid on booking created/accepted/rejected.

## 11. Success Metrics
- Zero double-booked confirmed sessions in production (enforced by DB constraint — should be verifiable via query returning 0 overlapping confirmed rows).
- Booking request -> tutor response time.
- Booking acceptance rate.

## 12. Open Questions
- Time zone handling: store UTC, display in user's local time — confirm this is acceptable for cross-timezone tutor/student pairs.
- Session duration: fixed slot lengths (e.g., 30/60 min) vs. custom range?
- What happens to a `pending` request if its slot gets taken by another confirmed booking — auto-reject or leave for tutor to see it's stale?
