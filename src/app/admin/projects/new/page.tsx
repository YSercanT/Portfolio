import { PageHeader } from "@/components/admin/page-header";
import { ProjectForm } from "@/components/admin/project-form";

export default function NewProjectPage() {
  return (
    <div className="grid max-w-4xl gap-8">
      <PageHeader title="New project" />
      <ProjectForm />
    </div>
  );
}
