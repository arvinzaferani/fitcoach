"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  CalendarCheck,
  ChevronLeft,
  ClipboardList,
  Dumbbell,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Trophy,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { clearAccessToken, getRoleFromToken, getStoredAccessToken } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [
  { href: "/admin/exercises", label: "مدیریت حرکات", icon: <Dumbbell size={20} />, roles: ["admin"] },
  { href: "/coach/dashboard", label: "داشبورد", icon: <LayoutDashboard size={20} />, roles: ["coach"] },
  { href: "/coach/athletes", label: "شاگردان", icon: <Users size={20} />, roles: ["coach"] },
  { href: "/coach/templates", label: "تمپلیت‌ها", icon: <ClipboardList size={20} />, roles: ["coach"] },
  { href: "/coach/assign", label: "تخصیص برنامه", icon: <CalendarCheck size={20} />, roles: ["coach"] },
  { href: "/athlete/dashboard", label: "خانه", icon: <Home size={20} />, roles: ["athlete"] },
  { href: "/athlete/workout", label: "تمرین", icon: <Dumbbell size={20} />, roles: ["athlete"] },
  { href: "/athlete/coaches", label: "مربی‌ها", icon: <UserCircle size={20} />, roles: ["athlete"] },
  { href: "/athlete/metrics", label: "پیشرفت", icon: <BarChart3 size={20} />, roles: ["athlete"] },
];

const bottomTabItems: NavItem[] = [
  { href: "/athlete/dashboard", label: "خانه", icon: <Home size={22} />, roles: ["athlete"] },
  { href: "/athlete/workout", label: "تمرین", icon: <Dumbbell size={22} />, roles: ["athlete"] },
  { href: "/athlete/metrics", label: "پیشرفت", icon: <BarChart3 size={22} />, roles: ["athlete"] },
  { href: "/coach/dashboard", label: "داشبورد", icon: <LayoutDashboard size={22} />, roles: ["coach"] },
  { href: "/coach/athletes", label: "شاگردان", icon: <Users size={22} />, roles: ["coach"] },
  { href: "/coach/templates", label: "تمپلیت‌ها", icon: <ClipboardList size={22} />, roles: ["coach"] },
];

export function AppShell({
  children,
  title,
  subtitle,
  hideNav,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  hideNav?: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const role = getRoleFromToken(getStoredAccessToken() ?? "");
  const visibleNavItems = navItems.filter((item) => role && item.roles.includes(role));
  const visibleTabs = bottomTabItems.filter((item) => role && item.roles.includes(role));

  const isWorkoutPlayer = pathname.startsWith("/athlete/workout/") && pathname !== "/athlete/workout";

  function handleLogout() {
    clearAccessToken();
    router.push("/login");
  }

  function isActive(href: string) {
    if (href === "/athlete/dashboard" || href === "/coach/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--background)] pb-20 lg:pb-0">
        {/* Desktop Sidebar */}
        <aside className="fixed right-0 top-0 z-20 hidden h-full w-64 border-l border-[var(--border)] bg-[var(--surface)] p-5 lg:block">
          <Link href="/" className="flex items-center gap-2.5 text-xl font-black text-primary">
            <Activity size={24} className="text-primary" />
            FitCoach
          </Link>
          <nav className="mt-8 space-y-1">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="absolute bottom-5 left-5 right-5 space-y-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm font-bold text-danger transition-colors hover:bg-[var(--danger-light)]"
            >
              <LogOut size={16} />
              <span>خروج</span>
            </button>
          </div>
        </aside>

        {/* Mobile Sidebar Drawer */}
        {mobileOpen ? (
          <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)}>
            <div
              className="absolute right-0 top-0 h-full w-[min(18rem,calc(100vw-2rem))] border-l border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-xl font-black text-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  <Activity size={22} />
                  FitCoach
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-secondary)]"
                  aria-label="بستن منو"
                >
                  <X size={18} />
                </button>
              </div>
              <nav className="space-y-1">
                {visibleNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors",
                      isActive(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </nav>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-3 py-3 text-sm font-bold text-danger transition-colors hover:bg-[var(--danger-light)]"
              >
                <LogOut size={16} />
                <span>خروج</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* Main Content */}
        <main className={cn("lg:pr-64", hideNav && "pb-0")}>
          {/* Header */}
          <header
            className={cn(
              "sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)]/80 px-3 py-3 backdrop-blur-xl sm:px-5",
              isWorkoutPlayer && "hidden",
            )}
          >
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-secondary)] lg:hidden"
                  aria-label="باز کردن منو"
                >
                  <Menu size={19} />
                </button>
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-black sm:text-2xl">{title}</h1>
                  {subtitle ? (
                    <p className="mt-0.5 line-clamp-1 text-xs text-[var(--text-secondary)] sm:text-sm">{subtitle}</p>
                  ) : null}
                </div>
              </div>
              <div className="hidden lg:block">
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <section className="mx-auto max-w-6xl px-3 py-4 sm:px-5 sm:py-6">{children}</section>
        </main>

        {/* Mobile Bottom Navigation */}
        {!hideNav && !isWorkoutPlayer && (
          <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--border)] bg-[var(--surface)]/95 px-2 pb-safe backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-around py-1.5">
              {visibleTabs.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-semibold transition-colors duration-200",
                    isActive(item.href)
                      ? "text-primary"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </AuthGuard>
  );
}
