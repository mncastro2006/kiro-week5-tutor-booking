import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-24 text-center dark:bg-black">
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-zinc-50">
        Book tutoring sessions, without the scheduling headaches.
      </h1>
      <p className="mt-4 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
        Browse tutors by subject, request a time that works for you, and get
        confirmed. No double-booked sessions, ever.
      </p>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/tutors"
          className="flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Find a tutor
        </Link>
        <Link
          href="/signup"
          className="flex h-12 items-center justify-center rounded-full border border-black/[.08] px-6 text-sm font-medium text-zinc-900 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-100 dark:hover:bg-white/[.06]"
        >
          Become a tutor
        </Link>
      </div>
    </div>
  );
}
