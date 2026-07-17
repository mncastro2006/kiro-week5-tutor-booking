'use client';

import { useState, useTransition } from 'react';
import { requestBooking } from './actions';

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
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="subject" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Subject
        </label>
        {subjects.length > 0 ? (
          <select
            id="subject"
            name="subject"
            required
            className="rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-950 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-zinc-50"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ) : (
          <input
            id="subject"
            name="subject"
            type="text"
            required
            className="rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-950 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-zinc-50"
          />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="date" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          className="rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-950 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-zinc-50"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="start_time" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Start (UTC)
          </label>
          <input
            id="start_time"
            name="start_time"
            type="time"
            required
            className="rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-950 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-zinc-50"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="end_time" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            End (UTC)
          </label>
          <input
            id="end_time"
            name="end_time"
            type="time"
            required
            className="rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-950 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-zinc-50"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-950 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-zinc-50"
        />
      </div>

      {message && (
        <p
          className={
            message.type === 'error'
              ? 'rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300'
              : 'rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-300'
          }
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="h-10 rounded-full bg-foreground text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-60 dark:hover:bg-[#ccc]"
      >
        {isPending ? 'Sending...' : 'Request session'}
      </button>
    </form>
  );
}
