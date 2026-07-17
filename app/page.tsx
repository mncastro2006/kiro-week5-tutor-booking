import Link from "next/link";
import Image from "next/image";
import {
  CalendarCheckIcon,
  ShieldCheckIcon,
  ClockIcon,
  ArrowUpRightIcon,
} from "@phosphor-icons/react/ssr";

const STEPS = [
  {
    icon: CalendarCheckIcon,
    title: "Browse and request",
    body: "Search tutors by subject, check their open slots, and send a request for the time that works for you.",
  },
  {
    icon: ClockIcon,
    title: "Get a fast response",
    body: "Tutors accept or decline from their dashboard. You will see the status change the moment they respond.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Show up with confidence",
    body: "Every confirmed slot is locked at the database level, so a tutor can never end up double-booked.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-12 px-6 pt-16 pb-20 md:grid-cols-2 md:pt-20">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Tutoring sessions, booked without the back and forth.
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-stone-600 dark:text-stone-400">
            Find a tutor, request a time that fits your week, and get a
            confirmed slot. No double bookings, no missed messages.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/tutors"
              className="group flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
            >
              Find a tutor
              <ArrowUpRightIcon
                size={16}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
            <Link
              href="/signup"
              className="flex h-12 items-center justify-center rounded-full border border-stone-300 px-6 text-sm font-medium text-stone-800 transition-colors hover:border-stone-400 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              Become a tutor
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl">
          <Image
            src="https://picsum.photos/seed/clarity-tutoring-session/1200/900"
            alt="A tutor and student reviewing notes together at a desk"
            fill
            priority
            className="object-cover"
          />
        </div>
      </section>

      <section className="border-t border-stone-200/70 bg-stone-100/60 px-6 py-20 dark:border-stone-800 dark:bg-stone-900/40">
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-md text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Three steps between you and your next session.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-3">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="border-t border-stone-300 pt-6 dark:border-stone-700">
                  <Icon size={22} className="text-accent" weight="bold" />
                  <h3 className="mt-4 text-base font-medium text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                    {step.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
