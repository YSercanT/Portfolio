import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  customType,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ---- shared helpers ----

// Drizzle doesn't ship a tsvector type, so define one.
const tsvector = customType<{ data: string }>({
  dataType: () => "tsvector",
});

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

const emptyTextArray = sql`'{}'::text[]`;

// Every translatable column `x` gets a Turkish copy `x_tr`. English is required,
// Turkish defaults to '' and the site shows English when it's empty (see i18n/localize.ts).
const trText = (name: string) => text(name).notNull().default("");
const trVarchar = (name: string, length: number) => varchar(name, { length }).notNull().default("");

// ---- enums ----

export const userRole = pgEnum("user_role", ["admin", "editor"]);
export const playgroundRunStatus = pgEnum("playground_run_status", ["success", "error", "rate_limited"]);
export const demoMediaType = pgEnum("demo_media_type", ["video_hosted", "youtube_embed", "image"]);

// ---- users (admin accounts) ----

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // stored lower-case, the repository takes care of that
    email: varchar("email", { length: 320 }).notNull(),
    name: varchar("name", { length: 120 }),
    passwordHash: text("password_hash").notNull(),
    role: userRole("role").notNull().default("editor"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    // sessions older than this get rejected, see lib/actions.ts
    passwordChangedAt: timestamp("password_changed_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [uniqueIndex("users_email_uq").on(t.email)],
);

// ---- profile (always exactly one row) ----

export const PROFILE_ID = 1;

export const profile = pgTable(
  "profile",
  {
    // fixed id + check constraint so there can only ever be one profile row
    id: smallint("id").primaryKey().default(PROFILE_ID),
    name: varchar("name", { length: 120 }).notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    titleTr: trVarchar("title_tr", 160),
    bio: text("bio").notNull().default(""),
    bioTr: trText("bio_tr"),
    avatarUrl: text("avatar_url"),
    githubUrl: text("github_url"),
    linkedinUrl: text("linkedin_url"),
    ...timestamps,
  },
  () => [check("profile_singleton_ck", sql`"id" = 1`)],
);

// ---- education / work experience ----

export const education = pgTable(
  "education",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    degree: varchar("degree", { length: 160 }).notNull(),
    degreeTr: trVarchar("degree_tr", 160),
    institution: varchar("institution", { length: 160 }).notNull(),
    institutionTr: trVarchar("institution_tr", 160),
    startDate: date("start_date", { mode: "string" }).notNull(),
    endDate: date("end_date", { mode: "string" }), // null while still studying
    description: text("description").notNull().default(""),
    descriptionTr: trText("description_tr"),
    ...timestamps,
  },
  (t) => [
    // same order the timeline uses: ongoing first, then newest
    index("education_timeline_idx").on(t.endDate.desc().nullsFirst(), t.startDate.desc()),
    check("education_dates_ck", sql`"end_date" IS NULL OR "end_date" >= "start_date"`),
  ],
);

export const workExperience = pgTable(
  "work_experience",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    role: varchar("role", { length: 160 }).notNull(),
    roleTr: trVarchar("role_tr", 160),
    company: varchar("company", { length: 160 }).notNull(),
    startDate: date("start_date", { mode: "string" }).notNull(),
    endDate: date("end_date", { mode: "string" }), // null = current job
    description: text("description").notNull().default(""),
    descriptionTr: trText("description_tr"),
    techStack: text("tech_stack").array().notNull().default(emptyTextArray),
    ...timestamps,
  },
  (t) => [
    index("work_experience_timeline_idx").on(t.endDate.desc().nullsFirst(), t.startDate.desc()),
    // lets us query things like tech_stack @> ARRAY['Rust']
    index("work_experience_tech_gin_idx").using("gin", t.techStack),
    check("work_experience_dates_ck", sql`"end_date" IS NULL OR "end_date" >= "start_date"`),
  ],
);

// ---- publications ----

export const publications = pgTable(
  "publications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 300 }).notNull(),
    titleTr: trVarchar("title_tr", 300),
    publisher: varchar("publisher", { length: 200 }).notNull(), // journal or conference
    publishedOn: date("published_on", { mode: "string" }).notNull(),
    abstract: text("abstract").notNull().default(""),
    abstractTr: trText("abstract_tr"),
    url: text("url"),
    searchVector: tsvector("search_vector").generatedAlwaysAs(
      sql`setweight(to_tsvector('english', coalesce("title", '')), 'A')
        || setweight(to_tsvector('english', coalesce("abstract", '')), 'B')`,
    ),
    ...timestamps,
  },
  (t) => [
    index("publications_published_on_idx").on(t.publishedOn.desc()),
    index("publications_search_gin_idx").using("gin", t.searchVector),
  ],
);

// ---- projects ----

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 160 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    summary: text("summary").notNull().default(""),
    summaryTr: trText("summary_tr"), // short description
    // long write-up in Markdown
    contentMd: text("content_md").notNull().default(""),
    contentMdTr: trText("content_md_tr"),
    techStack: text("tech_stack").array().notNull().default(emptyTextArray),
    // optional links, each one shows up as a button when filled in
    githubRepoUrl: text("github_repo_url"),
    liveSiteUrl: text("live_site_url"),
    kaggleUrl: text("kaggle_url"),
    demoMediaType: demoMediaType("demo_media_type"),
    demoMediaUrl: text("demo_media_url"),
    featured: boolean("featured").notNull().default(false),
    published: boolean("published").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    publishedAt: timestamp("published_at", { withTimezone: true }),

    // search text, kept up to date by Postgres. Title counts most, then summary, then content.
    searchVector: tsvector("search_vector").generatedAlwaysAs(
      sql`setweight(to_tsvector('english', coalesce("title", '')), 'A')
        || setweight(to_tsvector('english', coalesce("summary", '')), 'B')
        || setweight(to_tsvector('english', coalesce("content_md", '')), 'C')`,
    ),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("projects_slug_uq").on(t.slug),
    index("projects_published_order_idx").on(t.sortOrder, t.id).where(sql`"published" = true`),
    index("projects_search_gin_idx").using("gin", t.searchVector),
    // for filtering by technology
    index("projects_tech_stack_gin_idx").using("gin", t.techStack),
  ],
);

// ---- playground runs (usage log) ----

export const playgroundRuns = pgTable(
  "playground_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    model: varchar("model", { length: 100 }).notNull(),
    clientHash: varchar("client_hash", { length: 64 }).notNull(),
    status: playgroundRunStatus("status").notNull(),
    promptTokens: integer("prompt_tokens").notNull().default(0),
    completionTokens: integer("completion_tokens").notNull().default(0),
    latencyMs: integer("latency_ms").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("playground_runs_created_at_idx").on(t.createdAt.desc()),
    index("playground_runs_client_created_idx").on(t.clientHash, t.createdAt.desc()),
  ],
);

// ---- row types ----

export type UserRow = typeof users.$inferSelect;
export type UserRole = (typeof userRole.enumValues)[number];
export type DemoMediaType = (typeof demoMediaType.enumValues)[number];

export type ProfileRow = typeof profile.$inferSelect;
export type EducationRow = typeof education.$inferSelect;
export type WorkExperienceRow = typeof workExperience.$inferSelect;
export type PublicationRow = typeof publications.$inferSelect;
export type ProjectRow = typeof projects.$inferSelect;
export type NewProjectRow = typeof projects.$inferInsert;
export type PlaygroundRunRow = typeof playgroundRuns.$inferSelect;
