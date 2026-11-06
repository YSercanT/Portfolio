import Link from "next/link";
import { Pencil } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// admin page layout: list on the left, form on the right
export function CollectionLayout({
  title,
  description,
  basePath,
  editing,
  list,
  form,
}: {
  title: string;
  description: string;
  basePath: string;
  editing: boolean;
  list: React.ReactNode;
  form: React.ReactNode;
}) {
  return (
    <div className="grid max-w-6xl gap-8">
      <PageHeader title={title} description={description} />
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_420px]">
        {list}
        <Card className="lg:sticky lg:top-6">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>{editing ? "Edit entry" : "New entry"}</CardTitle>
            {editing && (
              <Button asChild variant="ghost" size="sm">
                <Link href={basePath}>Cancel</Link>
              </Button>
            )}
          </CardHeader>
          <CardContent>{form}</CardContent>
        </Card>
      </div>
    </div>
  );
}

// one row in the list, with edit and delete
export function EntryRow({
  id,
  basePath,
  deleteAction,
  active,
  children,
}: {
  id: string;
  basePath: string;
  deleteAction: (formData: FormData) => Promise<void>;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex items-start gap-2 px-6 py-4 ${active ? "bg-accent/40" : ""}`}>
      <div className="min-w-0 flex-1">{children}</div>
      <Button asChild variant="ghost" size="icon" aria-label="Edit">
        <Link href={`${basePath}?id=${id}`}>
          <Pencil />
        </Link>
      </Button>
      <DeleteButton action={deleteAction} id={id} />
    </div>
  );
}

export function EmptyList({ children }: { children: React.ReactNode }) {
  return <Card className="border-dashed px-6 text-sm text-muted-foreground">{children}</Card>;
}
