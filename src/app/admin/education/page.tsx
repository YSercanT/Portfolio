import { deleteEducation, saveEducation } from "@/app/admin/_actions/resume";
import { CollectionLayout, EmptyList, EntryRow } from "@/components/admin/collection-layout";
import { BilingualField } from "@/components/admin/bilingual-field";
import { Field } from "@/components/admin/field";
import { FormShell } from "@/components/admin/form-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getContainer } from "@/lib/container";
import { formatDateRange } from "@/lib/format";

const BASE = "/admin/education";

export default async function AdminEducationPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const [{ id }, items] = await Promise.all([searchParams, getContainer().educationRepository.list()]);
  const editing = items.find((i) => i.id === id);

  return (
    <CollectionLayout
      title="Education"
      description="Degrees shown on the homepage. Leave the end date empty if ongoing."
      basePath={BASE}
      editing={!!editing}
      list={
        items.length === 0 ? (
          <EmptyList>No education entries yet.</EmptyList>
        ) : (
          <Card className="gap-0 divide-y py-0">
            {items.map((i) => (
              <EntryRow key={i.id} id={i.id} basePath={BASE} deleteAction={deleteEducation} active={i.id === id}>
                <p className="font-medium">{i.degree}</p>
                <p className="text-sm text-muted-foreground">{i.institution}</p>
                <p className="text-xs text-muted-foreground">{formatDateRange(i.startDate, i.endDate)}</p>
              </EntryRow>
            ))}
          </Card>
        )
      }
      form={
        <FormShell key={editing?.id ?? "new"} action={saveEducation}>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <BilingualField
            label="Degree"
            en={<Input name="degree" required maxLength={160} defaultValue={editing?.degree} />}
            tr={<Input name="degreeTr" maxLength={160} defaultValue={editing?.degreeTr} />}
          />
          <BilingualField
            label="Institution"
            en={<Input name="institution" required maxLength={160} defaultValue={editing?.institution} />}
            tr={<Input name="institutionTr" maxLength={160} defaultValue={editing?.institutionTr} />}
          />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start date">
              <Input name="startDate" type="date" required defaultValue={editing?.startDate} />
            </Field>
            <Field label="End date">
              <Input name="endDate" type="date" defaultValue={editing?.endDate ?? ""} />
            </Field>
          </div>
          <BilingualField
            label="Description"
            en={<Textarea name="description" rows={4} maxLength={4000} defaultValue={editing?.description} />}
            tr={<Textarea name="descriptionTr" rows={4} maxLength={4000} defaultValue={editing?.descriptionTr} />}
          />
        </FormShell>
      }
    />
  );
}
