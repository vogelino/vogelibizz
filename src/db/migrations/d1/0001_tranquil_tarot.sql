ALTER TABLE `invoices` ADD `invoice_number` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `invoices` ADD `client_number` text DEFAULT '0001' NOT NULL;--> statement-breakpoint
ALTER TABLE `invoices` ADD `subject` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `invoices` ADD `introduction` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `invoices` ADD `foot_note` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `invoices` ADD `currency` text DEFAULT 'EUR' NOT NULL;--> statement-breakpoint
ALTER TABLE `invoices` ADD `language` text DEFAULT 'de-DE' NOT NULL;--> statement-breakpoint
ALTER TABLE `invoices` ADD `hourly_rate` integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE `invoices` ADD `invoice_location` text DEFAULT 'Santiago' NOT NULL;--> statement-breakpoint
ALTER TABLE `invoices` ADD `rows` text DEFAULT '[]' NOT NULL;