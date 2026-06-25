import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Activity, BarChart3, Dumbbell, Users } from "lucide-react";

const features = [
  { icon: Dumbbell, title: "طراحی تمپلیت", desc: "تمپلیت‌های چند هفته‌ای با فاز، بلوک و ست‌های متنوع" },
  { icon: Users, title: "مدیریت شاگردان", desc: "دعوت، تخصیص برنامه و پیگیری پیشرفت هر شاگرد" },
  { icon: BarChart3, title: "ثبت تمرین و RPE", desc: "ثبت وزنه، تکرار و میزان سختی هر ست" },
  { icon: Activity, title: "نمودار متریک‌ها", desc: "پیگیری وزن، چربی بدن و توده عضلانی در طول زمان" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--background)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xl font-black text-primary">
            <Activity size={24} />
            FitCoach
          </div>
          <ThemeToggle />
        </header>

        <section className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-black text-primary">
              <Dumbbell size={14} />
              پلتفرم مربی و ورزشکار
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">
              برنامه تمرینی، متریک‌ها و پیشرفت شاگردان را یکجا مدیریت کنید.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text-secondary)]">
              مربی تمپلیت می‌سازد، برنامه را برای هر ورزشکار شخصی‌سازی می‌کند و ورزشکار تمرین روزانه، تایمر استراحت و ثبت ست‌ها را در پنل خود دارد.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-2xl bg-primary px-7 py-3.5 font-black text-white shadow-float transition-all active:scale-[0.98]"
              >
                ورود
              </Link>
              <Link
                href="/register"
                className="rounded-2xl border border-[var(--border)] px-7 py-3.5 font-bold text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-hover)]"
              >
                ثبت‌نام
              </Link>
            </div>
          </div>

          <div className="grid gap-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-card transition-all hover:shadow-card-hover"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon size={22} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">{feature.title}</h3>
                  <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
