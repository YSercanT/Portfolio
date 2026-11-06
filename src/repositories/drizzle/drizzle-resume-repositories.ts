import "server-only";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import type { Database } from "@/lib/db";
import { education, PROFILE_ID, profile, publications, workExperience } from "@/lib/db/schema";
import type {
  Education,
  EducationInput,
  EducationRepository,
  Profile,
  ProfileInput,
  ProfileRepository,
  Publication,
  PublicationInput,
  PublicationRepository,
  WorkExperience,
  WorkExperienceInput,
  WorkExperienceRepository,
} from "@/repositories/interfaces/resume-repositories";

function firstOrThrow<T>(rows: T[]): T {
  const [row] = rows;
  if (!row) throw new Error("Write returned no row");
  return row;
}

export class DrizzleProfileRepository implements ProfileRepository {
  constructor(private readonly db: Database) {}

  async get(): Promise<Profile | null> {
    const [row] = await this.db.select().from(profile).where(eq(profile.id, PROFILE_ID)).limit(1);
    return row ?? null;
  }

  async upsert(input: ProfileInput): Promise<Profile> {
    return firstOrThrow(
      await this.db
        .insert(profile)
        .values({ id: PROFILE_ID, ...input })
        .onConflictDoUpdate({ target: profile.id, set: { ...input, updatedAt: new Date() } })
        .returning(),
    );
  }
}

// ongoing entries first, then newest (matches the timeline indexes)
const timelineOrder = (t: typeof education | typeof workExperience) => [
  sql`${t.endDate} DESC NULLS FIRST`,
  desc(t.startDate),
];

export class DrizzleEducationRepository implements EducationRepository {
  constructor(private readonly db: Database) {}

  list(): Promise<Education[]> {
    return this.db.select().from(education).orderBy(...timelineOrder(education));
  }

  async findById(id: string): Promise<Education | null> {
    const [row] = await this.db.select().from(education).where(eq(education.id, id)).limit(1);
    return row ?? null;
  }

  async create(input: EducationInput): Promise<Education> {
    return firstOrThrow(await this.db.insert(education).values(input).returning());
  }

  async update(id: string, input: EducationInput): Promise<Education | null> {
    const [row] = await this.db.update(education).set(input).where(eq(education.id, id)).returning();
    return row ?? null;
  }

  async delete(id: string): Promise<Education | null> {
    const [row] = await this.db.delete(education).where(eq(education.id, id)).returning();
    return row ?? null;
  }
}

export class DrizzleWorkExperienceRepository implements WorkExperienceRepository {
  constructor(private readonly db: Database) {}

  list(): Promise<WorkExperience[]> {
    return this.db.select().from(workExperience).orderBy(...timelineOrder(workExperience));
  }

  async findById(id: string): Promise<WorkExperience | null> {
    const [row] = await this.db.select().from(workExperience).where(eq(workExperience.id, id)).limit(1);
    return row ?? null;
  }

  async create(input: WorkExperienceInput): Promise<WorkExperience> {
    return firstOrThrow(await this.db.insert(workExperience).values(input).returning());
  }

  async update(id: string, input: WorkExperienceInput): Promise<WorkExperience | null> {
    const [row] = await this.db.update(workExperience).set(input).where(eq(workExperience.id, id)).returning();
    return row ?? null;
  }

  async delete(id: string): Promise<WorkExperience | null> {
    const [row] = await this.db.delete(workExperience).where(eq(workExperience.id, id)).returning();
    return row ?? null;
  }
}

const { searchVector: _sv, ...publicationColumns } = getTableColumns(publications);

export class DrizzlePublicationRepository implements PublicationRepository {
  constructor(private readonly db: Database) {}

  list(): Promise<Publication[]> {
    return this.db.select(publicationColumns).from(publications).orderBy(desc(publications.publishedOn));
  }

  async findById(id: string): Promise<Publication | null> {
    const [row] = await this.db.select(publicationColumns).from(publications).where(eq(publications.id, id)).limit(1);
    return row ?? null;
  }

  async create(input: PublicationInput): Promise<Publication> {
    return firstOrThrow(await this.db.insert(publications).values(input).returning(publicationColumns));
  }

  async update(id: string, input: PublicationInput): Promise<Publication | null> {
    const [row] = await this.db
      .update(publications)
      .set(input)
      .where(eq(publications.id, id))
      .returning(publicationColumns);
    return row ?? null;
  }

  async delete(id: string): Promise<Publication | null> {
    const [row] = await this.db.delete(publications).where(eq(publications.id, id)).returning(publicationColumns);
    return row ?? null;
  }
}
