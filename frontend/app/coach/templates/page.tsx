"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { getCoachTemplates, type CoachTemplateItem } from "@/lib/api";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<CoachTemplateItem[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  useEffect(() => {
    getCoachTemplates().then(setTemplates).catch(() => setTemplates([]));
  }, []);

  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) ?? null;

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
      {selectedTemplate ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 p-5" onClick={() => setSelectedTemplateId(null)}>
          <div className="w-full max-w-xl rounded-xl bg-white p-6 dark:bg-slate-900" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-2xl font-black">{selectedTemplate.title}</h3>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">سطح: {selectedTemplate.difficulty}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">روز تمرین در هفته: {selectedTemplate.daysCount}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">تعداد استفاده: {selectedTemplate.usage}</p>
            {selectedTemplate.purpose ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">هدف: {selectedTemplate.purpose}</p> : null}
            <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-700">
              {selectedTemplate.notes ? selectedTemplate.notes : "بدون یادداشت"}
            </div>
            <button type="button" onClick={() => setSelectedTemplateId(null)} className="mt-6 rounded-lg bg-primary px-5 py-2 font-black text-white">
              بستن
            </button>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
