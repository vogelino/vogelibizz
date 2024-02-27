DO $$ BEGIN
 CREATE TYPE "project_status" AS ENUM('todo', 'active', 'paused', 'done', 'cancelled', 'negotiating', 'waiting_for_feedback');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "clients_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"date" date DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "invoices_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"description" text,
	"status" "project_status" DEFAULT 'todo' NOT NULL,
	CONSTRAINT "projects_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects_to_clients" (
	"project_id" serial NOT NULL,
	"client_id" serial NOT NULL,
	CONSTRAINT "projects_to_clients_project_id_client_id_pk" PRIMARY KEY("project_id","client_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects_to_invoices" (
	"project_id" serial NOT NULL,
	"invoice_id" serial NOT NULL,
	CONSTRAINT "projects_to_invoices_project_id_invoice_id_pk" PRIMARY KEY("project_id","invoice_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects_to_quotes" (
	"project_id" serial NOT NULL,
	"quote_id" serial NOT NULL,
	CONSTRAINT "projects_to_quotes_project_id_quote_id_pk" PRIMARY KEY("project_id","quote_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"date" date DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "quotes_name_unique" UNIQUE("name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects_to_clients" ADD CONSTRAINT "projects_to_clients_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects_to_clients" ADD CONSTRAINT "projects_to_clients_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects_to_invoices" ADD CONSTRAINT "projects_to_invoices_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects_to_invoices" ADD CONSTRAINT "projects_to_invoices_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects_to_quotes" ADD CONSTRAINT "projects_to_quotes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects_to_quotes" ADD CONSTRAINT "projects_to_quotes_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "quotes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
