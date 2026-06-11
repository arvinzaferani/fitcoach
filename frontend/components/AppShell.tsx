"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { clearAccessToken, getRoleFromToken, getStoredAccessToken } from "@/lib/auth";

const navItems = [
  { href: "/admin/exercises", label: "مدیریت حرکات", roles: ["admin"] },
  { href: "/coach/dashboard", label: "داشبورد مربی", roles: ["coach"] },
  { href: "/coach/athletes", label: "شاگردان", roles: ["coach"] },
  { href: "/coach/templates", label: "تمپلیت‌ها", roles: ["coach"] },
  { href: "/coach/assign", label: "تخصیص برنامه", roles: ["coach"] },
  { href: "/athlete/dashboard", label: "پنل ورزشکار", roles: ["athlete"] },
  { href: "/athlete/metrics", label: "متریک‌ها", roles: ["athlete"] },
];

export function AppShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const role = getRoleFromToken(getStoredAccessToken() ?? "");
  const visibleNavItems = navItems.filter((item) => role && item.roles.includes(role));

  function handleLogout() {
    clearAccessToken();
    router.push("/login");
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--background)]">
      <aside className="fixed right-0 top-0 hidden h-full w-64 border-l border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:block">
        <Link href="/" className="text-xl font-black text-primary">
          FitCoach
        </Link>
        <nav className="mt-7 space-y-1.5">
          {visibleNavItems.map((item) => (
            <Link key={item.href} href={item.href} className={`block rounded-lg px-3 py-2.5 text-sm font-semibold transition ${pathname === item.href ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"}`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <button type="button" onClick={handleLogout} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 px-3 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40">
          <LogOut aria-hidden="true" size={16} />
          <span>خروج از حساب</span>
        </button>
      </aside>
      {mobileOpen ? (
        <div className="fixed inset-0 z-30 bg-black/35 backdrop-blur-[1px] lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-[min(18rem,calc(100vw-2rem))] border-l border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <Link href="/" className="text-xl font-black text-primary" onClick={() => setMobileOpen(false)}>
                FitCoach
              </Link>
              <button type="button" onClick={() => setMobileOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-100" aria-label="Close menu">
                <X aria-hidden="true" size={18} />
              </button>
            </div>
            <nav className="space-y-1.5">
              {visibleNavItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`block rounded-lg px-3 py-3 text-sm font-semibold ${pathname === item.href ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white" : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"}`}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <button type="button" onClick={handleLogout} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 px-3 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40">
              <LogOut aria-hidden="true" size={16} />
              <span>خروج از حساب</span>
            </button>
          </div>
        </div>
      ) : null}
      <main className="lg:pr-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-[var(--background)]/95 px-3 py-3 backdrop-blur dark:border-slate-800 sm:px-5">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button type="button" onClick={() => setMobileOpen(true)} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-100 lg:hidden" aria-label="Open menu">
                <Menu aria-hidden="true" size={19} />
              </button>
              <div className="min-w-0">
              <h1 className="truncate text-lg font-black sm:text-2xl">{title}</h1>
              {subtitle ? <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-300 sm:text-sm">{subtitle}</p> : null}
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <section className="mx-auto max-w-6xl px-3 py-4 sm:px-5 sm:py-6">{children}</section>
      </main>
      </div>
    </AuthGuard>
  );
}
