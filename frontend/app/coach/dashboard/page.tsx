"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MetricChart } from "@/components/MetricChart";
import { StatCard } from "@/components/StatCard";
import { getAthleteMetrics, getCoachAthletes } from "@/lib/api";

export default function CoachDashboardPage() {
  const [athletes, setAthletes] = useState<Array<{ id: string; fullName: string; activeProgram: string }>>([]);
  const [metrics, setMetrics] = useState<Array<{ date: Date; value: number }>>([]);

  useEffect(() => {
    getCoachAthletes().then((data) => setAthletes(data.map((item) => ({ id: item.id, fullName: item.fullName, activeProgram: item.activeProgram })))).catch(() => setAthletes([]));
    getAthleteMetrics().then((data) => {
      const points = data
        .filter((item) => typeof item.weightKg === "number")
        .map((item) => ({ date: new Date(item.recordedAt), value: Number(item.weightKg) }));
      setMetrics(points);
    }).catch(() => setMetrics([]));
  }, []);

  const activeProgramsCount = useMemo(() => athletes.filter((item) => item.activeProgram !== "بدون برنامه فعال").length, [athletes]);

  return (
    <AppShell title="داشبورد مربی" subtitle="نمای کلی شاگردان، برنامه‌ها و متریک‌های اخیر">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="شاگرد فعال" value={String(athletes.length)} />
        <StatCard label="تمپلیت" value="-" accent="secondary" />
        <StatCard label="برنامه فعال" value={String(activeProgramsCount)} accent="success" />
        <StatCard label="نیاز به بررسی" value="-" accent="warning" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5  dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-black">شاگردان اخیر</h2>
          <div className="space-y-3">
            {athletes.map((athlete) => (
              <div key={athlete.id} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700">
                <div className="font-black">{athlete.fullName}</div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-300">{athlete.activeProgram}</div>
              </div>
            ))}
          </div>
        </div>
        <MetricChart data={metrics.length > 0 ? metrics : [{ date: new Date(), value: 0 }]} type="weight" period="month" />
      </div>
    </AppShell>
  );
}
