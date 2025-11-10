import { redirect } from "next/navigation";
import { createSupabaseServerComponentClient } from "@/lib/supabaseClient";
import { DashboardClient } from "./dashboard-client";

type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerComponentClient>
>;

type DayRecord = {
  id: string;
  day_index: number;
};

type TaskSummary = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
};

const DEFAULT_DAY_TASKS: string[][] = [
  [
    "Warm Up",
    "None Enjoy",
    "Abs Excercise",
    "Boxing with dumbles + Air",
    "Boxing on Bag (100 punches)",
    "Kicks in Air",
    "100 PushUps",
    "Chest and triceps",
  ],
  [
    "Warm Up",
    "None Enjoy",
    "Special Abs Excercise-1",
    "Boxing with dumbles + Air",
    "Slow Boxing, all 4",
    "Kicks on Boxing Bag",
    "100 PushUps",
    "Back and biceps",
  ],
  [
    "Light Warm Up",
    "Running",
    "Abs Excercise",
    "Boxing with dumbles + Air",
    "None Enjoy",
    "None Enjoy",
    "Pull Ups",
    "Shoulders, forearms and abs",
  ],
  [
    "Warm Up",
    "None Enjoy",
    "Special Abs Excercise-2",
    "Boxing with dumbles + Air",
    "Slow Boxing, all 4",
    "Kicks on Boxing Bag",
    "100 PushUps",
    "Chest and triceps",
  ],
  [
    "Light Warm Up",
    "Running",
    "Abs Excercise",
    "Boxing with dumbles + Air",
    "None Enjoy",
    "None Enjoy",
    "Pull Ups",
    "Legs",
  ],
  [
    "Warm Up",
    "None Enjoy",
    "Special Abs Excercise-2",
    "Boxing with dumbles + Air",
    "Boxing on Bag (100 punches)",
    "Kicks in Air",
    "100 PushUps",
    "Back and biceps",
  ],
  [
    "Light Warm Up",
    "Sprint",
    "Abs Excercise",
    "Boxing with dumbles + Air",
    "Boxing on Bag (100 punches)",
    "None Enjoy",
    "100 PushUps",
    "Shoulders, forearms and triceps",
  ],
];

function dedupeDays(days: DayRecord[]): DayRecord[] {
  const map = new Map<string, DayRecord>();
  days.forEach((day) => map.set(day.id, day));
  return Array.from(map.values());
}

async function insertDefaultTasksForDays(
  supabase: SupabaseServerClient,
  days: DayRecord[]
) {
  const tasksToInsert = days.flatMap((day) => {
    const taskTitles = DEFAULT_DAY_TASKS[day.day_index - 1] ?? [];
    return taskTitles.map((title) => ({
      day_id: day.id,
      title,
      description: null,
      completed: false,
    }));
  });

  if (tasksToInsert.length === 0) {
    return;
  }

  const { error } = await supabase.from("tasks").insert(tasksToInsert);
  if (error) {
    throw error;
  }
}

