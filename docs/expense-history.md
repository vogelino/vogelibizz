# Expense history operations

## Supported import format

Import the Finanzassistent `.xlsx` export available from the bank. The importer
finds its transaction table after the workbook's title and
metadata rows. The table must include `Datum`, `Gegenpartei`, `Betrag`,
`Währung`, `Kategorie`, and `Buchungstext`.

- Only CHF transactions are supported. Negative amounts are imported as
  expenses; positive credits are skipped and reported in the preview.
- `Datum` determines each transaction's calendar month. Native Excel dates and
  supported text dates are normalized to `YYYY-MM-DD`.
- `Gegenpartei` becomes the transaction description, with `Buchungstext` used
  as a fallback.
- German Finanzassistent categories are translated to English expense
  categories and stored on the transaction. The complete supported list is:
  `Allgemeines`, `Apotheke & Drogerie`, `Auto`, `Bargeldbezug`,
  `Dienstleistungen`, `Gastronomie`, `Krankenversicherung`, `Lebensmittel`,
  `Lohn`, `Miete & Hypothek`, `Möbel & Einrichtung`, `Persönliches`, `Reisen`,
  `Shopping`, `Sparen & Anlegen`, `Steuern`, `Unterhaltung`,
  `Weitere Einnahmen`, `Zahlungen`, `Ärzte & Pflegedienste`, and
  `Öffentlicher Verkehr`. An unmapped category stops the import so it cannot
  be silently lost.

The preview shows all inferred months, debit count, total, skipped-credit count,
warnings, and which months already exist. Review the preview before
importing.

## Replacement and recovery

Only one active dataset exists per calendar month. Imports are never merged. If
any included month exists, the confirmation dialog explains that replacement
permanently removes all existing included months' transaction edits and
recurring-expense associations before the new rows are inserted.

The entire multi-month import is atomic: a validation or server failure leaves
all existing months unchanged. If an import fails, keep the current datasets,
correct or re-export the source file, preview it again, and retry. There is no
retained import draft or import
attempt history to recover; the previous active month remains the recovery point
until a replacement succeeds.

Deleting a recurring expense does not delete bank history. Its transactions
become unmatched and move to **Other expenses**. This does not change observed
spending.

## Privacy and troubleshooting

The raw source file is parsed in memory and is not retained or logged. Only
parsed transactions and a sanitized source-file basename are stored. The history read
API and UI do not expose the source filename.

For an actionable validation error, check the named row/header and re-preview the
corrected file. For a concurrent-edit warning, reload the month and review the
new values before retrying; this preserves the optimistic-concurrency contract.
Automatic transaction matching is intentionally unsupported: associations are
manual only.
