CREATE TYPE "public"."demo_media_type" AS ENUM('video_hosted', 'youtube_embed', 'image');--> statement-breakpoint
CREATE TABLE "education" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"degree" varchar(160) NOT NULL,
	"institution" varchar(160) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "education_dates_ck" CHECK ("end_date" IS NULL OR "end_date" >= "start_date")
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" smallint PRIMARY KEY DEFAULT 1 NOT NULL,
	"name" varchar(120) NOT NULL,
	"title" varchar(160) NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"avatar_url" text,
	"github_url" text,
	"linkedin_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profile_singleton_ck" CHECK ("id" = 1)
);
--> statement-breakpoint
CREATE TABLE "publications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(300) NOT NULL,
	"publisher" varchar(200) NOT NULL,
	"published_on" date NOT NULL,
	"abstract" text DEFAULT '' NOT NULL,
	"url" text,
	"search_vector" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('english', coalesce("title", '')), 'A')
        || setweight(to_tsvector('english', coalesce("abstract", '')), 'B')) STORED,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_experience" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" varchar(160) NOT NULL,
	"company" varchar(160) NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"description" text DEFAULT '' NOT NULL,
	"tech_stack" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "work_experience_dates_ck" CHECK ("end_date" IS NULL OR "end_date" >= "start_date")
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "content_md" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "tech_stack" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "github_repo_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "demo_media_type" "demo_media_type";--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "demo_media_url" text;--> statement-breakpoint
CREATE INDEX "education_timeline_idx" ON "education" USING btree ("end_date" DESC NULLS FIRST,"start_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "publications_published_on_idx" ON "publications" USING btree ("published_on" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "publications_search_gin_idx" ON "publications" USING gin ("search_vector");--> statement-breakpoint
CREATE INDEX "work_experience_timeline_idx" ON "work_experience" USING btree ("end_date" DESC NULLS FIRST,"start_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "work_experience_tech_gin_idx" ON "work_experience" USING gin ("tech_stack");--> statement-breakpoint
CREATE INDEX "projects_tech_stack_gin_idx" ON "projects" USING gin ("tech_stack");--> statement-breakpoint
-- Backfill (hand-written): carry existing data into the new columns before the contract migration.
UPDATE "projects" SET "content_md" = "content", "github_repo_url" = "repo_url", "tech_stack" = "tags";