async function ensureActiveCycle(
  supabase: SupabaseServerClient,
  userId: string
) {
  const { data: fetchedCycle, error } = await supabase
    .from("cycles")
    .select("id, sequence_number")
    .eq("user_id", userId)
    .order("sequence_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (error.code === "PGRST116") {
      // no rows yet, we'll create below
    } else if (error.code === "42P01") {
      throw new Error(
        "Supabase tables missing. Please create the cycles/days/tasks tables as documented in lib/supabaseConfig.ts."
      );
    } else {
      throw new Error(
        `Unable to load cycle data: ${error.message ?? "unknown Supabase error"}`
      );
    }
  }

  const daysNeedingDefaults: DayRecord[] = [];

  let cycleId: string;

  if (!fetchedCycle) {
    const { data: newCycle, error: insertError } = await supabase
      .from("cycles")
      .insert({
        user_id: userId,
        sequence_number: 1,
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertError || !newCycle) {
      throw insertError ?? new Error("Unable to create initial cycle");
    }

    cycleId = newCycle.id;

    const daysPayload = Array.from({ length: 7 }, (_, index) => ({
      cycle_id: cycleId,
      day_index: index + 1,
      completed: false,
    }));

    const { data: newDays, error: daysError } = await supabase
      .from("days")
      .insert(daysPayload)
      .select("id, day_index");

    if (daysError) {
      throw daysError;
    }

    if (newDays) {
      daysNeedingDefaults.push(...newDays);
    }
  } else {
    cycleId = fetchedCycle.id;
  }

  const { data: existingDays, error: daysError } = await supabase
    .from("days")
    .select("id, day_index")
    .eq("cycle_id", cycleId);

  if (daysError) {
    throw daysError;
  }

  const dayRecords: DayRecord[] = [...(existingDays ?? [])];
  const existingIndices = new Set(dayRecords.map((day) => day.day_index));
  const missing = Array.from({ length: 7 }, (_, index) => index + 1).filter(
    (index) => !existingIndices.has(index)
  );

  if (missing.length > 0) {
    const { data: insertedDays, error: insertMissing } = await supabase
      .from("days")
      .insert(
        missing.map((index) => ({
          cycle_id: cycleId,
          day_index: index,
          completed: false,
        }))
      )
      .select("id, day_index");

    if (insertMissing) {
      throw insertMissing;
    }

    if (insertedDays) {
      daysNeedingDefaults.push(...insertedDays);
      dayRecords.push(...insertedDays);
    }
  }

  const dayIds = dayRecords.map((day) => day.id);
  if (dayIds.length > 0) {
    const { data: taskSummaries, error: tasksError } = await supabase
      .from("tasks")
      .select("id, day_id")
      .in("day_id", dayIds);

    if (tasksError) {
      throw tasksError;
    }

    const tasksByDay = new Map<string, number>();
    taskSummaries?.forEach((task) => {
      tasksByDay.set(task.day_id, (tasksByDay.get(task.day_id) ?? 0) + 1);
    });

    dayRecords.forEach((day) => {
      if ((tasksByDay.get(day.id) ?? 0) === 0) {
        daysNeedingDefaults.push({ id: day.id, day_index: day.day_index });
      }
    });
  }

  const daysToSeed = dedupeDays(daysNeedingDefaults);
  if (daysToSeed.length > 0) {
    await insertDefaultTasksForDays(supabase, daysToSeed);
  }
}

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = await createSupabaseServerComponentClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await ensureActiveCycle(supabase, user.id);

  const { data: cycles, error: cyclesError } = await supabase
    .from("cycles")
    .select("id, sequence_number, completed_at")
    .eq("user_id", user.id)
    .order("sequence_number", { ascending: false });

  if (cyclesError) {
    throw cyclesError;
  }

  const currentCycle = cycles?.[0];

  if (!currentCycle) {
    throw new Error("Unable to load current cycle");
  }

  const { data: dayRows, error: currentDaysError } = await supabase
    .from("days")
    .select("id, day_index, completed")
    .eq("cycle_id", currentCycle.id)
    .order("day_index", { ascending: true });

  if (currentDaysError) {
    throw currentDaysError;
  }

  const dayList = dayRows ?? [];
  const dayIdList = dayList.map((day) => day.id);

  let taskMap = new Map<string, TaskSummary[]>();

  if (dayIdList.length > 0) {
    const { data: taskRows, error: tasksError } = await supabase
      .from("tasks")
      .select("id, day_id, title, description, completed, position, created_at")
      .in("day_id", dayIdList)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });

    if (tasksError) {
      throw tasksError;
    }

    taskMap = new Map<string, TaskSummary[]>();
    taskRows?.forEach((task) => {
      const existing = taskMap.get(task.day_id);
      const list = existing ?? ([] as TaskSummary[]);
      list.push({
        id: task.id,
        title: task.title,
        description: task.description,
        completed: task.completed,
      });
      taskMap.set(task.day_id, list);
    });
  }

  const normalizedDays = dayList.map((day) => ({
    id: day.id,
    dayNumber: day.day_index,
    completed: day.completed,
    tasks: taskMap.get(day.id) ?? [],
  }));

  const pastCyclesCount = cycles?.filter((cycle) => cycle.completed_at).length ?? 0;

  const cycleData = {
    id: currentCycle.id,
    sequenceNumber: currentCycle.sequence_number,
    completedAt: currentCycle.completed_at,
    days: normalizedDays,
    completedCount: normalizedDays.filter((day) => day.completed).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-slate-100 px-4 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="mx-auto w-full max-w-5xl">
        <DashboardClient
          userEmail={user.email ?? "friend"}
          cycle={cycleData}
          pastCyclesCount={pastCyclesCount}
        />
      </div>
    </div>
  );
}
