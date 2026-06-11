"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getAthleteTodayWorkout, type AthleteWorkoutResponse } from "@/lib/api";
import {
  countExercises,
  getWorkoutSession,
  workoutFlowLabel,
  type WorkoutDayPlan,
} from "@/lib/workout-plan";

export default function WorkoutStartPage() {
  const [days, setDays] = useState<WorkoutDayPlan[]>([]);
  const [activeDayId, setActiveDayId] = useState<string | null>(null);
  const [programTitle, setProgramTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getAthleteTodayWorkout()
      .then((data: AthleteWorkoutResponse) => {
        if (!mounted) return;
        setDays(data.days);
        setActiveDayId(data.activeDayId);
        setProgramTitle(data.activeProgramTitle);
      })
      .catch(() => {
        if (!mounted) return;
        setDays([]);
        setActiveDayId(null);
        setProgramTitle(null);
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <AppShell title="انتخاب روز تمرین" subtitle={programTitle ? `برنامه فعال: ${programTitle}` : "روز تمرین را انتخاب کنید و سپس در صفحه بعد شروع را بزنید"}>
      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">در حال بارگذاری برنامه...</div>
      ) : null}
      {!loading && days.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-300">برنامه فعالی از backend پیدا نشد.</p>
        </div>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {days.map((day) => {
          const session = getWorkoutSession(day.id);
          const isInProgress = Boolean(session.startedAt) && !session.finishedAt;

          return (
            <article
              key={day.id}
              className={`rounded-lg border bg-white p-4 dark:bg-slate-900 ${
                day.id === activeDayId ? "border-primary ring-4 ring-primary/10 dark:border-primary" : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">{day.label}</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{day.title}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">{countExercises(day)} حرکت</span>
              </div>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">{day.summary}</p>
              <div className="mt-4 space-y-2 text-sm">
                {day.phases.map((phase) => (
                  <div key={phase.id} className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold">{phase.title}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-300">{phase.blocks.length} بلوک</span>
                    </div>
                    <div className="mt-2 space-y-2">
                      {phase.blocks.map((block) => (
                        <div key={block.id} className="flex items-center justify-between rounded-md bg-white px-3 py-2 dark:bg-slate-900">
                          <span className="min-w-0 truncate font-medium">{block.kind === "compound" ? block.title : block.exercises[0]?.exerciseName ?? "نامشخص"}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-300">
                            {workoutFlowLabel(block.flowType)} • {block.exercises.length} حرکت • {block.rounds} دور
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-300">
                  {day.id === activeDayId ? "پیشنهاد امروز" : isInProgress ? "جلسه در حال اجرا" : "آماده شروع"}
                </span>
                <Link href={`/athlete/workout/${day.id}`} className="rounded-lg bg-secondary px-4 py-2.5 text-sm font-black text-white">
                  {isInProgress ? "ادامه" : "شروع"}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
