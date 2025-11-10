"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerComponentClient } from "@/lib/supabaseClient";

type ActionResult = {
  success: boolean;
  error?: string;
};

async function requireUser() {
  const supabase = await createSupabaseServerComponentClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return { supabase, user };
}

export async function toggleDayCompletion(
  dayId: string,
  completed: boolean
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireUser();

    const { data: dayRecord, error: dayError } = await supabase
      .from("days")
      .select("id, cycle_id, cycle:cycles(id, user_id, completed_at)")
      .eq("id", dayId)
      .single();

    if (dayError || !dayRecord) {
      throw new Error("Day not found");
    }

    if (dayRecord.cycle.user_id !== user.id) {
      throw new Error("Access denied");
    }

    if (dayRecord.cycle.completed_at) {
      throw new Error("Cycle already archived");
    }

    const { error: updateError } = await supabase
      .from("days")
      .update({ completed })
      .eq("id", dayId);

    if (updateError) {
      throw updateError;
    }

    const { data: taskIds, error: taskFetchError } = await supabase
      .from("tasks")
      .select("id")
      .eq("day_id", dayId);

    if (taskFetchError) {
      throw taskFetchError;
    }

    if (taskIds && taskIds.length > 0) {
      const { error: taskUpdateError } = await supabase
        .from("tasks")
        .update({ completed })
        .in(
          "id",
          taskIds.map((task) => task.id)
        );

      if (taskUpdateError) {
        throw taskUpdateError;
      }
    }

    await revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update day",
    };
  }
}

export async function toggleTaskCompletion(
  taskId: string,
  completed: boolean
): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireUser();

    const { data: taskRecord, error: taskError } = await supabase
      .from("tasks")
      .select("id, day_id")
      .eq("id", taskId)
      .single();

    if (taskError || !taskRecord) {
      throw new Error("Task not found");
    }

    const { data: dayRecord, error: dayError } = await supabase
      .from("days")
      .select("id, completed, cycle_id, cycle:cycles(id, user_id, completed_at)")
      .eq("id", taskRecord.day_id)
      .single();

    if (dayError || !dayRecord) {
      throw new Error("Day not found");
    }

    if (dayRecord.cycle.user_id !== user.id) {
      throw new Error("Access denied");
    }

    if (dayRecord.cycle.completed_at) {
      throw new Error("Cycle already archived");
    }

    const { error: updateError } = await supabase
      .from("tasks")
      .update({ completed })
      .eq("id", taskId);

    if (updateError) {
      throw updateError;
    }

    const { data: siblingTasks, error: siblingError } = await supabase
      .from("tasks")
      .select("id, completed")
      .eq("day_id", dayRecord.id);

    if (siblingError || !siblingTasks) {
      throw siblingError ?? new Error("Unable to read tasks");
    }

    const allComplete = siblingTasks.every((task) =>
      task.id === taskId ? completed : task.completed
    );

    if (allComplete !== dayRecord.completed) {
      const { error: dayUpdateError } = await supabase
        .from("days")
        .update({ completed: allComplete })
        .eq("id", dayRecord.id);

      if (dayUpdateError) {
        throw dayUpdateError;
      }
    }

    await revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update the task",
    };
  }
}

export async function startNextCycle(currentCycleId: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await requireUser();

    const { data: currentCycle, error: currentCycleError } = await supabase
      .from("cycles")
      .select("id, user_id, sequence_number, completed_at")
      .eq("id", currentCycleId)
      .single();

    if (currentCycleError || !currentCycle) {
      throw new Error("Cycle not found");
    }

    if (currentCycle.user_id !== user.id) {
      throw new Error("Access denied");
    }

    if (currentCycle.completed_at) {
      throw new Error("Cycle already archived");
    }

    const { data: cycleDays, error: cycleDaysError } = await supabase
      .from("days")
      .select("id, day_index, completed")
      .eq("cycle_id", currentCycle.id)
      .order("day_index", { ascending: true });

    if (cycleDaysError) {
      throw cycleDaysError;
    }

    const dayList = cycleDays ?? [];

    const allDaysComplete =
      dayList.length === 7 && dayList.every((day) => day.completed);

    if (!allDaysComplete) {
      throw new Error("Complete all days before starting a new cycle");
    }

    const { error: archiveError } = await supabase
      .from("cycles")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", currentCycle.id);

    if (archiveError) {
      throw archiveError;
    }

    const { data: newCycle, error: newCycleError } = await supabase
      .from("cycles")
      .insert({
        user_id: user.id,
        sequence_number: currentCycle.sequence_number + 1,
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (newCycleError || !newCycle) {
      throw newCycleError ?? new Error("Unable to create new cycle");
    }

    const newDaysPayload = Array.from({ length: 7 }, (_, index) => ({
      cycle_id: newCycle.id,
      day_index: index + 1,
      completed: false,
    }));

    const { data: newDays, error: newDaysError } = await supabase
      .from("days")
      .insert(newDaysPayload)
      .select("id, day_index");

    if (newDaysError || !newDays) {
      throw newDaysError ?? new Error("Unable to create days for new cycle");
    }

    let taskTemplates: {
      dayIndex: number;
      title: string;
      description: string | null;
    }[] = [];

    const dayIds = dayList.map((day) => day.id);
    if (dayIds.length > 0) {
      const { data: taskRows, error: tasksError } = await supabase
        .from("tasks")
        .select("day_id, title, description")
        .in("day_id", dayIds)
        .order("created_at", { ascending: true });

      if (tasksError) {
        throw tasksError;
      }

      const dayIndexLookup = new Map(dayList.map((day) => [day.id, day.day_index]));
      taskTemplates =
        taskRows?.map((task) => ({
          dayIndex: dayIndexLookup.get(task.day_id) ?? 0,
          title: task.title,
          description: task.description,
        })) ?? [];
    }

    if (taskTemplates.length > 0) {
      const dayIndexToId = new Map(
        newDays.map((day) => [day.day_index, day.id] as const)
      );

      const tasksToInsert = taskTemplates
        .map((task) => {
          const newDayId = dayIndexToId.get(task.dayIndex);
          if (!newDayId) {
            return null;
          }

          return {
            day_id: newDayId,
            title: task.title,
            description: task.description,
            completed: false,
          };
        })
        .filter(Boolean) as {
        day_id: string;
        title: string;
        description: string | null;
        completed: boolean;
      }[];

      if (tasksToInsert.length > 0) {
        const { error: insertTasksError } = await supabase
          .from("tasks")
          .insert(tasksToInsert);

        if (insertTasksError) {
          throw insertTasksError;
        }
      }
    }

    await revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to start the next cycle",
    };
  }
}

