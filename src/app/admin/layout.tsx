import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { RootDocument } from "@/components/layout/root-document";
import { Button } from "@/components/ui/button";
import { getVerifiedAdmin } from "@/lib/actions";
import { baseMetadata, baseViewport } from "@/lib/site";

export const dynamic = "force-dynamic";

// keep /admin out of search results (robots.txt blocks it too)
export const viewport = baseViewport;

export const metadata: Metadata = {
  ...baseMetadata,
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // The middleware only looked at the JWT. Here we also check the db, in case the
  // account was removed or the password changed since.
  const admin = await getVerifiedAdmin();
  if (!admin) redirect("/login");

  const signOutAction = async () => {
    "use server";
    await signOut({ redirectTo: "/login" });
  };

  // admin has its own root layout, English only
  return (
    <RootDocument lang="en">
    <div className="grid min-h-dvh md:grid-cols-[240px_1fr]">
      <aside className="border-b bg-card/40 p-4 md:flex md:flex-col md:border-r md:border-b-0">
        <div className="mb-4 flex items-center justify-between px-2 md:mb-6">
          <a href="/" className="text-sm font-semibold tracking-tight">
            The Hub · Admin
          </a>
        </div>
        <AdminNav />
        <form className="mt-4 md:mt-auto" action={signOutAction}>
          <p className="mb-2 hidden truncate px-2 text-xs text-muted-foreground md:block">{admin.email}</p>
          <Button type="submit" variant="outline" size="sm" className="w-full justify-start">
            <LogOut /> Sign out
          </Button>
        </form>
      </aside>
      <main className="min-w-0 p-6 md:p-10">{children}</main>
    </div>
    </RootDocument>
  );
}
