import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import StatusBadge from '@/components/StatusBadge';
import CancelButton from './CancelButton';
import type { BookingStatus } from '@/lib/supabase/types';

type BookingRow = {
  id: string;
  subject: string;
  start_at: string;
  end_at: string;
  status: BookingStatus;
  notes: string;
  tutor: { full_name: string } | null;
};

function formatRange(startAt: string, endAt: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const dateStr = start.toLocaleDateString(undefined, { dateStyle: 'medium' });
  const startStr = start.toLocaleTimeString(undefined, { timeStyle: 'short' });
  const endStr = end.toLocaleTimeString(undefined, { timeStyle: 'short' });
  return `${dateStr} · ${startStr} – ${endStr}`;
}

export default async function StudentDashboardPage() {
  const { profile } = await getCurrentUser();

  if (!profile) {
    redirect('/login');
  }
  if (profile.role !== 'student') {
    redirect('/dashboard/tutor');
  }

  const supabase = await createClient();
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, subject, start_at, end_at, status, notes, tutor:tutor_id(full_name)')
    .eq('student_id', profile.id)
    .order('start_at', { ascending: true });

  const rows = (bookings as unknown as BookingRow[] | null) ?? [];
  const upcoming = rows.filter((b) => b.status === 'pending' || b.status === 'confirmed');
  const history = rows.filter((b) => b.status !== 'pending' && b.status !== 'confirmed');

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">My sessions</h1>
        <Link
          href="/tutors"
          className="text-sm font-medium text-zinc-950 underline dark:text-zinc-50"
        >
          Book a new session
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          Could not load your sessions: {error.message}
        </p>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">No upcoming sessions.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {upcoming.map((booking) => (
              <li
                key={booking.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-950"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-zinc-950 dark:text-zinc-50">{booking.subject}</p>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    with {booking.tutor?.full_name ?? 'Unknown tutor'}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {formatRange(booking.start_at, booking.end_at)}
                  </p>
                  {booking.notes && (
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">&quot;{booking.notes}&quot;</p>
                  )}
                </div>
                <CancelButton bookingId={booking.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">History</h2>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">No past sessions yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {history.map((booking) => (
              <li
                key={booking.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-zinc-950"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-zinc-950 dark:text-zinc-50">{booking.subject}</p>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    with {booking.tutor?.full_name ?? 'Unknown tutor'}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {formatRange(booking.start_at, booking.end_at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
