import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { ProjectForm } from "@/components/admin/project-form";
import { Button } from "@/components/ui/button";
import { getContainer } from "@/lib/container";
import { idSchema } from "@/lib/validation/portfolio";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();

  const project = await getContainer().projectService.getById(id);
  if (!project) notFound();

  return (
    <div className="grid max-w-4xl gap-8">
      <PageHeader
        title={`Edit: ${project.title}`}
        actions={
          project.published && (
            <Button asChild variant="outline" size="sm">
              {/* no language in the link, the middleware picks one */}
              <a href={`/projects/${project.slug}`} target="_blank" rel="noopener noreferrer">
                View live <ExternalLink />
              </a>
            </Button>
          )
        }
      />
      <ProjectForm key={project.updatedAt.toISOString()} project={project} />
    </div>
  );
}
