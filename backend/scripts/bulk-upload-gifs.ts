/**
 * Bulk upload exercise GIFs
 *
 * Usage:
 *   npx tsx scripts/bulk-upload-gifs.ts --dir ./gifs --token <ADMIN_JWT> [--api http://localhost:3001/api]
 *
 * GIF files must be named after the exercise's English name (nameEn).
 * Example: "Barbell Squat.gif" → matches exercise with nameEn "Barbell Squat"
 *
 * Steps:
 *   1. Fetches all exercises from API
 *   2. Scans the directory for .gif files
 *   3. Matches filenames to exercises by nameEn (case-insensitive)
 *   4. For each match: presign URL → upload to MinIO → update exercise
 */

const API_BASE_URL = process.env.API_URL ?? "http://localhost:3001/api";

interface Exercise {
  id: string;
  name: string;
  nameEn: string | null;
  gifMediaId: string | null;
}

interface PresignResponse {
  uploadUrl: string;
  mediaId: string;
}

async function apiPost<T>(path: string, token: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const msg = await res.json().then((d) => d.message).catch(() => res.statusText);
    throw new Error(`${res.status} ${path}: ${msg}`);
  }
  return res.json();
}

async function apiPut<T>(path: string, token: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const msg = await res.json().then((d) => d.message).catch(() => res.statusText);
    throw new Error(`${res.status} ${path}: ${msg}`);
  }
  return res.json();
}

async function main() {
  const args = process.argv.slice(2);
  const dirArg = args.find((a) => a.startsWith("--dir="))?.split("=")[1] ?? args[args.indexOf("--dir") + 1];
  const tokenArg = args.find((a) => a.startsWith("--token="))?.split("=")[1] ?? args[args.indexOf("--token") + 1];

  if (!dirArg || !tokenArg) {
    console.error("Usage: npx tsx scripts/bulk-upload-gifs.ts --dir ./gifs --token <ADMIN_JWT> [--api http://localhost:3001/api]");
    process.exit(1);
  }

  const apiFlag = args.find((a) => a.startsWith("--api="))?.split("=")[1] ?? args[args.indexOf("--api") + 1];
  if (apiFlag) {
    process.env.API_URL = apiFlag;
  }

  const fs = await import("fs/promises");
  const path = await import("path");

  // 1. Fetch all exercises
  console.log("Fetching exercises...");
  const exercisesRes = await fetch(`${API_BASE_URL}/admin/exercises`, {
    headers: { Authorization: `Bearer ${tokenArg}` },
  });
  if (!exercisesRes.ok) throw new Error(`Failed to fetch exercises: ${exercisesRes.status}`);
  const exercises: Exercise[] = await exercisesRes.json();
  console.log(`  Found ${exercises.length} exercises`);

  // 2. Scan directory for GIFs
  const files = (await fs.readdir(dirArg)).filter((f) => f.toLowerCase().endsWith(".gif"));
  console.log(`  Found ${files.length} GIF files in "${dirArg}"`);

  // 3. Build lookup: lowercase nameEn → exercise
  const exerciseByName = new Map<string, Exercise>();
  for (const ex of exercises) {
    if (ex.nameEn) exerciseByName.set(ex.nameEn.toLowerCase(), ex);
  }

  const results = { uploaded: 0, skipped: 0, failed: 0, noMatch: 0 };

  for (const file of files) {
    const nameWithoutExt = path.parse(file).name;
    const exercise = exerciseByName.get(nameWithoutExt.toLowerCase());

    if (!exercise) {
      console.warn(`  ⚠ No match for "${file}" (tried: "${nameWithoutExt}")`);
      results.noMatch++;
      continue;
    }

    if (exercise.gifMediaId) {
      console.log(`  → Skipping "${file}": "${exercise.name}" already has a GIF`);
      results.skipped++;
      continue;
    }

    const filePath = path.join(dirArg, file);
    const stat = await fs.stat(filePath);

    try {
      // 4. Get presigned URL
      const presign = await apiPost<PresignResponse>("/admin/media/presign", tokenArg, {
        fileName: file,
        contentType: "image/gif",
        sizeBytes: stat.size,
      });

      // 5. Upload to MinIO
      const content = await fs.readFile(filePath);
      const uploadRes = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "image/gif" },
        body: content,
      });
      if (!uploadRes.ok) throw new Error(`MinIO upload failed: ${uploadRes.status}`);

      // 6. Update exercise with mediaId
      await apiPut(`/admin/exercises/${exercise.id}`, tokenArg, {
        gifMediaId: presign.mediaId,
      });

      console.log(`  ✓ "${file}" → "${exercise.name}" (mediaId: ${presign.mediaId})`);
      results.uploaded++;
    } catch (err) {
      console.error(`  ✗ Failed for "${file}":`, err instanceof Error ? err.message : err);
      results.failed++;
    }
  }

  console.log("\nDone:");
  console.log(`  Uploaded: ${results.uploaded}`);
  console.log(`  Skipped:  ${results.skipped} (already had GIF)`);
  console.log(`  Failed:   ${results.failed}`);
  console.log(`  No match: ${results.noMatch}`);
}

main().catch((err) => {
  console.error("Fatal:", err instanceof Error ? err.message : err);
  process.exit(1);
});
