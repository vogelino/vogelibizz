ALTER TABLE `clients` ADD `language` text DEFAULT 'de-DE' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `hourly_rate` integer DEFAULT 50 NOT NULL;