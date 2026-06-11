import { cn } from "@/lib/utils";
import { GifDisplay } from "@/components/GifDisplay";
import type { WorkoutStatus } from "@/types/domain";

interface WorkoutCardProps {
  exerciseName: string;
  sets: number;
  repsRange?: string | null;
  restSeconds: number;
  gifMediaId?: string | null;
  status: WorkoutStatus;
  onStart?: () => void;
}

export function WorkoutCard({ exerciseName, sets, repsRange, restSeconds, gifMediaId, status, onStart }: WorkoutCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <GifDisplay
          mediaId={gifMediaId}
          alt={exerciseName}
          className="w-full sm:w-28"
          frameClassName="h-24 w-full sm:w-28"
          imageClassName="h-full w-full object-cover"
          compact={!gifMediaId}
        />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-black">{exerciseName}</h3>
            <span className={cn("rounded-full px-3 py-1 text-xs font-bold", status === "completed" && "bg-success/10 text-success", status === "in-progress" && "bg-secondary/10 text-secondary", status === "pending" && "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300")}>
              {status === "completed" ? "تکمیل شده" : status === "in-progress" ? "در حال اجرا" : "در انتظار"}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
            {sets} ست • {repsRange ? `${repsRange} تکرار` : "تمرین زمانی"} • استراحت {restSeconds} ثانیه
          </p>
        </div>
        <button
          type="button"
          onClick={onStart}
          disabled={!onStart}
          className="rounded-lg bg-secondary px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          شروع
        </button>
      </div>
    </article>
  );
}
