"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PersianDateTimePicker } from "@/components/DateTimePicker";
import { MetricChart } from "@/components/MetricChart";
import { getAthleteMetrics } from "@/lib/api";

const persianDateTimeFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Tehran",
});

function getLocalIsoMinuteNow() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export default function AthleteMetricsPage() {
  const [metrics, setMetrics] = useState<Array<{ recordedAt: string; weightKg: number | null }>>([]);
  const [recordedAt, setRecordedAt] = useState(() => getLocalIsoMinuteNow());
  const [weightKg, setWeightKg] = useState("");
  const [bodyFatPercentage, setBodyFatPercentage] = useState("");
  const [muscleMassKg, setMuscleMassKg] = useState("");
  const [biologicalAge, setBiologicalAge] = useState("");

  useEffect(() => {
    getAthleteMetrics().then((data) => setMetrics(data.map((item) => ({ recordedAt: item.recordedAt, weightKg: item.weightKg })))).catch(() => setMetrics([]));
  }, []);

  const weightMetrics = useMemo(() => {
    const points = metrics
      .filter((item) => typeof item.weightKg === "number")
      .map((item) => ({ date: new Date(item.recordedAt), value: Number(item.weightKg) }));
    return points.length > 0 ? points : [{ date: new Date(), value: 0 }];
  }, [metrics]);

  return (
    <AppShell title="متریک‌های من" subtitle="ثبت، مشاهده نمودار و تاریخچه تغییرات بدن">
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <form className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-black">ثبت متریک جدید</h2>
          <div className="mt-4 grid gap-3">
            <input
              value={weightKg}
              onChange={(event) => setWeightKg(event.target.value)}
              placeholder="وزن"
              inputMode="decimal"
              className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-800"
            />
            <input
              value={bodyFatPercentage}
              onChange={(event) => setBodyFatPercentage(event.target.value)}
              placeholder="درصد چربی"
              inputMode="decimal"
              className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-800"
            />
            <input
              value={muscleMassKg}
              onChange={(event) => setMuscleMassKg(event.target.value)}
              placeholder="توده عضلانی"
              inputMode="decimal"
              className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-800"
            />
            <input
              value={biologicalAge}
              onChange={(event) => setBiologicalAge(event.target.value)}
              placeholder="سن بیولوژیک"
              inputMode="numeric"
              className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-800"
            />
            <PersianDateTimePicker value={recordedAt} onChange={setRecordedAt} showTime />
          </div>
          <p className="mt-3 text-sm text-slate-500">تاریخ ثبت: {persianDateTimeFormatter.format(new Date(recordedAt))}</p>
          <button className="mt-4 w-full rounded-lg bg-primary py-3 font-black text-white">ذخیره</button>
        </form>
        <MetricChart data={weightMetrics} type="weight" period="month" />
      </div>
    </AppShell>
  );
}
