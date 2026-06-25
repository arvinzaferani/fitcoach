"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, X } from "lucide-react";

interface SetLogData {
  weight?: number;
  reps?: number;
  rpe?: number;
  duration?: number;
  completed: boolean;
}

interface SetLoggerProps {
  exerciseName: string;
  setNumber: number;
  totalSets: number;
  setMode: "reps" | "time";
  repsRange?: string | null;
  previousWeight?: number | null;
  onLog: (data: SetLogData) => void;
  onSkip: () => void;
  onClose: () => void;
}

const RPE_OPTIONS = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];

export function SetLogger({
  exerciseName,
  setNumber,
  totalSets,
  setMode,
  repsRange,
  previousWeight,
  onLog,
  onSkip,
  onClose,
}: SetLoggerProps) {
  const [weight, setWeight] = useState(previousWeight ? String(previousWeight) : "");
  const [reps, setReps] = useState("");
  const [rpe, setRpe] = useState<number | null>(null);

  function handleSubmit() {
    onLog({
      weight: weight ? parseFloat(weight) : undefined,
      reps: reps ? parseInt(reps, 10) : undefined,
      rpe: rpe ?? undefined,
      completed: true,
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg animate-slide-up rounded-t-3xl border border-[var(--border)] bg-[var(--surface)] p-5 pb-8 shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[var(--border)]" />

        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)]">
              ست {setNumber} از {totalSets}
            </p>
            <h3 className="mt-0.5 text-xl font-black">{exerciseName}</h3>
            {repsRange && setMode === "reps" && (
              <p className="mt-1 text-sm text-[var(--text-secondary)]">هدف تکرار: {repsRange}</p>
            )}
            {previousWeight && (
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">وزنه قبلی: {previousWeight} کیلوگرم</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Weight Input */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-secondary)]">وزنه (کیلوگرم)</label>
            <input
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="مثلاً ۴۰"
              inputMode="decimal"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-lg font-bold transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
          </div>

          {/* Reps / Duration */}
          {setMode === "reps" ? (
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[var(--text-secondary)]">تعداد تکرار</label>
              <input
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="مثلاً ۱۲"
                inputMode="numeric"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-lg font-bold transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          ) : null}

          {/* RPE Selector */}
          <div>
            <label className="mb-2 block text-xs font-bold text-[var(--text-secondary)]">
              RPE (میزان سختی)
              <span className="mr-1 font-normal text-[var(--text-muted)]">(اختیاری)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {RPE_OPTIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRpe(rpe === value ? null : value)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-bold transition-all",
                    rpe === value
                      ? "border-primary bg-primary text-white"
                      : "border-[var(--border)] text-[var(--text-secondary)] hover:border-primary/30 hover:text-primary",
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onSkip}
              className="flex-1 rounded-xl border border-[var(--border)] py-3 text-sm font-bold text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)]"
            >
              رد کردن
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-black text-white shadow-card transition-all duration-200 active:scale-[0.98]"
            >
              <CheckCircle2 size={18} />
              ثبت ست
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
