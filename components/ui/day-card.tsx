"use client";

import { Fragment, useMemo, useState } from "react";
import { TaskCard } from "./task-card";

export type DayCardTask = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
};

export type DayCardProps = {
  day: {
    id: string;
    dayNumber: number;
    completed: boolean;
    tasks: DayCardTask[];
  };
  onToggleDay?: (dayId: string, nextState: boolean) => void;
  onToggleTask?: (taskId: string, nextState: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
};

export function DayCard({
  day,
  onToggleDay,
  onToggleTask,
  disabled = false,
  readOnly = false,
}: DayCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const completedTasks = useMemo(
    () => day.tasks.filter((task) => task.completed).length,
    [day.tasks]
  );

  const totalTasks = day.tasks.length;
  const progress =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const previewTasks = day.tasks.slice(0, 2).map((task) => task.title);

  return (
    <article
      className={`group flex flex-col rounded-[32px] border border-slate-200/70 bg-white/80 p-5 shadow-lg shadow-slate-200/40 backdrop-blur transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-sky-200/50 focus-within:-translate-y-2 focus-within:shadow-2xl focus-within:shadow-sky-200/60 dark:border-slate-800/70 dark:bg-slate-900/70 dark:shadow-black/30 ${
        disabled ? "opacity-80" : ""
      }`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-500 dark:text-sky-300">
            Day {day.dayNumber}
          </p>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {day.completed ? "Rhythm locked in" : "Dial in your focus"}
          </h2>
          <div className="flex flex-wrap gap-2 pt-2">
            {previewTasks.length > 0 ? (
              previewTasks.map((title) => (
                <span
                  key={title}
                  className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[0.7rem] font-medium text-slate-500 ring-1 ring-slate-200/80 transition group-hover:bg-sky-100 group-hover:text-sky-600 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700 dark:group-hover:bg-sky-950/40 dark:group-hover:text-sky-300"
                >
                  {title}
                </span>
              ))
            ) : (
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                Tasks will appear once added.
              </span>
            )}
          </div>
        </div>
        <label
          htmlFor={`day-${day.id}`}
          className={`relative inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-all duration-300 ${
            day.completed
              ? "bg-sky-500 text-white shadow-lg shadow-sky-400/40"
              : "bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
          } ${disabled || readOnly ? "pointer-events-none opacity-70" : ""}`}
        >
          <input
            id={`day-${day.id}`}
            type="checkbox"
            className="peer sr-only"
            checked={day.completed}
            disabled={disabled || readOnly}
            onChange={() => onToggleDay?.(day.id, !day.completed)}
            aria-label={
              day.completed
                ? `Mark Day ${day.dayNumber} incomplete`
                : `Mark Day ${day.dayNumber} complete`
            }
          />
          <span
            className={`inline-flex h-4 w-4 items-center justify-center rounded-full border-2 border-transparent transition-colors duration-300 ${
              day.completed
                ? "bg-white text-sky-500"
                : "border-slate-300 bg-transparent text-transparent dark:border-slate-600"
            }`}
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-3 w-3"
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
          <span>{day.completed ? "Day Completed" : "Complete Day"}</span>
        </label>
      </header>

      <div className="mt-6 space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              {completedTasks}/{totalTasks || "—"} tasks
            </span>
            <span>{progress}%</span>
          </div>
          <span className="mt-2 flex h-2 w-full overflow-hidden rounded-full bg-sky-100/80 dark:bg-slate-800">
            <span
              className="h-2 rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
              aria-hidden="true"
            />
          </span>
        </div>

        {totalTasks > 0 ? (
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-sky-100 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-sky-950/40 dark:hover:text-sky-300"
            aria-expanded={isExpanded}
          >
            <svg
              className={`h-3 w-3 transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 8l5 5 5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {isExpanded ? "Hide tasks" : "Show tasks"}
          </button>
        ) : null}
      </div>

      <div
        className={`mt-4 grid transition-all duration-500 ease-out ${
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
        aria-hidden={!isExpanded}
      >
        <div
          className={`min-h-0 overflow-hidden ${
            isExpanded ? "pt-2" : "pt-0"
          }`}
        >
          <div className="space-y-3">
            {totalTasks === 0 ? (
              <div className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-100/60 px-4 py-5 text-center text-xs text-zinc-500 shadow-inner dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400">
                No tasks yet for this day. Add tasks in Supabase to start
                tracking.
              </div>
            ) : (
              day.tasks.map((task, index) => (
                <Fragment key={task.id}>
                  <TaskCard
                    task={task}
                    onToggle={onToggleTask}
                    disabled={disabled}
                    readOnly={readOnly}
                  />
                  {index < day.tasks.length - 1 ? (
                    <div className="mx-6 h-px bg-gradient-to-r from-transparent via-slate-200/60 to-transparent dark:via-slate-700/60" />
                  ) : null}
                </Fragment>
              ))
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

