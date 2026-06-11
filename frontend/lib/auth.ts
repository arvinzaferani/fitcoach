const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
const ACCESS_TOKEN_KEY = "fitcoach_access_token";
const REFRESH_TOKEN_KEY = "fitcoach_refresh_token";

type AuthPayload = {
  accessToken: string;
  refreshToken: string;
};

export type UserRole = "admin" | "coach" | "athlete";
export type TokenPayload = {
  sub?: string;
  email?: string;
  role?: UserRole;
  exp?: number;
  iat?: number;
};

function parseJsonSafely<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function decodeJwtPayload(token: string): TokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const decoded = atob(padded);
    return parseJsonSafely<TokenPayload>(decoded);
  } catch {
    return null;
  }
}

export function getDefaultRouteByRole(role: UserRole | undefined) {
  if (role === "admin") {
    return "/admin/exercises";
  }
  if (role === "coach") {
    return "/coach/dashboard";
  }
  if (role === "athlete") {
    return "/athlete/dashboard";
  }
  return "/";
}

export function getRoleFromToken(token: string): UserRole | undefined {
  return decodeJwtPayload(token)?.role;
}

export function getStoredAccessToken() {
  return typeof window === "undefined" ? null : localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getStoredRefreshToken() {
  return typeof window === "undefined" ? null : localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function persistTokens(tokens: AuthPayload) {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function logoutAndRedirect(target = "/login") {
  clearAccessToken();
  if (typeof window !== "undefined" && window.location.pathname !== target) {
    window.location.replace(target);
  }
}

export function isTokenExpired(token: string, skewSeconds = 15) {
  const exp = decodeJwtPayload(token)?.exp;
  if (!exp) {
    return true;
  }

  return exp <= Math.floor(Date.now() / 1000) + skewSeconds;
}

export function isTokenUsable(token: string) {
  const payload = decodeJwtPayload(token);
  return Boolean(payload?.sub && payload?.role && payload?.exp && !isTokenExpired(token, 0));
}

export async function refreshAccessToken() {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken || !isTokenUsable(refreshToken)) {
    logoutAndRedirect();
    throw new Error("نشست شما منقضی شده است.");
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data?.accessToken || !data?.refreshToken) {
    logoutAndRedirect();
    throw new Error("نشست شما معتبر نیست. دوباره وارد شوید.");
  }

  persistTokens(data as AuthPayload);
  return data as AuthPayload;
}

async function postAuth<TBody>(path: string, body: TBody): Promise<AuthPayload> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data?.message === "string" ? data.message : "درخواست ناموفق بود.";
    throw new Error(message);
  }

  if (!data?.accessToken || !data?.refreshToken || typeof data.accessToken !== "string" || typeof data.refreshToken !== "string") {
    throw new Error("پاسخ نامعتبر از سرور دریافت شد.");
  }

  return data as AuthPayload;
}

export function loginRequest(email: string, password: string) {
  return postAuth("/auth/login", { email, password });
}

export function registerRequest(input: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: "coach" | "athlete";
}) {
  return postAuth("/auth/register", input);
}
