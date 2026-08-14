"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { MetricChart } from "@/components/MetricChart";
import { StatCard } from "@/components/StatCard";
import {
  getAthleteProfile,
  type AthleteProfileResponse,
} from "@/lib/api";
import type { MetricPoint } from "@/types/domain";

const fitnessLevelLabels: Record<string, string> = {
  beginner: "مبتدی",
  intermediate: "متوسط",
  advanced: "پیشرفته",
  elite: "حرفه‌ای",
};

const trainingGoalLabels: Record<string, string> = {
  weight_loss: "کاهش وزن",
  muscle_gain: "عضله‌سازی",
  strength: "قدرت",
  endurance: "استقامت",
  general_fitness: "آمادگی عمومی",
};

const difficultyLabels: Record<string, string> = {
  beginner: "مبتدی",
  intermediate: "متوسط",
  advanced: "پیشرفته",
  elite: "حرفه‌ای",
};

function toMetricPoints(metrics: AthleteProfileResponse["metrics"], field: "weightKg" | "bodyFatPercentage" | "muscleMassKg" | "biologicalAge"): MetricPoint[] {
  return metrics
    .filter((m) => m[field] != null)
    .map((m) => ({
      date: new Date(m.recordedAt),
      value: Number(m[field]),
    }));
}

const persianDateFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  dateStyle: "medium",
  timeZone: "Asia/Tehran",
});

export default function AthleteProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const athleteId = params.id;

  const [profile, setProfile] = useState<AthleteProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!athleteId) return;
    setLoading(true);
    getAthleteProfile(athleteId)
      .then((data) => {
        setProfile(data);
        setError("");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "خطا در دریافت اطلاعات.");
      })
      .finally(() => setLoading(false));
  }, [athleteId]);

  if (loading) {
    return (
      <AppShell title="پروفایل شاگرد" subtitle="در حال بارگذاری...">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppShell>
    );
  }

  if (error || !profile) {
    return (
      <AppShell title="پروفایل شاگرد" subtitle="خطا در بارگذاری اطلاعات">
        <div className="rounded-xl bg-danger/10 px-4 py-3 text-center text-sm text-danger">
          {error || "ورزشکار یافت نشد."}
        </div>
      </AppShell>
    );
  }

  const weightPoints = toMetricPoints(profile.metrics, "weightKg");
  const bodyFatPoints = toMetricPoints(profile.metrics, "bodyFatPercentage");
  const muscleMassPoints = toMetricPoints(profile.metrics, "muscleMassKg");
  const bioAgePoints = toMetricPoints(profile.metrics, "biologicalAge");

  const level = profile.profile?.fitnessLevel
    ? fitnessLevelLabels[profile.profile.fitnessLevel] ?? profile.profile.fitnessLevel
    : "نامشخص";

  const goal = profile.profile?.primaryGoal
    ? trainingGoalLabels[profile.profile.primaryGoal] ?? profile.profile.primaryGoal
    : "نامشخص";

  const trainingDays = profile.profile?.trainingDaysPerWeek
    ? `${profile.profile.trainingDaysPerWeek} روز`
    : "نامشخص";

  return (
    <AppShell title="پروفایل شاگرد" subtitle={`${profile.fullName} — اطلاعات کامل، متریک‌ها، نمودارها و برنامه فعال`}>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="سطح" value={level} />
        <StatCard label="هدف" value={goal} accent="secondary" />
        <StatCard label="روز تمرین" value={trainingDays} accent="success" />
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-5">
          {weightPoints.length > 0 && <MetricChart data={weightPoints} type="weight" period="month" />}
          {bodyFatPoints.length > 0 && <MetricChart data={bodyFatPoints} type="bodyFat" period="month" />}
          {muscleMassPoints.length > 0 && <MetricChart data={muscleMassPoints} type="muscleMass" period="month" />}
          {bioAgePoints.length > 0 && <MetricChart data={bioAgePoints} type="biologicalAge" period="month" />}
          {weightPoints.length === 0 && bodyFatPoints.length === 0 && muscleMassPoints.length === 0 && bioAgePoints.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-300">هنوز متریکی ثبت نشده است.</p>
            </div>
          )}
        </div>
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-xl font-black">برنامه فعال</h2>
          {profile.activeProgram ? (
            <div className="mt-4 rounded-2xl bg-slate-50 p-5 dark:bg-slate-700">
              <strong>{profile.activeProgram.templateTitle}</strong>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-300">
                {profile.activeProgram.difficulty && (
                  <span className="rounded-lg bg-slate-200 px-2 py-0.5 dark:bg-slate-600">
                    {difficultyLabels[profile.activeProgram.difficulty] ?? profile.activeProgram.difficulty}
                  </span>
                )}
                <span className="rounded-lg bg-slate-200 px-2 py-0.5 dark:bg-slate-600">
                  {persianDateFormatter.format(new Date(profile.activeProgram.startDate))} — {persianDateFormatter.format(new Date(profile.activeProgram.endDate))}
                </span>
                {profile.activeProgram.isCustomized && (
                  <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-primary">کاستومایز شده</span>
                )}
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">امکان کاستومایز بعد از تخصیص و افزودن یادداشت شخصی برای هر حرکت.</p>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl bg-slate-50 p-5 dark:bg-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-300">هنوز برنامه‌ای تخصیص داده نشده است.</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => router.push(`/coach/assign?athleteId=${athleteId}`)}
            className="mt-5 rounded-2xl bg-primary px-5 py-3 font-black text-white transition-colors hover:bg-primary-dark"
          >
            تخصیص برنامه جدید
          </button>
        </section>
      </div>
    </AppShell>
  );
}
