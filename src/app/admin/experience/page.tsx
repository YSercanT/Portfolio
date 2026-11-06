import { deleteExperience, saveExperience } from "@/app/admin/_actions/resume";
import { CollectionLayout, EmptyList, EntryRow } from "@/components/admin/collection-layout";
import { BilingualField } from "@/components/admin/bilingual-field";
import { Field } from "@/components/admin/field";
import { FormShell } from "@/components/admin/form-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getContainer } from "@/lib/container";
import { formatDateRange } from "@/lib/format";

const BASE = "/admin/experience";

export default async function AdminExperiencePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const [{ id }, items] = await Promise.all([searchParams, getContainer().experienceRepository.list()]);
  const editing = items.find((i) => i.id === id);

  return (
    <CollectionLayout
      title="Work experience"
      description="Positions shown on the homepage timeline. Leave the end date empty for a current role."
      basePath={BASE}
      editing={!!editing}
      list={
        items.length === 0 ? (
          <EmptyList>No positions yet.</EmptyList>
        ) : (
          <Card className="gap-0 divide-y py-0">
            {items.map((i) => (
              <EntryRow key={i.id} id={i.id} basePath={BASE} deleteAction={deleteExperience} active={i.id === id}>
                <p className="font-medium">
                  {i.role} · <span className="text-muted-foreground">{i.company}</span>
                </p>
                <p className="text-xs text-muted-foreground">{formatDateRange(i.startDate, i.endDate)}</p>
              </EntryRow>
            ))}
          </Card>
        )
      }
      form={
        <FormShell key={editing?.id ?? "new"} action={saveExperience}>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <BilingualField
            label="Role"
            en={<Input name="role" required maxLength={160} defaultValue={editing?.role} />}
            tr={<Input name="roleTr" maxLength={160} defaultValue={editing?.roleTr} />}
          />
          <Field label="Company">
            <Input name="company" required maxLength={160} defaultValue={editing?.company} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start date">
              <Input name="startDate" type="date" required defaultValue={editing?.startDate} />
            </Field>
            <Field label="End date">
              <Input name="endDate" type="date" defaultValue={editing?.endDate ?? ""} />
            </Field>
          </div>
          <Field label="Tech stack" hint="Comma-separated">
            <Input name="techStack" defaultValue={editing?.techStack.join(", ")} />
          </Field>
          <BilingualField
            label="Description"
            en={<Textarea name="description" rows={5} maxLength={4000} defaultValue={editing?.description} />}
            tr={<Textarea name="descriptionTr" rows={5} maxLength={4000} defaultValue={editing?.descriptionTr} />}
          />
        </FormShell>
      }
    />
  );
}
