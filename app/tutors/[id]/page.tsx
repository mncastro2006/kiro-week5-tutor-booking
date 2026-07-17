import { notFound } from 'next/navigation';
import { UserCircleIcon, ClockIcon } from '@phosphor-icons/react/ssr';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import type { Availability, Profile } from '@/lib/supabase/types';
import BookingForm from './BookingForm';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default async function TutorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: tutor } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('role', 'tutor')
    .single();

  if (!tutor) {
    notFound();
  }

  const { data: availability } = await supabase
    .from('availability')
    .select('*')
    .eq('tutor_id', id)
    .order('day_of_week', { ascending: true, nullsFirst: false })
    .order('specific_date', { ascending: true, nullsFirst: false });

  const { profile: currentProfile } = await getCurrentUser();
  const canBook = currentProfile?.role === 'student';
  const typedTutor = tutor as Profile;
  const typedAvailability = (availability as Availability[] | null) ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent-strong">
          <UserCircleIcon size={32} weight="fill" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{typedTutor.full_name}</h1>
      </div>

      {typedTutor.subjects.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {typedTutor.subjects.map((s) => (
            <span
              key={s}
              className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700 dark:bg-stone-800 dark:text-stone-300"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {typedTutor.bio && (
        <p className="mt-4 max-w-2xl leading-relaxed text-stone-700 dark:text-stone-300">{typedTutor.bio}</p>
      )}

      <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2">
        <div>
          <h2 className="text-lg font-medium text-foreground">Availability</h2>
          {typedAvailability.length === 0 ? (
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              This tutor hasn&apos;t set their availability yet.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2 text-sm text-stone-700 dark:text-stone-300">
              {typedAvailability.map((slot) => (
                <li
                  key={slot.id}
                  className="flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 dark:border-stone-800"
                >
                  <ClockIcon size={15} className="shrink-0 text-accent" />
                  {slot.day_of_week !== null
                    ? `Every ${DAY_NAMES[slot.day_of_week]}`
                    : slot.specific_date}{' '}
                  {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)} UTC
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-lg font-medium text-foreground">Request a session</h2>
          {canBook ? (
            <div className="mt-3">
              <BookingForm tutorId={id} subjects={typedTutor.subjects} />
            </div>
          ) : (
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              {currentProfile
                ? 'Only students can request sessions.'
                : 'Log in as a student to request a session with this tutor.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
