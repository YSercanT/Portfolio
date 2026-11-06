import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { deleteProject } from "@/app/admin/_actions/projects";
import { DeleteButton } from "@/components/admin/delete-button";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getContainer } from "@/lib/container";

export default async function AdminProjectsPage() {
  const projects = await getContainer().projectService.listAll();

  return (
    <div className="grid max-w-5xl gap-8">
      <PageHeader
        title="Projects"
        description="Curated portfolio entries. Drafts are only visible here."
        actions={
          <Button asChild>
            <Link href="/admin/projects/new">
              <Plus /> New project
            </Link>
          </Button>
        }
      />
      {projects.length === 0 ? (
        <p className="text-muted-foreground">No projects yet.</p>
      ) : (
        <Card className="gap-0 divide-y py-0">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center gap-4 px-6 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{p.title}</span>
                  {p.published ? <Badge variant="secondary">Published</Badge> : <Badge variant="outline">Draft</Badge>}
                  {p.featured && <Badge>Featured</Badge>}
                </div>
                <p className="truncate font-mono text-xs text-muted-foreground">/projects/{p.slug}</p>
              </div>
              <Button asChild variant="ghost" size="icon" aria-label="Edit">
                <Link href={`/admin/projects/${p.id}`}>
                  <Pencil />
                </Link>
              </Button>
              <DeleteButton action={deleteProject} id={p.id} confirmText={`Delete "${p.title}"?`} />
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
