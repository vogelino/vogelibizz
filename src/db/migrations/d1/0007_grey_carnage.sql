PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_expense_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`expense_month_id` integer NOT NULL,
	`expense_id` integer,
	`booked_at` text NOT NULL,
	`occurred_at` text,
	`value_date` text,
	`original_description` text NOT NULL,
	`description` text NOT NULL,
	`original_amount` real NOT NULL,
	`amount` real NOT NULL,
	`category` text,
	`type` text,
	`source_order` integer NOT NULL,
	`created_at` text NOT NULL,
	`last_modified` text NOT NULL,
	FOREIGN KEY (`expense_month_id`) REFERENCES `expense_months`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`expense_id`) REFERENCES `expenses`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "expense_transactions_booked_at_check" CHECK(length(`booked_at`) = 10
				and `booked_at` glob '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
	CONSTRAINT "expense_transactions_occurred_at_check" CHECK(`occurred_at` is null or (
				length(`occurred_at`) = 16
				and substr(`occurred_at`, 1, 10) glob '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
				and substr(`occurred_at`, 11, 6) glob 'T[0-9][0-9]:[0-9][0-9]'
			)),
	CONSTRAINT "expense_transactions_value_date_check" CHECK(`value_date` is null or (
				length(`value_date`) = 10
				and `value_date` glob '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
			)),
	CONSTRAINT "expense_transactions_original_description_check" CHECK(length(trim(`original_description`)) > 0),
	CONSTRAINT "expense_transactions_description_check" CHECK(length(trim(`description`)) > 0),
	CONSTRAINT "expense_transactions_original_amount_check" CHECK(`original_amount` > 0),
	CONSTRAINT "expense_transactions_amount_check" CHECK(`amount` >= 0),
	CONSTRAINT "expense_transactions_source_order_check" CHECK(`source_order` >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_expense_transactions`("id", "expense_month_id", "expense_id", "booked_at", "occurred_at", "value_date", "original_description", "description", "original_amount", "amount", "category", "type", "source_order", "created_at", "last_modified") SELECT "id", "expense_month_id", "expense_id", "booked_at", "occurred_at", "value_date", "original_description", "description", "original_amount", "amount", "category", "type", "source_order", "created_at", "last_modified" FROM `expense_transactions`;--> statement-breakpoint
DROP TABLE `expense_transactions`;--> statement-breakpoint
ALTER TABLE `__new_expense_transactions` RENAME TO `expense_transactions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `expense_transactions_expense_month_idx` ON `expense_transactions` (`expense_month_id`);--> statement-breakpoint
CREATE INDEX `expense_transactions_month_booked_order_idx` ON `expense_transactions` (`expense_month_id`,`booked_at`,`source_order`);--> statement-breakpoint
CREATE INDEX `expense_transactions_expense_idx` ON `expense_transactions` (`expense_id`);--> statement-breakpoint
CREATE INDEX `expense_transactions_booked_at_idx` ON `expense_transactions` (`booked_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `expense_transactions_month_source_order_unique` ON `expense_transactions` (`expense_month_id`,`source_order`);
