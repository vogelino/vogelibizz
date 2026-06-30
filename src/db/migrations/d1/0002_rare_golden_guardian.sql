ALTER TABLE `clients` ADD `client_number` text;--> statement-breakpoint
ALTER TABLE `invoices` ADD `client_id` integer REFERENCES clients(id);