"use client";

import { cn } from "@/lib/utils";
import { type WorkoutDayPlan, type WorkoutSessionState, getExerciseProgress } from "@/lib/workout-plan";
import { CheckCircle2, Circle, Dumbbell } from "lucide-react";

interface WorkoutProgressProps {
  day: WorkoutDayPlan;
  session: WorkoutSessionState;
}

export function WorkoutProgress({ day, session }: WorkoutProgressProps) {
  const totalExercises = day.phases.reduce(
    (sum, phase) => sum + phase.blocks.reduce((s, b) => s + b.exercises.length, 0),
    0,
  );

  const doneExercises = day.phases.reduce(
    (sum, phase) =>
      sum +
      phase.blocks.reduce((s, b) => {
        return s + b.exercises.filter((e) => getExerciseProgress(session, e.id).completed).length;
      }, 0),
    0,
  );

  const progress = totalExercises > 0 ? doneExercises / totalExercises : 0;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell size={16} className="text-primary" />
          <span className="text-sm font-bold">پیشرفت جلسه</span>
        </div>
        <span className="text-sm font-black tabular-nums text-primary">
          {doneExercises}/{totalExercises}
        </span>
      </div>

      {/* Overall progress bar */}
      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      {/* Phase-by-phase breakdown */}
      <div className="space-y-2">
        {day.phases.map((phase, phaseIndex) => {
          const phaseExercises = phase.blocks.flatMap((b) => b.exercises);
          const phaseDone = phaseExercises.filter(
            (e) => getExerciseProgress(session, e.id).completed,
          ).length;
          const isCurrentPhase = phaseIndex === session.phaseIndex;

          return (
            <div
              key={phase.id}
              className={cn(
                "rounded-xl px-3 py-2.5 transition-colors",
                isCurrentPhase ? "bg-primary/5" : "bg-[var(--background)]",
              )}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs font-bold",
                    isCurrentPhase ? "text-primary" : "text-[var(--text-secondary)]",
                  )}
                >
                  {phase.title}
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  {phaseDone}/{phaseExercises.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {phaseExercises.map((exercise) => {
                  const progress = getExerciseProgress(session, exercise.id);
                  const isActive =
                    phaseIndex === session.phaseIndex &&
                    phase.blocks.findIndex((b) => b.exercises.some((e) => e.id === exercise.id)) ===
                      session.blockIndex &&
                    exercise.id ===
                      session.dayId; // approximate
                  const isCurrent =
                    phaseIndex === session.phaseIndex &&
                    phase.blocks[session.blockIndex]?.exercises[session.exerciseIndex]?.id === exercise.id;

                  return (
                    <div
                      key={exercise.id}
                      className={cn(
                        "flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors",
                        isCurrent && "bg-primary/10 text-primary",
                        progress.completed && "bg-secondary/10 text-secondary",
                        !progress.completed && !isCurrent && "bg-[var(--background-secondary)] text-[var(--text-muted)]",
                      )}
                    >
                      {progress.completed ? (
                        <CheckCircle2 size={10} className="text-secondary" />
                      ) : isCurrent ? (
                        <Circle size={10} className="fill-primary/30 text-primary" />
                      ) : (
                        <Circle size={10} />
                      )}
                      <span className="truncate max-w-[80px]">{exercise.exerciseName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
