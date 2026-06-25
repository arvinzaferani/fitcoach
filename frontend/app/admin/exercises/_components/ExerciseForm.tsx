"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUploader } from "@/components/FileUploader";
import { GifDisplay } from "@/components/GifDisplay";
import { cn } from "@/lib/utils";
import {
  CatalogExercise,
  MAX_EXERCISE_GIF_BYTES,
  createExercise,
  deleteExerciseGifMedia,
  getAdminExerciseCatalog,
  getExerciseGroups,
  updateExercise,
  uploadExerciseGif,
} from "@/lib/exercise-catalog";

const DEFAULT_GROUPS = ["Cardio", "Lower Body", "Upper Body", "Mobility", "Core"];

const DEFAULT_MUSCLE_GROUPS = [
  "سینه",
  "پشت",
  "سرشانه",
  "جلو بازو",
  "پشت بازو",
  "چهارسر ران",
  "همسترینگ",
  "ساق پا",
  "شکم",
  "باسن",
  "فیله کمری",
  "کمر",
];

type Notice = { text: string; type: "success" | "error" | "info" } | null;

interface ExerciseFormProps {
  mode: "create" | "edit";
  exerciseId?: string;
  initialData?: CatalogExercise | null;
}

export function ExerciseForm({ mode, exerciseId, initialData }: ExerciseFormProps) {
  const router = useRouter();
  const [allExercises, setAllExercises] = useState<CatalogExercise[]>([]);
  const [name, setName] = useState(initialData?.name ?? "");
  const [nameEn, setNameEn] = useState(initialData?.nameEn ?? "");
  const [muscleGroup, setMuscleGroup] = useState(initialData?.muscleGroup ?? "");
  const [customMuscleGroup, setCustomMuscleGroup] = useState("");
  const [group, setGroup] = useState(initialData?.group ?? "Cardio");
  const [customGroup, setCustomGroup] = useState("");
  const [gifFile, setGifFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [stagedMediaId, setStagedMediaId] = useState<string | null>(null);
  const [originalMediaId, setOriginalMediaId] = useState<string | null>(initialData?.gifMediaId ?? null);
  const [gifUploading, setGifUploading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(mode === "edit" && !initialData);

  useEffect(() => {
    if (mode === "edit" && !initialData && exerciseId) {
      getAdminExerciseCatalog()
        .then((exercises) => {
          const found = exercises.find((e) => e.id === exerciseId);
          if (found) {
            setName(found.name ?? "");
            setNameEn(found.nameEn ?? "");
            setMuscleGroup(found.muscleGroup ?? "");
            setGroup(resolveGroupValue(found.group));
            setCustomGroup(DEFAULT_GROUPS.includes(found.group?.trim() || "") ? "" : found.group ?? "");
            setOriginalMediaId(found.gifMediaId ?? null);
            setAllExercises(exercises);
          }
        })
        .catch(() => setNotice({ text: "بارگذاری اطلاعات حرکت ناموفق بود.", type: "error" }))
        .finally(() => setLoadingData(false));
    } else if (initialData) {
      setAllExercises([initialData]);
    }
  }, [mode, exerciseId, initialData]);

  useEffect(() => {
    if (mode === "edit") {
      getAdminExerciseCatalog().then(setAllExercises).catch(() => {});
    }
  }, [mode]);

  const groupOptions = useMemo(() => {
    return Array.from(new Set([...DEFAULT_GROUPS, ...getExerciseGroups(allExercises)])).sort((left, right) => left.localeCompare(right));
  }, [allExercises]);

  const muscleGroupOptions = useMemo(() => {
    const fromExercises = allExercises.map((e) => e.muscleGroup?.trim()).filter(Boolean) as string[];
    return Array.from(new Set([...DEFAULT_MUSCLE_GROUPS, ...fromExercises])).sort((left, right) => left.localeCompare(right, "fa"));
  }, [allExercises]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function resolveGroupValue(exerciseGroup?: string | null) {
    const value = exerciseGroup?.trim() || "General";
    return DEFAULT_GROUPS.includes(value) || getExerciseGroups(allExercises).includes(value) ? value : "__custom__";
  }

  function resolveMuscleValue(value?: string | null) {
    const v = value?.trim() || "";
    return muscleGroupOptions.includes(v) ? v : "__custom__";
  }

  function clearPreviewUrl() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  }

  async function discardStagedMedia() {
    if (stagedMediaId && stagedMediaId !== originalMediaId) {
      await deleteExerciseGifMedia(stagedMediaId).catch(() => undefined);
    }
  }

  async function handleGifUpload(file: File | null) {
    if (gifUploading) return;

    if (!file) {
      if (stagedMediaId && stagedMediaId !== originalMediaId) {
        await deleteExerciseGifMedia(stagedMediaId).catch(() => undefined);
      }
      setGifFile(null);
      setStagedMediaId(null);
      clearPreviewUrl();
      return;
    }

    if (file.size > MAX_EXERCISE_GIF_BYTES) {
      if (stagedMediaId && stagedMediaId !== originalMediaId) {
        await deleteExerciseGifMedia(stagedMediaId).catch(() => undefined);
      }
      setGifFile(null);
      setStagedMediaId(null);
      clearPreviewUrl();
      setNotice({ text: `GIF باید کوچکتر از ${Math.ceil(MAX_EXERCISE_GIF_BYTES / 1024 / 1024)}MB باشد.`, type: "error" });
      return;
    }

    if (file.type && file.type !== "image/gif") {
      if (stagedMediaId && stagedMediaId !== originalMediaId) {
        await deleteExerciseGifMedia(stagedMediaId).catch(() => undefined);
      }
      setGifFile(null);
      setStagedMediaId(null);
      clearPreviewUrl();
      setNotice({ text: "فقط فایل GIF قابل قبول است.", type: "error" });
      return;
    }

    clearPreviewUrl();
    setGifFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setNotice(null);
    setGifUploading(true);
    const previousMediaId = stagedMediaId;

    try {
      const upload = await uploadExerciseGif(file);
      if (previousMediaId && previousMediaId !== originalMediaId) {
        await deleteExerciseGifMedia(previousMediaId).catch(() => undefined);
      }
      setStagedMediaId(upload.mediaId);
      setNotice({ text: "GIF با موفقیت آپلود شد.", type: "success" });
    } catch (error) {
      setStagedMediaId(previousMediaId);
      setNotice({ text: error instanceof Error ? error.message : "آپلود GIF ناموفق بود.", type: "error" });
    } finally {
      setGifUploading(false);
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedMuscle = muscleGroup === "__custom__" ? customMuscleGroup.trim() : muscleGroup.trim();
    const trimmedCustomGroup = customGroup.trim();
    const trimmedGroup = (group === "__custom__" ? trimmedCustomGroup : group).trim() || "General";

    if (!trimmedName) {
      setNotice({ text: "نام حرکت الزامی است.", type: "error" });
      return;
    }

    if (!trimmedMuscle) {
      setNotice({ text: "گروه عضلانی الزامی است.", type: "error" });
      return;
    }

    if (!gifFile && mode === "create") {
      setNotice({ text: "برای حرکت جدید باید GIF آپلود کنید.", type: "error" });
      return;
    }

    if (group === "__custom__" && !trimmedCustomGroup) {
      setNotice({ text: "برای گروه سفارشی، نام گروه را وارد کنید.", type: "error" });
      return;
    }

    const finalMediaId = stagedMediaId ?? originalMediaId ?? null;
    if (!finalMediaId && mode === "create") {
      setNotice({ text: gifUploading ? "GIF هنوز در حال آپلود است." : "GIF هنوز آپلود نشده است.", type: "error" });
      return;
    }

    setSaving(true);
    setNotice(null);

    try {
      if (mode === "edit" && exerciseId) {
        const updated = await updateExercise(exerciseId, {
          name: trimmedName,
          nameEn: nameEn.trim() || undefined,
          muscleGroup: trimmedMuscle,
          group: trimmedGroup,
          gifMediaId: finalMediaId ?? undefined,
        });

        if (stagedMediaId && originalMediaId && stagedMediaId !== originalMediaId) {
          await deleteExerciseGifMedia(originalMediaId).catch(() => undefined);
        }

        setNotice({ text: "حرکت با موفقیت به‌روزرسانی شد.", type: "success" });
        setTimeout(() => router.push("/admin/exercises"), 1000);
      } else {
        await createExercise({
          name: trimmedName,
          nameEn: nameEn.trim() || undefined,
          muscleGroup: trimmedMuscle,
          group: trimmedGroup,
          gifMediaId: finalMediaId ?? undefined,
        });

        setNotice({ text: "حرکت با موفقیت ذخیره شد.", type: "success" });
        setTimeout(() => router.push("/admin/exercises"), 1000);
      }
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : "ذخیره حرکت ناموفق بود.", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  function getNoticeStyle(type: "success" | "error" | "info") {
    switch (type) {
      case "success":
        return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200";
      case "error":
        return "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200";
      case "info":
        return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200";
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500 dark:text-slate-300">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-primary" />
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black">{mode === "edit" ? "ویرایش حرکت" : "افزودن حرکت جدید"}</h2>
      </div>
      {notice ? (
        <p className={cn("mt-3 rounded-lg border px-3 py-2 text-sm", getNoticeStyle(notice.type))}>{notice.text}</p>
      ) : null}
      <div className="mt-4 grid gap-3">
        <div className="grid gap-1.5">
          <label htmlFor="exercise-name" className="text-sm font-bold text-slate-700 dark:text-slate-200">
            نام حرکت <span className="text-red-500">*</span>
          </label>
          <input
            id="exercise-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثلا تردمیل"
            className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-800"
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="exercise-name-en" className="text-sm font-bold text-slate-700 dark:text-slate-200">English name</label>
          <input
            id="exercise-name-en"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="مثلا Treadmill"
            className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-800"
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="exercise-muscle" className="text-sm font-bold text-slate-700 dark:text-slate-200">
            گروه عضلانی <span className="text-red-500">*</span>
          </label>
          <select
            id="exercise-muscle"
            value={resolveMuscleValue(muscleGroup)}
            onChange={(e) => setMuscleGroup(e.target.value)}
            className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-800"
          >
            <option value="">انتخاب کنید...</option>
            {muscleGroupOptions.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
            <option value="__custom__">سفارشی</option>
          </select>
          {(muscleGroup === "__custom__" || (muscleGroup && !muscleGroupOptions.includes(muscleGroup))) ? (
            <input
              value={customMuscleGroup}
              onChange={(e) => setCustomMuscleGroup(e.target.value)}
              placeholder="نام گروه عضلانی سفارشی"
              className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-800"
            />
          ) : null}
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="exercise-group" className="text-sm font-bold text-slate-700 dark:text-slate-200">گروه نمایش</label>
          <select
            id="exercise-group"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-800"
          >
            {groupOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            <option value="__custom__">سفارشی</option>
          </select>
          {group === "__custom__" ? (
            <input
              value={customGroup}
              onChange={(e) => setCustomGroup(e.target.value)}
              placeholder="نام گروه سفارشی"
              className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-800"
            />
          ) : null}
        </div>
        <FileUploader
          id="exercise-gif"
          label={`GIF حرکت ${mode === "create" ? "*" : ""}`}
          accept="image/gif"
          helpText={`فایل GIF را انتخاب کنید. حداکثر حجم ${Math.ceil(MAX_EXERCISE_GIF_BYTES / 1024 / 1024)}MB است.`}
          file={gifFile}
          maxSizeBytes={MAX_EXERCISE_GIF_BYTES}
          disabled={saving || gifUploading}
          onChange={handleGifUpload}
        />
        {gifUploading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-primary" />
            در حال آپلود GIF...
          </div>
        ) : null}
        {previewUrl ? (
          <GifDisplay
            src={previewUrl}
            alt={name.trim() || "پیش‌نمایش GIF"}
            title="پیش‌نمایش فایل انتخاب شده"
            caption={gifFile ? `${gifFile.name} (${(gifFile.size / 1024 / 1024).toFixed(1)} MB)` : undefined}
            className="mt-1"
            frameClassName="h-40 w-full"
            imageClassName="h-40 w-full object-cover"
          />
        ) : stagedMediaId ? (
          <GifDisplay
            mediaId={stagedMediaId}
            alt={name.trim() || "GIF آپلود شده"}
            title="GIF ذخیره شده در سرور"
            caption="این فایل برای ذخیره‌سازی آماده است."
            className="mt-1"
            frameClassName="h-40 w-full"
            imageClassName="h-40 w-full object-cover"
          />
        ) : mode === "edit" && originalMediaId ? (
          <GifDisplay
            mediaId={originalMediaId}
            alt={name.trim() || "GIF فعلی"}
            title="GIF فعلی"
            caption="برای تعویض، فایل جدیدی انتخاب کنید."
            className="mt-1"
            frameClassName="h-40 w-full"
            imageClassName="h-40 w-full object-cover"
          />
        ) : null}
      </div>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/exercises")}
          className="flex-1 rounded-lg border border-slate-200 bg-transparent py-3 font-black text-slate-600 dark:border-slate-800 dark:text-slate-300"
        >
          انصراف
        </button>
        <button
          type="submit"
          disabled={saving || gifUploading}
          className="flex-1 rounded-lg bg-primary py-3 font-black text-white disabled:opacity-60"
        >
          {saving ? "در حال ذخیره..." : mode === "edit" ? "ذخیره تغییرات" : "ذخیره حرکت"}
        </button>
      </div>
    </form>
  );
}
