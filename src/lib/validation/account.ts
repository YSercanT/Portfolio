import { z } from "zod";

// same minimum as the seed script
export const PASSWORD_MIN_LENGTH = 12;

// bcrypt ignores everything after 72 bytes, so don't allow longer
const BCRYPT_MAX_BYTES = 72;
const utf8Length = (s: string) => new TextEncoder().encode(s).length;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Required").max(256),
    newPassword: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Must be at least ${PASSWORD_MIN_LENGTH} characters`)
      .refine((v) => utf8Length(v) <= BCRYPT_MAX_BYTES, `Must be at most ${BCRYPT_MAX_BYTES} bytes`),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Does not match the new password",
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    path: ["newPassword"],
    message: "Must differ from the current password",
  });
