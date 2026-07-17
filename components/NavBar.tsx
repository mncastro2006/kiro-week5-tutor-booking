import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { logout } from '@/app/logout/actions';

export default async function NavBar() {
  const { profile } = await getCurrentUser();
  const dashboardHref = profile ? `/dashboard/${profile.role === 'tutor' ? 'tutor' : 'student'}` : '/login';

  return (
    <header className="border-b border-black/[.08] bg-white dark:border-white/[.145] dark:bg-black">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
          TutorBooking
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/tutors" className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50">
            Find a tutor
          </Link>
          {profile ? (
            <>
              <Link
                href={dashboardHref}
                className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50"
              >
                Dashboard
              </Link>
              <span className="hidden text-zinc-500 sm:inline">{profile.full_name || profile.email}</span>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-full border border-black/[.08] px-4 py-1.5 text-zinc-800 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-200 dark:hover:bg-white/[.06]"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-foreground px-4 py-1.5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
