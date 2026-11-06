import { saveProject } from "@/app/admin/_actions/projects";
import { BilingualField } from "@/components/admin/bilingual-field";
import { CheckboxField, Field } from "@/components/admin/field";
import { FormShell } from "@/components/admin/form-shell";
import { ProjectMedia } from "@/components/project-media";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { Project } from "@/repositories/interfaces/project-repository";

// project form, for both new and existing projects
export function ProjectForm({ project }: { project?: Project }) {
  return (
    <FormShell action={saveProject} submitLabel={project ? "Save changes" : "Create project"}>
      {project && <input type="hidden" name="id" value={project.id} />}

      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <Input name="title" required maxLength={200} defaultValue={project?.title} />
            </Field>
            <Field label="Slug" hint="URL: /projects/<slug>. Leave empty to derive from the title.">
              <Input name="slug" maxLength={160} pattern="[a-z0-9]+(-[a-z0-9]+)*" defaultValue={project?.slug} />
            </Field>
          </div>
          <BilingualField
            label="Summary"
            hint="One or two sentences for cards and SEO (max 500)."
            en={<Textarea name="summary" rows={2} maxLength={500} defaultValue={project?.summary} />}
            tr={<Textarea name="summaryTr" rows={2} maxLength={500} defaultValue={project?.summaryTr} />}
          />
          <Field label="Tech stack" hint="Comma-separated, e.g. Python, PyTorch, LightGBM">
            <Input name="techStack" defaultValue={project?.techStack.join(", ")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="GitHub repository" hint="Shown as a GitHub button.">
              <Input
                name="githubRepoUrl"
                type="url"
                placeholder="https://github.com/…"
                defaultValue={project?.githubRepoUrl ?? ""}
              />
            </Field>
            <Field label="Live site" hint="Shown as a Live Demo button.">
              <Input name="liveSiteUrl" type="url" placeholder="https://…" defaultValue={project?.liveSiteUrl ?? ""} />
            </Field>
            <Field label="Kaggle" hint="Notebook, dataset or competition.">
              <Input
                name="kaggleUrl"
                type="url"
                placeholder="https://www.kaggle.com/…"
                defaultValue={project?.kaggleUrl ?? ""}
              />
            </Field>
          </div>
          <div className="flex flex-wrap items-end gap-6">
            <Field label="Sort order" hint="Lower comes first." className="w-32">
              <Input name="sortOrder" type="number" defaultValue={project?.sortOrder ?? 0} />
            </Field>
            <CheckboxField name="published" label="Published" defaultChecked={project?.published} />
            <CheckboxField name="featured" label="Featured" defaultChecked={project?.featured} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Demo media</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {project && (
            <ProjectMedia
              type={project.demoMediaType}
              url={project.demoMediaUrl}
              title={project.title}
              className="max-w-md"
            />
          )}
          <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
            <Field label="Type">
              <NativeSelect name="demoMediaType" defaultValue={project?.demoMediaType ?? ""}>
                <option value="">None</option>
                <option value="video_hosted">Hosted video</option>
                <option value="youtube_embed">YouTube embed</option>
                <option value="image">Image</option>
              </NativeSelect>
            </Field>
            <Field label="URL" hint="YouTube link, external file URL, or an existing /uploads/… path. Clear to remove.">
              <Input name="demoMediaUrl" defaultValue={project?.demoMediaUrl ?? ""} />
            </Field>
          </div>
          <Field
            label="…or upload a file"
            hint="Overrides type + URL. Images ≤ 10 MB (jpg/png/webp/gif), video ≤ 50 MB (mp4/webm)."
          >
            <Input name="demoMediaFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Write-up (Markdown)</CardTitle>
        </CardHeader>
        <CardContent>
          <BilingualField
            label="Content"
            hint="Leave Turkish empty to show the English write-up on /tr."
            en={
              <Textarea
                name="contentMd"
                rows={20}
                maxLength={100_000}
                defaultValue={project?.contentMd}
                className="font-mono text-sm"
                placeholder={"## Architecture\n\n## How it was built\n\n## Resources"}
              />
            }
            tr={
              <Textarea
                name="contentMdTr"
                rows={20}
                maxLength={100_000}
                defaultValue={project?.contentMdTr}
                className="font-mono text-sm"
                placeholder={"## Mimari\n\n## Nasıl geliştirildi\n\n## Kaynaklar"}
              />
            }
          />
        </CardContent>
      </Card>
    </FormShell>
  );
}
