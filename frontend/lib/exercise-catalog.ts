import { apiRequest } from "@/lib/api";

export type CatalogExercise = {
  id: string;
  name: string;
  nameEn?: string | null;
  muscleGroup?: string | null;
  group?: string | null;
  equipment?: string | null;
  gifMediaId?: string | null;
  description?: string | null;
  isActive?: boolean;
  createdAt?: string;
};

export type ExerciseGifUploadResponse = {
  uploadUrl: string;
  mediaId: string;
  expiresInSeconds: number;
  maxSizeBytes: number;
};

export const MAX_EXERCISE_GIF_BYTES = 25 * 1024 * 1024;

export function getExerciseGroups(exercises: CatalogExercise[]) {
  return Array.from(
    new Set(
      exercises
        .map((exercise) => exercise.group?.trim() || "")
        .filter((group) => group.length > 0),
    ),
  ).sort((left, right) => left.localeCompare(right));
}

export async function getExerciseCatalog() {
  return apiRequest<CatalogExercise[]>("/exercises");
}

export async function getAdminExerciseCatalog() {
  return apiRequest<CatalogExercise[]>("/admin/exercises");
}

export async function createExercise(input: {
  name: string;
  nameEn?: string;
  muscleGroup?: string;
  group?: string;
  equipment?: string;
  gifMediaId?: string;
  description?: string;
}) {
  return apiRequest<CatalogExercise>("/admin/exercises", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateExercise(id: string, input: Partial<{
  name: string;
  nameEn: string;
  muscleGroup: string;
  group: string;
  equipment: string;
  gifMediaId: string;
  description: string;
  isActive: boolean;
}>) {
  return apiRequest<CatalogExercise>(`/admin/exercises/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deactivateExercise(id: string) {
  return apiRequest<CatalogExercise>(`/admin/exercises/${id}`, {
    method: "DELETE",
  });
}

export async function requestExerciseGifUpload(input: {
  fileName: string;
  contentType: string;
  sizeBytes: number;
}) {
  return apiRequest<ExerciseGifUploadResponse>("/admin/media/presign", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function uploadExerciseGif(file: File) {
  const response = await requestExerciseGifUpload({
    fileName: file.name,
    contentType: file.type || "image/gif",
    sizeBytes: file.size,
  });

  const upload = await fetch(response.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "image/gif",
    },
    body: file,
  });

  if (!upload.ok) {
    throw new Error("آپلود GIF ناموفق بود.");
  }

  return response;
}

export async function deleteExerciseGifMedia(mediaId: string) {
  return apiRequest<{ deleted: boolean }>(`/admin/media/${mediaId}`, {
    method: "DELETE",
  });
}
