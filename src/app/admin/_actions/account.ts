"use server";

import { signOut } from "@/auth";
import { requireAdmin, validationError, type ActionState } from "@/lib/actions";
import { getContainer } from "@/lib/container";
import { changePasswordSchema } from "@/lib/validation/account";

const GENERIC_FAILURE: ActionState = {
  error: "Current password is incorrect.",
  fieldErrors: { currentPassword: ["Incorrect"] },
};

// Changes the admin password. After that every session is logged out
// (this one too), so you log back in with the new password.
export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();

  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return validationError(parsed.error);
  const { currentPassword, newPassword } = parsed.data;

  const { authService, loginRateLimiter } = getContainer();
  // Someone with a stolen session could use this to guess the current password,
  // so limit it the same way as the login form (5 tries per 15 minutes).
  const rl = await loginRateLimiter.limit(`pwchange:${admin.id}`);
  if (!rl.success) return { error: "Too many attempts. Please wait a few minutes and try again." };

  const changed = await authService.changePassword(admin.id, currentPassword, newPassword);
  if (!changed) return GENERIC_FAILURE;

  await signOut({ redirectTo: "/login?notice=password_changed" });
  return undefined; // never reached, signOut redirects
}
