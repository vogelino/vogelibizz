DO $$ BEGIN
 CREATE TYPE "expense_category" AS ENUM('Essentials', 'Home', 'Domain', 'Health & Wellbeing', 'Entertainment', 'Charity', 'Present', 'Services', 'Hardware', 'Software', 'Hobby', 'Savings', 'Transport', 'Travel');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "expense_rate" AS ENUM('Monthly', 'Daily', 'Hourly', 'Weekly', 'Yearly', 'Quarterly', 'Semester', 'Bi-Weekly', 'Bi-Monthly', 'Bi-Yearly', 'One-time');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "expense_type" AS ENUM('Personal', 'Freelance');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp,
	"name" text NOT NULL,
	"category" "expense_category" DEFAULT 'Software' NOT NULL,
	"type" "expense_type" DEFAULT 'Personal' NOT NULL,
	"rate" "expense_rate" DEFAULT 'Monthly' NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	CONSTRAINT "expenses_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "last_modified" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "last_modified" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "last_modified" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "content" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "quotes" ADD COLUMN "last_modified" timestamp DEFAULT now() NOT NULL;