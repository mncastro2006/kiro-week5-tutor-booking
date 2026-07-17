'use client';

import { useState, useTransition } from 'react';
import { WarningCircleIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { requestBooking } from './actions';

const inputClasses =
  'rounded-lg border border-stone-300 bg-transparent px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-stone-700';

export default function BookingForm({ tutorId, subjects }: { tutorId: string; subjects: string[] }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  function handleSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await requestBooking(tutorId, formData);
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: 'Request sent. The tutor will review it soon.' });
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-stone-200 p-5 dark:border-stone-800">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="subject" className="text-sm font-medium text-stone-800 dark:text-stone-200">
          Subject
        </label>
        {subjects.length > 0 ? (
          <select id="subject" name="subject" required className={inputClasses}>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ) : (
          <input id="subject" name="subject" type="text" required className={inputClasses} />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="date" className="text-sm font-medium text-stone-800 dark:text-stone-200">
          Date
        </label>
        <input id="date" name="date" type="date" required className={inputClasses} />
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="start_time" className="text-sm font-medium text-stone-800 dark:text-stone-200">
            Start (UTC)
          </label>
          <input id="start_time" name="start_time" type="time" required className={inputClasses} />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="end_time" className="text-sm font-medium text-stone-800 dark:text-stone-200">
            End (UTC)
          </label>
          <input id="end_time" name="end_time" type="time" required className={inputClasses} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-sm font-medium text-stone-800 dark:text-stone-200">
          Notes (optional)
        </label>
        <textarea id="notes" name="notes" rows={3} className={inputClasses} />
      </div>

      {message && (
        <p
          className={
            message.type === 'error'
              ? 'flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
              : 'flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
          }
        >
          {message.type === 'error' ? (
            <WarningCircleIcon size={16} className="mt-0.5 shrink-0" />
          ) : (
            <CheckCircleIcon size={16} className="mt-0.5 shrink-0" />
          )}
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="h-10 rounded-full bg-accent text-sm font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
      >
        {isPending ? 'Sending...' : 'Request session'}
      </button>
    </form>
  );
}
