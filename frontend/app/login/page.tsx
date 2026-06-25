"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getDefaultRouteByRole, getRoleFromToken, loginRequest, persistTokens } from "@/lib/auth";
import { Activity } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isFormValid = useMemo(() => email.trim().length > 0 && password.length >= 8, [email, password]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isFormValid || isSubmitting) return;

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
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Activity size={28} className="text-primary" />
          </div>
          <h1 className="text-3xl font-black">ورود</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">به پنل FitCoach وارد شوید</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-bold">ایمیل</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="your@email.com"
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold">رمز عبور</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              placeholder="حداقل ۸ کاراکتر"
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {error ? (
            <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full rounded-2xl bg-primary py-3.5 font-black text-white shadow-card transition-all duration-200 hover:bg-primary-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "در حال ورود..." : "ورود"}
          </button>

          <p className="text-center text-sm text-[var(--text-muted)]">
            حساب ندارید؟{" "}
            <Link href="/register" className="font-bold text-primary transition-colors hover:text-primary-dark">
              ثبت‌نام کنید
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
