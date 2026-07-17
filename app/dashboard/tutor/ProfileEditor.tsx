'use client';

import { useState, useTransition } from 'react';
import { WarningCircleIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { updateTutorProfile } from './actions';
import type { Profile } from '@/lib/supabase/types';

const inputClasses =
  'rounded-lg border border-stone-300 bg-transparent px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-stone-700';

export default function ProfileEditor({ profile }: { profile: Profile }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  function handleSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateTutorProfile(formData);
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: 'Profile updated.' });
      }
    });
  }

  return (
    <form action={handleSubmit} className="mt-3 flex flex-col gap-4 rounded-2xl border border-stone-200 p-5 dark:border-stone-800">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="full_name" className="text-sm font-medium text-stone-800 dark:text-stone-200">
          Full name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          defaultValue={profile.full_name}
          required
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="subjects" className="text-sm font-medium text-stone-800 dark:text-stone-200">
          Subjects (comma-separated)
        </label>
        <input
          id="subjects"
          name="subjects"
          type="text"
          defaultValue={profile.subjects.join(', ')}
          placeholder="Math, Physics, Chemistry"
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="bio" className="text-sm font-medium text-stone-800 dark:text-stone-200">
          Bio
        </label>
        <textarea id="bio" name="bio" rows={3} defaultValue={profile.bio} className={inputClasses} />
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
        className="h-9 self-start rounded-full bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
      >
        {isPending ? 'Saving...' : 'Save profile'}
      </button>
    </form>
  );
}
