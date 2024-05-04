ALTER TABLE "expenses" ALTER COLUMN "last_modified" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "last_modified" SET NOT NULL;