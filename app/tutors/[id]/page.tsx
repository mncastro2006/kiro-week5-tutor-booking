import { notFound } from 'next/navigation';
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
      <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">{typedTutor.full_name}</h1>

      {typedTutor.subjects.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {typedTutor.subjects.map((s) => (
            <span
              key={s}
              className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {typedTutor.bio && (
        <p className="mt-4 max-w-2xl text-zinc-700 dark:text-zinc-300">{typedTutor.bio}</p>
      )}

      <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2">
        <div>
          <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">Availability</h2>
          {typedAvailability.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              This tutor hasn&apos;t set their availability yet.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              {typedAvailability.map((slot) => (
                <li key={slot.id} className="rounded-md border border-black/[.08] px-3 py-2 dark:border-white/[.145]">
                  {slot.day_of_week !== null
                    ? `Every ${DAY_NAMES[slot.day_of_week]}`
                    : slot.specific_date}{' '}
                  · {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)} UTC
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-lg font-medium text-zinc-950 dark:text-zinc-50">Request a session</h2>
          {canBook ? (
            <div className="mt-3">
              <BookingForm tutorId={id} subjects={typedTutor.subjects} />
            </div>
          ) : (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
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
