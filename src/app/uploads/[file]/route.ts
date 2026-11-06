import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { isUploadPath } from "@/lib/media";
import { UPLOAD_DIR } from "@/lib/uploads";

export const runtime = "nodejs";

// Serves files from public/uploads.
//
// `next start` only serves files that were already in public/ when it started,
// so anything uploaded later would 404 without this route. Range requests are
// supported so videos can be skipped forward.
const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm",
};

const notFound = () => new Response("Not found", { status: 404 });

export async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  // same check as when saving: no slashes, no .., only known extensions
  if (!isUploadPath(`/uploads/${file}`)) return notFound();
  const type = MIME[path.extname(file).slice(1)];
  if (!type) return notFound();

  const filePath = path.join(UPLOAD_DIR, file);
  let size: number;
  try {
    const info = await stat(filePath);
    if (!info.isFile()) return notFound();
    size = info.size;
  } catch {
    return notFound();
  }

  const headers = new Headers({
    "Content-Type": type,
    "Accept-Ranges": "bytes",
    // file names are random and files never change, so cache them for good
    "Cache-Control": "public, max-age=31536000, immutable",
  });

  const range = req.headers.get("range")?.match(/^bytes=(\d*)-(\d*)$/);
  if (range && (range[1] || range[2])) {
    const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
    const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start > end || start >= size) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    }
    headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
    headers.set("Content-Length", String(end - start + 1));
    const body = Readable.toWeb(createReadStream(filePath, { start, end })) as ReadableStream;
    return new Response(body, { status: 206, headers });
  }

  headers.set("Content-Length", String(size));
  return new Response(Readable.toWeb(createReadStream(filePath)) as ReadableStream, { status: 200, headers });
}
