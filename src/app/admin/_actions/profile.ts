"use server";

import { redirect } from "next/navigation";
import { requireAdmin, validationError, type ActionState } from "@/lib/actions";
import { getContainer } from "@/lib/container";
import { deleteUpload, getUploadedFile, saveUpload, UploadError } from "@/lib/uploads";
import { profileSchema } from "@/lib/validation/portfolio";

export async function saveProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error);
  const data = parsed.data;

  const { profileRepository, resumeService } = getContainer();
  const previous = await profileRepository.get();

  const file = getUploadedFile(formData, "avatarFile");
  if (file) {
    try {
      data.avatarUrl = (await saveUpload(file, ["image"])).url;
    } catch (err) {
      if (err instanceof UploadError) return { error: err.message, fieldErrors: { avatarFile: [err.message] } };
      throw err;
    }
  }

  await profileRepository.upsert(data);
  if (previous && previous.avatarUrl !== data.avatarUrl) await deleteUpload(previous.avatarUrl);
  await resumeService.invalidate();

  redirect("/admin/profile?saved=1");
}
