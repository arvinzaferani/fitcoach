const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
import type { TemplateDayPlan } from "@/lib/template-plans";
import {
  clearAccessToken,
  decodeJwtPayload,
  getStoredAccessToken,
  getStoredRefreshToken,
  isTokenExpired,
  isTokenUsable,
  logoutAndRedirect,
  refreshAccessToken,
} from "@/lib/auth";

let refreshPromise: Promise<string> | null = null;

async function getValidAccessToken() {
  const accessToken = getStoredAccessToken();
  if (!accessToken || !isTokenUsable(accessToken)) {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken || !isTokenUsable(refreshToken)) {
      clearAccessToken();
      throw new Error("نشست شما منقضی شده است. دوباره وارد شوید.");
    }
  }

  if (!accessToken || isTokenExpired(accessToken)) {
    refreshPromise ??= refreshAccessToken()
      .then((tokens) => tokens.accessToken)
      .finally(() => {
        refreshPromise = null;
      });
    return refreshPromise;
  }

  return accessToken;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, allowRetry = true): Promise<T> {
  const token = await getValidAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));

  if ((response.status === 401 || response.status === 403) && allowRetry) {
    try {
      await refreshAccessToken();
      return apiRequest<T>(path, init, false);
    } catch {
      if (response.status === 401) {
        logoutAndRedirect();
      } else {
        clearAccessToken();
      }
      throw new Error("دسترسی شما منقضی یا نامعتبر است. دوباره وارد شوید.");
    }
  }

  if (response.status === 401) {
    logoutAndRedirect();
    throw new Error("نشست شما منقضی شده است. دوباره وارد شوید.");
  }

  if (!response.ok) {
    const message = typeof data?.message === "string" ? data.message : "API request failed.";
    throw new Error(message);
  }

  return data as T;
}

async function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path);
}

export type CoachAthleteItem = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  activeProgram: string;
  relationCreatedAt: string;
};

export type CoachTemplateItem = {
  id: string;
  title: string;
  difficulty: string;
  purpose?: string;
  daysCount: number;
  usage: number;
  notes?: string;
};

export type CoachTemplateDetailResponse = CoachTemplateItem & {
  createdAt: string;
  plan: Array<{
    dayNumber: number;
    phases: Array<{
      id: string;
      title: string;
      blocks: Array<{
        id: string;
        kind: "exercise" | "compound";
        title?: string;
        type?: string;
        rounds?: number;
        sets?: number;
        exerciseId?: string;
        exerciseName?: string;
        muscleGroup?: string;
        measureType?: string;
        count?: number;
        duration?: number;
        timeUnit?: string;
        notes?: string;
        children?: Array<{
          id: string;
          exerciseId: string;
          exerciseName?: string;
          muscleGroup?: string;
          measureType?: string;
          count?: number;
          duration?: number;
          timeUnit?: string;
          notes?: string;
        }>;
      }>;
    }>;
  }>;
};

export type CreateCoachTemplateInput = {
  title: string;
  difficultyLevel: string;
  suggestedForGoal?: string;
  suggestedTrainingDays: number;
  description?: string;
  plan?: TemplateDayPlan[];
};

export type CoachAssignmentItem = {
  id: string;
  athleteId: string;
  athleteName: string;
  templateId: string;
  templateTitle: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
};

export type AthleteWorkoutResponse = {
  athlete: { id: string; fullName: string } | null;
  activeProgramTitle: string | null;
  activeAssignmentId: string | null;
  activeDayId: string | null;
  days: Array<{
    id: string;
    dayNumber: number;
    label: string;
    title: string;
    summary: string;
    phases: Array<{
      id: string;
      title: string;
      blocks: Array<{
        id: string;
        title: string;
        kind: "exercise" | "compound";
        flowType: "single" | "superset" | "triple" | "circuit";
        rounds: number;
        exercises: Array<{
          id: string;
          exerciseName: string;
          muscleGroup: string | null;
          sets: number;
          setMode: "reps" | "time";
          repsRange?: string | null;
          durationSeconds?: number | null;
          restSeconds: number;
          gifMediaId?: string | null;
          status: "pending" | "in-progress" | "completed";
        }>;
      }>;
      exercises: Array<{
        id: string;
        exerciseName: string;
        muscleGroup: string | null;
        sets: number;
        setMode: "reps" | "time";
        repsRange?: string | null;
        durationSeconds?: number | null;
        restSeconds: number;
        gifMediaId?: string | null;
        status: "pending" | "in-progress" | "completed";
      }>;
    }>;
  }>;
  exercises: Array<{
    id: string;
    exerciseName: string;
    muscleGroup: string | null;
    sets: number;
    setMode: "reps" | "time";
    repsRange?: string | null;
    durationSeconds?: number | null;
    restSeconds: number;
    gifMediaId?: string | null;
    status: "pending" | "in-progress" | "completed";
  }>;
};

