'use client';

import { useState, useTransition } from 'react';
import { cancelBookingAsStudent } from './actions';

export default function CancelButton({ bookingId }: { bookingId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await cancelBookingAsStudent(bookingId);
      if (result.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded-full border border-black/[.08] px-3 py-1 text-xs font-medium text-zinc-800 transition-colors hover:bg-black/[.04] disabled:opacity-60 dark:border-white/[.145] dark:text-zinc-200 dark:hover:bg-white/[.06]"
      >
        {isPending ? 'Cancelling...' : 'Cancel'}
      </button>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
