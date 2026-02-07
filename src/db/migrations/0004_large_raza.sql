DO $$ BEGIN
 CREATE TYPE "currency" AS ENUM('CLF', 'CLP', 'EUR', 'CHF', 'USD', 'JPY', 'GBP', 'CNY', 'AUD', 'CAD', 'HKD', 'SGD', 'SEK', 'KRW', 'NOK', 'NZD', 'INR', 'MXN', 'TWD', 'ZAR', 'BRL', 'DKK', 'PLN', 'THB', 'ILS', 'IDR', 'CZK', 'AED', 'TRY', 'HUF', 'SAR', 'PHP', 'MYR', 'COP', 'RUB', 'RON', 'PEN', 'BHD', 'BGN', 'ARS');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "original_currency" "currency" DEFAULT 'CLP' NOT NULL;
