import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CalendarBlankIcon, WarningCircleIcon, PlusCircleIcon } from '@phosphor-icons/react/ssr';
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
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">My sessions</h1>
        <Link
          href="/tutors"
          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
        >
          <PlusCircleIcon size={16} weight="bold" />
          Book a new session
        </Link>
      </div>

      {error && (
        <p className="mt-6 flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          <WarningCircleIcon size={16} className="mt-0.5 shrink-0" />
          Could not load your sessions: {error.message}
        </p>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-medium text-foreground">Upcoming</h2>
        {upcoming.length === 0 ? (
          <div className="mt-3 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-stone-300 py-10 text-center dark:border-stone-700">
            <CalendarBlankIcon size={26} className="text-stone-400" />
            <p className="text-sm text-stone-600 dark:text-stone-400">No upcoming sessions yet.</p>
          </div>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {upcoming.map((booking) => (
              <li
                key={booking.id}
                className="flex items-start justify-between gap-4 rounded-2xl border border-stone-200 bg-background p-4 dark:border-stone-800"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{booking.subject}</p>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                    with {booking.tutor?.full_name ?? 'Unknown tutor'}
                  </p>
                  <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                    {formatRange(booking.start_at, booking.end_at)}
                  </p>
                  {booking.notes && (
                    <p className="mt-2 text-sm text-stone-500">&quot;{booking.notes}&quot;</p>
                  )}
                </div>
                <CancelButton bookingId={booking.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-foreground">History</h2>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">No past sessions yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {history.map((booking) => (
              <li
                key={booking.id}
                className="flex items-start justify-between gap-4 rounded-2xl border border-stone-200 bg-background p-4 dark:border-stone-800"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{booking.subject}</p>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                    with {booking.tutor?.full_name ?? 'Unknown tutor'}
                  </p>
                  <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
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
