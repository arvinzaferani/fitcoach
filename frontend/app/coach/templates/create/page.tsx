"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { createCoachTemplate } from "@/lib/api";
import { CatalogExercise, getExerciseCatalog } from "@/lib/exercise-catalog";
import {
  CoachTemplate,
  CompoundSetType,
  DifficultyLevel,
  MoveMeasureType,
  TemplateBlock,
  TemplateCompoundBlock,
  TemplateCompoundChild,
  TemplateDayPlan,
  TemplatePhase,
  TemplateSimpleBlock,
  TimeUnit,
  getTemplates,
  saveTemplates,
} from "@/lib/template-plans";

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createSimpleBlock(): TemplateSimpleBlock {
  return { id: createId("block"), kind: "exercise", exerciseId: "", measureType: "count", sets: 1, count: 10 };
}

function createCompoundChild(): TemplateCompoundChild {
  return { id: createId("child"), exerciseId: "", measureType: "count", count: 10 };
}

function minChildrenForType(type: CompoundSetType) {
  if (type === "superset") return 2;
  if (type === "triple") return 3;
  return 4;
}

function createCompoundBlock(type: CompoundSetType = "superset"): TemplateCompoundBlock {
  return {
    id: createId("compound"),
    kind: "compound",
    title: "Compound block",
    type,
    rounds: 3,
    children: Array.from({ length: minChildrenForType(type) }, createCompoundChild),
  };
}

function createPhase(): TemplatePhase {
  return { id: createId("phase"), title: "Warmup", blocks: [createSimpleBlock()] };
}

function isCompoundBlock(block: TemplateBlock): block is TemplateCompoundBlock {
  return block.kind === "compound";
}

function isSimpleBlock(block: TemplateBlock): block is TemplateSimpleBlock {
  return block.kind !== "compound";
}

function nextMeasureDefaults(measureType: MoveMeasureType, current: TemplateCompoundChild | TemplateSimpleBlock) {
  return {
    count: measureType === "count" ? current.count ?? 10 : undefined,
    duration: measureType === "time" ? current.duration ?? 30 : undefined,
    timeUnit: measureType === "time" ? current.timeUnit ?? "seconds" : undefined,
  };
}

function ensureMinimumChildren(type: CompoundSetType, children: TemplateCompoundChild[]) {
  const min = minChildrenForType(type);
  if (children.length >= min) {
    return children;
  }

  return [...children, ...Array.from({ length: min - children.length }, createCompoundChild)];
}

