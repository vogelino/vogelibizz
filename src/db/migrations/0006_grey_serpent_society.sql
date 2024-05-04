ALTER TABLE "invoices" ALTER COLUMN "last_modified" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "last_modified" SET NOT NULL;