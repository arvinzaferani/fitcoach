"use client";

export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "elite";
export type MoveMeasureType = "count" | "time";
export type TimeUnit = "seconds" | "minutes";
export type CompoundSetType = "superset" | "triple" | "circuit";

export type TemplateExerciseBase = {
  id: string;
  exerciseId: string;
  measureType: MoveMeasureType;
  count?: number;
  duration?: number;
  timeUnit?: TimeUnit;
  notes?: string;
};

export type TemplateSimpleBlock = TemplateExerciseBase & {
  kind?: "exercise";
  sets: number;
};

export type TemplateCompoundChild = TemplateExerciseBase & {
  kind?: "exercise";
};

export type TemplateCompoundBlock = {
  id: string;
  kind: "compound";
  title: string;
  type: CompoundSetType;
  rounds: number;
  children: TemplateCompoundChild[];
  notes?: string;
};

export type TemplateBlock = TemplateSimpleBlock | TemplateCompoundBlock;

export type TemplatePhase = {
  id: string;
  title: string;
  blocks: TemplateBlock[];
};

export type TemplateDayPlan = {
  dayNumber: number;
  phases: TemplatePhase[];
};

export type CoachTemplate = {
  id: string;
  title: string;
  difficulty: DifficultyLevel;
  purpose?: string;
  daysCount: number;
  notes?: string;
  days: TemplateDayPlan[];
  usage: number;
};

export type AssignedPlan = {
  id: string;
  athleteName: string;
  templateId: string;
  templateTitle: string;
  startDate: string;
  endDate: string;
  days: TemplateDayPlan[];
};

const TEMPLATE_KEY = "fitcoach_templates_v2";
const PLAN_KEY = "fitcoach_assigned_plans_v1";

const defaults: CoachTemplate[] = [
  { id: "tpl-1", title: "هایپرتروفی ۴ هفته‌ای", difficulty: "intermediate", purpose: "muscle_gain", daysCount: 4, notes: "", days: [], usage: 18 },
  { id: "tpl-2", title: "قدرت پایه", difficulty: "beginner", purpose: "strength", daysCount: 3, notes: "", days: [], usage: 11 },
];

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getTemplates(): CoachTemplate[] {
  if (typeof window === "undefined") return defaults;
  return parseJson<CoachTemplate[]>(localStorage.getItem(TEMPLATE_KEY), defaults);
}

export function saveTemplates(templates: CoachTemplate[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TEMPLATE_KEY, JSON.stringify(templates));
}

export function getAssignedPlans(): AssignedPlan[] {
  if (typeof window === "undefined") return [];
  return parseJson<AssignedPlan[]>(localStorage.getItem(PLAN_KEY), []);
}

export function saveAssignedPlans(plans: AssignedPlan[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PLAN_KEY, JSON.stringify(plans));
}

