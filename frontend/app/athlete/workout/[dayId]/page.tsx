"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GifDisplay } from "@/components/GifDisplay";
import { getAthleteTodayWorkout, type AthleteWorkoutResponse } from "@/lib/api";
import { formatSeconds } from "@/lib/utils";
import {
  clearWorkoutSession,
  createSession,
  getExerciseProgress,
  getWorkoutSession,
  saveWorkoutSession,
  type WorkoutBlock,
  type WorkoutDayPlan,
  type WorkoutExerciseItem,
  type WorkoutSessionState,
  workoutFlowLabel,
} from "@/lib/workout-plan";

type WorkoutPointer = {
  phaseIndex: number;
  blockIndex: number;
  exerciseIndex: number;
  roundIndex: number;
};

function parseDayId(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

function startSetTimestamp(exercise: WorkoutExerciseItem, nowIso: string) {
  return exercise.setMode === "time" ? nowIso : null;
}

function getElapsedSeconds(startedAt: string | null, now: number, stoppedAt: string | null = null) {
  const endPoint = stoppedAt ? new Date(stoppedAt).getTime() : now;
  return startedAt ? Math.max(0, Math.floor((endPoint - new Date(startedAt).getTime()) / 1000)) : 0;
}

function isExerciseActive(session: WorkoutSessionState, exerciseId: string) {
  const progress = getExerciseProgress(session, exerciseId);
  return !progress.completed && !progress.skipped;
}

function findFirstActiveExerciseIndex(block: WorkoutBlock, session: WorkoutSessionState) {
  const index = block.exercises.findIndex((exercise) => isExerciseActive(session, exercise.id));
  return index >= 0 ? index : null;
}

function findNextPointerAfterBlock(day: WorkoutDayPlan, phaseIndex: number, blockIndex: number, session: WorkoutSessionState): WorkoutPointer | null {
  for (let nextPhaseIndex = phaseIndex; nextPhaseIndex < day.phases.length; nextPhaseIndex += 1) {
    const phase = day.phases[nextPhaseIndex];
    const startBlockIndex = nextPhaseIndex === phaseIndex ? blockIndex + 1 : 0;

    for (let nextBlockIndex = startBlockIndex; nextBlockIndex < phase.blocks.length; nextBlockIndex += 1) {
      const block = phase.blocks[nextBlockIndex];

      if (block.kind === "exercise") {
        const exercise = block.exercises[0];
        if (exercise && isExerciseActive(session, exercise.id)) {
          return { phaseIndex: nextPhaseIndex, blockIndex: nextBlockIndex, exerciseIndex: 0, roundIndex: 0 };
        }
        continue;
      }

      const childIndex = findFirstActiveExerciseIndex(block, session);
      if (childIndex !== null) {
        return { phaseIndex: nextPhaseIndex, blockIndex: nextBlockIndex, exerciseIndex: childIndex, roundIndex: 0 };
      }
    }
  }

  return null;
}

function findNextPointerWithinCompound(
  day: WorkoutDayPlan,
  session: WorkoutSessionState,
  phaseIndex: number,
  blockIndex: number,
  exerciseIndex: number,
  roundIndex: number,
): WorkoutPointer | null {
  const block = day.phases[phaseIndex]?.blocks[blockIndex];
  if (!block || block.kind !== "compound") {
    return null;
  }

  for (let nextExerciseIndex = exerciseIndex + 1; nextExerciseIndex < block.exercises.length; nextExerciseIndex += 1) {
    const exercise = block.exercises[nextExerciseIndex];
    if (isExerciseActive(session, exercise.id)) {
      return { phaseIndex, blockIndex, exerciseIndex: nextExerciseIndex, roundIndex };
    }
  }

  if (roundIndex + 1 < block.rounds) {
    const nextRoundChildIndex = findFirstActiveExerciseIndex(block, session);
    if (nextRoundChildIndex !== null) {
      return { phaseIndex, blockIndex, exerciseIndex: nextRoundChildIndex, roundIndex: roundIndex + 1 };
    }
  }

  return findNextPointerAfterBlock(day, phaseIndex, blockIndex, session);
}

function moveToPointer(session: WorkoutSessionState, day: WorkoutDayPlan, pointer: WorkoutPointer, nowIso: string) {
  const exercise = day.phases[pointer.phaseIndex]?.blocks[pointer.blockIndex]?.exercises[pointer.exerciseIndex];
  return {
    ...session,
    phaseIndex: pointer.phaseIndex,
    blockIndex: pointer.blockIndex,
    exerciseIndex: pointer.exerciseIndex,
    roundIndex: pointer.roundIndex,
    currentSetStartedAt: exercise ? startSetTimestamp(exercise, nowIso) : null,
  };
}

export default function WorkoutPlayerPage() {
  const params = useParams<{ dayId?: string | string[] }>();
  const dayId = parseDayId(params.dayId);
  const [day, setDay] = useState<WorkoutDayPlan | null>(null);
  const [programTitle, setProgramTitle] = useState<string | null>(null);
  const [session, setSession] = useState<WorkoutSessionState | null>(null);
  const [now, setNow] = useState(Date.now());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    setReady(false);

    getAthleteTodayWorkout()
      .then((data: AthleteWorkoutResponse) => {
        if (!mounted) return;
        setProgramTitle(data.activeProgramTitle);
        const nextDay = data.days.find((item) => item.id === dayId) ?? null;
        setDay(nextDay);
        if (nextDay) {
          const storedSession = getWorkoutSession(dayId);
          setSession({
            ...createSession(dayId),
            ...storedSession,
            dayId,
            currentSetStartedAt: storedSession.currentSetStartedAt ?? null,
          });
        } else {
          setSession(null);
        }
        setReady(true);
      })
      .catch(() => {
        if (!mounted) return;
        setProgramTitle(null);
        setDay(null);
        setSession(null);
        setReady(true);
      });

    return () => {
      mounted = false;
    };
  }, [dayId]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (session) {
      saveWorkoutSession(session);
    }
  }, [session]);

  const currentPhase = useMemo(() => {
    if (!day || !session) return null;
    return day.phases[session.phaseIndex] ?? null;
  }, [day, session]);

  const currentBlock = useMemo(() => {
    if (!currentPhase || !session) return null;
    return currentPhase.blocks[session.blockIndex] ?? null;
  }, [currentPhase, session]);

  const currentExercise = useMemo(() => {
    if (!currentBlock || !session) return null;
    return currentBlock.exercises[session.exerciseIndex] ?? null;
  }, [currentBlock, session]);

  const currentProgress = useMemo(() => {
    if (!session || !currentExercise) return null;
    return getExerciseProgress(session, currentExercise.id);
  }, [currentExercise, session]);

  const workoutElapsed = getElapsedSeconds(session?.startedAt ?? null, now, session?.finishedAt ?? null);
  const setElapsed = getElapsedSeconds(session?.currentSetStartedAt ?? null, now, session?.finishedAt ?? null);
  const activeDurationSeconds = currentExercise?.setMode === "time" ? currentExercise.durationSeconds ?? 0 : 0;
  const setRemaining =
    currentExercise?.setMode === "time" && currentExercise.durationSeconds
      ? Math.max(0, currentExercise.durationSeconds - setElapsed)
      : null;

  const setReadyToFinish = Boolean(
    currentExercise &&
      currentProgress &&
      currentProgress.setsDone >= currentExercise.sets &&
      !currentProgress.completed &&
      !currentProgress.skipped,
  );

  function updateSession(next: WorkoutSessionState) {
    setSession(next);
  }

  function handleStartWorkout() {
    if (!day || !session || session.startedAt) {
      return;
    }

    const nowIso = new Date().toISOString();
    const firstPhase = day.phases[0];
    const firstBlock = firstPhase?.blocks[0];
    const firstExercise = firstBlock?.exercises[0] ?? null;
    updateSession({
      ...session,
      startedAt: nowIso,
      currentSetStartedAt: firstExercise ? startSetTimestamp(firstExercise, nowIso) : null,
    });
  }

  function advanceFromCurrentPointer(baseSession: WorkoutSessionState) {
    if (!day) {
      return baseSession;
    }

    const pointer = currentPhase && currentBlock && currentExercise
      ? {
          phaseIndex: baseSession.phaseIndex,
          blockIndex: baseSession.blockIndex,
          exerciseIndex: baseSession.exerciseIndex,
          roundIndex: baseSession.roundIndex,
        }
      : null;

    if (!pointer) {
      return baseSession;
    }

    const nextPointer =
      currentBlock?.kind === "compound"
        ? findNextPointerWithinCompound(day, baseSession, pointer.phaseIndex, pointer.blockIndex, pointer.exerciseIndex, pointer.roundIndex)
        : findNextPointerAfterBlock(day, pointer.phaseIndex, pointer.blockIndex, baseSession);

    if (!nextPointer) {
      return {
        ...baseSession,
        finishedAt: new Date().toISOString(),
        currentSetStartedAt: null,
      };
    }

    return moveToPointer(baseSession, day, nextPointer, new Date().toISOString());
  }

  function handleDoneSet() {
    if (!session || !currentExercise || !currentProgress || !day || !session.startedAt || session.finishedAt) {
      return;
    }

    const nowIso = new Date().toISOString();
    const nextSetsDone = Math.min(currentExercise.sets, currentProgress.setsDone + 1);
    const nextProgressCompleted = nextSetsDone >= currentExercise.sets;

    const nextSession = {
      ...session,
      completedExercises: {
        ...session.completedExercises,
        [currentExercise.id]: {
          ...currentProgress,
          setsDone: nextSetsDone,
          skipped: false,
          completed: nextProgressCompleted || currentProgress.completed,
        },
      },
    };

    if (currentBlock?.kind === "compound") {
      const nextPointer = findNextPointerWithinCompound(day, nextSession, session.phaseIndex, session.blockIndex, session.exerciseIndex, session.roundIndex);
      updateSession(
        nextPointer
          ? moveToPointer(nextSession, day, nextPointer, nowIso)
          : { ...nextSession, finishedAt: nowIso, currentSetStartedAt: null },
      );
      return;
    }

    if (!nextProgressCompleted) {
      updateSession({
        ...nextSession,
        currentSetStartedAt: currentExercise.setMode === "time" ? nowIso : null,
      });
      return;
    }

    updateSession(advanceFromCurrentPointer({
      ...nextSession,
      currentSetStartedAt: null,
    }));
  }

  function handleDoneExercise() {
    if (!session || !currentExercise || !currentProgress || !day || !session.startedAt || session.finishedAt) {
      return;
    }

    const nextSession = {
      ...session,
      completedExercises: {
        ...session.completedExercises,
        [currentExercise.id]: {
          ...currentProgress,
          setsDone: currentExercise.sets,
          skipped: false,
          completed: true,
        },
      },
      currentSetStartedAt: null,
    };

    updateSession(advanceFromCurrentPointer(nextSession));
  }

  function handleSkipExercise() {
    if (!session || !currentExercise || !currentProgress || !day || !session.startedAt || session.finishedAt) {
      return;
    }

    const nextSession = {
      ...session,
      completedExercises: {
        ...session.completedExercises,
        [currentExercise.id]: {
          ...currentProgress,
          skipped: true,
          completed: false,
        },
      },
      currentSetStartedAt: null,
    };

    updateSession(advanceFromCurrentPointer(nextSession));
  }

  function handleReset() {
    if (!day) return;
    clearWorkoutSession(day.id);
    const next = createSession(day.id);
    setSession(next);
  }

  if (!ready) {
    return (
      <AppShell title="اجرای تمرین" subtitle="در حال آماده‌سازی">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          در حال بارگذاری...
        </div>
      </AppShell>
    );
  }

  if (!day) {
    return (
      <AppShell title="اجرای تمرین" subtitle={programTitle ? `برنامه فعال: ${programTitle}` : "روز مورد نظر پیدا نشد"}>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-300">این روز تمرین در برنامه فعلی پیدا نشد.</p>
          <Link href="/athlete/workout" className="mt-4 inline-flex rounded-lg bg-primary px-5 py-3 font-black text-white">
            بازگشت به انتخاب روز
          </Link>
        </div>
      </AppShell>
    );
  }

  if (session?.finishedAt) {
    return (
      <AppShell title={day.title} subtitle="تمرین کامل شد">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <h2 className="text-2xl font-black">آفرین، این جلسه کامل شد.</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">زمان کل: {formatSeconds(workoutElapsed)}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={handleReset} className="rounded-lg bg-primary px-5 py-3 font-black text-white">
              شروع دوباره
            </button>
            <Link href="/athlete/workout" className="rounded-lg bg-slate-100 px-5 py-3 font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              انتخاب روز دیگر
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!session?.startedAt) {
    return (
      <AppShell title={day.title} subtitle={day.summary}>
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <h2 className="text-2xl font-black">{day.label}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{day.summary}</p>
            <div className="mt-4 space-y-3">
              {day.phases.map((phase) => (
                <div key={phase.id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold">{phase.title}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-300">{phase.blocks.length} بلوک</span>
                  </div>
                  <div className="mt-2 space-y-2">
                    {phase.blocks.map((block) => (
                      <div key={block.id} className="rounded-md bg-white px-3 py-2 dark:bg-slate-900">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium">{block.kind === "compound" ? block.title : block.exercises[0]?.exerciseName ?? "نامشخص"}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-300">
                            {workoutFlowLabel(block.flowType)} • {block.exercises.length} حرکت • {block.rounds} دور
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <h2 className="text-xl font-black">آماده شروع</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">بعد از شروع، تایمر کل تمرین و هر ست فعال می‌شود و در ریلود هم از همین‌جا ادامه می‌دهد.</p>
            <button type="button" onClick={handleStartWorkout} className="mt-5 w-full rounded-lg bg-primary px-5 py-3 font-black text-white">
              شروع تمرین
            </button>
            <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-800">
              <p>زمان کل تا الان: {formatSeconds(workoutElapsed)}</p>
              <p className="mt-1">پیشرفت جلسه در localStorage ذخیره می‌شود.</p>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={day.title} subtitle={programTitle ? `${programTitle} • ${day.summary}` : day.summary}>
      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-300">تایمر کل تمرین</p>
                <strong className="mt-1 block text-3xl font-black sm:text-4xl">{formatSeconds(workoutElapsed)}</strong>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                {currentBlock ? workoutFlowLabel(currentBlock.flowType) : "در حال اجرا"}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-300">فاز</p>
            <h2 className="mt-1 text-2xl font-black">{currentPhase?.title ?? "فاز نامشخص"}</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
              {currentPhase ? `${currentPhase.blocks.length} بلوک تمرینی` : "فاز فعال پیدا نشد."}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-300">بلوک فعال</p>
            <h3 className="mt-1 text-2xl font-black">{currentExercise?.exerciseName ?? "حرکتی برای نمایش نیست"}</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
              {currentBlock ? `${workoutFlowLabel(currentBlock.flowType)} • ${currentBlock.exercises.length} حرکت` : ""}
            </p>
            {currentBlock?.kind === "compound" ? (
              <p className="mt-2 text-xs font-bold text-primary">
                کمپوند: {currentBlock.title}
              </p>
            ) : null}

            {currentBlock?.kind === "compound" ? (
              <div className="mt-4 rounded-lg bg-primary p-4 text-white sm:p-5">
                <p className="text-sm font-bold opacity-80">دور کمپوند</p>
                <strong className="mt-2 block text-4xl font-black sm:text-5xl">
                  {session.roundIndex + 1} / {currentBlock.rounds}
                </strong>
                <p className="mt-2 text-sm opacity-85">
                  حرکت {session.exerciseIndex + 1} از {currentBlock.exercises.length}
                </p>
              </div>
            ) : null}

            {currentExercise ? (
              <div className={`mt-4 rounded-lg ${currentExercise.setMode === "time" ? "bg-primary p-4 text-white sm:p-5" : "bg-slate-50 p-4 dark:bg-slate-800"}`}>
                <p className={`text-sm font-bold ${currentExercise.setMode === "time" ? "opacity-80" : "text-slate-500 dark:text-slate-300"}`}>
                  {currentExercise.setMode === "time" ? "تایمر ست" : "هدف تکرار"}
                </p>
                <strong className={`mt-2 block ${currentExercise.setMode === "time" ? "text-4xl sm:text-5xl" : "text-2xl"} font-black`}>
                  {currentExercise.setMode === "time" ? formatSeconds(setRemaining ?? activeDurationSeconds) : currentExercise.repsRange ?? "—"}
                </strong>
                <p className={`mt-2 text-sm ${currentExercise.setMode === "time" ? "opacity-85" : "text-slate-500 dark:text-slate-300"}`}>
                  {currentBlock?.kind === "compound"
                    ? `دور ${session.roundIndex + 1} از ${currentBlock.rounds}`
                    : `ست ${Math.min((currentProgress?.setsDone ?? 0) + 1, currentExercise.sets)} از ${currentExercise.sets}`}
                </p>
              </div>
            ) : null}

            {currentExercise?.gifMediaId ? (
              <GifDisplay
                mediaId={currentExercise.gifMediaId}
                alt={currentExercise.exerciseName}
                title="حرکت"
                caption="پیش‌نمایش حرکت فعلی"
                className="mt-4"
                frameClassName="h-48 w-full"
                imageClassName="h-48 w-full object-cover"
              />
            ) : null}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <h2 className="text-xl font-black">کنترل تمرین</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
              {currentProgress?.skipped
                ? "این حرکت رد شده است."
                : setReadyToFinish
                  ? "این حرکت کامل شده و می‌توانی به بعدی بروی."
                  : "ست فعلی را انجام بده و بعد تصمیم بگیر حرکت را تمام کنی یا رد کنی."}
            </p>

            <div className="mt-5 grid gap-3">
              <button
                type="button"
                onClick={handleDoneSet}
                disabled={!session?.startedAt || !currentExercise || Boolean(session?.finishedAt) || Boolean(currentProgress?.skipped)}
                className="rounded-lg bg-success px-4 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                ست انجام شد
              </button>
              <button
                type="button"
                onClick={handleDoneExercise}
                disabled={!session?.startedAt || !currentExercise || Boolean(session?.finishedAt)}
                className="rounded-lg bg-primary px-4 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                done
              </button>
              <button
                type="button"
                onClick={handleSkipExercise}
                disabled={!session?.startedAt || !currentExercise || Boolean(session?.finishedAt)}
                className="rounded-lg bg-danger/10 px-4 py-3 font-black text-danger disabled:cursor-not-allowed disabled:opacity-60"
              >
                skip exercise
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <h3 className="text-lg font-black">پیشرفت جلسه</h3>
            <div className="mt-4 space-y-3">
              {day.phases.map((phase, phaseIndex) => (
                <div key={phase.id} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold">{phase.title}</p>
                    <span className="text-xs text-slate-500 dark:text-slate-300">{phase.blocks.length} بلوک</span>
                  </div>
                  <div className="mt-3 space-y-3 text-sm">
                    {phase.blocks.map((block, blockIndex) => (
                      <div key={block.id} className="rounded-lg bg-white px-3 py-2 dark:bg-slate-900">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="font-medium">{block.kind === "compound" ? block.title : block.exercises[0]?.exerciseName ?? "نامشخص"}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-300">
                              {workoutFlowLabel(block.flowType)} • {block.exercises.length} حرکت • {block.rounds} دور
                            </p>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-300">
                            {phaseIndex === session?.phaseIndex && blockIndex === session?.blockIndex ? "فعال" : "آینده"}
                          </span>
                        </div>
                        <div className="mt-3 space-y-2">
                          {block.exercises.map((exercise, exerciseIndex) => {
                            const progress = session ? getExerciseProgress(session, exercise.id) : null;
                            const isActive = phaseIndex === session?.phaseIndex && blockIndex === session?.blockIndex && exerciseIndex === session?.exerciseIndex;
                            return (
                              <div
                                key={exercise.id}
                                className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                                  isActive ? "bg-primary/10 text-primary" : "bg-slate-50 dark:bg-slate-800"
                                }`}
                              >
                                <span className="font-medium">{exercise.exerciseName}</span>
                            <span className="text-xs">
                              {progress?.skipped
                                ? "رد شده"
                                : progress?.completed
                                  ? "انجام شد"
                                  : `${progress?.setsDone ?? 0}/${exercise.sets} ${block.kind === "compound" ? "دور" : "ست"}`}
                            </span>
                          </div>
                        );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={handleReset} className="mt-4 w-full rounded-lg border border-slate-200 px-4 py-3 font-black dark:border-slate-800">
              ریست جلسه
            </button>
          </div>
        </aside>
      </div>
      <div className="mt-5">
        <Link href="/athlete/workout" className="inline-flex rounded-lg bg-slate-100 px-5 py-3 font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          انتخاب روز دیگر
        </Link>
      </div>
    </AppShell>
  );
}
