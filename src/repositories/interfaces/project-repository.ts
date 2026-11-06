import type { NewProjectRow, ProjectRow } from "@/lib/db/schema";

// a project row without the search_vector column
export type Project = Omit<ProjectRow, "searchVector">;
export type CreateProjectInput = Omit<NewProjectRow, "id" | "searchVector" | "createdAt" | "updatedAt">;
export type UpdateProjectInput = Partial<CreateProjectInput>;

// cursor for paging, matches the (sort_order, id) index
export interface ProjectCursor {
  sortOrder: number;
  id: string;
}

export interface ListProjectsOptions {
  limit: number;
  after?: ProjectCursor;
}

// What the project service needs from the database. The Drizzle version
// is in repositories/drizzle.
export interface ProjectRepository {
  findById(id: string): Promise<Project | null>;
  findBySlug(slug: string): Promise<Project | null>;
  // all projects including drafts, for the admin panel
  listAll(): Promise<Project[]>;
  // published projects, paged with a cursor
  listPublished(options: ListProjectsOptions): Promise<Project[]>;
  // just slug and date of every published project, for the sitemap
  listPublishedSlugs(): Promise<{ slug: string; updatedAt: Date }[]>;
  // full text search over published projects, best matches first
  searchPublished(query: string, limit: number): Promise<Project[]>;
  create(input: CreateProjectInput): Promise<Project>;
  update(id: string, input: UpdateProjectInput): Promise<Project | null>;
  delete(id: string): Promise<Project | null>;
}
