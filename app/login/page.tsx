import Link from 'next/link';
import { WarningCircleIcon } from '@phosphor-icons/react/ssr';
import { login } from './actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center bg-stone-100/60 px-4 py-16 dark:bg-stone-900/40">
      <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-background p-8 shadow-sm dark:border-stone-800">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Log in</h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Welcome back. Enter your details to continue.
        </p>

        {error && (
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
            <WarningCircleIcon size={16} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <form action={login} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-stone-800 dark:text-stone-200">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="rounded-lg border border-stone-300 bg-transparent px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-stone-700"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-stone-800 dark:text-stone-200">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="rounded-lg border border-stone-300 bg-transparent px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-stone-700"
            />
          </div>
          <button
            type="submit"
            className="mt-2 h-10 rounded-full bg-accent text-sm font-medium text-white transition-colors hover:bg-accent-strong"
          >
            Log in
          </button>
        </form>

        <p className="mt-6 text-sm text-stone-600 dark:text-stone-400">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-accent hover:text-accent-strong">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