export type AthleteMetricResponse = {
  id: string;
  recordedAt: string;
  weightKg: number | null;
  bodyFatPercentage: number | null;
  muscleMassKg: number | null;
  biologicalAge: number | null;
  notes?: string | null;
};

export type AthleteInvitationItem = {
  id: string;
  message?: string | null;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  createdAt: string;
  coach: {
    id: string;
    fullName: string;
    email: string;
  };
};

export type AthleteCoachItem = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  connectedAt: string;
};

function requireCurrentUserId() {
  const token = getStoredAccessToken();
  const userId = token ? decodeJwtPayload(token)?.sub : undefined;
  if (!userId) {
    throw new Error("شناسه کاربر در توکن یافت نشد.");
  }

  return userId;
}

export function getCoachAthletes() {
  return apiGet<CoachAthleteItem[]>("/coach/athletes");
}

export function getCoachTemplates() {
  return apiGet<CoachTemplateItem[]>("/coach/templates");
}

export function createCoachTemplate(input: CreateCoachTemplateInput) {
  return apiRequest<CoachTemplateItem>("/coach/templates", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getCoachTemplate(id: string) {
  return apiGet<CoachTemplateDetailResponse>(`/coach/templates/${id}`);
}

export function getCoachAssignments() {
  return apiGet<CoachAssignmentItem[]>("/coach/assignments");
}

export function createCoachAssignment(input: { athleteId: string; templateId: string; startDate: string; endDate: string }) {
  return apiRequest<CoachAssignmentItem>("/coach/assign", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getAthleteTodayWorkout() {
  return apiGet<AthleteWorkoutResponse>("/athlete/today-workout");
}

export function getAthleteMetrics() {
  return apiGet<AthleteMetricResponse[]>("/athlete/metrics");
}

export function getAthleteInvitations() {
  const athleteId = requireCurrentUserId();
  return apiGet<AthleteInvitationItem[]>(`/coach-athlete/athlete/${athleteId}/invitations`);
}

export function getAthleteCoaches() {
  const athleteId = requireCurrentUserId();
  return apiGet<AthleteCoachItem[]>(`/coach-athlete/athlete/${athleteId}/coaches`);
}

export function acceptAthleteInvitation(invitationId: string) {
  return apiRequest<{ status: string; invitationId: string }>("/coach-athlete/accept", {
    method: "POST",
    body: JSON.stringify({ invitationId }),
  });
}

export function inviteAthlete(input: { athleteContact: string; message?: string }) {
  return apiRequest<{ invitationId: string; status: string }>("/coach-athlete/invite", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export type AthleteProfileResponse = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  profile: {
    gender?: string | null;
    birthDate?: string | null;
    fitnessLevel?: string | null;
    primaryGoal?: string | null;
    trainingDaysPerWeek?: number | null;
    injuries?: string | null;
    medicalConditions?: string | null;
  } | null;
  metrics: AthleteMetricResponse[];
  activeProgram: {
    id: string;
    templateId: string;
    templateTitle: string;
    difficulty: string;
    purpose?: string | null;
    startDate: string;
    endDate: string;
    isCustomized: boolean;
  } | null;
};

export type AthleteCurrentProgramResponse = {
  id: string;
  templateId: string;
  templateTitle: string;
  difficulty: string;
  purpose?: string | null;
  startDate: string;
  endDate: string;
  isCustomized: boolean;
  customizationNote?: string | null;
} | null;

export function getAthleteProfile(athleteId: string) {
  return apiGet<AthleteProfileResponse>(`/coach/athletes/${athleteId}/profile`);
}

export function getAthleteCurrentProgram(athleteId: string) {
  return apiGet<AthleteCurrentProgramResponse>(`/coach/athletes/${athleteId}/current-program`);
}
