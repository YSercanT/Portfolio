import "server-only";
import { and, asc, desc, eq, getTableColumns, sql } from "drizzle-orm";
import type { Database } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import type {
  CreateProjectInput,
  ListProjectsOptions,
  Project,
  ProjectRepository,
  UpdateProjectInput,
} from "@/repositories/interfaces/project-repository";

// all columns except the search vector
const { searchVector: _searchVector, ...projectColumns } = getTableColumns(projects);

// ProjectRepository on top of Drizzle. User input always goes in as query
// parameters (Drizzle handles that, also in the sql`` tag), never pasted into the SQL.
export class DrizzleProjectRepository implements ProjectRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<Project | null> {
    const [row] = await this.db.select(projectColumns).from(projects).where(eq(projects.id, id)).limit(1);
    return row ?? null;
  }

  async findBySlug(slug: string): Promise<Project | null> {
    const [row] = await this.db
      .select(projectColumns)
      .from(projects)
      .where(eq(projects.slug, slug)) // uses the unique slug index
      .limit(1);
    return row ?? null;
  }

  async listAll(): Promise<Project[]> {
    return this.db.select(projectColumns).from(projects).orderBy(asc(projects.sortOrder), desc(projects.createdAt));
  }

  async listPublished({ limit, after }: ListProjectsOptions): Promise<Project[]> {
    // cursor based paging instead of OFFSET, which gets slower the further you go
    return this.db
      .select(projectColumns)
      .from(projects)
      .where(
        and(
          eq(projects.published, true),
          after ? sql`(${projects.sortOrder}, ${projects.id}) > (${after.sortOrder}, ${after.id})` : undefined,
        ),
      )
      .orderBy(asc(projects.sortOrder), asc(projects.id))
      .limit(limit);
  }

  async listPublishedSlugs(): Promise<{ slug: string; updatedAt: Date }[]> {
    return this.db
      .select({ slug: projects.slug, updatedAt: projects.updatedAt })
      .from(projects)
      .where(eq(projects.published, true)) // matches the partial index on published rows
      .orderBy(asc(projects.sortOrder), asc(projects.id));
  }

  async searchPublished(query: string, limit: number): Promise<Project[]> {
    // websearch_to_tsquery accepts whatever the user types (quotes, -, OR) without
    // throwing, unlike to_tsquery
    const tsQuery = sql`websearch_to_tsquery('english', ${query})`;
    return this.db
      .select(projectColumns)
      .from(projects)
      .where(and(eq(projects.published, true), sql`${projects.searchVector} @@ ${tsQuery}`)) // uses the GIN index
      .orderBy(desc(sql`ts_rank(${projects.searchVector}, ${tsQuery})`))
      .limit(limit);
  }

  async create(input: CreateProjectInput): Promise<Project> {
    const [row] = await this.db.insert(projects).values(input).returning(projectColumns);
    if (!row) throw new Error("Insert returned no row");
    return row;
  }

  async update(id: string, input: UpdateProjectInput): Promise<Project | null> {
    const [row] = await this.db.update(projects).set(input).where(eq(projects.id, id)).returning(projectColumns);
    return row ?? null;
  }

  async delete(id: string): Promise<Project | null> {
    const [row] = await this.db.delete(projects).where(eq(projects.id, id)).returning(projectColumns);
    return row ?? null;
  }
}
