import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

type TypedClient = SupabaseClient<Database>;

/**
 * Returns true if the tutor already has a CONFIRMED booking that overlaps
 * [startAt, endAt). This mirrors the DB-level EXCLUDE constraint and lets us
 * surface a friendly error before hitting the database.
 */
export async function hasConfirmedConflict(
  supabase: TypedClient,
  tutorId: string,
  startAt: string,
  endAt: string,
  excludeBookingId?: string
): Promise<boolean> {
  let query = supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('tutor_id', tutorId)
    .eq('status', 'confirmed')
    .lt('start_at', endAt)
    .gt('end_at', startAt);

  if (excludeBookingId) {
    query = query.neq('id', excludeBookingId);
  }

  const { count, error } = await query;
  if (error) throw error;
  return (count ?? 0) > 0;
}

/**
 * Checks whether [startAt, endAt) falls entirely inside one of the tutor's
 * declared availability windows (recurring day_of_week or one-off
 * specific_date).
 *
 * NOTE: availability.start_time/end_time have no timezone. Per the PRD's
 * open question on timezone handling, this app treats those values (and
 * day_of_week) as UTC for v1. Booking start_at/end_at are always compared in
 * UTC as a result.
 */
export async function isWithinAvailability(
  supabase: TypedClient,
  tutorId: string,
  startAtIso: string,
  endAtIso: string
): Promise<boolean> {
  const startAt = new Date(startAtIso);
  const endAt = new Date(endAtIso);

  // A slot must not cross midnight (UTC) to match a single availability row.
  if (startAt.getUTCFullYear() !== endAt.getUTCFullYear() ||
      startAt.getUTCMonth() !== endAt.getUTCMonth() ||
      startAt.getUTCDate() !== endAt.getUTCDate()) {
    return false;
  }

  const dateStr = startAt.toISOString().slice(0, 10);
  const dow = startAt.getUTCDay();

  const { data, error } = await supabase
    .from('availability')
    .select('start_time, end_time')
    .eq('tutor_id', tutorId)
    .or(`day_of_week.eq.${dow},specific_date.eq.${dateStr}`);

  if (error) throw error;
  if (!data || data.length === 0) return false;

  const startMinutes = startAt.getUTCHours() * 60 + startAt.getUTCMinutes();
  const endMinutes = endAt.getUTCHours() * 60 + endAt.getUTCMinutes();

  return data.some((window) => {
    const [wsH, wsM] = window.start_time.split(':').map(Number);
    const [weH, weM] = window.end_time.split(':').map(Number);
    const windowStart = wsH * 60 + wsM;
    const windowEnd = weH * 60 + weM;
    return startMinutes >= windowStart && endMinutes <= windowEnd;
  });
}
