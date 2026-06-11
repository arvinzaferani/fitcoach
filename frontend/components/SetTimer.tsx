"use client";

import { useEffect, useRef, useState } from "react";
import { formatSeconds } from "@/lib/utils";

interface SetTimerProps {
  durationSeconds: number;
  onComplete?: () => void;
  onSkip?: () => void;
}

export function SetTimer({ durationSeconds, onComplete, onSkip }: SetTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const completeNotified = useRef(false);

  useEffect(() => {
    setTimeLeft(durationSeconds);
    setIsPaused(false);
    completeNotified.current = false;
  }, [durationSeconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!completeNotified.current) {
        completeNotified.current = true;
        onComplete?.();
      }
      return;
    }
    if (isPaused) {
      return;
    }
    const timer = window.setTimeout(() => setTimeLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [isPaused, onComplete, timeLeft]);

  function handleSkip() {
    setTimeLeft(0);
    setIsPaused(false);
    onSkip?.();
  }

  return (
    <div className="rounded-3xl bg-primary p-6 text-center text-white">
      <p className="text-sm font-bold opacity-80">تایمر استراحت</p>
      <strong className="mt-2 block text-5xl font-black tracking-widest">{formatSeconds(timeLeft)}</strong>
      <button
        type="button"
        onClick={() => setIsPaused((value) => !value)}
        disabled={timeLeft <= 0}
        className="mt-5 rounded-2xl bg-white/15 px-5 py-2 text-sm font-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPaused ? "ادامه تایمر" : "توقف تایمر"}
      </button>
      <button
        type="button"
        onClick={handleSkip}
        disabled={timeLeft <= 0}
        className="mt-3 rounded-2xl bg-white/15 px-5 py-2 text-sm font-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        رد کردن استراحت
      </button>
    </div>
  );
}
