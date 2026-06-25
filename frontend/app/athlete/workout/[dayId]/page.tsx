"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SetLogger } from "@/components/SetLogger";
import { SetTimer } from "@/components/SetTimer";
import { WorkoutProgress } from "@/components/WorkoutProgress";
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
} from "@/lib/workout-plan";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Dumbbell,
  Play,
  SkipForward,
  Timer,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

type WorkoutPointer = {
  phaseIndex: number;
  blockIndex: number;
  exerciseIndex: number;
  roundIndex: number;
};

function parseDayId(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

function getElapsedSeconds(startedAt: string | null, now: number, stoppedAt: string | null = null) {
  const endPoint = stoppedAt ? new Date(stoppedAt).getTime() : now;
  return startedAt ? Math.max(0, Math.floor((endPoint - new Date(startedAt).getTime()) / 1000)) : 0;
}

function findFirstActiveExercise(block: WorkoutBlock, session: WorkoutSessionState) {
  return block.exercises.find((e) => {
    const p = getExerciseProgress(session, e.id);
    return !p.completed && !p.skipped;
  }) ?? null;
}

function findNextPointer(day: WorkoutDayPlan, session: WorkoutSessionState, from: WorkoutPointer): WorkoutPointer | null {
  for (let pi = from.phaseIndex; pi < day.phases.length; pi++) {
    const phase = day.phases[pi];
    const startBlock = pi === from.phaseIndex ? from.blockIndex : 0;

    for (let bi = startBlock; bi < phase.blocks.length; bi++) {
      const block = phase.blocks[bi];
      let startEi = pi === from.phaseIndex && bi === from.blockIndex ? from.exerciseIndex + 1 : 0;

      for (let ei = startEi; ei < block.exercises.length; ei++) {
        const ex = block.exercises[ei];
        const p = getExerciseProgress(session, ex.id);
        if (!p.completed && !p.skipped) {
          return { phaseIndex: pi, blockIndex: bi, exerciseIndex: ei, roundIndex: 0 };
        }
      }
    }
  }
  return null;
}

export default function WorkoutPlayerPage() {
  const params = useParams<{ dayId?: string | string[] }>();
  const router = useRouter();
  const dayId = parseDayId(params.dayId);

  const [day, setDay] = useState<WorkoutDayPlan | null>(null);
  const [programTitle, setProgramTitle] = useState<string | null>(null);
  const [session, setSession] = useState<WorkoutSessionState | null>(null);
  const [now, setNow] = useState(Date.now());
  const [ready, setReady] = useState(false);
  const [showSetLogger, setShowSetLogger] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

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
          const stored = getWorkoutSession(dayId);
          setSession({ ...createSession(dayId), ...stored, dayId });
        } else {
          setSession(null);
        }
        setReady(true);
      })
      .catch(() => {
        if (!mounted) return;
        setDay(null);
        setSession(null);
        setReady(true);
      });

    return () => { mounted = false; };
  }, [dayId]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (session) saveWorkoutSession(session);
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
  const isRestPhase = showTimer && !showSetLogger;

  function syncSession(next: WorkoutSessionState) {
    setSession({ ...next });
  }

  function handleStartWorkout() {
    if (!day || !session || session.startedAt) return;
    const nowIso = new Date().toISOString();
    syncSession({ ...session, startedAt: nowIso });
  }

  function advanceToNext(current: WorkoutSessionState) {
    if (!day) return current;

    const pointer: WorkoutPointer = {
      phaseIndex: current.phaseIndex,
      blockIndex: current.blockIndex,
      exerciseIndex: current.exerciseIndex,
      roundIndex: current.roundIndex,
    };

    const next = findNextPointer(day, current, pointer);

    if (!next) {
      return { ...current, finishedAt: new Date().toISOString() };
    }

    return {
      ...current,
      phaseIndex: next.phaseIndex,
      blockIndex: next.blockIndex,
      exerciseIndex: next.exerciseIndex,
      roundIndex: next.roundIndex,
    };
  }

  function handleLogSet(data: { weight?: number; reps?: number; rpe?: number; completed: boolean }) {
    if (!session || !currentExercise || !currentProgress || !day || !session.startedAt || session.finishedAt) return;

    const nextSetsDone = Math.min(currentExercise.sets, currentProgress.setsDone + 1);
    const completed = nextSetsDone >= currentExercise.sets;

    const next: WorkoutSessionState = {
      ...session,
      completedExercises: {
        ...session.completedExercises,
        [currentExercise.id]: {
          setsDone: nextSetsDone,
          skipped: false,
          completed: completed || currentProgress.completed,
        },
      },
    };

    setShowSetLogger(false);

    if (completed) {
      setShowTimer(true);
      syncSession(advanceToNext(next));
    } else {
      setShowTimer(true);
      syncSession(next);
    }
  }

  function handleSkipExercise() {
    if (!session || !currentExercise || !currentProgress || !day || !session.startedAt || session.finishedAt) return;

    const next: WorkoutSessionState = {
      ...session,
      completedExercises: {
        ...session.completedExercises,
        [currentExercise.id]: { ...currentProgress, skipped: true, completed: false },
      },
    };

    setShowSetLogger(false);
    setShowTimer(false);
    syncSession(advanceToNext(next));
  }

  function handleTimerComplete() {
    setShowTimer(false);
  }

  function handleTimerSkip() {
    setShowTimer(false);
  }

  function handleReset() {
    if (!day) return;
    clearWorkoutSession(day.id);
    setSession(createSession(day.id));
    setShowTimer(false);
    setShowSetLogger(false);
  }

  // --- Loading / Error states ---
  if (!ready) {
    return (
      <AppShell title="تمرین" subtitle="در حال آماده‌سازی" hideNav>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm">در حال بارگذاری...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!day) {
    return (
      <AppShell title="تمرین" subtitle="روز مورد نظر پیدا نشد" hideNav>
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <p className="text-[var(--text-secondary)]">این روز تمرین در برنامه فعلی پیدا نشد.</p>
          <Link
            href="/athlete/workout"
            className="rounded-xl bg-primary px-6 py-3 font-black text-white shadow-card transition-all active:scale-[0.98]"
          >
            بازگشت به تمرینات
          </Link>
        </div>
      </AppShell>
    );
  }

  // --- Finished ---
  if (session?.finishedAt) {
    return (
      <AppShell title={day.title} subtitle="تمرین کامل شد" hideNav>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10">
            <Trophy size={40} className="text-secondary" />
          </div>
          <h2 className="text-3xl font-black">آفرین!</h2>
          <p className="mt-2 text-[var(--text-secondary)]">این جلسه با موفقیت انجام شد</p>
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-4">
            <Clock size={18} className="text-primary" />
            <span className="font-bold">زمان کل تمرین: {formatSeconds(workoutElapsed)}</span>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl bg-primary px-6 py-3 font-black text-white shadow-card transition-all active:scale-[0.98]"
            >
              شروع دوباره
            </button>
            <Link
              href="/athlete/workout"
              className="rounded-xl border border-[var(--border)] px-6 py-3 font-bold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
            >
              بازگشت
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  // --- Pre-start ---
  if (!session?.startedAt) {
    return (
      <AppShell title={day.title} subtitle={day.summary} hideNav>
        <div className="mx-auto max-w-lg">
          {/* Day Overview */}
          <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-card">
            <h2 className="text-2xl font-black">{day.label}</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{day.summary}</p>

            <div className="mt-5 space-y-3">
              {day.phases.map((phase) => (
                <div key={phase.id} className="rounded-xl bg-[var(--background)] p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{phase.title}</span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {phase.blocks.reduce((s, b) => s + b.exercises.length, 0)} حرکت
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {phase.blocks.map((block) => (
                      <div
                        key={block.id}
                        className="flex items-center justify-between rounded-lg bg-[var(--surface)] px-3 py-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Dumbbell size={14} className="shrink-0 text-[var(--text-muted)]" />
                          <span className="truncate text-sm font-medium">
                            {block.kind === "compound" ? block.title : block.exercises[0]?.exerciseName ?? "—"}
                          </span>
                        </div>
                        <span className="shrink-0 text-xs text-[var(--text-muted)]">
                          {block.exercises.length} حرکت • {block.rounds} دور
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            type="button"
            onClick={handleStartWorkout}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-5 text-lg font-black text-white shadow-float transition-all duration-200 active:scale-[0.98]"
          >
            <Play size={24} fill="white" />
            شروع تمرین
          </button>
        </div>
      </AppShell>
    );
  }

  // --- Active Workout ---
  return (
    <AppShell title="" subtitle="" hideNav>
      {/* Set Logger Bottom Sheet */}
      {showSetLogger && currentExercise && (
        <SetLogger
          exerciseName={currentExercise.exerciseName}
          setNumber={(currentProgress?.setsDone ?? 0) + 1}
          totalSets={currentExercise.sets}
          setMode={currentExercise.setMode}
          repsRange={currentExercise.repsRange}
          onLog={handleLogSet}
          onSkip={handleSkipExercise}
          onClose={() => setShowSetLogger(false)}
        />
      )}

      <div className="mx-auto flex max-w-lg flex-col gap-4 px-0 py-0">
        {/* Minimal header */}
        <div className="flex items-center justify-between px-4 pt-3">
          <button
            type="button"
            onClick={() => router.push("/athlete/workout")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)]"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium text-[var(--text-muted)]">
            <Timer size={14} className="inline ml-1" />
            {formatSeconds(workoutElapsed)}
          </span>
          <div className="h-10 w-10" /> {/* spacer */}
        </div>

        {isRestPhase ? (
          /* --- Rest Timer View --- */
          <div className="flex flex-col items-center px-4 py-8">
            <SetTimer
              key={`timer-${currentExercise?.id}-${currentProgress?.setsDone}`}
              durationSeconds={currentExercise?.restSeconds ?? 60}
              onComplete={handleTimerComplete}
              onSkip={handleTimerSkip}
              autoStart
            />
            <button
              type="button"
              onClick={() => setShowSetLogger(true)}
              className="mt-6 w-full rounded-2xl bg-primary py-4 text-center font-black text-white shadow-card transition-all active:scale-[0.98]"
            >
              شروع ست بعدی
            </button>
          </div>
        ) : (
          /* --- Exercise View --- */
          <div className="flex flex-col gap-4 px-4">
            {/* Exercise Card */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-card">
              {/* Phase & Block context */}
              <div className="mb-3 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span className="rounded-md bg-primary/10 px-2 py-0.5 font-medium text-primary">
                  {currentPhase?.title}
                </span>
                <span>•</span>
                <span>حرکت {day.phases.reduce((s, p, i) => s + (i < session.phaseIndex ? p.blocks.reduce((a, b) => a + b.exercises.length, 0) : 0), 0) + session.exerciseIndex + 1} از {day.phases.reduce((s, p) => s + p.blocks.reduce((a, b) => a + b.exercises.length, 0), 0)}</span>
              </div>

              {/* Exercise Name + Set info */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-2xl font-black">{currentExercise?.exerciseName ?? "—"}</h2>
                  {currentExercise?.repsRange && (
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">هدف: {currentExercise.repsRange} تکرار</p>
                  )}
                </div>
                <div className="shrink-0 text-center">
                  <span className="block text-3xl font-black text-primary tabular-nums">
                    {(currentProgress?.setsDone ?? 0) + 1}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">از {currentExercise?.sets ?? 0}</span>
                </div>
              </div>

              {/* GIF */}
              {currentExercise?.gifMediaId && (
                <div className="mt-4">
                  <GifDisplay
                    mediaId={currentExercise.gifMediaId}
                    alt={currentExercise.exerciseName}
                    frameClassName="h-52 w-full rounded-xl"
                    imageClassName="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Primary action */}
              <button
                type="button"
                onClick={() => setShowSetLogger(true)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-lg font-black text-white shadow-card transition-all duration-200 active:scale-[0.98]"
              >
                <Play size={20} fill="white" />
                انجام ست {Math.min((currentProgress?.setsDone ?? 0) + 1, currentExercise?.sets ?? 0)}
              </button>

              {/* Skip */}
              <button
                type="button"
                onClick={handleSkipExercise}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] py-3 text-sm font-bold text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)]"
              >
                <SkipForward size={16} />
                رد کردن این حرکت
              </button>
            </div>

            {/* Progress */}
            <WorkoutProgress day={day} session={session} />

            {/* Reset */}
            <button
              type="button"
              onClick={handleReset}
              className="mb-4 text-center text-xs text-[var(--text-muted)] underline underline-offset-2 hover:text-danger"
            >
              ریست جلسه
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
