import { saveProfile } from "@/app/admin/_actions/profile";
import { BilingualField } from "@/components/admin/bilingual-field";
import { Field } from "@/components/admin/field";
import { FormShell } from "@/components/admin/form-shell";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getContainer } from "@/lib/container";

export default async function AdminProfilePage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const [{ saved }, profile] = await Promise.all([searchParams, getContainer().profileRepository.get()]);

  return (
    <div className="grid max-w-3xl gap-8">
      <PageHeader title="Profile" description="Shown in the homepage hero." />
      {saved && <p className="text-sm text-emerald-400">Profile saved.</p>}
      <Card>
        <CardContent>
          <FormShell action={saveProfile} submitLabel="Save profile">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name">
                <Input name="name" required maxLength={120} defaultValue={profile?.name} />
              </Field>
              <BilingualField
                label="Title"
                en={<Input name="title" required maxLength={160} defaultValue={profile?.title} />}
                tr={<Input name="titleTr" maxLength={160} defaultValue={profile?.titleTr} />}
              />
            </div>
            <BilingualField
              label="Bio"
              en={<Textarea name="bio" rows={5} maxLength={4000} defaultValue={profile?.bio} />}
              tr={<Textarea name="bioTr" rows={5} maxLength={4000} defaultValue={profile?.bioTr} />}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="GitHub URL">
                <Input name="githubUrl" type="url" defaultValue={profile?.githubUrl ?? ""} />
              </Field>
              <Field label="LinkedIn URL">
                <Input name="linkedinUrl" type="url" defaultValue={profile?.linkedinUrl ?? ""} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Avatar URL" hint="External URL, or upload a file instead.">
                <Input name="avatarUrl" defaultValue={profile?.avatarUrl ?? ""} />
              </Field>
              <Field label="Upload avatar" hint="jpg, png, webp, gif · max 10 MB">
                <Input name="avatarFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif" />
              </Field>
            </div>
          </FormShell>
        </CardContent>
      </Card>
    </div>
  );
}
