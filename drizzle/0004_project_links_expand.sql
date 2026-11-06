ALTER TABLE "projects" ADD COLUMN "live_site_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "kaggle_url" text;--> statement-breakpoint
-- Backfill (hand-written): live_url is being renamed to live_site_url.
UPDATE "projects" SET "live_site_url" = "live_url" WHERE "live_url" IS NOT NULL;
