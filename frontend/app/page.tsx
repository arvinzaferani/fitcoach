import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--background)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6">
        <header className="flex items-center justify-between">
          <div className="text-2xl font-black text-primary">FitCoach</div>
          <ThemeToggle />
        </header>
        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-5 inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-black text-primary">پلتفرم مربی و ورزشکار</div>
            <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">
              برنامه تمرینی، متریک‌ها و پیشرفت شاگردان را یکجا مدیریت کنید.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-500 dark:text-slate-300">
              مربی تمپلیت می‌سازد، برنامه را برای هر ورزشکار شخصی‌سازی می‌کند و ورزشکار تمرین روزانه، تایمر استراحت و ثبت ست‌ها را در پنل خود دارد.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="rounded-2xl bg-primary px-6 py-3 font-black text-white shadow-lg shadow-indigo-500/20">
                ورود
              </Link>
              <Link href="/register" className="rounded-2xl bg-secondary px-6 py-3 font-black text-white shadow-lg shadow-orange-500/20">
                ثبت‌نام
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
            {["طراحی تمپلیت چند هفته‌ای", "تخصیص و کاستومایز برنامه", "ثبت تمرین و RPE", "نمودار متریک‌های بدن"].map((item) => (
              <div key={item} className="mb-3 rounded-3xl bg-slate-50 p-5 font-black last:mb-0 dark:bg-slate-700">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
