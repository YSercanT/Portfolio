import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

const ERROR_MESSAGES: Record<string, string> = {
  rate_limited: "Too many attempts. Please wait a few minutes and try again.",
  CredentialsSignin: "Invalid email or password.",
};

async function login(formData: FormData) {
  "use server";
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      // always go to /admin, never to a URL from the query string
      redirectTo: "/admin",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      const code = "code" in err && typeof err.code === "string" && err.code !== "credentials" ? err.code : err.type;
      redirect(`/login?error=${encodeURIComponent(code)}`);
    }
    throw err; // the redirect is thrown as an error, let it through
  }
}

const NOTICES: Record<string, string> = {
  password_changed: "Password changed. Please sign in with your new password.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const { error, notice } = await searchParams;
  const message = error ? (ERROR_MESSAGES[error] ?? "Sign-in failed.") : null;
  const info = !message && notice ? NOTICES[notice] : undefined; // only show our own messages, not whatever is in the URL

  return (
    <main className="flex min-h-dvh items-center justify-center px-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Admin sign in</CardTitle>
          <CardDescription>Restricted area. All attempts are rate-limited.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={login} className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              Email
              <Input name="email" type="email" autoComplete="username" required maxLength={320} />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Password
              <Input name="password" type="password" autoComplete="current-password" required maxLength={256} />
            </label>
            {info && (
              <p role="status" className="text-sm text-emerald-400">
                {info}
              </p>
            )}
            {message && (
              <p role="alert" className="text-sm text-destructive">
                {message}
              </p>
            )}
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
