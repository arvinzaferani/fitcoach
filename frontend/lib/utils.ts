export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function goalLabel(goal: string) {
  const labels: Record<string, string> = {
    weight_loss: "کاهش وزن",
    muscle_gain: "افزایش عضله",
    strength: "قدرت",
    endurance: "استقامت",
    general_fitness: "تناسب عمومی",
  };
  return labels[goal] ?? goal;
}

export function levelLabel(level: string) {
  const labels: Record<string, string> = {
    beginner: "مبتدی",
    intermediate: "متوسط",
    advanced: "پیشرفته",
    elite: "حرفه‌ای",
  };
  return labels[level] ?? level;
}
