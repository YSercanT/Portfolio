import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import { getContainer } from "@/lib/container";
import { getClientIp } from "@/lib/security/client-ip";

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  password: z.string().min(1).max(256),
});

class RateLimitedError extends CredentialsSignin {
  override code = "rate_limited";
}

// The full Auth.js setup with email/password login (needs Node, not Edge).
// Logins are rate limited per IP and email before we even touch bcrypt.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw, request) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const { loginRateLimiter, authService } = getContainer();
        const ip = getClientIp(request.headers);
        const rl = await loginRateLimiter.limit(`${ip}:${email}`);
        if (!rl.success) throw new RateLimitedError();

        return authService.verifyCredentials(email, password);
      },
    }),
  ],
});
