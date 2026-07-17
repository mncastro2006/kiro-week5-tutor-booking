'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { hasConfirmedConflict, isWithinAvailability } from '@/lib/bookings';

export type BookingActionResult = { error?: string; success?: boolean };

export async function requestBooking(
  tutorId: string,
  formData: FormData
): Promise<BookingActionResult> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return { error: 'You must be logged in as a student to request a session.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single();

  if (!profile || profile.role !== 'student') {
    return { error: 'Only students can request a tutoring session.' };
  }

  const subject = String(formData.get('subject') ?? '').trim();
  const date = String(formData.get('date') ?? '');
  const startTime = String(formData.get('start_time') ?? '');
  const endTime = String(formData.get('end_time') ?? '');
  const notes = String(formData.get('notes') ?? '').trim();

  if (!subject || !date || !startTime || !endTime) {
    return { error: 'Subject, date, start time, and end time are required.' };
  }

  const startAt = new Date(`${date}T${startTime}:00.000Z`).toISOString();
  const endAt = new Date(`${date}T${endTime}:00.000Z`).toISOString();

  if (new Date(endAt) <= new Date(startAt)) {
    return { error: 'End time must be after start time.' };
  }

  if (new Date(startAt) <= new Date()) {
    return { error: 'Please choose a time in the future.' };
  }

  const withinAvailability = await isWithinAvailability(supabase, tutorId, startAt, endAt);
  if (!withinAvailability) {
    return { error: "That time is outside the tutor's availability." };
  }

  const conflict = await hasConfirmedConflict(supabase, tutorId, startAt, endAt);
  if (conflict) {
    return { error: 'That slot was just booked by someone else. Please choose another time.' };
  }

  const { error: insertError } = await supabase.from('bookings').insert({
    student_id: userData.user.id,
    tutor_id: tutorId,
    subject,
    start_at: startAt,
    end_at: endAt,
    notes,
  });

  if (insertError) {
    // Postgres exclusion constraint violation code, in case of a race condition
    // between our pre-check and the insert.
    if (insertError.code === '23P01') {
      return { error: 'That slot was just booked by someone else. Please choose another time.' };
    }
    return { error: insertError.message };
  }

  revalidatePath(`/tutors/${tutorId}`);
  revalidatePath('/dashboard/student');
  return { success: true };
}
