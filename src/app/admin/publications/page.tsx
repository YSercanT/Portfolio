import { deletePublication, savePublication } from "@/app/admin/_actions/resume";
import { CollectionLayout, EmptyList, EntryRow } from "@/components/admin/collection-layout";
import { BilingualField } from "@/components/admin/bilingual-field";
import { Field } from "@/components/admin/field";
import { FormShell } from "@/components/admin/form-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getContainer } from "@/lib/container";
import { formatMonthYear } from "@/lib/format";

const BASE = "/admin/publications";

export default async function AdminPublicationsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const [{ id }, items] = await Promise.all([searchParams, getContainer().publicationRepository.list()]);
  const editing = items.find((i) => i.id === id);

  return (
    <CollectionLayout
      title="Publications"
      description="Papers and conference proceedings, newest first."
      basePath={BASE}
      editing={!!editing}
      list={
        items.length === 0 ? (
          <EmptyList>No publications yet.</EmptyList>
        ) : (
          <Card className="gap-0 divide-y py-0">
            {items.map((i) => (
              <EntryRow key={i.id} id={i.id} basePath={BASE} deleteAction={deletePublication} active={i.id === id}>
                <p className="font-medium">{i.title}</p>
                <p className="text-xs text-muted-foreground">
                  {i.publisher} · {formatMonthYear(i.publishedOn)}
                </p>
              </EntryRow>
            ))}
          </Card>
        )
      }
      form={
        <FormShell key={editing?.id ?? "new"} action={savePublication}>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <BilingualField
            label="Title"
            en={<Textarea name="title" rows={2} required maxLength={300} defaultValue={editing?.title} />}
            tr={<Textarea name="titleTr" rows={2} maxLength={300} defaultValue={editing?.titleTr} />}
          />
          <Field label="Publisher / conference">
            <Input name="publisher" required maxLength={200} defaultValue={editing?.publisher} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date">
              <Input name="publishedOn" type="date" required defaultValue={editing?.publishedOn} />
            </Field>
            <Field label="URL (DOI, PDF…)">
              <Input name="url" type="url" defaultValue={editing?.url ?? ""} />
            </Field>
          </div>
          <BilingualField
            label="Abstract"
            en={<Textarea name="abstract" rows={6} maxLength={10_000} defaultValue={editing?.abstract} />}
            tr={<Textarea name="abstractTr" rows={6} maxLength={10_000} defaultValue={editing?.abstractTr} />}
          />
        </FormShell>
      }
    />
  );
}
