'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function cancelBookingAsStudent(bookingId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return { error: 'You must be logged in.' };
  }

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, student_id, status')
    .eq('id', bookingId)
    .single();

  if (!booking || booking.student_id !== userData.user.id) {
    return { error: 'Booking not found.' };
  }

  if (booking.status !== 'pending' && booking.status !== 'confirmed') {
    return { error: 'Only pending or confirmed sessions can be cancelled.' };
  }

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard/student');
  return {};
}
