import Link from 'next/link';
import { GraduationCapIcon } from '@phosphor-icons/react/ssr';
import { getCurrentUser } from '@/lib/auth';
import { logout } from '@/app/logout/actions';

export default async function NavBar() {
  const { profile } = await getCurrentUser();
  const dashboardHref = profile ? `/dashboard/${profile.role === 'tutor' ? 'tutor' : 'student'}` : '/login';

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-background/90 backdrop-blur-md dark:border-stone-800">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
            <GraduationCapIcon size={18} weight="fill" />
          </span>
          Clarity Tutoring
        </Link>
        <div className="flex items-center gap-5 text-sm font-medium">
          <Link href="/tutors" className="hidden text-stone-600 transition-colors hover:text-foreground sm:inline dark:text-stone-400">
            Find a tutor
          </Link>
          {profile ? (
            <>
              <Link
                href={dashboardHref}
                className="hidden text-stone-600 transition-colors hover:text-foreground sm:inline dark:text-stone-400"
              >
                Dashboard
              </Link>
              <span className="hidden text-stone-500 md:inline">{profile.full_name || profile.email}</span>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-full border border-stone-300 px-4 py-1.5 text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-stone-600 transition-colors hover:text-foreground dark:text-stone-400">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-accent px-4 py-1.5 text-white transition-colors hover:bg-accent-strong"
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
