"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatSeconds } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Pause, Play, SkipForward, Timer as TimerIcon } from "lucide-react";

interface SetTimerProps {
  durationSeconds: number;
  onComplete: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
}

const SIZE = 220;
const STROKE_WIDTH = 8;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function SetTimer({ durationSeconds, onComplete, onSkip, autoStart = true }: SetTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isPaused, setIsPaused] = useState(!autoStart);
  const [isComplete, setIsComplete] = useState(false);
  const completeNotified = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progress = 1 - timeLeft / durationSeconds;
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const isWarning = timeLeft <= 5 && timeLeft > 0;
  const isCritical = timeLeft <= 3 && timeLeft > 0;

  const notifyComplete = useCallback(() => {
    if (completeNotified.current) return;
    completeNotified.current = true;
    setIsComplete(true);
    try {
      navigator.vibrate?.([200, 100, 200, 100, 400]);
    } catch {}
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    setTimeLeft(durationSeconds);
    setIsPaused(!autoStart);
    setIsComplete(false);
    completeNotified.current = false;
  }, [durationSeconds, autoStart]);

  useEffect(() => {
    if (isPaused || isComplete) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, isComplete]);

  useEffect(() => {
    if (timeLeft === 0 && !isComplete) {
      notifyComplete();
    }
  }, [timeLeft, isComplete, notifyComplete]);

  function handleSkip() {
    setTimeLeft(0);
    setIsPaused(false);
    setIsComplete(true);
    completeNotified.current = true;
    onSkip?.();
  }

  function handlePauseToggle() {
    setIsPaused((prev) => !prev);
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Timer Ring */}
      <div className="relative flex items-center justify-center">
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE_WIDTH}
            className="text-[var(--border)]"
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            className={cn(
              "transition-[stroke-dashoffset] duration-500",
              isCritical ? "text-danger" : isWarning ? "text-warning" : "text-primary",
            )}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <TimerIcon
            size={20}
            className={cn(
              "mb-1 transition-colors",
              isCritical ? "text-danger" : isWarning ? "text-warning" : "text-primary",
            )}
          />
          <span
            className={cn(
              "text-5xl font-black tabular-nums tracking-tight",
              isCritical ? "text-danger" : isWarning ? "text-warning" : "text-[var(--text-primary)]",
            )}
          >
            {formatSeconds(timeLeft)}
          </span>
          <span className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">استراحت</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSkip}
          disabled={isComplete}
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-secondary)] disabled:cursor-not-allowed disabled:opacity-40"
          title="رد کردن استراحت"
        >
          <SkipForward size={20} />
        </button>
        <button
          type="button"
          onClick={handlePauseToggle}
          disabled={isComplete}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-float transition-all duration-200 active:scale-95",
            isPaused ? "bg-primary" : "bg-warning",
            isComplete && "cursor-not-allowed opacity-40",
          )}
          title={isPaused ? "ادامه" : "توقف"}
        >
          {isPaused ? <Play size={24} fill="white" /> : <Pause size={24} fill="white" />}
        </button>
      </div>

      {/* Time labels */}
      <div className="flex w-full max-w-[220px] justify-between text-xs text-[var(--text-muted)]">
        <span>شروع</span>
        <span>{formatSeconds(durationSeconds)}</span>
      </div>
    </div>
  );
}
