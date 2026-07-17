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
        className="rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-100 disabled:opacity-60 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
      >
        {isPending ? 'Cancelling...' : 'Cancel'}
      </button>
      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}
