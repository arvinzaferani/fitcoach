"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { FileUploader } from "@/components/FileUploader";
import { GifDisplay } from "@/components/GifDisplay";
import {
  CatalogExercise,
  MAX_EXERCISE_GIF_BYTES,
  createExercise,
  deactivateExercise,
  deleteExerciseGifMedia,
  getAdminExerciseCatalog,
  getExerciseGroups,
  updateExercise,
  uploadExerciseGif,
} from "@/lib/exercise-catalog";

const DEFAULT_GROUPS = ["Cardio", "Lower Body", "Upper Body", "Mobility", "Core"];

export default function AdminExercisesPage() {
  const [exercises, setExercises] = useState<CatalogExercise[]>([]);
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [group, setGroup] = useState("Cardio");
  const [customGroup, setCustomGroup] = useState("");
  const [filterGroup, setFilterGroup] = useState("all");
  const [gifFile, setGifFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [stagedMediaId, setStagedMediaId] = useState<string | null>(null);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editingOriginalMediaId, setEditingOriginalMediaId] = useState<string | null>(null);
  const [gifUploading, setGifUploading] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadExercises() {
      setLoading(true);
      try {
        const data = await getAdminExerciseCatalog();
        if (active) {
          setExercises(data);
        }
      } catch {
        if (active) {
          setSaveNotice("بارگذاری کتابخانه حرکات ناموفق بود.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadExercises();
    return () => {
      active = false;
    };
  }, []);

  const groupOptions = useMemo(() => {
    return Array.from(new Set([...DEFAULT_GROUPS, ...getExerciseGroups(exercises)])).sort((left, right) => left.localeCompare(right));
  }, [exercises]);

  const filteredExercises = filterGroup === "all" ? exercises : exercises.filter((exercise) => exercise.group === filterGroup);
  const isEditing = editingExerciseId !== null;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function clearPreviewUrl() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  }

  async function discardStagedMedia() {
    if (stagedMediaId && stagedMediaId !== editingOriginalMediaId) {
      await deleteExerciseGifMedia(stagedMediaId).catch(() => undefined);
    }
  }

  function resolveGroupValue(exerciseGroup?: string | null) {
    const value = exerciseGroup?.trim() || "General";
    return groupOptions.includes(value) ? value : "__custom__";
  }

  async function beginEditExercise(exercise: CatalogExercise) {
    await discardStagedMedia();
    clearPreviewUrl();
    setEditingExerciseId(exercise.id);
    setEditingOriginalMediaId(exercise.gifMediaId ?? null);
    setName(exercise.name ?? "");
    setNameEn(exercise.nameEn ?? "");
    setMuscleGroup(exercise.muscleGroup ?? "");
    setGroup(resolveGroupValue(exercise.group));
    setCustomGroup(groupOptions.includes(exercise.group?.trim() || "") ? "" : exercise.group ?? "");
    setGifFile(null);
    setStagedMediaId(null);
    setSaveNotice("حالت ویرایش فعال شد.");
  }

  async function cancelEditExercise() {
    await discardStagedMedia();
    setEditingExerciseId(null);
    setEditingOriginalMediaId(null);
    setName("");
    setNameEn("");
    setMuscleGroup("");
    setGroup("Cardio");
    setCustomGroup("");
    setGifFile(null);
    setStagedMediaId(null);
    clearPreviewUrl();
    setSaveNotice("ویرایش لغو شد.");
  }

  async function handleGifUpload(file: File | null) {
    if (gifUploading) {
      return;
    }

    if (!file) {
      if (stagedMediaId && stagedMediaId !== editingOriginalMediaId) {
        await deleteExerciseGifMedia(stagedMediaId).catch(() => undefined);
      }
      setGifFile(null);
      setStagedMediaId(null);
      clearPreviewUrl();
      return;
    }

    if (file.size > MAX_EXERCISE_GIF_BYTES) {
      if (stagedMediaId && stagedMediaId !== editingOriginalMediaId) {
        await deleteExerciseGifMedia(stagedMediaId).catch(() => undefined);
      }
      setGifFile(null);
      setStagedMediaId(null);
      clearPreviewUrl();
      setSaveNotice(`GIF باید کوچکتر از ${Math.ceil(MAX_EXERCISE_GIF_BYTES / 1024 / 1024)}MB باشد.`);
      return;
    }

    if (file.type && file.type !== "image/gif") {
      if (stagedMediaId && stagedMediaId !== editingOriginalMediaId) {
        await deleteExerciseGifMedia(stagedMediaId).catch(() => undefined);
      }
      setGifFile(null);
      setStagedMediaId(null);
      clearPreviewUrl();
      setSaveNotice("فقط فایل GIF قابل قبول است.");
      return;
    }

    clearPreviewUrl();
    setGifFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setSaveNotice(null);
    setGifUploading(true);
    const previousMediaId = stagedMediaId;

    try {
      const upload = await uploadExerciseGif(file);
      if (previousMediaId && previousMediaId !== editingOriginalMediaId) {
        await deleteExerciseGifMedia(previousMediaId).catch(() => undefined);
      }
      setStagedMediaId(upload.mediaId);
      setSaveNotice("GIF با موفقیت آپلود شد و برای ذخیره آماده است.");
    } catch (error) {
      setStagedMediaId(previousMediaId);
      setSaveNotice(error instanceof Error ? error.message : "آپلود GIF ناموفق بود.");
    } finally {
      setGifUploading(false);
    }
  }

  async function handleSaveExercise(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedMuscle = muscleGroup.trim();
    const trimmedCustomGroup = customGroup.trim();
    const trimmedGroup = (group === "__custom__" ? trimmedCustomGroup : group).trim() || "General";

    if (!trimmedName || !trimmedMuscle || (!gifFile && !isEditing)) {
      setSaveNotice("نام و گروه عضلانی الزامی هستند و برای حرکت جدید GIF هم لازم است.");
      return;
    }

    if (group === "__custom__" && !trimmedCustomGroup) {
      setSaveNotice("برای گروه سفارشی، نام گروه را وارد کنید.");
      return;
    }

    const finalMediaId = stagedMediaId ?? editingOriginalMediaId ?? null;
    if (!finalMediaId && !isEditing) {
      setSaveNotice(gifUploading ? "GIF هنوز در حال آپلود است." : "GIF هنوز آپلود نشده است.");
      return;
    }

    setSaving(true);
    setSaveNotice(null);

    try {
      if (editingExerciseId) {
        const updatedExercise = await updateExercise(editingExerciseId, {
          name: trimmedName,
          nameEn: nameEn.trim() || undefined,
          muscleGroup: trimmedMuscle,
          group: trimmedGroup,
          gifMediaId: finalMediaId ?? undefined,
        });

        if (stagedMediaId && editingOriginalMediaId && stagedMediaId !== editingOriginalMediaId) {
          await deleteExerciseGifMedia(editingOriginalMediaId).catch(() => undefined);
        }

        setExercises((current) => current.map((exercise) => (exercise.id === updatedExercise.id ? updatedExercise : exercise)));
        setSaveNotice("حرکت با موفقیت به‌روزرسانی شد.");
      } else {
        const createdExercise = await createExercise({
          name: trimmedName,
          nameEn: nameEn.trim() || undefined,
          muscleGroup: trimmedMuscle,
          group: trimmedGroup,
          gifMediaId: finalMediaId ?? undefined,
        });

        setExercises((current) => [createdExercise, ...current.filter((exercise) => exercise.id !== createdExercise.id)]);
        setSaveNotice("حرکت با موفقیت در MinIO و دیتابیس ذخیره شد.");
      }

      setEditingExerciseId(null);
      setEditingOriginalMediaId(null);
      setName("");
      setNameEn("");
      setMuscleGroup("");
      setGroup("Cardio");
      setCustomGroup("");
      setGifFile(null);
      setStagedMediaId(null);
      clearPreviewUrl();
      event.currentTarget.reset();
    } catch (error) {
      setSaveNotice(error instanceof Error ? error.message : "ذخیره حرکت ناموفق بود.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(id: string) {
    setSaving(true);
    setSaveNotice(null);

    try {
      const updatedExercise = await deactivateExercise(id);
      setExercises((current) => current.map((exercise) => (exercise.id === updatedExercise.id ? updatedExercise : exercise)));
      setSaveNotice("حرکت غیرفعال شد.");
    } catch (error) {
      setSaveNotice(error instanceof Error ? error.message : "غیرفعال‌سازی ناموفق بود.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell title="مدیریت حرکات" subtitle="CRUD حرکات، آپلود مستقیم GIF و مدیریت دسته‌بندی">
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <form onSubmit={handleSaveExercise} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">{isEditing ? "ویرایش حرکت" : "افزودن حرکت"}</h2>
              {isEditing ? (
                <button type="button" onClick={cancelEditExercise} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  لغو ویرایش
                </button>
              ) : null}
            </div>
            {saveNotice ? <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">{saveNotice}</p> : null}
            <div className="mt-4 grid gap-3">
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="نام حرکت (مثلا تردمیل)" className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-800" />
              <input value={nameEn} onChange={(event) => setNameEn(event.target.value)} placeholder="English name (optional)" className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-800" />
              <input value={muscleGroup} onChange={(event) => setMuscleGroup(event.target.value)} placeholder="گروه عضلانی (مثلا پا)" className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-800" />
              <div className="grid gap-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">گروه نمایش</label>
                <select value={group} onChange={(event) => setGroup(event.target.value)} className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-800">
                  {groupOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                  <option value="__custom__">سفارشی</option>
                </select>
                {group === "__custom__" ? (
                  <input value={customGroup} onChange={(event) => setCustomGroup(event.target.value)} placeholder="نام گروه سفارشی" className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-800" />
                ) : null}
              </div>
              <FileUploader
                id="exercise-gif"
                label="GIF حرکت"
                accept="image/gif"
                helpText={`فایل GIF را انتخاب کنید. حداکثر حجم ${Math.ceil(MAX_EXERCISE_GIF_BYTES / 1024 / 1024)}MB است.`}
                file={gifFile}
                maxSizeBytes={MAX_EXERCISE_GIF_BYTES}
                disabled={saving || gifUploading}
                onChange={handleGifUpload}
              />
              {gifUploading ? <p className="text-xs text-slate-500 dark:text-slate-300">در حال آپلود GIF...</p> : null}
              {previewUrl ? (
                <GifDisplay
                  src={previewUrl}
                  alt={name.trim() || "پیش‌نمایش GIF"}
                  title="پیش‌نمایش قبل از آپلود"
                  caption="این همان فایلی است که به MinIO ارسال می‌شود."
                  className="mt-1"
                  frameClassName="h-40 w-full"
                  imageClassName="h-40 w-full object-cover"
                />
              ) : null}
              {stagedMediaId ? (
                <GifDisplay
                  mediaId={stagedMediaId}
                  alt={name.trim() || "GIF آپلود شده"}
                  title="نمونه بعد از آپلود"
                  caption="نسخه ذخیره شده در MinIO و دیتابیس."
                  className="mt-1"
                  frameClassName="h-40 w-full"
                  imageClassName="h-40 w-full object-cover"
                />
              ) : isEditing && editingOriginalMediaId ? (
                <GifDisplay
                  mediaId={editingOriginalMediaId}
                  alt={name.trim() || "GIF فعلی"}
                  title="GIF فعلی"
                  caption="نسخه‌ای که الان به حرکت وصل است."
                  className="mt-1"
                  frameClassName="h-40 w-full"
                  imageClassName="h-40 w-full object-cover"
                />
              ) : null}
            </div>
            <button type="submit" disabled={saving || gifUploading} className="mt-4 w-full rounded-lg bg-primary py-3 font-black text-white disabled:opacity-60">
              {saving ? "در حال ذخیره..." : isEditing ? "ذخیره تغییرات" : "ذخیره حرکت"}
            </button>
          </form>
        </div>
        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-black">کتابخانه حرکات</h2>
          <div className="mt-3">
            <select value={filterGroup} onChange={(event) => setFilterGroup(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-800">
              <option value="all">همه گروه‌ها</option>
              {groupOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div className="mt-4 space-y-3">
            {loading ? <p className="text-sm text-slate-500 dark:text-slate-300">در حال بارگذاری...</p> : null}
            {!loading && filteredExercises.length === 0 ? <p className="text-sm text-slate-500 dark:text-slate-300">حرکتی برای نمایش وجود ندارد.</p> : null}
            {filteredExercises.map((exercise) => (
              <div key={exercise.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
                <div className="min-w-0">
                  <strong>{exercise.name}</strong>
                  {exercise.nameEn ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{exercise.nameEn}</p> : null}
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                    {exercise.group ?? "General"} • {exercise.muscleGroup ?? "—"}
                  </p>
                  {exercise.gifMediaId ? (
                    <GifDisplay
                      mediaId={exercise.gifMediaId}
                      alt={exercise.name}
                      title="GIF ذخیره شده"
                      caption="این نمونه از MinIO بارگذاری می‌شود."
                      className="mt-2 max-w-40"
                      frameClassName="h-20 w-20"
                      imageClassName="h-20 w-20 object-cover"
                      compact
                    />
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => beginEditExercise(exercise)}
                    disabled={saving || gifUploading}
                    className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 disabled:opacity-60 dark:bg-slate-800 dark:text-slate-200"
                  >
                    ویرایش
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeactivate(exercise.id)}
                    disabled={saving || gifUploading}
                    className="rounded-lg bg-danger/10 px-4 py-2 text-sm font-black text-danger disabled:opacity-60"
                  >
                    غیرفعال
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
