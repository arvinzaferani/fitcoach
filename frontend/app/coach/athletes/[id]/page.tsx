import { AppShell } from "@/components/AppShell";
import { MetricChart } from "@/components/MetricChart";
import { StatCard } from "@/components/StatCard";
import { weightMetrics } from "@/lib/mock-data";

export default function AthleteProfilePage() {
  return (
    <AppShell title="پروفایل شاگرد" subtitle="اطلاعات کامل، متریک‌ها، نمودارها و برنامه فعال">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="سطح" value="متوسط" />
        <StatCard label="هدف" value="عضله‌سازی" accent="secondary" />
        <StatCard label="روز تمرین" value="۴ روز" accent="success" />
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <MetricChart data={weightMetrics} type="weight" period="month" />
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-xl font-black">برنامه فعال</h2>
          <div className="mt-4 rounded-2xl bg-slate-50 p-5 dark:bg-slate-700">
            <strong>هایپرتروفی ۴ هفته‌ای</strong>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">امکان کاستومایز بعد از تخصیص و افزودن یادداشت شخصی برای هر حرکت.</p>
          </div>
          <button className="mt-5 rounded-2xl bg-primary px-5 py-3 font-black text-white">تخصیص برنامه جدید</button>
        </section>
      </div>
    </AppShell>
  );
}
