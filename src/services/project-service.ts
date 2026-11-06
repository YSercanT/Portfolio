import { cacheKeys, getOrSet, type CacheStore } from "@/lib/cache/cache-store";
import type {
  CreateProjectInput,
  Project,
  ProjectCursor,
  ProjectRepository,
  UpdateProjectInput,
} from "@/repositories/interfaces/project-repository";

const PROJECT_TTL_SEC = 60 * 10;
const LIST_TTL_SEC = 60 * 5;
export const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;

// Project logic. Only talks to the repository and cache interfaces, not Drizzle
// or Redis directly, so it's easy to test with fakes.
export class ProjectService {
  constructor(
    private readonly repo: ProjectRepository,
    private readonly cache: CacheStore,
  ) {}

  // read from cache, fall back to the db
  getPublishedBySlug(slug: string): Promise<Project | null> {
    return getOrSet(this.cache, cacheKeys.projectBySlug(slug), PROJECT_TTL_SEC, async () => {
      const project = await this.repo.findBySlug(slug);
      return project?.published ? project : null;
    });
  }

  // Only the first page (what the homepage loads) is cached, so there's just one
  // list key to clear on changes. Other pages hit the db, which is fast enough.
  listPublished(limit = DEFAULT_PAGE_SIZE, after?: ProjectCursor): Promise<Project[]> {
    const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_SIZE);
    if (after || safeLimit !== DEFAULT_PAGE_SIZE) return this.repo.listPublished({ limit: safeLimit, after });
    return getOrSet(this.cache, cacheKeys.publishedProjectsFirstPage(safeLimit), LIST_TTL_SEC, () =>
      this.repo.listPublished({ limit: safeLimit }),
    );
  }

  // not cached: rarely requested, and it shouldn't show a project right after it's unpublished
  listSitemapEntries(): Promise<{ slug: string; updatedAt: Date }[]> {
    return this.repo.listPublishedSlugs();
  }

  search(query: string, limit = DEFAULT_PAGE_SIZE): Promise<Project[]> {
    const q = query.trim();
    if (q.length === 0) return Promise.resolve([]);
    return this.repo.searchPublished(q.slice(0, 200), Math.min(limit, MAX_PAGE_SIZE));
  }

  // admin reads, never cached

  listAll(): Promise<Project[]> {
    return this.repo.listAll();
  }

  getById(id: string): Promise<Project | null> {
    return this.repo.findById(id);
  }

  // admin writes, each one clears the related cache

  async create(input: CreateProjectInput): Promise<Project> {
    const project = await this.repo.create(input);
    await this.invalidate(project.slug);
    return project;
  }

  async update(id: string, input: UpdateProjectInput): Promise<Project | null> {
    const before = await this.repo.findById(id);
    const project = await this.repo.update(id, input);
    if (project) await this.invalidate(project.slug, before?.slug);
    return project;
  }

  async delete(id: string): Promise<Project | null> {
    const project = await this.repo.delete(id);
    if (project) await this.invalidate(project.slug);
    return project;
  }

  private async invalidate(...slugs: (string | undefined)[]): Promise<void> {
    const keys = [
      ...new Set(slugs.filter((s): s is string => Boolean(s)).map(cacheKeys.projectBySlug)),
      // the only cached list page, see listPublished
      cacheKeys.publishedProjectsFirstPage(DEFAULT_PAGE_SIZE),
    ];
    try {
      await this.cache.del(...keys);
    } catch (err) {
      // not fatal, the entry expires on its own
      console.error("[project-service] cache invalidation failed", err);
    }
  }
}
