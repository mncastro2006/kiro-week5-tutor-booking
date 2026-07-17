'use client';

import { useState, useTransition } from 'react';
import { ClockIcon, TrashIcon, WarningCircleIcon } from '@phosphor-icons/react';
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

  const inputClasses =
    'rounded-lg border border-stone-300 bg-transparent px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-stone-700';

  return (
    <div>
      <ul className="flex flex-col gap-2">
        {availability.length === 0 && (
          <li className="text-sm text-stone-600 dark:text-stone-400">No availability windows set yet.</li>
        )}
        {availability.map((slot) => (
          <li
            key={slot.id}
            className="flex items-center justify-between rounded-lg border border-stone-200 px-3 py-2 text-sm dark:border-stone-800"
          >
            <span className="flex items-center gap-2 text-stone-800 dark:text-stone-200">
              <ClockIcon size={15} className="shrink-0 text-accent" />
              {slot.day_of_week !== null ? `Every ${DAY_NAMES[slot.day_of_week]}` : slot.specific_date}{' '}
              {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)} UTC
            </span>
            <button
              type="button"
              onClick={() => handleDelete(slot.id)}
              disabled={isPending}
              className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:underline disabled:opacity-60 dark:text-rose-400"
            >
              <TrashIcon size={14} />
              Remove
            </button>
          </li>
        ))}
      </ul>

      <form action={handleSubmit} className="mt-4 flex flex-col gap-3 rounded-2xl border border-stone-200 p-4 dark:border-stone-800">
        <div className="flex gap-2 text-sm">
          <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-stone-300 py-2 text-stone-700 transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent/10 has-[:checked]:text-accent-strong dark:border-stone-700 dark:text-stone-300">
            <input
              type="radio"
              name="mode"
              value="recurring"
              checked={mode === 'recurring'}
              onChange={() => setMode('recurring')}
              className="sr-only"
            />
            Weekly
          </label>
          <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-stone-300 py-2 text-stone-700 transition-colors has-[:checked]:border-accent has-[:checked]:bg-accent/10 has-[:checked]:text-accent-strong dark:border-stone-700 dark:text-stone-300">
            <input
              type="radio"
              name="mode"
              value="oneoff"
              checked={mode === 'oneoff'}
              onChange={() => setMode('oneoff')}
              className="sr-only"
            />
            One-off date
          </label>
        </div>

        {mode === 'recurring' ? (
          <select name="day_of_week" required className={inputClasses}>
            {DAY_NAMES.map((day, i) => (
              <option key={day} value={i}>
                {day}
              </option>
            ))}
          </select>
        ) : (
          <input type="date" name="specific_date" required className={inputClasses} />
        )}

        <div className="flex gap-3">
          <input type="time" name="start_time" required className={`flex-1 ${inputClasses}`} />
          <input type="time" name="end_time" required className={`flex-1 ${inputClasses}`} />
        </div>

        {error && (
          <p className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <WarningCircleIcon size={16} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="h-9 rounded-full bg-accent text-sm font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          Add window
        </button>
      </form>
    </div>
  );
}
