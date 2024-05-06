CREATE TABLE IF NOT EXISTS "currencies" (
	"original_currency" "currency" PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL,
	"usdRate" double precision DEFAULT 0 NOT NULL,
	CONSTRAINT "currencies_original_currency_unique" UNIQUE("original_currency")
);
--> statement-breakpoint
ALTER TABLE "expenses" RENAME COLUMN "price" TO "original_price";--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "original_currency" DROP DEFAULT;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "expenses" ADD CONSTRAINT "expenses_original_currency_currencies_original_currency_fk" FOREIGN KEY ("original_currency") REFERENCES "currencies"("original_currency") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
