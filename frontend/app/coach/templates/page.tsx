"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  getCoachTemplates,
  getCoachTemplate,
  type CoachTemplateItem,
  type CoachTemplateDetailResponse,
} from "@/lib/api";

const difficultyLabels: Record<string, string> = {
  beginner: "مبتدی",
  intermediate: "متوسط",
  advanced: "پیشرفته",
  elite: "حرفه‌ای",
};

const compoundTypeLabels: Record<string, string> = {
  superset: "سوپرست",
  triple: "تری‌ست",
  circuit: "سیرکت",
};

function formatExerciseDetail(block: { measureType?: string; count?: number; duration?: number; timeUnit?: string }) {
  if (block.measureType === "time" && typeof block.duration === "number") {
    return `${block.duration} ${block.timeUnit === "minutes" ? "دقیقه" : "ثانیه"}`;
  }
  if (typeof block.count === "number") {
    return `${block.count} تکرار`;
  }
  return "—";
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<CoachTemplateItem[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CoachTemplateDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    getCoachTemplates().then(setTemplates).catch(() => setTemplates([]));
  }, []);

  useEffect(() => {
    if (!selectedTemplateId) {
      setDetail(null);
      setDetailError("");
      return;
    }
    setDetailLoading(true);
    setDetailError("");
    getCoachTemplate(selectedTemplateId)
      .then((data) => {
        setDetail(data);
      })
      .catch((err) => {
        setDetailError(err instanceof Error ? err.message : "خطا در دریافت اطلاعات تمپلیت.");
      })
      .finally(() => setDetailLoading(false));
  }, [selectedTemplateId]);

  return (
    <AppShell title="کتابخانه تمپلیت‌ها" subtitle="ساخت، کپی، ویرایش و پیش‌نمایش برنامه‌های تمرینی">
      <div className="mb-5 flex justify-end">
        <Link href="/coach/templates/create" className="rounded-lg bg-primary px-5 py-3 font-black text-white">
          ساخت تمپلیت جدید
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {templates.map((template) => (
          <article key={template.id} className="rounded-xl border border-slate-200 bg-white p-5  dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-black">{template.title}</h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">
              {template.daysCount} روز تمرین در هفته • سطح {template.difficulty}
            </p>
            <div className="mt-5 flex items-center justify-between">
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-black text-success">{template.usage} استفاده</span>
              <button type="button" onClick={() => setSelectedTemplateId(template.id)} className="font-black text-primary">
                پیش‌نمایش
              </button>
            </div>
          </article>
        ))}
      </div>
      {selectedTemplateId ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 p-5" onClick={() => setSelectedTemplateId(null)}>
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            {detailLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : detailError ? (
              <div className="py-8 text-center text-sm text-danger">{detailError}</div>
            ) : detail ? (
              <>
                <h3 className="text-2xl font-black">{detail.title}</h3>
                <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-300">
                  <span>سطح: {difficultyLabels[detail.difficulty] ?? detail.difficulty}</span>
                  <span>•</span>
                  <span>{detail.daysCount} روز تمرین در هفته</span>
                  <span>•</span>
                  <span>{detail.usage} استفاده</span>
                </div>
                {detail.purpose ? (
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">هدف: {detail.purpose}</p>
                ) : null}
                {detail.notes ? (
                  <div className="mt-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {detail.notes}
                  </div>
                ) : null}

                {detail.plan.length > 0 ? (
                  <div className="mt-5 space-y-4">
                    <h4 className="text-lg font-black">برنامه تمرینی</h4>
                    {detail.plan.map((day) => (
                      <div key={day.dayNumber} className="rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-800">
                          <span className="font-black">روز {day.dayNumber}</span>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                          {day.phases.map((phase) => (
                            <div key={phase.id} className="px-4 py-3">
                              <p className="mb-2 text-sm font-bold text-slate-400">{phase.title}</p>
                              <div className="space-y-2">
                                {phase.blocks.map((block) =>
                                  block.kind === "compound" ? (
                                    <div key={block.id} className="rounded-lg bg-primary/5 p-3">
                                      <div className="mb-1.5 flex items-center gap-2 text-xs">
                                        <span className="rounded bg-primary/15 px-2 py-0.5 font-black text-primary">
                                          {compoundTypeLabels[block.type ?? "superset"] ?? block.type}
                                        </span>
                                        <span className="text-slate-400">{block.rounds ?? 1} دور</span>
                                      </div>
                                      {block.notes ? (
                                        <p className="mb-1.5 text-xs text-slate-500 dark:text-slate-400">{block.notes}</p>
                                      ) : null}
                                      <div className="space-y-1.5">
                                        {block.children?.map((child) => (
                                          <div key={child.id}>
                                            <div className="flex items-center justify-between text-sm">
                                              <div className="flex items-center gap-2">
                                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                <span className="font-bold">{child.exerciseName}</span>
                                                {child.muscleGroup ? (
                                                  <span className="text-xs text-slate-400">{child.muscleGroup}</span>
                                                ) : null}
                                              </div>
                                              <span className="text-xs text-slate-500">{formatExerciseDetail(child)}</span>
                                            </div>
                                            {child.notes ? (
                                              <p className="mr-3.5 mt-0.5 text-xs text-slate-400">{child.notes}</p>
                                            ) : null}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <div key={block.id}>
                                      <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold">{block.exerciseName}</span>
                                          {block.muscleGroup ? (
                                            <span className="text-xs text-slate-400">{block.muscleGroup}</span>
                                          ) : null}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                          <span>{block.sets ?? 1}×{formatExerciseDetail(block)}</span>
                                        </div>
                                      </div>
                                      {block.notes ? (
                                        <p className="ml-3.5 mt-0.5 text-xs text-slate-400">{block.notes}</p>
                                      ) : null}
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-400 dark:bg-slate-800">
                    این تمپلیت هنوز برنامه تمرینی ندارد.
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedTemplateId(null)}
                  className="mt-6 w-full rounded-lg bg-primary px-5 py-2.5 font-black text-white"
                >
                  بستن
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
