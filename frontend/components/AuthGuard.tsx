"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  clearAccessToken,
  getDefaultRouteByRole,
  getRoleFromToken,
  getStoredAccessToken,
  getStoredRefreshToken,
  isTokenUsable,
  refreshAccessToken,
  type UserRole,
} from "@/lib/auth";

const routeRoleMap: Array<{ prefix: string; role: UserRole }> = [
  { prefix: "/admin", role: "admin" },
  { prefix: "/coach", role: "coach" },
  { prefix: "/athlete", role: "athlete" },
];

function getRequiredRole(pathname: string) {
  return routeRoleMap.find((item) => pathname.startsWith(item.prefix))?.role;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const requiredRole = useMemo(() => getRequiredRole(pathname), [pathname]);

  useEffect(() => {
    let cancelled = false;

    async function validate() {
      const accessToken = getStoredAccessToken();
      const refreshToken = getStoredRefreshToken();

      if (!accessToken || !refreshToken || !isTokenUsable(refreshToken)) {
        clearAccessToken();
        router.replace("/login");
        return;
      }

      let currentToken = accessToken;
      if (!isTokenUsable(accessToken)) {
        try {
          const refreshed = await refreshAccessToken();
          currentToken = refreshed.accessToken;
        } catch {
          clearAccessToken();
          router.replace("/login");
          return;
        }
      }

      const role = getRoleFromToken(currentToken);
      if (!role) {
        clearAccessToken();
        router.replace("/login");
        return;
      }

      if (requiredRole && role !== requiredRole) {
        router.replace(getDefaultRouteByRole(role));
        return;
      }

      if (!cancelled) {
        setReady(true);
      }
    }

    setReady(false);
    void validate();

    return () => {
      cancelled = true;
    };
  }, [requiredRole, router, pathname]);

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">در حال بررسی دسترسی...</div>;
  }

  return <>{children}</>;
}
