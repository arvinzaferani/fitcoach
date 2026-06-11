"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PersianDateRangePicker } from "@/components/DateTimePicker";
import {
  createCoachAssignment,
  getCoachAssignments,
  getCoachAthletes,
  getCoachTemplates,
  type CoachAssignmentItem,
  type CoachAthleteItem,
  type CoachTemplateItem,
} from "@/lib/api";

const persianDateTimeFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Tehran",
});

export default function AssignPage() {
  const [athleteId, setAthleteId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [message, setMessage] = useState("");
  const [athletes, setAthletes] = useState<CoachAthleteItem[]>([]);
  const [templates, setTemplates] = useState<CoachTemplateItem[]>([]);
  const [assignedPlans, setAssignedPlans] = useState<CoachAssignmentItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getCoachAthletes().then(setAthletes).catch(() => setAthletes([]));
    getCoachTemplates().then(setTemplates).catch(() => setTemplates([]));
    getCoachAssignments().then(setAssignedPlans).catch(() => setAssignedPlans([]));
  }, []);

  const selectedTemplate = useMemo(() => templates.find((template) => template.id === templateId), [templateId, templates]);

  async function handleAssign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!athleteId || !selectedTemplate || !startDate || !endDate || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    try {
      const nextPlan = await createCoachAssignment({
        athleteId,
        templateId: selectedTemplate.id,
        startDate,
        endDate,
      });
      setAssignedPlans((current) => [nextPlan, ...current]);
      setTemplates((current) =>
        current.map((template) => (template.id === selectedTemplate.id ? { ...template, usage: template.usage + 1 } : template)),
      );
      setAthleteId("");
      setTemplateId("");
      setStartDate(undefined);
      setEndDate(undefined);
      setMessage("پلن برای ورزشکار ثبت شد.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ثبت تخصیص ناموفق بود.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell title="تخصیص برنامه" subtitle="انتخاب شاگرد، تمپلیت، تاریخ و کاستومایز قبل از تخصیص">
      <form onSubmit={handleAssign} className="rounded-xl border border-slate-200 bg-white p-5  dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-bold">شاگرد
            <select value={athleteId} onChange={(event) => setAthleteId(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-800">
              <option value="">انتخاب شاگرد</option>
              {athletes.map((athlete) => <option key={athlete.id} value={athlete.id}>{athlete.fullName}</option>)}
            </select>
          </label>
          <label className="text-sm font-bold">تمپلیت
            <select value={templateId} onChange={(event) => setTemplateId(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-transparent px-4 py-3 dark:border-slate-800">
              <option value="">انتخاب تمپلیت</option>
              {templates.map((template) => <option key={template.id} value={template.id}>{template.title}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-4">
          <PersianDateRangePicker
            from={startDate}
            to={endDate}
            showTime={false}
            onChange={({ from, to }) => {
              setStartDate(from);
              setEndDate(to);
            }}
          />
        </div>
        {selectedTemplate ? (
          <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-700">
            <p className="font-black">پیش‌نمایش تمپلیت انتخاب‌شده</p>
            <p className="mt-1">روزها: {selectedTemplate.daysCount} • سطح: {selectedTemplate.difficulty}</p>
          </div>
        ) : null}
        {startDate && endDate ? (
          <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-700">
            <p className="font-black">بازه انتخاب‌شده</p>
            <p className="mt-1">
              از {persianDateTimeFormatter.format(new Date(startDate))} تا {persianDateTimeFormatter.format(new Date(endDate))}
            </p>
          </div>
        ) : null}
        {message ? <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
        <button type="submit" disabled={isSubmitting} className="mt-6 rounded-lg bg-primary px-6 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? "در حال ثبت..." : "ساخت پلن برای شاگرد"}
        </button>
      </form>
      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5  dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xl font-black">پلن‌های تخصیص داده‌شده (مستقل از تمپلیت)</h2>
        <div className="mt-3 space-y-3">
          {assignedPlans.map((plan) => (
            <div key={plan.id} className="rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-700">
              <p className="font-black">{plan.athleteName} ← {plan.templateTitle}</p>
              <p className="mt-1">
                از {persianDateTimeFormatter.format(new Date(plan.startDate))} تا {persianDateTimeFormatter.format(new Date(plan.endDate))}
              </p>
              <p className="mt-1">وضعیت: {plan.status}</p>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
