"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getAthleteTodayWorkout, type AthleteWorkoutResponse } from "@/lib/api";
import {
  countExercises,
  getWorkoutSession,
  type WorkoutDayPlan,
} from "@/lib/workout-plan";
import { cn } from "@/lib/utils";
import { CalendarCheck, ChevronLeft, ChevronRight, Dumbbell, Play, Sparkles } from "lucide-react";

const DAY_NAMES = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];

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
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <AppShell title="تمرینات" subtitle="برنامه تمرینی شما">
        <div className="flex h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm">در حال بارگذاری...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!loading && days.length === 0) {
    return (
      <AppShell title="تمرینات" subtitle="برنامه تمرینی شما">
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
          <Dumbbell size={48} className="text-[var(--text-muted)]" />
          <p className="text-center text-[var(--text-secondary)]">
            برنامه فعالی برای نمایش وجود ندارد.
          </p>
          {programTitle && (
            <p className="text-sm text-[var(--text-muted)]">برنامه: {programTitle}</p>
          )}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="تمرینات" subtitle={programTitle ? `برنامه: ${programTitle}` : "روز تمرین را انتخاب کنید"}>
      {/* Weekly Progress Summary */}
      <div className="mb-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck size={18} className="text-primary" />
            <span className="font-bold">پیشرفت هفتگی</span>
          </div>
          <span className="text-sm text-[var(--text-muted)]">
            {days.filter((d) => {
              const s = getWorkoutSession(d.id);
              return Boolean(s.finishedAt);
            }).length}
            /{days.length}
          </span>
        </div>
        <div className="mt-3 flex gap-1.5">
          {days.map((day) => {
            const session = getWorkoutSession(day.id);
            const isDone = Boolean(session.finishedAt);
            const isInProgress = Boolean(session.startedAt) && !session.finishedAt;
            return (
              <div
                key={day.id}
                className={cn(
                  "h-2 flex-1 rounded-full transition-all",
                  isDone && "bg-secondary",
                  isInProgress && "bg-primary",
                  !isDone && !isInProgress && "bg-[var(--border)]",
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Day Cards */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {days.map((day, index) => {
          const session = getWorkoutSession(day.id);
          const isInProgress = Boolean(session.startedAt) && !session.finishedAt;
          const isDone = Boolean(session.finishedAt);
          const isToday = day.id === activeDayId;
          const exerciseCount = countExercises(day);

          return (
            <Link
              key={day.id}
              href={`/athlete/workout/${day.id}`}
              className={cn(
                "group relative overflow-hidden rounded-2xl border bg-[var(--surface)] p-4 shadow-card transition-all duration-200 hover:shadow-card-hover active:scale-[0.98]",
                isDone && "border-secondary/30",
                isInProgress && "border-primary/40",
                !isDone && !isInProgress && "border-[var(--border)]",
              )}
            >
              {/* Day label + status */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black">{day.label}</h2>
                    {isToday && (
                      <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                        <Sparkles size={10} />
                        امروز
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{day.title}</p>
                </div>
                <span
                  className={cn(
                    "flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-bold",
                    isDone && "bg-secondary/10 text-secondary",
                    isInProgress && "bg-primary/10 text-primary",
                    !isDone && !isInProgress && "bg-[var(--background-secondary)] text-[var(--text-muted)]",
                  )}
                >
                  <Dumbbell size={12} />
                  {exerciseCount}
                </span>
              </div>

              {/* Summary */}
              <p className="mt-3 line-clamp-2 text-sm text-[var(--text-muted)]">{day.summary}</p>

              {/* Mini phase preview */}
              {day.phases.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {day.phases.map((phase) => (
                    <span
                      key={phase.id}
                      className="rounded-md bg-[var(--background-secondary)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]"
                    >
                      {phase.title}
                    </span>
                  ))}
                </div>
              )}

              {/* Action */}
              <div className="mt-4 flex items-center justify-between border-t border-[var(--border-light)] pt-3">
                <span className="text-xs text-[var(--text-muted)]">
                  {isDone ? "انجام شده" : isInProgress ? "در حال اجرا" : `${exerciseCount} حرکت`}
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-black text-white transition-all",
                    isDone
                      ? "bg-secondary/20 text-secondary"
                      : "bg-primary group-hover:bg-primary-dark",
                  )}
                >
                  {isDone ? "مشاهده" : isInProgress ? "ادامه" : "شروع"}
                  <ChevronLeft size={16} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
