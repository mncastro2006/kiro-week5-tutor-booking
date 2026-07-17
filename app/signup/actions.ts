'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/supabase/types';

export async function signup(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const fullName = String(formData.get('full_name') ?? '').trim();
  const role = String(formData.get('role') ?? 'student') as UserRole;

  if (!email || !password || !fullName) {
    redirect('/signup?error=' + encodeURIComponent('All fields are required.'));
  }

  if (role !== 'student' && role !== 'tutor') {
    redirect('/signup?error=' + encodeURIComponent('Invalid role.'));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, full_name: fullName },
    },
  });

  if (error) {
    redirect('/signup?error=' + encodeURIComponent(error.message));
  }

  redirect('/dashboard');
}
