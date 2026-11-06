"use server";

import { redirect } from "next/navigation";
import { isUniqueViolation, requireAdmin, validationError, type ActionState } from "@/lib/actions";
import { getContainer } from "@/lib/container";
import { deleteUpload, getUploadedFile, saveUpload, UploadError } from "@/lib/uploads";
import { idSchema, projectSchema, slugify } from "@/lib/validation/portfolio";

// creates a project, or updates it if there's an id. Also handles the media upload.
export async function saveProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const file = getUploadedFile(formData, "demoMediaFile");
  const raw: Record<string, unknown> = Object.fromEntries(formData);
  if (!String(raw.slug ?? "").trim()) raw.slug = slugify(String(raw.title ?? ""));
  if (file) {
    // if a file was uploaded, it replaces whatever was in the URL field
    raw.demoMediaUrl = "";
    raw.demoMediaType = "";
  }

  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) return validationError(parsed.error);
  const { id, ...data } = parsed.data;

  const { projectService } = getContainer();
  const existing = id ? await projectService.getById(id) : null;
  if (id && !existing) return { error: "Project not found." };

  // only save the file once the form is valid, so we don't leave junk files around
  let uploadedUrl: string | null = null;
  if (file) {
    try {
      const upload = await saveUpload(file, ["image", "video"]);
      uploadedUrl = upload.url;
      data.demoMediaUrl = upload.url;
      data.demoMediaType = upload.kind === "image" ? "image" : "video_hosted";
    } catch (err) {
      if (err instanceof UploadError) return { error: err.message, fieldErrors: { demoMediaFile: [err.message] } };
      throw err;
    }
  }

  const publishedAt = data.published ? (existing?.publishedAt ?? new Date()) : null;
  try {
    // the service clears the cache for both the old and the new slug
    if (existing) await projectService.update(existing.id, { ...data, publishedAt });
    else await projectService.create({ ...data, publishedAt });
  } catch (err) {
    await deleteUpload(uploadedUrl);
    if (isUniqueViolation(err)) return { error: "Slug already in use.", fieldErrors: { slug: ["Must be unique"] } };
    throw err;
  }

  // the old uploaded file was replaced or removed, delete it
  if (existing && existing.demoMediaUrl !== data.demoMediaUrl) await deleteUpload(existing.demoMediaUrl);

  redirect("/admin/projects");
}

export async function deleteProject(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idSchema.parse(formData.get("id"));
  const deleted = await getContainer().projectService.delete(id);
  await deleteUpload(deleted?.demoMediaUrl);
  redirect("/admin/projects");
}
