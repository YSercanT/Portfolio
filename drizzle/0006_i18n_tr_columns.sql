ALTER TABLE "education" ADD COLUMN "degree_tr" varchar(160) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "education" ADD COLUMN "institution_tr" varchar(160) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "education" ADD COLUMN "description_tr" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "title_tr" varchar(160) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "bio_tr" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "summary_tr" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "content_md_tr" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "publications" ADD COLUMN "title_tr" varchar(300) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "publications" ADD COLUMN "abstract_tr" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "work_experience" ADD COLUMN "role_tr" varchar(160) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "work_experience" ADD COLUMN "description_tr" text DEFAULT '' NOT NULL;