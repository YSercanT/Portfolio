import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { isUploadPath, UPLOAD_URL_PREFIX } from "@/lib/media";

// Saves admin uploads to public/uploads. If this ever moves to S3/R2,
// keeping these two functions the same means nothing else has to change.
export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export type UploadKind = "image" | "video";

const MAX_BYTES: Record<UploadKind, number> = {
  image: 10 * 1024 * 1024,
  video: 50 * 1024 * 1024, // must match serverActions.bodySizeLimit in next.config
};

// We check the first bytes of the file to see what it really is. The file name and
// MIME type come from the browser and can be faked. No SVG, since it can contain scripts.
const SIGNATURES: { ext: string; kind: UploadKind; test: (b: Uint8Array) => boolean }[] = [
  { ext: "jpg", kind: "image", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: "png", kind: "image", test: (b) => ascii(b, 1, 4) === "PNG" && b[0] === 0x89 },
  { ext: "gif", kind: "image", test: (b) => ascii(b, 0, 4) === "GIF8" },
  { ext: "webp", kind: "image", test: (b) => ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP" },
  { ext: "mp4", kind: "video", test: (b) => ascii(b, 4, 8) === "ftyp" },
  { ext: "webm", kind: "video", test: (b) => b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3 },
];

function ascii(bytes: Uint8Array, start: number, end: number): string {
  return String.fromCharCode(...bytes.subarray(start, end));
}

export class UploadError extends Error {}

// the uploaded file, or null if the field was left empty
export function getUploadedFile(formData: FormData, field: string): File | null {
  const value = formData.get(field);
  return value instanceof File && value.size > 0 ? value : null;
}

// Checks and saves the file, returns its URL. The file gets a random name,
// so nothing the user typed ends up in the path.
export async function saveUpload(file: File, allowed: UploadKind[]): Promise<{ url: string; kind: UploadKind }> {
  const ceiling = Math.max(...allowed.map((k) => MAX_BYTES[k]));
  if (file.size > ceiling) throw new UploadError(`File too large (max ${ceiling / 1024 / 1024} MB).`);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const match = SIGNATURES.find((s) => allowed.includes(s.kind) && s.test(bytes));
  if (!match) {
    throw new UploadError(`Unsupported file type. Allowed: ${allowed.join(", ")} (jpg, png, gif, webp, mp4, webm).`);
  }
  if (bytes.byteLength > MAX_BYTES[match.kind]) {
    throw new UploadError(`${match.kind} too large (max ${MAX_BYTES[match.kind] / 1024 / 1024} MB).`);
  }

  const name = `${randomUUID()}.${match.ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), bytes, { flag: "wx" });
  return { url: `${UPLOAD_URL_PREFIX}${name}`, kind: match.kind };
}

// deletes one of our uploads, anything else (external URLs etc.) is ignored
export async function deleteUpload(url: string | null | undefined): Promise<void> {
  if (!url || !isUploadPath(url)) return; // strict pattern, so no ../ tricks
  try {
    await unlink(path.join(UPLOAD_DIR, path.basename(url)));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") console.error("[uploads] delete failed", url, err);
  }
}
