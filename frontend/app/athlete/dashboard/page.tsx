"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getAthleteTodayWorkout, getAthleteMetrics, type AthleteWorkoutResponse } from "@/lib/api";
import {
  getWorkoutSession,
  countExercises,
} from "@/lib/workout-plan";
import {
  Activity,
  BarChart3,
  CalendarCheck,
  ChevronLeft,
  Dumbbell,
  Flame,
  Play,
  Sparkles,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AthleteDashboardPage() {
  const [workoutData, setWorkoutData] = useState<AthleteWorkoutResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getAthleteTodayWorkout().catch(() => null),
      getAthleteMetrics().catch(() => []),
    ]).then(([workout]) => {
      if (!mounted) return;
      setWorkoutData(workout);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const todayDay = workoutData?.days.find((d) => d.id === workoutData.activeDayId) ?? null;
  const todaySession = todayDay ? getWorkoutSession(todayDay.id) : null;
  const todayInProgress = Boolean(todaySession?.startedAt && !todaySession?.finishedAt);
  const todayDone = Boolean(todaySession?.finishedAt);
  const daysDone = workoutData?.days.filter((d) => Boolean(getWorkoutSession(d.id).finishedAt)).length ?? 0;
  const totalDays = workoutData?.days.length ?? 0;

  if (loading) {
    return (
      <AppShell title="خانه" subtitle="پنل ورزشکار">
        <div className="flex h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm">در حال بارگذاری...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="خانه" subtitle="خلاصه وضعیت تمرینی شما">
      {/* Today's Workout Card */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border p-5 shadow-card",
          todayDone
            ? "border-secondary/30 bg-gradient-to-br from-secondary/5 to-transparent"
            : todayInProgress
              ? "border-primary/40 bg-gradient-to-br from-primary/5 to-transparent"
              : "border-[var(--border)] bg-[var(--surface)]",
        )}
      >
        {todayDay ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                      todayDone && "bg-secondary/10 text-secondary",
                      todayInProgress && "bg-primary/10 text-primary",
                      !todayDone && !todayInProgress && "bg-[var(--background-secondary)] text-[var(--text-muted)]",
                    )}
                  >
                    {todayDone ? "انجام شد ✅" : todayInProgress ? "در حال اجرا" : "امروز"}
                  </span>
                  {workoutData?.activeProgramTitle && (
                    <span className="text-xs text-[var(--text-muted)]">{workoutData.activeProgramTitle}</span>
                  )}
                </div>
                <h2 className="mt-2 text-2xl font-black">{todayDay.label}</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{todayDay.title}</p>
              </div>
              <span className="flex shrink-0 items-center gap-1 rounded-xl bg-primary/10 px-3 py-2 text-sm font-black text-primary">
                <Dumbbell size={16} />
                {countExercises(todayDay)}
              </span>
            </div>

            <p className="mt-3 line-clamp-2 text-sm text-[var(--text-muted)]">{todayDay.summary}</p>

            {/* Phase tags */}
            {todayDay.phases.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {todayDay.phases.map((phase) => (
                  <span
                    key={phase.id}
                    className="rounded-lg bg-[var(--background-secondary)] px-2.5 py-1 text-xs font-medium text-[var(--text-muted)]"
                  >
                    {phase.title}
                  </span>
                ))}
              </div>
            )}

            <Link
              href={`/athlete/workout/${todayDay.id}`}
              className={cn(
                "mt-4 flex items-center justify-center gap-2 rounded-xl py-3 font-black text-white shadow-card transition-all active:scale-[0.98]",
                todayDone
                  ? "bg-secondary/20 text-secondary"
                  : "bg-primary hover:bg-primary-dark",
              )}
            >
              {todayDone ? (
                "مشاهده جلسه"
              ) : todayInProgress ? (
                <>
                  <Play size={18} fill="white" />
                  ادامه تمرین
                </>
              ) : (
                <>
                  <Play size={18} fill="white" />
                  شروع تمرین امروز
                </>
              )}
            </Link>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-6">
            <Dumbbell size={40} className="text-[var(--text-muted)]" />
            <p className="text-center text-[var(--text-secondary)]">
              {workoutData?.activeProgramTitle
                ? "برنامه فعالی برای امروز وجود ندارد"
                : "برنامه فعالی یافت نشد"}
            </p>
            <Link
              href="/athlete/workout"
              className="rounded-xl bg-primary px-5 py-2.5 font-black text-white shadow-card transition-all active:scale-[0.98]"
            >
              مشاهده همه روزها
            </Link>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-card">
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-primary" />
            <span className="text-xs text-[var(--text-muted)]">روزهای انجام شده</span>
          </div>
          <p className="mt-2 text-2xl font-black tabular-nums">
            {daysDone}<span className="mr-0.5 text-sm font-medium text-[var(--text-muted)]">/{totalDays}</span>
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-card">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-secondary" />
            <span className="text-xs text-[var(--text-muted)]">این هفته</span>
          </div>
          <p className="mt-2 text-2xl font-black tabular-nums">
            {daysDone}<span className="mr-0.5 text-sm font-medium text-[var(--text-muted)]">روز</span>
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-card">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-accent" />
            <span className="text-xs text-[var(--text-muted)]">هدف هفتگی</span>
          </div>
          <p className="mt-2 text-2xl font-black tabular-nums">
            {totalDays}
            <span className="mr-0.5 text-sm font-medium text-[var(--text-muted)]">روز</span>
          </p>
        </div>
        <Link
          href="/athlete/metrics"
          className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-card transition-colors hover:border-primary/30"
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-warning" />
            <span className="text-xs text-[var(--text-muted)]">آخرین متریک</span>
          </div>
          <p className="mt-2 text-2xl font-black tabular-nums">
            —
            <span className="mr-0.5 text-sm font-medium text-[var(--text-muted)]">کیلوگرم</span>
          </p>
        </Link>
      </div>

      {/* Quick Links */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link
          href="/athlete/workout"
          className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-card transition-all hover:shadow-card-hover"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <CalendarCheck size={22} className="text-primary" />
          </div>
          <div>
            <p className="font-bold">همه روزهای تمرین</p>
            <p className="text-xs text-[var(--text-muted)]">مشاهده و ادامه روزها</p>
          </div>
          <ChevronLeft size={18} className="mr-auto text-[var(--text-muted)]" />
        </Link>
        <Link
          href="/athlete/metrics"
          className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-card transition-all hover:shadow-card-hover"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary/10">
            <BarChart3 size={22} className="text-secondary" />
          </div>
          <div>
            <p className="font-bold">نمودار پیشرفت</p>
            <p className="text-xs text-[var(--text-muted)]">وزن، چربی و عضله</p>
          </div>
          <ChevronLeft size={18} className="mr-auto text-[var(--text-muted)]" />
        </Link>
        <Link
          href="/athlete/coaches"
          className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-card transition-all hover:shadow-card-hover"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
            <Activity size={22} className="text-accent" />
          </div>
          <div>
            <p className="font-bold">مربی‌های من</p>
            <p className="text-xs text-[var(--text-muted)]">مشاهده مربیان و دعوت‌ها</p>
          </div>
          <ChevronLeft size={18} className="mr-auto text-[var(--text-muted)]" />
        </Link>
      </div>

      {/* Weekly Progress */}
      {totalDays > 0 && (
        <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck size={18} className="text-primary" />
              <span className="font-bold">پیشرفت هفتگی</span>
            </div>
            <span className="text-sm text-[var(--text-muted)]">{daysDone}/{totalDays}</span>
          </div>
          <div className="flex gap-2">
            {workoutData?.days.map((day) => {
              const session = getWorkoutSession(day.id);
              const isFinished = Boolean(session.finishedAt);
              const isActive = Boolean(session.startedAt && !session.finishedAt);
              return (
                <Link
                  key={day.id}
                  href={`/athlete/workout/${day.id}`}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-2 rounded-xl px-2 py-3 text-center transition-all hover:shadow-card-hover",
                    isFinished && "bg-secondary/10",
                    isActive && "bg-primary/10",
                    !isFinished && !isActive && "bg-[var(--background-secondary)]",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-black",
                      isFinished && "bg-secondary text-white",
                      isActive && "bg-primary text-white",
                      !isFinished && !isActive && "bg-[var(--border)] text-[var(--text-muted)]",
                    )}
                  >
                    {day.label?.replace("روز ", "") || day.dayNumber}
                  </div>
                  <span className="text-[10px] font-medium text-[var(--text-muted)] line-clamp-1">
                    {day.title || `روز ${day.dayNumber}`}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </AppShell>
  );
}
