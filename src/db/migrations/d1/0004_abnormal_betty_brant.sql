CREATE TABLE `expense_months` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`month` text NOT NULL,
	`source_filename` text NOT NULL,
	`imported_at` text NOT NULL,
	`last_modified` text NOT NULL,
	`imported_debit_count` integer NOT NULL,
	`skipped_credit_count` integer DEFAULT 0 NOT NULL,
	CONSTRAINT "expense_months_month_check" CHECK(length("expense_months"."month") = 7
				and "expense_months"."month" glob '[0-9][0-9][0-9][0-9]-[0-9][0-9]'
				and cast(substr("expense_months"."month", 6, 2) as integer) between 1 and 12),
	CONSTRAINT "expense_months_source_filename_check" CHECK(length(trim("expense_months"."source_filename")) > 0),
	CONSTRAINT "expense_months_imported_debit_count_check" CHECK("expense_months"."imported_debit_count" >= 0),
	CONSTRAINT "expense_months_skipped_credit_count_check" CHECK("expense_months"."skipped_credit_count" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `expense_months_month_unique` ON `expense_months` (`month`);--> statement-breakpoint
CREATE TABLE `expense_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`expense_month_id` integer NOT NULL,
	`expense_id` integer,
	`booked_at` text NOT NULL,
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
	CONSTRAINT "expense_transactions_booked_at_check" CHECK(length("expense_transactions"."booked_at") = 10
				and "expense_transactions"."booked_at" glob '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
	CONSTRAINT "expense_transactions_value_date_check" CHECK("expense_transactions"."value_date" is null or (
				length("expense_transactions"."value_date") = 10
				and "expense_transactions"."value_date" glob '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
			)),
	CONSTRAINT "expense_transactions_original_description_check" CHECK(length(trim("expense_transactions"."original_description")) > 0),
	CONSTRAINT "expense_transactions_description_check" CHECK(length(trim("expense_transactions"."description")) > 0),
	CONSTRAINT "expense_transactions_original_amount_check" CHECK("expense_transactions"."original_amount" > 0),
	CONSTRAINT "expense_transactions_amount_check" CHECK("expense_transactions"."amount" >= 0),
	CONSTRAINT "expense_transactions_source_order_check" CHECK("expense_transactions"."source_order" >= 0)
);
--> statement-breakpoint
CREATE INDEX `expense_transactions_expense_month_idx` ON `expense_transactions` (`expense_month_id`);--> statement-breakpoint
CREATE INDEX `expense_transactions_expense_idx` ON `expense_transactions` (`expense_id`);--> statement-breakpoint
CREATE INDEX `expense_transactions_booked_at_idx` ON `expense_transactions` (`booked_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `expense_transactions_month_source_order_unique` ON `expense_transactions` (`expense_month_id`,`source_order`);