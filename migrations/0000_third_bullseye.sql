CREATE TABLE `clients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`legal_name` text,
	`address_line_1` text,
	`address_line_2` text,
	`address_line_3` text,
	`tax_id` text,
	`svg_logo_string` text,
	`svg_icon_string` text,
	`created_at` text NOT NULL,
	`last_modified` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clients_name_unique` ON `clients` (`name`);--> statement-breakpoint
CREATE TABLE `currencies` (
	`original_currency` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`last_modified` text NOT NULL,
	`usdRate` real DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `currencies_original_currency_unique` ON `currencies` (`original_currency`);--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`last_modified` text NOT NULL,
	`name` text NOT NULL,
	`category` text DEFAULT 'Software' NOT NULL,
	`type` text DEFAULT 'Personal' NOT NULL,
	`rate` text DEFAULT 'Monthly' NOT NULL,
	`original_price` real DEFAULT 0 NOT NULL,
	`original_currency` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `expenses_name_unique` ON `expenses` (`name`);--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`last_modified` text NOT NULL,
	`date` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoices_name_unique` ON `invoices` (`name`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` text NOT NULL,
	`last_modified` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'todo' NOT NULL,
	`content` text DEFAULT ''
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_name_unique` ON `projects` (`name`);--> statement-breakpoint
CREATE TABLE `projects_to_clients` (
	`project_id` integer,
	`client_id` integer,
	PRIMARY KEY(`project_id`, `client_id`),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `projects_to_invoices` (
	`project_id` integer,
	`invoice_id` integer,
	PRIMARY KEY(`project_id`, `invoice_id`),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `projects_to_quotes` (
	`project_id` integer,
	`quote_id` integer,
	PRIMARY KEY(`project_id`, `quote_id`),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` text NOT NULL,
	`last_modified` text NOT NULL,
	`date` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quotes_name_unique` ON `quotes` (`name`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company_display_name` text NOT NULL,
	`target_currency` text DEFAULT 'CLP' NOT NULL,
	`company_legal_name` text,
	`company_svg_logo_string` text,
	`company_svg_icon_string` text,
	`company_tax_id` text,
	`company_street_name` text,
	`company_street_number` text,
	`company_district` text,
	`company_country_code` text,
	`company_email` text,
	`company_phone` text,
	`company_website` text,
	`company_bank_owner` text,
	`company_bank_name` text,
	`company_bank_account_number` text,
	`company_bank_address` text,
	`company_bank_swift_code` text,
	`company_default_hourly_rate` integer DEFAULT 50
);
