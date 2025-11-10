"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CycleHeader } from "@/components/ui/cycle-header";
import { DayCard, DayCardTask } from "@/components/ui/day-card";
import { CycleCompleteModal } from "@/components/ui/cycle-complete-modal";
import {
  toggleDayCompletion,
  toggleTaskCompletion,
  startNextCycle,
} from "./actions";

type DashboardClientProps = {
  userEmail: string;
  cycle: {
    id: string;
    sequenceNumber: number;
    completedAt: string | null;
    days: {
      id: string;
      dayNumber: number;
      completed: boolean;
      tasks: DayCardTask[];
    }[];
    completedCount: number;
  };
  pastCyclesCount: number;
};

export function DashboardClient({
  userEmail,
  cycle,
  pastCyclesCount,
}: DashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasShownCompletionModal, setHasShownCompletionModal] =
    useState(false);
  const [localCycle, setLocalCycle] = useState(cycle);

  useEffect(() => {
    setLocalCycle(cycle);
  }, [cycle]);

  const isCycleComplete = useMemo(
    () =>
      localCycle.days.length === 7 &&
      localCycle.days.every((day) => day.completed),
    [localCycle.days]
  );

  useEffect(() => {
    if (isCycleComplete && !hasShownCompletionModal) {
      setIsModalOpen(true);
      setHasShownCompletionModal(true);
    }

    if (!isCycleComplete && hasShownCompletionModal) {
      setHasShownCompletionModal(false);
    }
  }, [isCycleComplete, hasShownCompletionModal]);

  const syncCycleState = (
    updater: (prev: DashboardClientProps["cycle"]) => DashboardClientProps["cycle"]
  ) => {
    setLocalCycle((prev) => updater(structuredClone(prev)));
  };

  const handleToggleDay = (dayId: string, nextState: boolean) => {
    syncCycleState((draft) => {
      draft.days = draft.days.map((day) => {
        if (day.id !== dayId) {
          return day;
        }
        return {
          ...day,
          completed: nextState,
          tasks: day.tasks.map((task) => ({
            ...task,
            completed: nextState,
          })),
        };
      });
      draft.completedCount = draft.days.filter((day) => day.completed).length;
      return draft;
    });

    startTransition(async () => {
      setError(null);
      const result = await toggleDayCompletion(dayId, nextState);
      if (!result.success) {
        setError(result.error ?? "Unable to update day.");
        setLocalCycle(cycle);
      }
    });
  };

  const handleToggleTask = (taskId: string, nextState: boolean) => {
    syncCycleState((draft) => {
      draft.days = draft.days.map((day) => {
        if (!day.tasks.some((task) => task.id === taskId)) {
          return day;
        }
        const updatedTasks = day.tasks.map((task) =>
          task.id === taskId ? { ...task, completed: nextState } : task
        );
        const allComplete = updatedTasks.length
          ? updatedTasks.every((task) => task.completed)
          : false;
        return {
          ...day,
          tasks: updatedTasks,
          completed: allComplete,
        };
      });
      draft.completedCount = draft.days.filter((day) => day.completed).length;
      return draft;
    });

    startTransition(async () => {
      setError(null);
      const result = await toggleTaskCompletion(taskId, nextState);
      if (!result.success) {
        setError(result.error ?? "Unable to update task.");
        setLocalCycle(cycle);
      }
    });
  };

  const handleStartNextCycle = () => {
    startTransition(async () => {
      setError(null);
      const result = await startNextCycle(localCycle.id);
      if (!result.success) {
        setError(result.error ?? "Unable to start the next cycle.");
        setIsModalOpen(false);
        return;
      }
      setIsModalOpen(false);
      setHasShownCompletionModal(false);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-8 pb-16">
      <CycleHeader
        userEmail={userEmail}
        cycleNumber={localCycle.sequenceNumber}
        completedDays={localCycle.completedCount}
        totalDays={localCycle.days.length}
        pastCyclesCount={pastCyclesCount}
        onOpenCompletionModal={() => setIsModalOpen(true)}
        isCycleComplete={isCycleComplete}
      />

      {error ? (
        <div className="rounded-3xl border border-red-200/60 bg-red-50/80 px-4 py-3 text-sm text-red-700 shadow-sm backdrop-blur dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {localCycle.days.map((day) => (
          <DayCard
            key={day.id}
            day={day}
            onToggleDay={handleToggleDay}
            onToggleTask={handleToggleTask}
            disabled={isPending}
            readOnly={Boolean(localCycle.completedAt)}
          />
        ))}
      </section>

      <CycleCompleteModal
        isOpen={isModalOpen && isCycleComplete}
        cycleNumber={localCycle.sequenceNumber}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleStartNextCycle}
        isSubmitting={isPending}
      />
    </div>
  );
}

