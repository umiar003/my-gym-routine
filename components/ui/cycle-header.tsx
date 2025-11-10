type CycleHeaderProps = {
  userEmail: string;
  cycleNumber: number;
  completedDays: number;
  totalDays: number;
  pastCyclesCount: number;
  onOpenCompletionModal?: () => void;
  isCycleComplete?: boolean;
};

export function CycleHeader({
  userEmail,
  cycleNumber,
  completedDays,
  totalDays,
  pastCyclesCount,
  onOpenCompletionModal,
  isCycleComplete = false,
}: CycleHeaderProps) {
  const progress =
    totalDays === 0 ? 0 : Math.round((completedDays / totalDays) * 100);

  return (
    <header className="relative overflow-hidden rounded-[32px] border border-sky-100/70 bg-gradient-to-br from-sky-500/20 via-sky-400/10 to-blue-500/20 px-6 py-8 shadow-[0_30px_60px_-40px_rgba(14,116,234,0.65)] backdrop-blur-xl transition-all duration-500 hover:shadow-[0_40px_80px_-45px_rgba(14,116,234,0.75)] dark:border-sky-900/40 dark:from-slate-900/80 dark:via-blue-900/50 dark:to-sky-900/40">
      <div className="pointer-events-none absolute -left-24 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-700/30" />
      <div className="pointer-events-none absolute -right-16 -top-24 h-48 w-48 rounded-full bg-blue-300/30 blur-3xl dark:bg-blue-800/40" />

      <div className="relative flex flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="inline-flex items-center rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-sky-700 backdrop-blur dark:bg-sky-500/20 dark:text-sky-200">
              Cycle {cycleNumber.toString().padStart(2, "0")}
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Welcome back, {userEmail}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              Seven focused days, seamless resets. Flow through your cycle,
              track momentum, and let each tap reassure you&apos;re on course.
            </p>
          </div>
          <div className="hidden flex-col gap-3 text-right sm:flex">
            <span className="text-xs uppercase tracking-[0.3em] text-sky-600 dark:text-sky-300/80">
              Current rhythm
            </span>
            <span className="text-4xl font-semibold text-slate-900 dark:text-white">
              {progress}%
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="group rounded-3xl border border-sky-200/60 bg-white/70 px-4 py-5 text-sm font-medium text-sky-700 shadow-lg shadow-sky-200/40 transition hover:-translate-y-1 hover:shadow-xl dark:border-sky-900/40 dark:bg-slate-900/70 dark:text-sky-300">
            <p className="text-xs uppercase tracking-[0.3em] text-sky-500/80 dark:text-sky-300/80">
              Cycle Progress
            </p>
            <p className="mt-3 text-2xl font-semibold">{progress}%</p>
          </div>
          <div className="group rounded-3xl border border-slate-200/70 bg-white/70 px-4 py-5 text-sm font-medium text-slate-600 shadow-lg shadow-slate-200/50 transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800/60 dark:bg-slate-900/70 dark:text-slate-200">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Days Complete
            </p>
            <p className="mt-3 text-2xl font-semibold">
              {completedDays}/{totalDays}
            </p>
          </div>
          <div className="group rounded-3xl border border-slate-200/70 bg-white/70 px-4 py-5 text-sm font-medium text-slate-600 shadow-lg shadow-slate-200/50 transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800/60 dark:bg-slate-900/70 dark:text-slate-200">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Cycles Logged
            </p>
            <p className="mt-3 text-2xl font-semibold">{pastCyclesCount}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <span>Cycle progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-sky-100/70 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
              aria-hidden="true"
            />
          </div>
          {isCycleComplete && onOpenCompletionModal ? (
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-sky-400/40 transition hover:from-sky-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:shadow-sky-900/30"
              onClick={onOpenCompletionModal}
            >
              Celebrate &amp; start the next cycle
              <svg
                className="h-3 w-3"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M7 5l6 5-6 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

