import { cn } from "@/lib/utils";
import { GifDisplay } from "@/components/GifDisplay";
import type { WorkoutStatus } from "@/types/domain";
import { CheckCircle2, Clock, Dumbbell, Play } from "lucide-react";

interface WorkoutCardProps {
  exerciseName: string;
  sets: number;
  setsDone?: number;
  repsRange?: string | null;
  restSeconds: number;
  gifMediaId?: string | null;
  status: WorkoutStatus;
  onStart?: () => void;
  compact?: boolean;
}

export function WorkoutCard({
  exerciseName,
  sets,
  setsDone = 0,
  repsRange,
  restSeconds,
  gifMediaId,
  status,
  onStart,
  compact = false,
}: WorkoutCardProps) {
  const progress = sets > 0 ? setsDone / sets : 0;
  const isCompleted = status === "completed";
  const isInProgress = status === "in-progress";

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border bg-[var(--surface)] p-3 transition-all duration-200",
          isCompleted
            ? "border-secondary/30 opacity-70"
            : isInProgress
              ? "border-primary/40 shadow-card-hover"
              : "border-[var(--border)]",
        )}
      >
        {/* Progress indicator */}
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
          {isCompleted ? (
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-secondary/10">
              <CheckCircle2 size={24} className="text-secondary" />
            </div>
          ) : (
            <>
              <svg width="48" height="48" viewBox="0 0 48 48" className="absolute">
                <circle cx="24" cy="24" r="20" fill="none" stroke="var(--border)" strokeWidth="3" />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 125.6} ${125.6 - progress * 125.6}`}
                  transform="rotate(-90 24 24)"
                  className={isInProgress ? "text-primary" : "text-[var(--text-muted)]"}
                />
              </svg>
              <span className="text-xs font-black text-[var(--text-secondary)]">
                {setsDone}/{sets}
              </span>
            </>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h3 className={cn("truncate font-bold", isCompleted && "line-through")}>{exerciseName}</h3>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span>{sets} ست</span>
            {repsRange ? <><span className="text-[var(--border)]">•</span><span>{repsRange} تکرار</span></> : null}
            <span className="text-[var(--border)]">•</span>
            <Clock size={11} />
            <span>{restSeconds}ث</span>
          </div>
        </div>

        {/* Action */}
        <button
          type="button"
          onClick={onStart}
          disabled={!onStart || isCompleted}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-black text-white transition-all duration-200 active:scale-90",
            isCompleted
              ? "bg-secondary/20 text-secondary"
              : "bg-primary shadow-card hover:shadow-card-hover",
            (!onStart || isCompleted) && "cursor-not-allowed opacity-50",
          )}
        >
          {isCompleted ? (
            <CheckCircle2 size={16} />
          ) : (
            <Play size={16} fill="white" />
          )}
        </button>
      </div>
    );
  }

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border bg-[var(--surface)] transition-all duration-200",
        isCompleted
          ? "border-secondary/20"
          : isInProgress
            ? "border-primary/30 shadow-card-hover"
            : "border-[var(--border)] shadow-card hover:shadow-card-hover",
      )}
    >
      <div className="flex flex-col sm:flex-row">
        <GifDisplay
          mediaId={gifMediaId}
          alt={exerciseName}
          className="w-full sm:w-32"
          frameClassName="h-32 w-full sm:w-32"
          imageClassName="h-full w-full object-cover"
          compact={!gifMediaId}
        />
        <div className="flex flex-1 flex-col justify-center p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className={cn("text-lg font-black", isCompleted && "line-through")}>{exerciseName}</h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {sets} ست • {repsRange ? `${repsRange} تکرار` : "تمرین زمانی"} • استراحت {restSeconds}ث
              </p>
            </div>
            <span
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
                isCompleted && "bg-secondary/10 text-secondary",
                isInProgress && "bg-primary/10 text-primary",
                !isCompleted && !isInProgress && "bg-[var(--background-secondary)] text-[var(--text-muted)]",
              )}
            >
              <Dumbbell size={12} />
              {isCompleted ? "تکمیل" : isInProgress ? "در حال اجرا" : `${setsDone}/${sets}`}
            </span>
          </div>

          {/* Progress bar */}
          {!isCompleted && (
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isInProgress ? "bg-primary" : "bg-[var(--border)]",
                )}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          )}

          <button
            type="button"
            onClick={onStart}
            disabled={!onStart || isCompleted}
            className={cn(
              "mt-3 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black text-white transition-all duration-200 active:scale-[0.98]",
              isCompleted ? "bg-secondary/20 text-secondary" : "bg-primary hover:bg-primary-dark shadow-card",
              (!onStart || isCompleted) && "cursor-not-allowed opacity-50",
            )}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 size={16} />
                انجام شده
              </>
            ) : (
              <>
                <Play size={16} fill="white" />
                {isInProgress ? "ادامه" : "شروع"}
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
