import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function DashboardIndexPage() {
  const { profile } = await getCurrentUser();

  if (!profile) {
    redirect('/login');
  }

  redirect(profile.role === 'tutor' ? '/dashboard/tutor' : '/dashboard/student');
}
