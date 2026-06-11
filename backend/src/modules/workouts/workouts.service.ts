import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

type CompoundSetType = "superset" | "triple" | "circuit";
type MeasureType = "count" | "time";

type TemplateExerciseConfig = {
  id: string;
  exerciseId: string;
  measureType: MeasureType;
  count?: number;
  duration?: number;
  timeUnit?: "seconds" | "minutes";
};

type TemplateSimpleBlockConfig = TemplateExerciseConfig & {
  kind?: "exercise";
  sets: number;
};

type TemplateCompoundBlockConfig = {
  id: string;
  kind: "compound";
  title: string;
  type: CompoundSetType;
  rounds: number;
  children: TemplateExerciseConfig[];
};

type TemplateBlockConfig = TemplateSimpleBlockConfig | TemplateCompoundBlockConfig;

type TemplatePhasePlan = {
  id: string;
  title: string;
  blocks: TemplateBlockConfig[];
};

type TemplateDayPlan = {
  dayNumber: number;
  phases: TemplatePhasePlan[];
};

type WorkoutExerciseItem = {
  id: string;
  exerciseName: string;
  muscleGroup: string | null;
  sets: number;
  setMode: "reps" | "time";
  repsRange: string | null;
  durationSeconds: number | null;
  restSeconds: number;
  gifMediaId: string | null;
  status: "pending" | "in-progress" | "completed";
};

type WorkoutBlock = {
  id: string;
  title: string;
  kind: "exercise" | "compound";
  flowType: "single" | "superset" | "triple" | "circuit";
  rounds: number;
  exercises: WorkoutExerciseItem[];
};

