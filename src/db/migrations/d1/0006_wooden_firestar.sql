ALTER TABLE `expense_transactions`
ADD `occurred_at` text
CONSTRAINT "expense_transactions_occurred_at_check"
CHECK(
	`occurred_at` is null or (
		length(`occurred_at`) = 16
		and `occurred_at` glob '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]T[0-9][0-9]:[0-9][0-9]'
	)
);
