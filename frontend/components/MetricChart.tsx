import type { MetricPoint } from "@/types/domain";

interface MetricChartProps {
  data: MetricPoint[];
  type: "weight" | "bodyFat" | "muscleMass" | "biologicalAge";
  period: "week" | "month" | "3months" | "6months" | "year";
}

const labels = {
  weight: "وزن",
  bodyFat: "درصد چربی",
  muscleMass: "توده عضلانی",
  biologicalAge: "سن بیولوژیک",
};

export function MetricChart({ data, type, period }: MetricChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-black">{labels[type]}</h3>
        <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">{period}</span>
      </div>
      <div className="flex h-48 items-end gap-3">
        {data.map((item) => (
          <div key={item.date.toISOString()} className="flex flex-1 flex-col items-center gap-2">
            <div className="w-full rounded-t-md bg-primary" style={{ height: `${Math.max((item.value / maxValue) * 100, 8)}%` }} />
            <span className="text-xs text-slate-400">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
