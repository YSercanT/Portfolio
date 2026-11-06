import "server-only";
import { z } from "zod";
import { auth } from "@/auth";
import { getContainer } from "@/lib/container";
import type { AuthenticatedUser } from "@/services/auth-service";

// what a form action returns on error (on success it redirects)
export type ActionState = { error?: string; fieldErrors?: Record<string, string[]> } | undefined;

// Gets the logged-in admin, double-checked against the db and not just the JWT.
// Returns null if the account is gone, isn't an admin anymore, or the password
// was changed after this session started.
export async function getVerifiedAdmin(): Promise<AuthenticatedUser | null> {
  const session = await auth();
  if (session?.user?.role !== "admin" || !session.user.id) return null;
  return getContainer().authService.getActiveAdmin(session.user.id, session.user.authTime);
}

// Call this at the start of every admin server action. Server actions can be
// POSTed to directly, so the middleware alone doesn't protect them.
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const admin = await getVerifiedAdmin();
  if (!admin) throw new Error("Unauthorized");
  return admin;
}

export function validationError(error: z.ZodError): ActionState {
  return { error: "Please fix the highlighted fields.", fieldErrors: z.flattenError(error).fieldErrors };
}

// true for Postgres unique violations (23505), also when Drizzle wraps the error
export function isUniqueViolation(err: unknown): boolean {
  const code = (e: unknown) => (e as { code?: string } | undefined)?.code;
  return code(err) === "23505" || code((err as { cause?: unknown })?.cause) === "23505";
}
