import type { AthleteSummary, MetricPoint, WorkoutExercise } from "@/types/domain";

export const athletes: AthleteSummary[] = [
  {
    id: "ath-1",
    fullName: "نیما رضایی",
    level: "intermediate",
    goal: "muscle_gain",
    lastMetricDate: "۱۴۰۳/۰۸/۱۲",
    activeProgram: "هایپرتروفی ۴ هفته‌ای",
  },
  {
    id: "ath-2",
    fullName: "سارا محمدی",
    level: "beginner",
    goal: "weight_loss",
    lastMetricDate: "۱۴۰۳/۰۸/۱۰",
    activeProgram: "فول‌بادی مقدماتی",
  },
];

export const todayWorkout: WorkoutExercise[] = [
  {
    id: "ex-1",
    exerciseName: "اسکوات هالتر",
    sets: 4,
    repsRange: "۸ تا ۱۰",
    restSeconds: 90,
    muscleGroup: "پا",
    status: "in-progress",
  },
  {
    id: "ex-2",
    exerciseName: "پرس سینه دمبل",
    sets: 3,
    repsRange: "۱۰ تا ۱۲",
    restSeconds: 75,
    muscleGroup: "سینه",
    status: "pending",
  },
  {
    id: "ex-3",
    exerciseName: "لت پول‌داون",
    sets: 3,
    repsRange: "۱۲",
    restSeconds: 60,
    muscleGroup: "پشت",
    status: "pending",
  },
];

export const weightMetrics: MetricPoint[] = [
  { date: new Date("2024-10-01"), value: 82.4 },
  { date: new Date("2024-10-08"), value: 81.9 },
  { date: new Date("2024-10-15"), value: 81.1 },
  { date: new Date("2024-10-22"), value: 80.7 },
  { date: new Date("2024-10-29"), value: 80.2 },
];

export const templates = [
  { id: "tpl-1", title: "هایپرتروفی ۴ هفته‌ای", days: 4, level: "متوسط", usage: 18 },
  { id: "tpl-2", title: "قدرت پایه", days: 3, level: "مبتدی", usage: 11 },
  { id: "tpl-3", title: "چربی‌سوزی فول‌بادی", days: 5, level: "پیشرفته", usage: 7 },
];
