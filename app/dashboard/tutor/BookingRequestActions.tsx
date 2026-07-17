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
          className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-60 dark:hover:bg-[#ccc]"
        >
          Accept
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handle(rejectBooking)}
          className="rounded-full border border-black/[.08] px-3 py-1 text-xs font-medium text-zinc-800 transition-colors hover:bg-black/[.04] disabled:opacity-60 dark:border-white/[.145] dark:text-zinc-200 dark:hover:bg-white/[.06]"
        >
          Reject
        </button>
      </div>
      {error && <p className="max-w-[16rem] text-right text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
