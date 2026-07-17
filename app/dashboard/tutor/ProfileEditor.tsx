'use client';

import { useState, useTransition } from 'react';
import { updateTutorProfile } from './actions';
import type { Profile } from '@/lib/supabase/types';

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
    <form action={handleSubmit} className="mt-3 flex flex-col gap-4 rounded-xl border border-black/[.08] p-4 dark:border-white/[.145]">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="full_name" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Full name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          defaultValue={profile.full_name}
          required
          className="rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-950 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-zinc-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="subjects" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Subjects (comma-separated)
        </label>
        <input
          id="subjects"
          name="subjects"
          type="text"
          defaultValue={profile.subjects.join(', ')}
          placeholder="Math, Physics, Chemistry"
          className="rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-950 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-zinc-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="bio" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={profile.bio}
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
        className="h-9 self-start rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-60 dark:hover:bg-[#ccc]"
      >
        {isPending ? 'Saving...' : 'Save profile'}
      </button>
    </form>
  );
}
