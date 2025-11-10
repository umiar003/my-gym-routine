import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-sky-50 via-white to-slate-100 px-6 py-16 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 text-center">
        <span className="mx-auto rounded-full bg-sky-500/10 px-3 py-1 text-sm font-medium text-sky-700 ring-1 ring-sky-200/70 backdrop-blur dark:bg-sky-500/20 dark:text-sky-200 dark:ring-sky-800/50">
          Personal Efficiency Toolkit
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Design your 7-day routine and stick with the rhythm.
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          Cycle through focused days, track tasks, and keep momentum without the
          clutter. Sign in to start shaping the habits that matter most.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-400/40 transition hover:from-sky-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-sky-200 sm:w-auto"
          >
            Create an account
          </Link>
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-sky-400 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:text-slate-100 dark:hover:border-sky-500 dark:hover:text-sky-300 sm:w-auto"
          >
            I already have one
          </Link>
        </div>
      </div>
    </div>
  );
}
