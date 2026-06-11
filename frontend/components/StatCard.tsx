export function StatCard({ label, value, accent = "primary" }: { label: string; value: string; accent?: "primary" | "secondary" | "success" | "warning" }) {
  const accentClass = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
  }[accent];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className={`mb-3 inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${accentClass}`}>{label}</div>
      <div className="text-3xl font-black">{value}</div>
    </div>
  );
}
