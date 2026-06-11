 "use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDefaultRouteByRole, getRoleFromToken, loginRequest, persistTokens } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isFormValid = useMemo(() => email.trim().length > 0 && password.length >= 8, [email, password]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isFormValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const response = await loginRequest(email.trim(), password);
      persistTokens(response);
      const role = getRoleFromToken(response.accessToken);
      router.push(getDefaultRouteByRole(role));
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "خطای ناشناخته رخ داد.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <h1 className="text-3xl font-black">ورود به FitCoach</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">با ایمیل و رمز عبور وارد پنل خود شوید.</p>
        <label className="mt-6 block text-sm font-bold">ایمیل</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 outline-none focus:border-primary dark:border-slate-700"
        />
        <label className="mt-4 block text-sm font-bold">رمز عبور</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 outline-none focus:border-primary dark:border-slate-700"
        />
        {error ? <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-200">{error}</p> : null}
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="mt-6 w-full rounded-2xl bg-primary py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "در حال ورود..." : "ورود"}
        </button>
        <p className="mt-5 text-center text-sm text-slate-500">
          حساب ندارید؟ <Link href="/register" className="font-black text-primary">ثبت‌نام کنید</Link>
        </p>
      </form>
    </main>
  );
}
