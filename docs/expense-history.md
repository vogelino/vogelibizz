# Expense history operations

## Supported CSV contract

Import exactly one CHF bank statement per calendar month from **Expenses →
Expenses History**. The file must be semicolon-delimited and contain these exact
headers:

```text
IBAN;Booked At;Text;Credit/Debit Amount;Balance;Valuta Date
```

- `Booked At` determines the calendar month. Dates may use `DD.MM.YYYY` or
  `YYYY-MM-DD`; every transaction row must belong to the same month.
- Debit amounts must be negative. They are stored and displayed as positive CHF
  expense magnitudes. Positive credit rows are skipped and reported in the
  preview. Zero amounts are rejected.
- Amounts may use a dot or comma decimal separator and apostrophes or spaces as
  thousands separators.
- A row containing only `Text` continues the preceding transaction description.
  A continuation row without a preceding transaction is rejected.
- Missing headers, invalid dates or amounts, empty/credit-only files, and files
  spanning multiple booked months are rejected before anything is written.

The preview shows the inferred month, debit count, total, skipped-credit count,
warnings, and whether that month already exists. Review the preview before
importing.

## Replacement and recovery

Only one active dataset exists per calendar month. Imports are never merged. If
the month exists, the confirmation dialog explains that replacement permanently
removes that month's transaction edits and recurring-expense associations before
the new rows are inserted.

Replacement is atomic: a validation or server failure leaves the existing month
unchanged. If an import fails, keep the current dataset, correct or re-export the
CSV, preview it again, and retry. There is no retained import draft or import
attempt history to recover; the previous active month remains the recovery point
until a replacement succeeds.

Deleting a recurring expense does not delete bank history. Its transactions
become unmatched and move to **Other expenses**. This does not change observed
spending.

## Privacy and troubleshooting

The raw CSV is parsed in memory and is not retained or logged. Only parsed
transactions and a sanitized source-file basename are stored. The history read
API and UI do not expose the source filename.

For an actionable validation error, check the named row/header and re-preview the
corrected file. For a concurrent-edit warning, reload the month and review the
new values before retrying; this preserves the optimistic-concurrency contract.
Automatic transaction matching is intentionally unsupported: associations are
manual only.
