const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export function getMediaSrc(mediaId?: string | null) {
  return mediaId ? `${API_BASE_URL}/media/${mediaId}` : null;
}