export default function CreateTemplatePage() {
  const [exerciseCatalog, setExerciseCatalog] = useState<CatalogExercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("beginner");
  const [purpose, setPurpose] = useState("");
  const [daysCount, setDaysCount] = useState("3");
  const [notes, setNotes] = useState("");
  const [days, setDays] = useState<TemplateDayPlan[]>([]);
  const [saved, setSaved] = useState(false);
  const [selectedGroupByItem, setSelectedGroupByItem] = useState<Record<string, string>>({});
  const [searchByItem, setSearchByItem] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;

    async function loadExercises() {
      setLoadingExercises(true);
      try {
        const data = await getExerciseCatalog();
        if (active) {
          setExerciseCatalog(data);
        }
      } catch {
        if (active) {
          setExerciseCatalog([]);
        }
      } finally {
        if (active) {
          setLoadingExercises(false);
        }
      }
    }

    loadExercises();
    return () => {
      active = false;
    };
  }, []);

  const groups = useMemo(
    () => Array.from(new Set(exerciseCatalog.map((item) => item.group).filter((group): group is string => Boolean(group)))).sort(),
    [exerciseCatalog],
  );

  const parsedDaysCount = Number(daysCount || 0);
  const baseValid = title.trim().length > 1 && parsedDaysCount > 0;

  function isValidBlock(block: TemplateBlock) {
    if (isSimpleBlock(block)) {
      return Boolean(block.exerciseId && block.sets > 0 && (block.measureType === "count" ? (block.count ?? 0) > 0 : (block.duration ?? 0) > 0));
    }

    const minimumChildren = minChildrenForType(block.type);
    return Boolean(
      block.title.trim().length > 0
        && block.rounds > 0
        && block.children.length >= minimumChildren
        && block.children.every((child) => child.exerciseId && (child.measureType === "count" ? (child.count ?? 0) > 0 : (child.duration ?? 0) > 0)),
    );
  }

  const canReview = useMemo(() => {
    return days.length === parsedDaysCount
      && days.every((day) => day.phases.length > 0
        && day.phases.every((phase) => phase.title.trim().length > 0
          && phase.blocks.length > 0
          && phase.blocks.every((block) => isValidBlock(block))));
  }, [days, parsedDaysCount]);

  function handleBaseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!baseValid) return;
    const initialDays = Array.from({ length: parsedDaysCount }, (_, index) => ({
      dayNumber: index + 1,
      phases: [createPhase()],
    }));
    setDays(initialDays);
    setStep(2);
  }

  function updateDay(dayNumber: number, updater: (day: TemplateDayPlan) => TemplateDayPlan) {
    setDays((current) => current.map((day) => (day.dayNumber === dayNumber ? updater(day) : day)));
  }

  function updatePhase(dayNumber: number, phaseId: string, updater: (phase: TemplatePhase) => TemplatePhase) {
    updateDay(dayNumber, (day) => ({
      ...day,
      phases: day.phases.map((phase) => (phase.id === phaseId ? updater(phase) : phase)),
    }));
  }

  function updateBlock(dayNumber: number, phaseId: string, blockId: string, updater: (block: TemplateBlock) => TemplateBlock) {
    updatePhase(dayNumber, phaseId, (phase) => ({
      ...phase,
      blocks: phase.blocks.map((block) => (block.id === blockId ? updater(block) : block)),
    }));
  }

  function updateChild(dayNumber: number, phaseId: string, blockId: string, childId: string, updater: (child: TemplateCompoundChild) => TemplateCompoundChild) {
    updateBlock(dayNumber, phaseId, blockId, (block) => {
      if (!isCompoundBlock(block)) return block;
      return {
        ...block,
        children: block.children.map((child) => (child.id === childId ? updater(child) : child)),
      };
    });
  }

  function addPhase(dayNumber: number) {
    updateDay(dayNumber, (day) => ({ ...day, phases: [...day.phases, createPhase()] }));
  }

  function addBlock(dayNumber: number, phaseId: string) {
    updatePhase(dayNumber, phaseId, (phase) => ({ ...phase, blocks: [...phase.blocks, createSimpleBlock()] }));
  }

  function addChild(dayNumber: number, phaseId: string, blockId: string) {
    updateBlock(dayNumber, phaseId, blockId, (block) => {
      if (!isCompoundBlock(block)) return block;
      return { ...block, children: [...block.children, createCompoundChild()] };
    });
  }

  function removeChild(dayNumber: number, phaseId: string, blockId: string, childId: string) {
    updateBlock(dayNumber, phaseId, blockId, (block) => {
      if (!isCompoundBlock(block)) return block;
      const nextChildren = block.children.filter((child) => child.id !== childId);
      return { ...block, children: nextChildren.length >= minChildrenForType(block.type) ? nextChildren : block.children };
    });
  }

  function toggleCompound(dayNumber: number, phaseId: string, blockId: string, nextIsCompound: boolean) {
    updateBlock(dayNumber, phaseId, blockId, (block) => {
      if (nextIsCompound && isSimpleBlock(block)) {
        return {
          ...createCompoundBlock("superset"),
          id: block.id,
          rounds: block.sets,
          children: ensureMinimumChildren("superset", [
            {
              id: createId("child"),
              exerciseId: block.exerciseId,
              measureType: block.measureType,
              ...nextMeasureDefaults(block.measureType, block),
            },
          ]),
        };
      }

      if (!nextIsCompound && isCompoundBlock(block)) {
        const firstChild = block.children[0];
        return {
          id: block.id,
          kind: "exercise",
          exerciseId: firstChild?.exerciseId ?? "",
          measureType: firstChild?.measureType ?? "count",
          sets: block.rounds,
          ...nextMeasureDefaults(firstChild?.measureType ?? "count", firstChild ?? createSimpleBlock()),
        };
      }

      return block;
    });
  }

  function updateCompoundType(dayNumber: number, phaseId: string, blockId: string, type: CompoundSetType) {
    updateBlock(dayNumber, phaseId, blockId, (block) => {
      if (!isCompoundBlock(block)) return block;
      return {
        ...block,
        type,
        children: ensureMinimumChildren(type, block.children),
      };
    });
  }

  function getFilteredExercises(itemId: string): CatalogExercise[] {
    const selectedGroup = selectedGroupByItem[itemId] ?? "all";
    const search = (searchByItem[itemId] ?? "").trim().toLowerCase();
    return exerciseCatalog.filter((exercise: CatalogExercise) => {
      const groupMatch = selectedGroup === "all" || exercise.group === selectedGroup;
      const searchMatch = !search
        || exercise.name.toLowerCase().includes(search)
        || (exercise.nameEn ?? "").toLowerCase().includes(search)
        || (exercise.muscleGroup ?? "").toLowerCase().includes(search);
      return groupMatch && searchMatch;
    });
  }

  async function saveTemplate() {
    const templates = getTemplates();
    const nextTemplate: CoachTemplate = {
      id: `tpl-${Date.now()}`,
      title: title.trim(),
      difficulty,
      purpose: purpose.trim() || undefined,
      daysCount: parsedDaysCount,
      notes: notes.trim() || undefined,
      days,
      usage: 0,
    };

    try {
      saveTemplates([...templates, nextTemplate]);
      await createCoachTemplate({
        title: nextTemplate.title,
        difficultyLevel: nextTemplate.difficulty,
        suggestedForGoal: nextTemplate.purpose,
        suggestedTrainingDays: nextTemplate.daysCount,
        description: nextTemplate.notes,
        plan: nextTemplate.days,
      });
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  function renderSimpleBlock(dayNumber: number, phaseId: string, block: TemplateSimpleBlock) {
    return (
      <div key={block.id} className="mt-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm font-black">
            <input
              type="checkbox"
              checked={false}
              onChange={(event) => toggleCompound(dayNumber, phaseId, block.id, event.target.checked)}
            />
            Compound set
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-300">Exercise block</p>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <select
            value={selectedGroupByItem[block.id] ?? "all"}
            onChange={(event) => setSelectedGroupByItem((current) => ({ ...current, [block.id]: event.target.value }))}
            className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-600"
          >
            <option value="all">همه گروه‌ها</option>
            {groups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
          <input
            value={searchByItem[block.id] ?? ""}
            onChange={(event) => setSearchByItem((current) => ({ ...current, [block.id]: event.target.value }))}
            placeholder="جستجو حرکت..."
            className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-600"
          />
          <select
            value={block.exerciseId}
            onChange={(event) => updateBlock(dayNumber, phaseId, block.id, (current) => {
              if (!isSimpleBlock(current)) return current;
              return { ...current, exerciseId: event.target.value };
            })}
            className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-600"
          >
            <option value="">انتخاب حرکت</option>
            {loadingExercises ? <option value="">در حال بارگذاری...</option> : null}
            {getFilteredExercises(block.id).map((exercise: CatalogExercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name} {exercise.nameEn ? `(${exercise.nameEn})` : ""}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            value={block.sets}
            onChange={(event) =>
              updateBlock(dayNumber, phaseId, block.id, (current) => {
                if (!isSimpleBlock(current)) return current;
                return { ...current, sets: Number(event.target.value || 0) };
              })
            }
            placeholder="ست"
            className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-600"
          />
          <select
            value={block.measureType}
            onChange={(event) =>
              updateBlock(dayNumber, phaseId, block.id, (current) => {
                if (!isSimpleBlock(current)) return current;
                const measureType = event.target.value as MoveMeasureType;
                return {
                  ...current,
                  measureType,
                  count: measureType === "count" ? current.count ?? 10 : undefined,
                  duration: measureType === "time" ? current.duration ?? 30 : undefined,
                  timeUnit: measureType === "time" ? current.timeUnit ?? "seconds" : undefined,
                };
              })
            }
            className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-600"
          >
            <option value="count">Count</option>
            <option value="time">Time</option>
          </select>
          {block.measureType === "count" ? (
            <input
              type="number"
              min={1}
              value={block.count ?? ""}
              onChange={(event) =>
                updateBlock(dayNumber, phaseId, block.id, (current) => {
                  if (!isSimpleBlock(current)) return current;
                  return { ...current, count: Number(event.target.value || 0) };
                })
              }
              placeholder="تعداد تکرار"
              className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-600"
            />
          ) : (
            <>
              <input
                type="number"
                min={1}
                value={block.duration ?? ""}
                onChange={(event) =>
                  updateBlock(dayNumber, phaseId, block.id, (current) => {
                    if (!isSimpleBlock(current)) return current;
                    return { ...current, duration: Number(event.target.value || 0) };
                  })
                }
                placeholder="زمان"
                className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-600"
              />
              <select
                value={block.timeUnit ?? "seconds"}
                onChange={(event) =>
                  updateBlock(dayNumber, phaseId, block.id, (current) => {
                    if (!isSimpleBlock(current)) return current;
                    return { ...current, timeUnit: event.target.value as TimeUnit };
                  })
                }
                className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-600"
              >
                <option value="seconds">Second</option>
                <option value="minutes">Minute</option>
              </select>
            </>
          )}
          <p className="text-xs text-slate-500">حرکت تک‌تایی</p>
        </div>
      </div>
    );
  }

  function renderCompoundBlock(dayNumber: number, phaseId: string, block: TemplateCompoundBlock) {
    return (
      <div key={block.id} className="mt-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm font-black">
            <input type="checkbox" checked onChange={(event) => toggleCompound(dayNumber, phaseId, block.id, event.target.checked)} />
            Compound set
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-300">Superset / triple / circuit</p>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <input
            value={block.title}
            onChange={(event) => updateBlock(dayNumber, phaseId, block.id, (current) => {
              if (!isCompoundBlock(current)) return current;
              return { ...current, title: event.target.value };
            })}
            placeholder="Compound title"
            className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-600 md:col-span-2"
          />
          <select
            value={block.type}
            onChange={(event) => updateCompoundType(dayNumber, phaseId, block.id, event.target.value as CompoundSetType)}
            className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-600"
          >
            <option value="superset">Super</option>
            <option value="triple">Triple</option>
            <option value="circuit">Circuit</option>
          </select>
          <input
            type="number"
            min={1}
            value={block.rounds}
            onChange={(event) =>
              updateBlock(dayNumber, phaseId, block.id, (current) => {
                if (!isCompoundBlock(current)) return current;
                return { ...current, rounds: Number(event.target.value || 0) };
              })
            }
            placeholder="Round count"
            className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-600"
          />
        </div>
        <div className="mt-4 space-y-3">
          {block.children.map((child, index) => (
            <div key={child.id} className="rounded-lg border border-dashed border-slate-200 p-3 dark:border-slate-700">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black">Exercise {index + 1}</p>
                <button
                  type="button"
                  onClick={() => removeChild(dayNumber, phaseId, block.id, child.id)}
                  disabled={block.children.length <= minChildrenForType(block.type)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-danger hover:bg-danger/10 disabled:opacity-50"
                  aria-label="Remove exercise"
                >
                  <Trash2 aria-hidden="true" size={16} />
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <select
                  value={selectedGroupByItem[child.id] ?? "all"}
                  onChange={(event) => setSelectedGroupByItem((current) => ({ ...current, [child.id]: event.target.value }))}
                  className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-600"
                >
                  <option value="all">همه گروه‌ها</option>
                  {groups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
                <input
                  value={searchByItem[child.id] ?? ""}
                  onChange={(event) => setSearchByItem((current) => ({ ...current, [child.id]: event.target.value }))}
                  placeholder="جستجو حرکت..."
                  className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-600"
                />
                <select
                  value={child.exerciseId}
                  onChange={(event) =>
                    updateChild(dayNumber, phaseId, block.id, child.id, (current) => ({
                      ...current,
                      exerciseId: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-600"
                >
                  <option value="">انتخاب حرکت</option>
                  {loadingExercises ? <option value="">در حال بارگذاری...</option> : null}
                  {getFilteredExercises(child.id).map((exercise: CatalogExercise) => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.name} {exercise.nameEn ? `(${exercise.nameEn})` : ""}
                    </option>
                  ))}
                </select>
                <select
                  value={child.measureType}
                  onChange={(event) =>
                    updateChild(dayNumber, phaseId, block.id, child.id, (current) => {
                      const measureType = event.target.value as MoveMeasureType;
                      return {
                        ...current,
                        measureType,
                        count: measureType === "count" ? current.count ?? 10 : undefined,
                        duration: measureType === "time" ? current.duration ?? 30 : undefined,
                        timeUnit: measureType === "time" ? current.timeUnit ?? "seconds" : undefined,
                      };
                    })
                  }
                  className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-600"
                >
                  <option value="count">Count</option>
                  <option value="time">Time</option>
                </select>
                {child.measureType === "count" ? (
                  <input
                    type="number"
                    min={1}
                    value={child.count ?? ""}
                    onChange={(event) =>
                      updateChild(dayNumber, phaseId, block.id, child.id, (current) => ({ ...current, count: Number(event.target.value || 0) }))
                    }
                    placeholder="تعداد تکرار"
                    className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-600"
                  />
                ) : (
                  <>
                    <input
                      type="number"
                      min={1}
                      value={child.duration ?? ""}
                      onChange={(event) =>
                        updateChild(dayNumber, phaseId, block.id, child.id, (current) => ({ ...current, duration: Number(event.target.value || 0) }))
                      }
                      placeholder="زمان"
                      className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-600"
                    />
                    <select
                      value={child.timeUnit ?? "seconds"}
                      onChange={(event) =>
                        updateChild(dayNumber, phaseId, block.id, child.id, (current) => ({ ...current, timeUnit: event.target.value as TimeUnit }))
                      }
                      className="rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-600"
                    >
                      <option value="seconds">Second</option>
                      <option value="minutes">Minute</option>
                    </select>
                  </>
                )}
              </div>
            </div>
          ))}
          <button type="button" onClick={() => addChild(dayNumber, phaseId, block.id)} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-black text-primary sm:w-auto">
            <Plus aria-hidden="true" size={16} />
            <span>افزودن حرکت به کمپوند</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <AppShell title="ساخت تمپلیت" subtitle="طراحی روزها، فازها، بلوک‌ها و کمپوندها از کتابخانه ادمین">
      <div className="grid gap-4 lg:grid-cols-[0.55fr_1.45fr]">
        <aside className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 lg:p-4">
          <div className="flex gap-2 lg:block">
          {["اطلاعات پایه", "طراحی روزها و فازها", "بازبینی کامل"].map((label, index) => (
            <div key={label} className={`min-w-max rounded-lg px-3 py-2 text-sm font-black lg:mb-2 lg:min-w-0 lg:px-4 lg:py-3 ${step === index + 1 ? "bg-primary/10 text-primary" : "bg-slate-50 dark:bg-slate-800"}`}>
              {index + 1}. {label}
            </div>
          ))}
          </div>
        </aside>
        <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          {step === 1 ? (
            <form onSubmit={handleBaseSubmit}>
              <h2 className="text-xl font-black">اطلاعات پایه تمپلیت</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-bold">
                  عنوان
                  <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-800" />
                </label>
                <label className="text-sm font-bold">
                  سطح سختی
                  <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as DifficultyLevel)} className="mt-2 w-full rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-800">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="elite">Elite</option>
                  </select>
                </label>
                <label className="text-sm font-bold">
                  هدف (اختیاری)
                  <input value={purpose} onChange={(event) => setPurpose(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-800" />
                </label>
                <label className="text-sm font-bold">
                  تعداد روز
                  <input type="number" min={1} max={7} value={daysCount} onChange={(event) => setDaysCount(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-800" />
                </label>
              </div>
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="یادداشت مربی..." className="mt-4 min-h-24 w-full rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-800" />
              <button type="submit" disabled={!baseValid} className="mt-5 w-full rounded-lg bg-secondary px-6 py-3 font-black text-white disabled:opacity-60 sm:w-auto">
                ادامه طراحی روزها
              </button>
            </form>
          ) : null}
          {step === 2 ? (
            <div>
              <h2 className="text-xl font-black">طراحی همه روزها</h2>
              <div className="mt-4 space-y-5">
                {days.map((day) => (
                  <div key={day.dayNumber} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800 sm:p-4">
                    <h3 className="text-lg font-black">روز {day.dayNumber}</h3>
                    {day.phases.map((phase) => (
                      <div key={phase.id} className="mt-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800 sm:p-4">
                        <input
                          value={phase.title}
                          onChange={(event) =>
                            updatePhase(day.dayNumber, phase.id, (currentDay) => ({
                              ...currentDay,
                              title: event.target.value,
                            }))
                          }
                          placeholder="عنوان فاز (مثلا Warmup)"
                          className="w-full rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-600"
                        />
                        {phase.blocks.map((block) => (isCompoundBlock(block) ? renderCompoundBlock(day.dayNumber, phase.id, block) : renderSimpleBlock(day.dayNumber, phase.id, block)))}
                        <button type="button" onClick={() => addBlock(day.dayNumber, phase.id)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-secondary/10 px-3 py-2.5 text-sm font-black text-secondary sm:w-auto">
                          <Plus aria-hidden="true" size={16} />
                          <span>افزودن بلوک</span>
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addPhase(day.dayNumber)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-secondary/10 px-3 py-2.5 text-sm font-black text-secondary sm:w-auto">
                      <Plus aria-hidden="true" size={16} />
                      <span>افزودن فاز</span>
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-3 sm:flex">
                <button type="button" onClick={() => setStep(1)} className="rounded-lg bg-slate-200 px-6 py-3 font-black dark:bg-slate-700">
                  بازگشت
                </button>
                <button type="button" disabled={!canReview} onClick={() => setStep(3)} className="rounded-lg bg-secondary px-6 py-3 font-black text-white disabled:opacity-60">
                  بازبینی نهایی
                </button>
              </div>
            </div>
          ) : null}
          {step === 3 ? (
            <div>
              <h2 className="text-xl font-black">بررسی کامل برنامه</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">قبل از ذخیره، همه روزها/فازها/بلوک‌ها را بررسی کنید.</p>
              <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-700">
                <p>عنوان: {title}</p>
                <p>سطح: {difficulty}</p>
                <p>هدف: {purpose || "—"}</p>
                <p>تعداد روز: {daysCount}</p>
              </div>
              <div className="mt-4 space-y-3">
                {days.map((day) => (
                  <div key={day.dayNumber} className="rounded-lg border border-slate-200 p-4 text-sm dark:border-slate-800">
                    <p className="font-black">روز {day.dayNumber}</p>
                    {day.phases.map((phase) => (
                      <div key={phase.id} className="mt-2">
                        <p className="font-bold">فاز: {phase.title}</p>
                        {phase.blocks.map((block) =>
                          isCompoundBlock(block) ? (
                            <div key={block.id} className="mt-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-700">
                              <p className="font-bold">
                                کمپوند: {block.title} - {block.type} - {block.rounds} دور
                              </p>
                              {block.children.map((child, index) => {
                                const exercise = exerciseCatalog.find((item) => item.id === child.exerciseId);
                                return (
                                  <p key={child.id} className="mt-1">
                                    {index + 1}. {exercise?.name ?? "نامشخص"} - {child.measureType === "count" ? `${child.count ?? 0} تکرار` : `${child.duration ?? 0} ${child.timeUnit ?? "seconds"}`}
                                  </p>
                                );
                              })}
                            </div>
                          ) : (
                            <p key={block.id} className="mt-2">
                              بلوک: {exerciseCatalog.find((item) => item.id === block.exerciseId)?.name ?? "نامشخص"} - {block.sets} ست - {block.measureType === "count" ? `${block.count ?? 0} تکرار` : `${block.duration ?? 0} ${block.timeUnit}`}
                            </p>
                          ),
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              {saved ? <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">تمپلیت ذخیره شد.</p> : null}
              <div className="mt-5 grid gap-3 sm:flex">
                <button type="button" onClick={() => setStep(2)} className="rounded-lg bg-slate-200 px-6 py-3 font-black dark:bg-slate-700">
                  بازگشت
                </button>
                <button type="button" onClick={saveTemplate} className="rounded-lg bg-primary px-6 py-3 font-black text-white">
                  ذخیره تمپلیت
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
