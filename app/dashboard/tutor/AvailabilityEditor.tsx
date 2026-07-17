'use client';

import { useState, useTransition } from 'react';
import { addAvailability, deleteAvailability } from './actions';
import type { Availability } from '@/lib/supabase/types';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AvailabilityEditor({ availability }: { availability: Availability[] }) {
  const [mode, setMode] = useState<'recurring' | 'oneoff'>('recurring');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addAvailability(formData);
      if (result.error) setError(result.error);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteAvailability(id);
    });
  }

  return (
    <div>
      <ul className="flex flex-col gap-2">
        {availability.length === 0 && (
          <li className="text-sm text-zinc-600 dark:text-zinc-400">No availability windows set yet.</li>
        )}
        {availability.map((slot) => (
          <li
            key={slot.id}
            className="flex items-center justify-between rounded-md border border-black/[.08] px-3 py-2 text-sm dark:border-white/[.145]"
          >
            <span className="text-zinc-800 dark:text-zinc-200">
              {slot.day_of_week !== null ? `Every ${DAY_NAMES[slot.day_of_week]}` : slot.specific_date}{' '}
              · {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)} UTC
            </span>
            <button
              type="button"
              onClick={() => handleDelete(slot.id)}
              disabled={isPending}
              className="text-xs font-medium text-red-600 hover:underline disabled:opacity-60 dark:text-red-400"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <form action={handleSubmit} className="mt-4 flex flex-col gap-3 rounded-xl border border-black/[.08] p-4 dark:border-white/[.145]">
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200">
            <input
              type="radio"
              name="mode"
              value="recurring"
              checked={mode === 'recurring'}
              onChange={() => setMode('recurring')}
              className="accent-zinc-950 dark:accent-zinc-50"
            />
            Weekly
          </label>
          <label className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200">
            <input
              type="radio"
              name="mode"
              value="oneoff"
              checked={mode === 'oneoff'}
              onChange={() => setMode('oneoff')}
              className="accent-zinc-950 dark:accent-zinc-50"
            />
            One-off date
          </label>
        </div>

        {mode === 'recurring' ? (
          <select
            name="day_of_week"
            required
            className="rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-950 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-zinc-50"
          >
            {DAY_NAMES.map((day, i) => (
              <option key={day} value={i}>
                {day}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="date"
            name="specific_date"
            required
            className="rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-950 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-zinc-50"
          />
        )}

        <div className="flex gap-3">
          <input
            type="time"
            name="start_time"
            required
            className="flex-1 rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-950 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-zinc-50"
          />
          <input
            type="time"
            name="end_time"
            required
            className="flex-1 rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-950 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-zinc-50"
          />
        </div>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="h-9 rounded-full bg-foreground text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-60 dark:hover:bg-[#ccc]"
        >
          Add window
        </button>
      </form>
    </div>
  );
}
