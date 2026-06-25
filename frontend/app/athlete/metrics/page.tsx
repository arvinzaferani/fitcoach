"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MetricChart } from "@/components/MetricChart";
import { getAthleteMetrics } from "@/lib/api";
import { cn } from "@/lib/utils";
import { History, Plus, Scale, Timer, TrendingUp, User } from "lucide-react";

interface MetricRecord {
  recordedAt: string;
  weightKg: number | null;
  bodyFatPercentage: number | null;
  muscleMassKg: number | null;
  biologicalAge: number | null;
}

const METRIC_TYPES = [
  { key: "weight" as const, label: "وزن", unit: "کیلوگرم", icon: Scale, color: "#F97316" },
  { key: "bodyFat" as const, label: "درصد چربی", unit: "%", icon: Timer, color: "#8B5CF6" },
  { key: "muscleMass" as const, label: "توده عضلانی", unit: "کیلوگرم", icon: TrendingUp, color: "#22C55E" },
  { key: "biologicalAge" as const, label: "سن بیولوژیک", unit: "سال", icon: User, color: "#F59E0B" },
];

function getLocalIsoMinuteNow() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function dateToPersian(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export default function AthleteMetricsPage() {
  const [metrics, setMetrics] = useState<MetricRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [recordedAt, setRecordedAt] = useState(() => getLocalIsoMinuteNow());
  const [formValues, setFormValues] = useState({
    weightKg: "",
    bodyFatPercentage: "",
    muscleMassKg: "",
    biologicalAge: "",
  });

  useEffect(() => {
    getAthleteMetrics()
      .then((data) => setMetrics(data.map((item: any) => ({
        recordedAt: item.recordedAt,
        weightKg: item.weightKg ?? null,
        bodyFatPercentage: item.bodyFatPercentage ?? null,
        muscleMassKg: item.muscleMassKg ?? null,
        biologicalAge: item.biologicalAge ?? null,
      }))))
      .catch(() => setMetrics([]));
  }, []);

  function latestValue(key: string): number | null {
    for (let i = metrics.length - 1; i >= 0; i--) {
      const val = metrics[i][key as keyof MetricRecord];
      if (val !== null && val !== undefined) return Number(val);
    }
    return null;
  }

  function filterByType(type: "weight" | "bodyFat" | "muscleMass" | "biologicalAge") {
    const keyMap = {
      weight: "weightKg",
      bodyFat: "bodyFatPercentage",
      muscleMass: "muscleMassKg",
      biologicalAge: "biologicalAge",
    };
    const k = keyMap[type];
    return metrics
      .filter((m) => m[k as keyof MetricRecord] !== null)
      .map((m) => ({
        date: new Date(m.recordedAt),
        value: Number(m[k as keyof MetricRecord]),
      }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: actual API call - for now just add to local state
    const newRecord: MetricRecord = {
      recordedAt: new Date(recordedAt).toISOString(),
      weightKg: formValues.weightKg ? parseFloat(formValues.weightKg) : null,
      bodyFatPercentage: formValues.bodyFatPercentage ? parseFloat(formValues.bodyFatPercentage) : null,
      muscleMassKg: formValues.muscleMassKg ? parseFloat(formValues.muscleMassKg) : null,
      biologicalAge: formValues.biologicalAge ? parseInt(formValues.biologicalAge, 10) : null,
    };
    setMetrics((prev) => [...prev, newRecord]);
    setFormValues({ weightKg: "", bodyFatPercentage: "", muscleMassKg: "", biologicalAge: "" });
    setShowForm(false);
  }

  return (
    <AppShell title="پیشرفت من" subtitle="ثبت و پیگیری تغییرات بدن">
      {/* Metric Summary Cards */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {METRIC_TYPES.map((metric) => {
          const val = latestValue(metric.key === "weight" ? "weightKg" : metric.key === "bodyFat" ? "bodyFatPercentage" : metric.key === "muscleMass" ? "muscleMassKg" : "biologicalAge");
          return (
            <div
              key={metric.key}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-card"
            >
              <div className="flex items-center gap-2">
                <metric.icon size={16} style={{ color: metric.color }} />
                <span className="text-xs font-medium text-[var(--text-muted)]">{metric.label}</span>
              </div>
              <p className="mt-2 text-2xl font-black tabular-nums" style={{ color: metric.color }}>
                {val ?? "—"}
                <span className="mr-1 text-xs font-medium opacity-60">{metric.unit}</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Add Metric Button */}
      <button
        type="button"
        onClick={() => setShowForm(!showForm)}
        className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--surface)] py-4 text-sm font-bold text-[var(--text-secondary)] transition-colors hover:border-primary/40 hover:text-primary"
      >
        <Plus size={18} />
        {showForm ? "بستن فرم ثبت" : "ثبت متریک جدید"}
      </button>

      {/* Metric Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-5 animate-slide-up rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-card"
        >
          <h3 className="mb-4 text-lg font-black">ثبت متریک جدید</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-[var(--text-secondary)]">
                وزن (کیلوگرم)
              </label>
              <input
                value={formValues.weightKg}
                onChange={(e) => setFormValues((p) => ({ ...p, weightKg: e.target.value }))}
                placeholder="مثلاً ۷۵"
                inputMode="decimal"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[var(--text-secondary)]">
                درصد چربی
              </label>
              <input
                value={formValues.bodyFatPercentage}
                onChange={(e) => setFormValues((p) => ({ ...p, bodyFatPercentage: e.target.value }))}
                placeholder="مثلاً ۱۵"
                inputMode="decimal"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[var(--text-secondary)]">
                توده عضلانی (کیلوگرم)
              </label>
              <input
                value={formValues.muscleMassKg}
                onChange={(e) => setFormValues((p) => ({ ...p, muscleMassKg: e.target.value }))}
                placeholder="مثلاً ۳۵"
                inputMode="decimal"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[var(--text-secondary)]">
                سن بیولوژیک
              </label>
              <input
                value={formValues.biologicalAge}
                onChange={(e) => setFormValues((p) => ({ ...p, biologicalAge: e.target.value }))}
                placeholder="مثلاً ۲۸"
                inputMode="numeric"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-xs font-bold text-[var(--text-secondary)]">تاریخ</label>
            <input
              type="datetime-local"
              value={recordedAt}
              onChange={(e) => setRecordedAt(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-primary py-3 font-black text-white shadow-card transition-all active:scale-[0.98]"
          >
            ذخیره متریک
          </button>
        </form>
      )}

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {METRIC_TYPES.map((metric) => (
          <MetricChart
            key={metric.key}
            data={filterByType(metric.key)}
            type={metric.key}
            period="month"
          />
        ))}
      </div>

      {/* History */}
      {metrics.length > 0 && (
        <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-card">
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-5 py-4">
            <History size={16} className="text-primary" />
            <h3 className="font-bold">تاریخچه ثبت‌ها</h3>
          </div>
          <div className="divide-y divide-[var(--border-light)]">
            {[...metrics]
              .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
              .slice(0, 20)
              .map((m, i) => (
                <div key={i} className="grid grid-cols-4 gap-3 px-5 py-3 text-sm">
                  <span className="text-[var(--text-muted)]">{dateToPersian(m.recordedAt)}</span>
                  <span className="font-medium tabular-nums">{m.weightKg ?? "—"} کگ</span>
                  <span className="font-medium tabular-nums">{m.bodyFatPercentage ?? "—"}%</span>
                  <span className="font-medium tabular-nums">{m.muscleMassKg ?? "—"} کگ</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
