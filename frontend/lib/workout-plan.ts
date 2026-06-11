"use client";

export type WorkoutSetMode = "reps" | "time";
export type WorkoutFlowType = "single" | "superset" | "triple" | "circuit";
export type WorkoutExerciseStatus = "pending" | "in-progress" | "completed";

export type WorkoutExerciseItem = {
  id: string;
  exerciseName: string;
  muscleGroup: string | null;
  sets: number;
  setMode: WorkoutSetMode;
  repsRange?: string | null;
  durationSeconds?: number | null;
  restSeconds: number;
  gifMediaId?: string | null;
  status: WorkoutExerciseStatus;
};

export type WorkoutBlock = {
  id: string;
  title: string;
  kind: "exercise" | "compound";
  flowType: WorkoutFlowType;
  rounds: number;
  exercises: WorkoutExerciseItem[];
};

export type WorkoutPhase = {
  id: string;
  title: string;
  blocks: WorkoutBlock[];
  exercises: WorkoutExerciseItem[];
};

export type WorkoutDayPlan = {
  id: string;
  dayNumber: number;
  label: string;
  title: string;
  summary: string;
  phases: WorkoutPhase[];
  isRecommended?: boolean;
};

export type WorkoutProgramPlan = {
  athlete: { id: string; fullName: string } | null;
  activeProgramTitle: string | null;
  activeAssignmentId: string | null;
  activeDayId: string | null;
  days: WorkoutDayPlan[];
  exercises: WorkoutExerciseItem[];
};

export type ExerciseProgress = {
  setsDone: number;
  skipped: boolean;
  completed: boolean;
};

export type WorkoutSessionState = {
  dayId: string;
  startedAt: string | null;
  finishedAt: string | null;
  phaseIndex: number;
  blockIndex: number;
  exerciseIndex: number;
  roundIndex: number;
  currentSetStartedAt: string | null;
  completedExercises: Record<string, ExerciseProgress>;
};

const SESSION_PREFIX = "fitcoach_workout_session_v1";

function createExerciseProgress(): ExerciseProgress {
  return { setsDone: 0, skipped: false, completed: false };
}

export function createSession(dayId: string): WorkoutSessionState {
  return {
    dayId,
    startedAt: null,
    finishedAt: null,
    phaseIndex: 0,
    blockIndex: 0,
    exerciseIndex: 0,
    roundIndex: 0,
    currentSetStartedAt: null,
    completedExercises: {},
  };
}

export function getWorkoutSession(dayId: string): WorkoutSessionState {
  if (typeof window === "undefined") {
    return createSession(dayId);
  }

  const raw = window.localStorage.getItem(`${SESSION_PREFIX}:${dayId}`);
  if (!raw) {
    return createSession(dayId);
  }

  try {
    return JSON.parse(raw) as WorkoutSessionState;
  } catch {
    return createSession(dayId);
  }
}

export function saveWorkoutSession(session: WorkoutSessionState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(`${SESSION_PREFIX}:${session.dayId}`, JSON.stringify(session));
}

export function clearWorkoutSession(dayId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(`${SESSION_PREFIX}:${dayId}`);
}

export function getExerciseProgress(session: WorkoutSessionState, exerciseId: string) {
  return session.completedExercises[exerciseId] ?? createExerciseProgress();
}

export function updateExerciseProgress(
  session: WorkoutSessionState,
  exerciseId: string,
  updater: (progress: ExerciseProgress) => ExerciseProgress,
) {
  return {
    ...session,
    completedExercises: {
      ...session.completedExercises,
      [exerciseId]: updater(getExerciseProgress(session, exerciseId)),
    },
  };
}

export function workoutFlowLabel(flowType: WorkoutFlowType) {
  switch (flowType) {
    case "single":
      return "تک‌حرکتی";
    case "superset":
      return "سوپرست";
    case "triple":
      return "تریپل‌ست";
    case "circuit":
      return "سیرکیت";
  }
}

export function countExercises(day: WorkoutDayPlan) {
  return day.phases.reduce((total, phase) => total + phase.blocks.reduce((blockTotal, block) => blockTotal + block.exercises.length, 0), 0);
}

export function flattenDayExercises(day: WorkoutDayPlan) {
  return day.phases.flatMap((phase) => phase.blocks.flatMap((block) => block.exercises));
}
