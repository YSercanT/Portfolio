DROP INDEX "projects_tags_gin_idx";--> statement-breakpoint
ALTER TABLE "projects" drop column "search_vector";--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "search_vector" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('english', coalesce("title", '')), 'A')
        || setweight(to_tsvector('english', coalesce("summary", '')), 'B')
        || setweight(to_tsvector('english', coalesce("content_md", '')), 'C')) STORED;--> statement-breakpoint
-- Hand-written: dropping the generated column dropped its GIN index; drizzle-kit does not recreate it.
CREATE INDEX "projects_search_gin_idx" ON "projects" USING gin ("search_vector");--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "content";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "tags";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "cover_image_url";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "repo_url";