type WorkoutPhase = {
  id: string;
  title: string;
  blocks: WorkoutBlock[];
  exercises: WorkoutExerciseItem[];
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toText(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function toMeasureType(value: unknown): MeasureType {
  return value === "time" ? "time" : "count";
}

function toPositiveNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}

function durationToSeconds(move: TemplateExerciseConfig) {
  if (typeof move.duration !== "number" || move.duration <= 0) {
    return null;
  }
  return move.timeUnit === "minutes" ? move.duration * 60 : move.duration;
}

function formatReps(move: TemplateExerciseConfig) {
  if (typeof move.count === "number" && move.count > 0) {
    return `${move.count} تکرار`;
  }
  return "—";
}

function parseExerciseConfig(value: unknown, fallbackId: string): TemplateExerciseConfig | null {
  if (!isObject(value) || typeof value.exerciseId !== "string") {
    return null;
  }

  return {
    id: typeof value.id === "string" && value.id.length > 0 ? value.id : fallbackId,
    exerciseId: value.exerciseId,
    measureType: toMeasureType(value.measureType),
    count: typeof value.count === "number" ? value.count : undefined,
    duration: typeof value.duration === "number" ? value.duration : undefined,
    timeUnit: value.timeUnit === "minutes" ? "minutes" : "seconds",
  };
}

function parseCompoundType(value: unknown): CompoundSetType {
  return value === "triple" ? "triple" : value === "circuit" ? "circuit" : "superset";
}

function parseBlock(value: unknown, dayIndex: number, phaseIndex: number, blockIndex: number): TemplateBlockConfig | null {
  if (!isObject(value)) {
    return null;
  }

  const rawCompound = isObject(value.compound) ? value.compound : null;

  if (value.kind === "compound" || rawCompound?.enabled === true) {
    const rawChildren = Array.isArray(value.children)
      ? value.children
      : Array.isArray(rawCompound?.children)
        ? rawCompound.children
        : [];
    const children = rawChildren
      .map((child, childIndex) => parseExerciseConfig(child, `compound-child-${dayIndex}-${phaseIndex}-${blockIndex}-${childIndex}`))
      .filter((child): child is TemplateExerciseConfig => Boolean(child));

    if (children.length === 0) {
      return null;
    }

    return {
      id: typeof value.id === "string" && value.id.length > 0 ? value.id : `compound-${dayIndex}-${phaseIndex}-${blockIndex}`,
      kind: "compound",
      title: toText(value.title ?? rawCompound?.title, "Compound"),
      type: parseCompoundType(value.type ?? rawCompound?.type),
      rounds: toPositiveNumber(value.rounds ?? value.sets, 1),
      children,
    };
  }

  const exercise = parseExerciseConfig(value, `exercise-${dayIndex}-${phaseIndex}-${blockIndex}`);
  if (!exercise) {
    return null;
  }

  return {
    ...exercise,
    kind: "exercise",
    sets: toPositiveNumber(value.sets, 1),
  };
}

function parsePhase(value: unknown, dayIndex: number, phaseIndex: number): TemplatePhasePlan | null {
  if (!isObject(value) || typeof value.title !== "string") {
    return null;
  }

  const rawBlocks = Array.isArray(value.blocks)
    ? value.blocks
    : Array.isArray(value.moves)
      ? value.moves
      : [];

  const blocks = rawBlocks
    .map((block, blockIndex) => parseBlock(block, dayIndex, phaseIndex, blockIndex))
    .filter((block): block is TemplateBlockConfig => Boolean(block));

  if (blocks.length === 0) {
    return null;
  }

  return {
    id: typeof value.id === "string" && value.id.length > 0 ? value.id : `phase-${dayIndex}-${phaseIndex}`,
    title: value.title,
    blocks,
  };
}

function parseTemplatePlan(plan: unknown): TemplateDayPlan[] {
  if (!Array.isArray(plan)) {
    return [];
  }

  return plan
    .map((day, dayIndex) => {
      if (!isObject(day)) return null;
      const phases = Array.isArray(day.phases)
        ? day.phases
            .map((phase, phaseIndex) => parsePhase(phase, dayIndex, phaseIndex))
            .filter((phase): phase is TemplatePhasePlan => Boolean(phase))
        : [];

      return {
        dayNumber: typeof day.dayNumber === "number" && day.dayNumber > 0 ? day.dayNumber : dayIndex + 1,
        phases,
      } satisfies TemplateDayPlan;
    })
    .filter((day): day is TemplateDayPlan => Boolean(day));
}

function localDateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function diffCalendarDays(start: Date, end: Date) {
  const startDate = localDateOnly(start).getTime();
  const endDate = localDateOnly(end).getTime();
  return Math.floor((endDate - startDate) / 86_400_000);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

@Injectable()
export class WorkoutsService {
  constructor(private readonly prisma: PrismaService) {}

  async todayWorkout(athleteId: string) {
    const athlete = await this.prisma.user.findFirst({ where: { id: athleteId, role: "athlete" } });
    if (!athlete) {
      return { athlete: null, activeProgramTitle: null, activeAssignmentId: null, activeDayId: null, days: [], exercises: [] };
    }

    const activeProgram = await this.prisma.athleteAssignedProgram.findFirst({
      where: { athleteId: athlete.id, status: "active" },
      include: {
        template: {
          select: {
            id: true,
            title: true,
            plan: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const planDays = parseTemplatePlan(activeProgram?.template.plan);
    const exerciseIdsFromPlan = Array.from(
      new Set(
        planDays.flatMap((day) =>
          day.phases.flatMap((phase) =>
            phase.blocks.flatMap((block) =>
              block.kind === "compound" ? block.children.map((child) => child.exerciseId) : [block.exerciseId],
            ),
          ),
        ),
      ),
    );

    const exercises = exerciseIdsFromPlan.length
      ? await this.prisma.exercise.findMany({
          where: { id: { in: exerciseIdsFromPlan } },
          select: { id: true, name: true, muscleGroup: true, gifMediaId: true },
        })
      : [];

    const exerciseLookup = new Map(exercises.map((exercise) => [exercise.id, exercise]));

    const workoutDays = planDays.map((day, index) => {
      const dayNumber = day.dayNumber ?? index + 1;
      const phases: WorkoutPhase[] = day.phases.map((phase, phaseIndex) => {
        const blocks: WorkoutBlock[] = phase.blocks.map((block, blockIndex) => {
          if (block.kind === "compound") {
            const exercisesForBlock = block.children.map((child, childIndex) => {
              const exercise = exerciseLookup.get(child.exerciseId);
              return {
                id: `${activeProgram?.id ?? "program"}-day-${dayNumber}-phase-${phaseIndex}-compound-${blockIndex}-child-${childIndex}`,
                exerciseName: exercise?.name ?? "نامشخص",
                muscleGroup: exercise?.muscleGroup ?? null,
                sets: block.rounds,
                setMode: child.measureType === "time" ? "time" : "reps",
                repsRange: child.measureType === "count" ? formatReps(child) : null,
                durationSeconds: child.measureType === "time" ? durationToSeconds(child) : null,
                restSeconds: 60,
                gifMediaId: exercise?.gifMediaId ?? null,
                status: "pending" as const,
              } satisfies WorkoutExerciseItem;
            });

            return {
              id: block.id || `${activeProgram?.id ?? "program"}-day-${dayNumber}-phase-${phaseIndex}-compound-${blockIndex}`,
              title: block.title,
              kind: "compound" as const,
              flowType: block.type,
              rounds: block.rounds,
              exercises: exercisesForBlock,
            } satisfies WorkoutBlock;
          }

          const exercise = exerciseLookup.get(block.exerciseId);
          const exerciseItem = {
            id: `${activeProgram?.id ?? "program"}-day-${dayNumber}-phase-${phaseIndex}-exercise-${blockIndex}`,
            exerciseName: exercise?.name ?? "نامشخص",
            muscleGroup: exercise?.muscleGroup ?? null,
            sets: block.sets,
            setMode: block.measureType === "time" ? "time" : "reps",
            repsRange: block.measureType === "count" ? formatReps(block) : null,
            durationSeconds: block.measureType === "time" ? durationToSeconds(block) : null,
            restSeconds: 60,
            gifMediaId: exercise?.gifMediaId ?? null,
            status: "pending" as const,
          } satisfies WorkoutExerciseItem;

          return {
            id: block.id || `${activeProgram?.id ?? "program"}-day-${dayNumber}-phase-${phaseIndex}-exercise-${blockIndex}`,
            title: exercise?.name ?? "نامشخص",
            kind: "exercise" as const,
            flowType: "single" as const,
            rounds: block.sets,
            exercises: [exerciseItem],
          } satisfies WorkoutBlock;
        });

        const exercisesInPhase = blocks.flatMap((block) => block.exercises);
        return {
          id: phase.id || `${activeProgram?.id ?? "program"}-day-${dayNumber}-phase-${phaseIndex}`,
          title: phase.title,
          blocks,
          exercises: exercisesInPhase,
        } satisfies WorkoutPhase;
      });

      const exerciseCount = phases.reduce((total, phase) => total + phase.exercises.length, 0);
      return {
        id: `${activeProgram?.id ?? "program"}-day-${dayNumber}`,
        dayNumber,
        label: `روز ${dayNumber}`,
        title: `روز ${dayNumber}`,
        summary: `${phases.length} فاز • ${exerciseCount} حرکت`,
        phases,
      };
    });

    const activeDayIndex = activeProgram && workoutDays.length > 0
      ? clamp(diffCalendarDays(activeProgram.startDate, new Date()), 0, workoutDays.length - 1)
      : 0;
    const activeDay = workoutDays[activeDayIndex] ?? null;
    const flattenedExercises = activeDay ? activeDay.phases.flatMap((phase) => phase.exercises) : [];

    return {
      athlete: { id: athlete.id, fullName: athlete.fullName },
      activeProgramTitle: activeProgram?.template.title ?? null,
      activeAssignmentId: activeProgram?.id ?? null,
      activeDayId: activeDay?.id ?? null,
      days: workoutDays,
      exercises: flattenedExercises,
    };
  }

  logSet(data: { athleteProgramId: string; exerciseId: string; performedDate: Date; setNumber: number; actualReps?: number; actualWeight?: number; rpe?: number; notes?: string }) {
    return this.prisma.workoutLog.create({ data });
  }
}
