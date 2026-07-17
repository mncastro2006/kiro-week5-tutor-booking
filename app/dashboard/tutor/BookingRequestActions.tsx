'use client';

import { useState, useTransition } from 'react';
import { acceptBooking, rejectBooking } from './actions';

export default function BookingRequestActions({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handle(action: (id: string) => Promise<{ error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action(bookingId);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => handle(acceptBooking)}
          className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          Accept
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handle(rejectBooking)}
          className="rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-100 disabled:opacity-60 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
        >
          Reject
        </button>
      </div>
      {error && <p className="max-w-[16rem] text-right text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}
