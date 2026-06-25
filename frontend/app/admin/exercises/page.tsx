"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ImageIcon, Plus, Search, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { GifDisplay } from "@/components/GifDisplay";
import { cn } from "@/lib/utils";
import {
  CatalogExercise,
  deactivateExercise,
  getAdminExerciseCatalog,
  getExerciseGroups,
} from "@/lib/exercise-catalog";

const DEFAULT_GROUPS = ["Cardio", "Lower Body", "Upper Body", "Mobility", "Core"];
const DEFAULT_MUSCLE_GROUPS = [
  "سینه", "پشت", "سرشانه", "جلو بازو", "پشت بازو",
  "چهارسر ران", "همسترینگ", "ساق پا", "شکم", "باسن", "فیله کمری", "کمر",
];
const PAGE_SIZE = 10;

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);

  const pages: (number | "...")[] = [];
  pages.push(0);

  if (current > 2) pages.push("...");

  const start = Math.max(1, current - 1);
  const end = Math.min(total - 2, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 3) pages.push("...");

  pages.push(total - 1);
  return pages;
}

type Notice = { text: string; type: "success" | "error" } | null;

export default function ExercisesCatalogPage() {
  const [exercises, setExercises] = useState<CatalogExercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGroup, setFilterGroup] = useState("all");
  const [filterMuscle, setFilterMuscle] = useState("all");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [previewExercise, setPreviewExercise] = useState<CatalogExercise | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getAdminExerciseCatalog()
      .then((data) => { if (active) setExercises(data); })
      .catch(() => { if (active) setNotice({ text: "بارگذاری ناموفق بود.", type: "error" }); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const muscleGroupOptions = useMemo(() => {
    const fromExercises = exercises.map((e) => e.muscleGroup?.trim()).filter(Boolean) as string[];
    return Array.from(new Set([...DEFAULT_MUSCLE_GROUPS, ...fromExercises])).sort();
  }, [exercises]);

  const groupOptions = useMemo(() => {
    return Array.from(new Set([...DEFAULT_GROUPS, ...getExerciseGroups(exercises)])).sort();
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    let result = exercises;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (e) => e.name.toLowerCase().includes(q) || (e.nameEn?.toLowerCase().includes(q) ?? false),
      );
    }
    if (filterGroup !== "all") {
      result = result.filter((e) => e.group === filterGroup);
    }
    if (filterMuscle !== "all") {
      result = result.filter((e) => e.muscleGroup === filterMuscle);
    }
    return result;
  }, [exercises, searchQuery, filterGroup, filterMuscle]);

  const totalPages = Math.max(1, Math.ceil(filteredExercises.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = filteredExercises.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  function getNoticeStyle(type: "success" | "error") {
    switch (type) {
      case "success":
        return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200";
      case "error":
        return "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200";
    }
  }

  async function handleDeactivate(exercise: CatalogExercise) {
    if (!window.confirm(`آیا از غیرفعال‌سازی "${exercise.name}" اطمینان دارید؟`)) return;
    setSavingId(exercise.id);
    setNotice(null);
    try {
      const updated = await deactivateExercise(exercise.id);
      setExercises((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setNotice({ text: `"${exercise.name}" غیرفعال شد.`, type: "success" });
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : "غیرفعال‌سازی ناموفق بود.", type: "error" });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <AppShell title="مدیریت حرکات" subtitle="کتابخانه حرکات ورزشی">
      {/* Notice */}
      {notice ? (
        <p className={cn("mb-4 rounded-lg border px-3 py-2 text-sm", getNoticeStyle(notice.type))}>{notice.text}</p>
      ) : null}

      {/* Actions bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              placeholder="جستجوی حرکت..."
              className="w-full rounded-lg border border-slate-200 bg-transparent px-4 py-2.5 pr-9 text-sm dark:border-slate-800"
            />
          </div>
          <select
            value={filterGroup}
            onChange={(e) => { setFilterGroup(e.target.value); setPage(0); }}
            className="rounded-lg border border-slate-200 bg-transparent px-3 py-2.5 text-sm dark:border-slate-800"
          >
            <option value="all">همه گروه‌ها</option>
            {groupOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select
            value={filterMuscle}
            onChange={(e) => { setFilterMuscle(e.target.value); setPage(0); }}
            className="rounded-lg border border-slate-200 bg-transparent px-3 py-2.5 text-sm dark:border-slate-800"
          >
            <option value="all">همه عضلات</option>
            {muscleGroupOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <Link
          href="/admin/exercises/new"
          className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-black text-white"
        >
          <Plus size={18} />
          حرکت جدید
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                <th className="whitespace-nowrap px-4 py-3 text-right font-black text-slate-600 dark:text-slate-300">تصویر</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-black text-slate-600 dark:text-slate-300">نام</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-black text-slate-600 dark:text-slate-300">نام انگلیسی</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-black text-slate-600 dark:text-slate-300">گروه</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-black text-slate-600 dark:text-slate-300">عضله</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-black text-slate-600 dark:text-slate-300">وضعیت</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-black text-slate-600 dark:text-slate-300">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-primary" />
                      در حال بارگذاری...
                    </div>
                  </td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    {searchQuery || filterGroup !== "all" || filterMuscle !== "all"
                      ? "حرکتی با این مشخصات یافت نشد."
                      : "هنوز حرکتی ثبت نشده است."}
                  </td>
                </tr>
              ) : (
                pageItems.map((exercise) => (
                  <tr
                    key={exercise.id}
                    className={cn(
                      "border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900",
                      exercise.isActive === false && "opacity-50",
                    )}
                  >
                    <td className="px-4 py-3">
                      {exercise.gifMediaId ? (
                        <button type="button" onClick={() => setPreviewExercise(exercise)} className="block">
                          <GifDisplay
                            mediaId={exercise.gifMediaId}
                            alt={exercise.name}
                            compact
                            className="rounded-lg"
                            frameClassName="h-10 w-10"
                            imageClassName="h-10 w-10 object-cover rounded-lg"
                          />
                        </button>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                          <ImageIcon size={16} className="text-slate-400" />
                        </div>
                      )}
                    </td>
                    <td className="max-w-40 truncate px-4 py-3 font-semibold">{exercise.name}</td>
                    <td className="max-w-32 truncate px-4 py-3 text-slate-500">{exercise.nameEn || "—"}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{exercise.group ?? "General"}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{exercise.muscleGroup || "—"}</td>
                    <td className="px-4 py-3">
                      {exercise.isActive === false ? (
                        <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-black text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          غیرفعال
                        </span>
                      ) : (
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                          فعال
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/exercises/${exercise.id}/edit`}
                          className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        >
                          ویرایش
                        </Link>
                        {exercise.isActive !== false ? (
                          <button
                            type="button"
                            onClick={() => handleDeactivate(exercise)}
                            disabled={savingId === exercise.id}
                            className="rounded-lg bg-danger/10 px-3 py-1.5 text-xs font-black text-danger disabled:opacity-50"
                          >
                            {savingId === exercise.id ? "..." : "غیرفعال"}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          <p className="hidden text-slate-500 sm:block dark:text-slate-300">
            {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filteredExercises.length)} از{" "}
            {filteredExercises.length}
          </p>
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold disabled:opacity-40 dark:border-slate-800"
            >
              قبلی
            </button>
            {getPageNumbers(safePage, totalPages).map((item, i) =>
              item === "..." ? (
                <span key={`ellipsis-${i}`} className="px-2 text-xs text-slate-400">...</span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPage(item)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-bold",
                    item === safePage
                      ? "bg-primary text-white"
                      : "border border-slate-200 dark:border-slate-800",
                  )}
                >
                  {item + 1}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage >= totalPages - 1}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold disabled:opacity-40 dark:border-slate-800"
            >
              بعدی
            </button>
          </div>
        </div>
      ) : null}

      {/* GIF Preview Modal */}
      {previewExercise ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setPreviewExercise(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-white p-4 shadow-2xl dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewExercise(null)}
              className="absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white"
            >
              <X size={16} />
            </button>
            {previewExercise.gifMediaId ? (
              <GifDisplay
                mediaId={previewExercise.gifMediaId}
                alt={previewExercise.name}
                title={previewExercise.name}
                caption={previewExercise.nameEn ? `${previewExercise.name} • ${previewExercise.group ?? "General"} • ${previewExercise.muscleGroup ?? "—"}` : undefined}
                frameClassName="max-h-[70vh] w-auto"
                imageClassName="max-h-[70vh] w-auto object-contain"
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
