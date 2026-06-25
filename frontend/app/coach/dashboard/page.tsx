"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getCoachAthletes, getAthleteMetrics, type CoachAthleteItem } from "@/lib/api";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Calendar,
  Dumbbell,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function CoachDashboardPage() {
  const [athletes, setAthletes] = useState<CoachAthleteItem[]>([]);

  useEffect(() => {
    getCoachAthletes()
      .then(setAthletes)
      .catch(() => setAthletes([]));
  }, []);

  const activeProgramsCount = useMemo(
    () => athletes.filter((a) => a.activeProgram && a.activeProgram !== "بدون برنامه فعال").length,
    [athletes],
  );

  const stats = [
    {
      label: "شاگردان",
      value: athletes.length,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
      href: "/coach/athletes",
    },
    {
      label: "برنامه فعال",
      value: activeProgramsCount,
      icon: Dumbbell,
      color: "text-secondary",
      bg: "bg-secondary/10",
      href: "/coach/assign",
    },
    {
      label: "تمپلیت‌ها",
      value: "—",
      icon: BarChart3,
      color: "text-accent",
      bg: "bg-accent/10",
      href: "/coach/templates",
    },
    {
      label: "نیاز به بررسی",
      value: "—",
      icon: Activity,
      color: "text-warning",
      bg: "bg-warning/10",
      href: "/coach/athletes",
    },
  ];

  return (
    <AppShell title="داشبورد مربی" subtitle="خلاصه وضعیت شاگردان و برنامه‌ها">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-card transition-all hover:shadow-card-hover"
          >
            <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl", stat.bg)}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-2xl font-black tabular-nums">{stat.value}</p>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Link
          href="/coach/athletes"
          className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-card transition-all hover:shadow-card-hover"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <UserPlus size={22} className="text-primary" />
          </div>
          <div>
            <p className="font-bold">دعوت شاگرد جدید</p>
            <p className="text-xs text-[var(--text-muted)]">افزودن شاگرد با ایمیل</p>
          </div>
          <ArrowLeft size={18} className="mr-auto text-[var(--text-muted)]" />
        </Link>
        <Link
          href="/coach/assign"
          className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-card transition-all hover:shadow-card-hover"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
            <Calendar size={22} className="text-secondary" />
          </div>
          <div>
            <p className="font-bold">تخصیص برنامه</p>
            <p className="text-xs text-[var(--text-muted)]">برنامه به شاگرد</p>
          </div>
          <ArrowLeft size={18} className="mr-auto text-[var(--text-muted)]" />
        </Link>
        <Link
          href="/coach/templates/create"
          className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-card transition-all hover:shadow-card-hover"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
            <Dumbbell size={22} className="text-accent" />
          </div>
          <div>
            <p className="font-bold">تمپلیت جدید</p>
            <p className="text-xs text-[var(--text-muted)]">ساخت برنامه تمرینی</p>
          </div>
          <ArrowLeft size={18} className="mr-auto text-[var(--text-muted)]" />
        </Link>
      </div>

      {/* Recent Athletes */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-black">شاگردان اخیر</h2>
          <Link
            href="/coach/athletes"
            className="text-sm font-bold text-primary transition-colors hover:text-primary-dark"
          >
            مشاهده همه
          </Link>
        </div>
        {athletes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] py-10">
            <Users size={32} className="text-[var(--text-muted)]" />
            <p className="text-sm text-[var(--text-muted)]">هنوز شاگردی ندارید</p>
            <Link
              href="/coach/athletes"
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-black text-white shadow-card transition-all active:scale-[0.98]"
            >
              دعوت شاگرد
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {athletes.map((athlete) => (
              <Link
                key={athlete.id}
                href={`/coach/athletes/${athlete.id}`}
                className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-card transition-all hover:shadow-card-hover"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-black text-primary">
                  {athlete.fullName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{athlete.fullName}</p>
                  <p className="truncate text-xs text-[var(--text-muted)]">
                    {athlete.activeProgram || "بدون برنامه"}
                  </p>
                </div>
                <ArrowLeft size={16} className="shrink-0 text-[var(--text-muted)]" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
