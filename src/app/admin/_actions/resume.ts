"use server";

import { redirect } from "next/navigation";
import { requireAdmin, validationError, type ActionState } from "@/lib/actions";
import { getContainer } from "@/lib/container";
import { educationSchema, experienceSchema, idSchema, publicationSchema } from "@/lib/validation/portfolio";

// Save/delete actions for education, experience and publications.
// Each one checks the admin, validates, writes, clears the cache and redirects.
// The whole resume is cached under one key, so one delete clears it.

async function done(path: string): Promise<never> {
  await getContainer().resumeService.invalidate();
  redirect(path);
}

// ---- education ----

export async function saveEducation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = educationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error);

  const { id, ...data } = parsed.data;
  const repo = getContainer().educationRepository;
  if (id) {
    if (!(await repo.update(id, data))) return { error: "Entry not found." };
  } else {
    await repo.create(data);
  }
  return done("/admin/education");
}

export async function deleteEducation(formData: FormData): Promise<void> {
  await requireAdmin();
  await getContainer().educationRepository.delete(idSchema.parse(formData.get("id")));
  await done("/admin/education");
}

// ---- work experience ----

export async function saveExperience(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = experienceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error);

  const { id, ...data } = parsed.data;
  const repo = getContainer().experienceRepository;
  if (id) {
    if (!(await repo.update(id, data))) return { error: "Entry not found." };
  } else {
    await repo.create(data);
  }
  return done("/admin/experience");
}

export async function deleteExperience(formData: FormData): Promise<void> {
  await requireAdmin();
  await getContainer().experienceRepository.delete(idSchema.parse(formData.get("id")));
  await done("/admin/experience");
}

// ---- publications ----

export async function savePublication(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = publicationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error);

  const { id, ...data } = parsed.data;
  const repo = getContainer().publicationRepository;
  if (id) {
    if (!(await repo.update(id, data))) return { error: "Entry not found." };
  } else {
    await repo.create(data);
  }
  return done("/admin/publications");
}

export async function deletePublication(formData: FormData): Promise<void> {
  await requireAdmin();
  await getContainer().publicationRepository.delete(idSchema.parse(formData.get("id")));
  await done("/admin/publications");
}
