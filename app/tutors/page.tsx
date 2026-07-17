import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/supabase/types';

export default async function TutorsPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const { subject } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('profiles')
    .select('*')
    .eq('role', 'tutor')
    .order('full_name', { ascending: true });

  if (subject) {
    query = query.contains('subjects', [subject]);
  }

  const { data: tutors, error } = await query;

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">Find a tutor</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Browse available tutors and their subjects.
      </p>

      <form method="get" className="mt-6 flex max-w-sm gap-2">
        <input
          type="text"
          name="subject"
          defaultValue={subject ?? ''}
          placeholder="Filter by subject (e.g. Math)"
          className="flex-1 rounded-md border border-black/[.08] bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-950 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-zinc-50"
        />
        <button
          type="submit"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Search
        </button>
      </form>

      {error && (
        <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          Could not load tutors: {error.message}
        </p>
      )}

      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(tutors as Profile[] | null)?.map((tutor) => (
          <li
            key={tutor.id}
            className="rounded-xl border border-black/[.08] bg-white p-5 dark:border-white/[.145] dark:bg-zinc-950"
          >
            <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">
              {tutor.full_name || 'Unnamed tutor'}
            </h2>
            {tutor.subjects.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tutor.subjects.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
            {tutor.bio && (
              <p className="mt-3 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{tutor.bio}</p>
            )}
            <Link
              href={`/tutors/${tutor.id}`}
              className="mt-4 inline-block text-sm font-medium text-zinc-950 underline dark:text-zinc-50"
            >
              View profile & book
            </Link>
          </li>
        ))}
      </ul>

      {!error && tutors?.length === 0 && (
        <p className="mt-8 text-sm text-zinc-600 dark:text-zinc-400">
          No tutors found{subject ? ` for "${subject}"` : ''}.
        </p>
      )}
    </div>
  );
}
