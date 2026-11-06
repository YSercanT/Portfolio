import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { changePassword } from "@/app/admin/_actions/account";
import { Field } from "@/components/admin/field";
import { FormShell } from "@/components/admin/form-shell";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getVerifiedAdmin } from "@/lib/actions";
import { PASSWORD_MIN_LENGTH } from "@/lib/validation/account";

export const metadata: Metadata = { title: "Settings" }; // noindex comes from admin/layout.tsx

export default async function AdminSettingsPage() {
  const admin = await getVerifiedAdmin();
  if (!admin) redirect("/login");

  return (
    <div className="grid max-w-2xl gap-8">
      <PageHeader title="Settings" description="Account security." />

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            You will be signed out everywhere and asked to sign in again with the new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormShell action={changePassword} submitLabel="Change password">
            {/* helps password managers save it for the right account */}
            <input type="text" name="username" autoComplete="username" value={admin.email} readOnly hidden />
            <Field label="Current password">
              <Input name="currentPassword" type="password" autoComplete="current-password" required maxLength={256} />
            </Field>
            <Field label="New password" hint={`At least ${PASSWORD_MIN_LENGTH} characters. A long passphrase is best.`}>
              <Input
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={PASSWORD_MIN_LENGTH}
                maxLength={72}
              />
            </Field>
            <Field label="Confirm new password">
              <Input name="confirmPassword" type="password" autoComplete="new-password" required maxLength={72} />
            </Field>
          </FormShell>
        </CardContent>
      </Card>
    </div>
  );
}
