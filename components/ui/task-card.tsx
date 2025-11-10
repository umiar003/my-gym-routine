"use client";

import { useMemo } from "react";

export type TaskCardProps = {
  task: {
    id: string;
    title: string;
    description: string | null;
    completed: boolean;
  };
  onToggle?: (taskId: string, nextState: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
};

export function TaskCard({
  task,
  onToggle,
  disabled = false,
  readOnly = false,
}: TaskCardProps) {
  const nextLabel = useMemo(
    () => (task.completed ? "Mark task incomplete" : "Mark task complete"),
    [task.completed]
  );

  return (
    <label
      htmlFor={`task-${task.id}`}
      className={`group relative flex cursor-pointer items-start gap-3 rounded-3xl border border-transparent bg-white/85 px-4 py-4 shadow-[0_15px_35px_-25px_rgba(14,116,234,0.7)] ring-1 ring-slate-200/60 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_25px_45px_-20px_rgba(14,116,234,0.75)] hover:ring-sky-200/80 focus-within:ring-sky-300 dark:bg-slate-900/80 dark:shadow-black/30 dark:ring-slate-800/60 dark:hover:ring-sky-600/60 ${
        disabled || readOnly ? "pointer-events-none opacity-70" : ""
      }`}
    >
      <input
        id={`task-${task.id}`}
        type="checkbox"
        className="peer sr-only"
        checked={task.completed}
        disabled={disabled || readOnly}
        onChange={() => onToggle?.(task.id, !task.completed)}
        aria-label={nextLabel}
      />
      <span
        className={`mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 transition-colors duration-300 ${
          task.completed
            ? "border-sky-500 bg-sky-500 text-white shadow-inner shadow-sky-700/40"
            : "border-slate-300 bg-white text-transparent dark:border-slate-700 dark:bg-slate-950"
        }`}
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path
            d="M5 10.5L8.5 14L15 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div className="flex flex-1 flex-col">
        <p
          className={`text-sm font-medium transition-colors duration-300 ${
            task.completed
              ? "text-sky-600 dark:text-sky-300"
              : "text-slate-900 dark:text-slate-100"
          }`}
        >
          {task.title}
        </p>
        {task.description ? (
          <p className="mt-1 text-xs text-slate-500 transition-colors duration-300 group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-300">
            {task.description}
          </p>
        ) : null}
      </div>
    </label>
  );
}

