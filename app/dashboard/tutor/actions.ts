'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { hasConfirmedConflict } from '@/lib/bookings';

type ActionResult = { error?: string };

async function requireTutorOwnedBooking(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bookingId: string
) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: 'You must be logged in.' } as const;
  }

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, tutor_id, student_id, start_at, end_at, status')
    .eq('id', bookingId)
    .single();

  if (!booking || booking.tutor_id !== userData.user.id) {
    return { error: 'Booking not found.' } as const;
  }

  return { booking } as const;
}

/**
 * Accepts a pending booking. Re-checks for overlapping confirmed bookings
 * immediately before updating (race-condition guard) and relies on the DB
 * EXCLUDE constraint as the final safety net. On success, auto-rejects any
 * other pending requests for the tutor that overlap the newly confirmed slot.
 */
export async function acceptBooking(bookingId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const result = await requireTutorOwnedBooking(supabase, bookingId);
  if ('error' in result) return result;

  const { booking } = result;
  if (booking.status !== 'pending') {
    return { error: 'Only pending requests can be accepted.' };
  }

  const conflict = await hasConfirmedConflict(
    supabase,
    booking.tutor_id,
    booking.start_at,
    booking.end_at,
    booking.id
  );
  if (conflict) {
    return { error: 'That slot is no longer available. It conflicts with another confirmed session.' };
  }

  const { error: updateError } = await supabase
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('id', bookingId)
    .eq('status', 'pending');

  if (updateError) {
    if (updateError.code === '23P01') {
      return { error: 'That slot is no longer available. It conflicts with another confirmed session.' };
    }
    return { error: updateError.message };
  }

  // Auto-reject other pending requests for this tutor that overlap the slot
  // we just confirmed, per PRD 5.2.
  await supabase
    .from('bookings')
    .update({ status: 'rejected' })
    .eq('tutor_id', booking.tutor_id)
    .eq('status', 'pending')
    .neq('id', booking.id)
    .lt('start_at', booking.end_at)
    .gt('end_at', booking.start_at);

  revalidatePath('/dashboard/tutor');
  revalidatePath('/dashboard/student');
  return {};
}

export async function rejectBooking(bookingId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const result = await requireTutorOwnedBooking(supabase, bookingId);
  if ('error' in result) return result;

  const { booking } = result;
  if (booking.status !== 'pending') {
    return { error: 'Only pending requests can be rejected.' };
  }

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'rejected' })
    .eq('id', bookingId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/tutor');
  revalidatePath('/dashboard/student');
  return {};
}

export async function cancelBookingAsTutor(bookingId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const result = await requireTutorOwnedBooking(supabase, bookingId);
  if ('error' in result) return result;

  const { booking } = result;
  if (booking.status !== 'confirmed' && booking.status !== 'pending') {
    return { error: 'Only pending or confirmed sessions can be cancelled.' };
  }

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/tutor');
  revalidatePath('/dashboard/student');
  return {};
}

export async function addAvailability(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: 'You must be logged in.' };

  const mode = String(formData.get('mode') ?? 'recurring');
  const startTime = String(formData.get('start_time') ?? '');
  const endTime = String(formData.get('end_time') ?? '');

  if (!startTime || !endTime) {
    return { error: 'Start and end time are required.' };
  }
  if (endTime <= startTime) {
    return { error: 'End time must be after start time.' };
  }

  const payload: {
    tutor_id: string;
    start_time: string;
    end_time: string;
    day_of_week: number | null;
    specific_date: string | null;
  } = {
    tutor_id: userData.user.id,
    start_time: startTime,
    end_time: endTime,
    day_of_week: null,
    specific_date: null,
  };

  if (mode === 'recurring') {
    const dayOfWeek = Number(formData.get('day_of_week'));
    if (Number.isNaN(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      return { error: 'Please choose a valid day of week.' };
    }
    payload.day_of_week = dayOfWeek;
  } else {
    const specificDate = String(formData.get('specific_date') ?? '');
    if (!specificDate) {
      return { error: 'Please choose a date.' };
    }
    payload.specific_date = specificDate;
  }

  const { error } = await supabase.from('availability').insert(payload);
  if (error) return { error: error.message };

  revalidatePath('/dashboard/tutor');
  return {};
}

export async function deleteAvailability(availabilityId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: 'You must be logged in.' };

  const { error } = await supabase
    .from('availability')
    .delete()
    .eq('id', availabilityId)
    .eq('tutor_id', userData.user.id);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/tutor');
  return {};
}

export async function updateTutorProfile(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: 'You must be logged in.' };

  const fullName = String(formData.get('full_name') ?? '').trim();
  const bio = String(formData.get('bio') ?? '').trim();
  const subjectsRaw = String(formData.get('subjects') ?? '');
  const subjects = subjectsRaw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (!fullName) {
    return { error: 'Full name is required.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, bio, subjects })
    .eq('id', userData.user.id);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/tutor');
  revalidatePath('/tutors');
  return {};
}
