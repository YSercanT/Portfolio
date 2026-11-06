// Media URL helpers. Both the admin validation and <ProjectMedia /> use these,
// so what we accept and what we can show always match.

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

// gets the video id out of the usual YouTube URL formats, or null
export function parseYouTubeId(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || !YOUTUBE_HOSTS.has(url.hostname)) return null;

  let id: string | null | undefined;
  if (url.hostname === "youtu.be") id = url.pathname.slice(1);
  else if (url.pathname === "/watch") id = url.searchParams.get("v");
  else id = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1];

  return id && /^[\w-]{11}$/.test(id) ? id : null;
}

export const UPLOAD_URL_PREFIX = "/uploads/";
const UPLOAD_PATH = /^\/uploads\/[\w-]+\.[a-z0-9]+$/;

export const isHttpUrl = (v: string) => /^https?:\/\/[^\s]+$/i.test(v) && URL.canParse(v);
export const isUploadPath = (v: string) => UPLOAD_PATH.test(v);
