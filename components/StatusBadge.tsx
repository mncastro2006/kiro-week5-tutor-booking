import type { BookingStatus } from '@/lib/supabase/types';

const STYLES: Record<BookingStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800',
  confirmed: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800',
  rejected: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-800',
  cancelled: 'bg-stone-100 text-stone-600 ring-1 ring-inset ring-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:ring-stone-700',
  completed: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-800',
};

export default function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STYLES[status]}`}>
      {status}
    </span>
  );
}
