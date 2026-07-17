import Link from 'next/link';
import { MagnifyingGlassIcon, WarningCircleIcon, UserCircleIcon, ArrowRightIcon } from '@phosphor-icons/react/ssr';
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
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Find a tutor</h1>
      <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
        Browse available tutors and their subjects.
      </p>

      <form method="get" className="mt-6 flex max-w-sm gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            name="subject"
            defaultValue={subject ?? ''}
            placeholder="Filter by subject (e.g. Math)"
            className="w-full rounded-lg border border-stone-300 bg-transparent py-2 pl-9 pr-3 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-stone-700"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
        >
          Search
        </button>
      </form>

      {error && (
        <p className="mt-6 flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
          <WarningCircleIcon size={16} className="mt-0.5 shrink-0" />
          Could not load tutors: {error.message}
        </p>
      )}

      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(tutors as Profile[] | null)?.map((tutor) => (
          <li
            key={tutor.id}
            className="rounded-2xl border border-stone-200 bg-background p-5 transition-shadow hover:shadow-md dark:border-stone-800"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent-strong">
                <UserCircleIcon size={22} weight="fill" />
              </span>
              <h2 className="text-base font-medium text-foreground">
                {tutor.full_name || 'Unnamed tutor'}
              </h2>
            </div>
            {tutor.subjects.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {tutor.subjects.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
            {tutor.bio && (
              <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">{tutor.bio}</p>
            )}
            <Link
              href={`/tutors/${tutor.id}`}
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent-strong hover:text-accent"
            >
              View profile & book
              <ArrowRightIcon size={14} />
            </Link>
          </li>
        ))}
      </ul>

      {!error && tutors?.length === 0 && (
        <p className="mt-8 text-sm text-stone-600 dark:text-stone-400">
          No tutors found{subject ? ` for "${subject}"` : ''}.
        </p>
      )}
    </div>
  );
}
