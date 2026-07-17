import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/lib/supabase/types';

/**
 * Fetches the current authenticated user's auth record and app profile.
 * Returns nulls if not signed in. Safe to call from Server Components,
 * Server Actions, and Route Handlers.
 */
export async function getCurrentUser(): Promise<{ profile: Profile | null }> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return { profile: null };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userData.user.id)
    .single();

  return { profile: (profile as Profile) ?? null };
}
