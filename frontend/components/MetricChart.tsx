"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { BarChart3, TrendingDown, TrendingUp, Minus } from "lucide-react";

interface MetricPoint {
  date: Date;
  value: number;
}

interface MetricChartProps {
  data: MetricPoint[];
  type: "weight" | "bodyFat" | "muscleMass" | "biologicalAge";
  period: "week" | "month" | "3months" | "6months" | "year";
}

const chartConfig = {
  weight: { label: "وزن", unit: "کیلوگرم", color: "#F97316", gradientFrom: "#F97316", gradientTo: "#FED7AA" },
  bodyFat: { label: "درصد چربی", unit: "%", color: "#8B5CF6", gradientFrom: "#8B5CF6", gradientTo: "#DDD6FE" },
  muscleMass: { label: "توده عضلانی", unit: "کیلوگرم", color: "#22C55E", gradientFrom: "#22C55E", gradientTo: "#BBF7D0" },
  biologicalAge: { label: "سن بیولوژیک", unit: "سال", color: "#F59E0B", gradientFrom: "#F59E0B", gradientTo: "#FDE68A" },
};

const periods = [
  { key: "week" as const, label: "۱ هفته" },
  { key: "month" as const, label: "۱ ماه" },
  { key: "3months" as const, label: "۳ ماه" },
  { key: "6months" as const, label: "۶ ماه" },
  { key: "year" as const, label: "۱ سال" },
];

function dateToPersian(date: Date): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric" }).format(date);
  } catch {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-float">
      <p className="text-xs text-[var(--text-muted)]">{dateToPersian(new Date(data.date))}</p>
      <p className="mt-1 text-lg font-black tabular-nums" style={{ color: data.color }}>
        {data.value} <span className="text-xs font-medium opacity-70">{data.unit}</span>
      </p>
    </div>
  );
}

export function MetricChart({ data, type, period }: MetricChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const config = chartConfig[type];

  const chartData = useMemo(() => {
    if (data.length === 0) return [];
    return data
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((point) => ({
        ...point,
        date: point.date.toISOString(),
        label: dateToPersian(point.date),
        color: config.color,
        unit: config.unit,
      }));
  }, [data, config]);

  const trend = useMemo(() => {
    if (chartData.length < 2) return "stable";
    const first = chartData[0].value;
    const last = chartData[chartData.length - 1].value;
    if (last > first * 1.01) return "up";
    if (last < first * 0.99) return "down";
    return "stable";
  }, [chartData]);

  const latestValue = chartData.length > 0 ? chartData[chartData.length - 1].value : null;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-card sm:p-5">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black">{config.label}</h3>
            {trend === "up" && <TrendingUp size={16} className="text-danger" />}
            {trend === "down" && <TrendingDown size={16} className="text-secondary" />}
            {trend === "stable" && <Minus size={16} className="text-[var(--text-muted)]" />}
          </div>
          {latestValue !== null && (
            <p className="mt-1 text-2xl font-black tabular-nums" style={{ color: config.color }}>
              {latestValue}
              <span className="mr-1 text-sm font-medium opacity-60">{config.unit}</span>
            </p>
          )}
        </div>
        <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
          {config.unit}
        </span>
      </div>

      {/* Chart */}
      {chartData.length > 1 ? (
        <div className="h-52 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={config.gradientFrom} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={config.gradientTo} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                tickLine={false}
                axisLine={false}
                domain={["dataMin - 2", "dataMax + 2"]}
                width={35}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={config.color}
                strokeWidth={2.5}
                fill={`url(#gradient-${type})`}
                dot={{ r: 3, fill: config.color, strokeWidth: 1, stroke: "var(--surface)" }}
                activeDot={{ r: 5, fill: config.color, strokeWidth: 2, stroke: "var(--surface)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-52 items-center justify-center rounded-xl bg-[var(--background-secondary)]">
          <div className="flex flex-col items-center gap-2 text-[var(--text-muted)]">
            <BarChart3 size={28} />
            <span className="text-xs">داده کافی برای نمایش وجود ندارد</span>
          </div>
        </div>
      )}

      {/* Period selector */}
      <div className="mt-4 flex gap-1.5 overflow-x-auto no-scrollbar">
        {periods.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setSelectedPeriod(p.key)}
            disabled={chartData.length === 0}
            className={cn(
              "shrink-0 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors",
              selectedPeriod === p.key
                ? "border-primary bg-primary text-white"
                : "border-[var(--border)] text-[var(--text-muted)] hover:border-primary/30 hover:text-primary",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
