"use client";

import { useEffect } from "react";

type CycleCompleteModalProps = {
  isOpen: boolean;
  cycleNumber: number;
  onConfirm: () => void;
  onClose: () => void;
  isSubmitting?: boolean;
};

export function CycleCompleteModal({
  isOpen,
  cycleNumber,
  onConfirm,
  onClose,
  isSubmitting = false,
}: CycleCompleteModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        aria-hidden="true"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-sky-200/70 bg-white/95 p-8 shadow-[0_30px_70px_-35px_rgba(14,116,234,0.75)] backdrop-blur-xl transition-all duration-300 ease-out dark:border-sky-900/50 dark:bg-slate-900/90 dark:shadow-black/50">
        <div className="absolute -top-24 right-0 h-48 w-48 rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-700/30" />
        <div className="relative">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-sky-700 dark:bg-sky-500/20 dark:text-sky-200">
              Cycle {cycleNumber.toString().padStart(2, "0")}
            </span>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
              Incredible work! 🎉
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              You locked in seven days straight. Ready to carry that momentum
              into the next cycle?
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-sky-300 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:text-slate-300 dark:hover:border-sky-500 dark:hover:text-sky-300"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Not yet
            </button>
            <button
              type="button"
              className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/40 transition hover:from-sky-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:from-sky-400 disabled:to-blue-500"
              onClick={onConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Starting..." : "Start next cycle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

