 "use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getDefaultRouteByRole, getRoleFromToken, persistTokens, registerRequest } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"athlete" | "coach">("athlete");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isFormValid = useMemo(
    () => fullName.trim().length > 1 && email.trim().length > 0 && password.length >= 8,
    [email, fullName, password],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isFormValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const response = await registerRequest({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        role,
      });
      persistTokens(response);
      const userRole = getRoleFromToken(response.accessToken);
      router.push(getDefaultRouteByRole(userRole));
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "خطای ناشناخته رخ داد.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">ثبت‌نام چندمرحله‌ای</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">اطلاعات پایه و پروفایل ورزشی را تکمیل کنید.</p>
          </div>
          <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-black text-primary">مرحله ۱ از ۲</span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-bold">
            نام کامل
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 outline-none focus:border-primary dark:border-slate-700"
            />
          </label>
          <label className="block text-sm font-bold">
            ایمیل
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 outline-none focus:border-primary dark:border-slate-700"
            />
          </label>
          <label className="block text-sm font-bold">
            رمز عبور
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 outline-none focus:border-primary dark:border-slate-700"
            />
          </label>
          <label className="block text-sm font-bold">
            شماره موبایل
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 outline-none focus:border-primary dark:border-slate-700"
            />
          </label>
          <label className="block text-sm font-bold">
            نقش
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as "athlete" | "coach")}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 outline-none focus:border-primary dark:border-slate-700"
            >
              <option value="athlete">ورزشکار</option>
              <option value="coach">مربی</option>
            </select>
          </label>
          <label className="block text-sm font-bold">
            سطح آمادگی
            <select className="mt-2 w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 outline-none focus:border-primary dark:border-slate-700">
              <option>مبتدی</option>
              <option>متوسط</option>
              <option>پیشرفته</option>
              <option>حرفه‌ای</option>
            </select>
          </label>
        </div>
        {error ? <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-200">{error}</p> : null}
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="mt-6 rounded-2xl bg-secondary px-6 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "در حال ثبت‌نام..." : "تکمیل ثبت‌نام"}
        </button>
      </form>
    </main>
  );
}
