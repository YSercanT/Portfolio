import { z } from "zod";
import { demoMediaType } from "@/lib/db/schema";
import { isHttpUrl, isUploadPath, parseYouTubeId } from "@/lib/media";

// Zod schemas for the admin forms. The input comes from Object.fromEntries(formData),
// so everything is a string or missing. The helpers below clean that up.

const blankToNull = (v: unknown) => (v == null || (typeof v === "string" && v.trim() === "") ? null : v);

const requiredText = (max: number) => z.string().trim().min(1, "Required").max(max);
const longText = (max: number) => z.preprocess((v) => v ?? "", z.string().trim().max(max));

const httpUrl = z.preprocess(
  blankToNull,
  z.string().trim().max(2048).refine(isHttpUrl, "Must be an http(s) URL").nullable(),
);

// Optional http(s) link that has to be on a given site, so the GitHub button
// can only link to GitHub. Empty becomes null.
// Not using z.string().url() because it lets javascript: links through.
const siteUrl = (host: string, label: string) =>
  z.preprocess(
    blankToNull,
    z
      .string()
      .trim()
      .max(2048)
      .refine(isHttpUrl, "Must be an http(s) URL")
      .refine((v) => {
        const h = new URL(v).hostname;
        return h === host || h.endsWith(`.${host}`);
      }, `Must be a ${label} link (${host})`)
      .nullable(),
  );

// either an external http(s) link or one of our uploaded files
const mediaUrl = z.preprocess(
  blankToNull,
  z
    .string()
    .trim()
    .max(2048)
    .refine((v) => isHttpUrl(v) || isUploadPath(v), "Must be an http(s) URL or an uploaded file")
    .nullable(),
);

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
const optionalIsoDate = z.preprocess(blankToNull, isoDate.nullable());
const optionalId = z.preprocess(blankToNull, z.string().uuid().nullable());
const checkbox = z.preprocess((v) => v === "on" || v === "true", z.boolean());

// "Python, PyTorch , python" becomes ["Python", "PyTorch"]
const commaList = z.preprocess(
  (v) => {
    const items = typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const seen = new Set<string>();
    return items.filter((s) => !seen.has(s.toLowerCase()) && seen.add(s.toLowerCase()));
  },
  z.array(z.string().max(40, "Each item max 40 chars")).max(30, "Max 30 items"),
);

const dateRangeOk = (d: { startDate: string; endDate: string | null }) => !d.endDate || d.endDate >= d.startDate;
const dateRangeError = { message: "End date must be on or after start date", path: ["endDate"] };

export const idSchema = z.string().uuid();

// Turkish fields are optional, if empty the English text is shown on /tr
export const profileSchema = z.object({
  name: requiredText(120),
  title: requiredText(160),
  titleTr: longText(160),
  bio: longText(4000),
  bioTr: longText(4000),
  avatarUrl: mediaUrl,
  githubUrl: httpUrl,
  linkedinUrl: httpUrl,
});

export const educationSchema = z
  .object({
    id: optionalId,
    degree: requiredText(160),
    degreeTr: longText(160),
    institution: requiredText(160),
    institutionTr: longText(160),
    startDate: isoDate,
    endDate: optionalIsoDate,
    description: longText(4000),
    descriptionTr: longText(4000),
  })
  .refine(dateRangeOk, dateRangeError);

export const experienceSchema = z
  .object({
    id: optionalId,
    role: requiredText(160),
    roleTr: longText(160),
    company: requiredText(160),
    startDate: isoDate,
    endDate: optionalIsoDate,
    description: longText(4000),
    descriptionTr: longText(4000),
    techStack: commaList,
  })
  .refine(dateRangeOk, dateRangeError);

export const publicationSchema = z.object({
  id: optionalId,
  title: requiredText(300),
  titleTr: longText(300),
  publisher: requiredText(200),
  publishedOn: isoDate,
  abstract: longText(10_000),
  abstractTr: longText(10_000),
  url: httpUrl,
});

export const projectSchema = z
  .object({
    id: optionalId,
    slug: z
      .string()
      .trim()
      .min(1, "Required")
      .max(160)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, digits and single dashes only"),
    title: requiredText(200),
    summary: longText(500),
    summaryTr: longText(500),
    contentMd: longText(100_000),
    contentMdTr: longText(100_000),
    techStack: commaList,
    githubRepoUrl: siteUrl("github.com", "GitHub"),
    kaggleUrl: siteUrl("kaggle.com", "Kaggle"),
    liveSiteUrl: httpUrl,
    demoMediaType: z.preprocess(blankToNull, z.enum(demoMediaType.enumValues).nullable()),
    demoMediaUrl: mediaUrl,
    featured: checkbox,
    published: checkbox,
    sortOrder: z.coerce.number().int().min(-10_000).max(10_000),
  })
  .superRefine((d, ctx) => {
    if (d.demoMediaUrl && !d.demoMediaType) {
      ctx.addIssue({ code: "custom", path: ["demoMediaType"], message: "Choose a media type for the URL" });
    }
    if (d.demoMediaType === "youtube_embed" && d.demoMediaUrl && !parseYouTubeId(d.demoMediaUrl)) {
      ctx.addIssue({ code: "custom", path: ["demoMediaUrl"], message: "Not a valid YouTube video URL" });
    }
  });

// "Genius-Omics: Ensemble FS!" becomes "genius-omics-ensemble-fs". Also handles Turkish ı/İ.
export function slugify(input: string): string {
  return input
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}
