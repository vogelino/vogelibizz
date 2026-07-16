# Expenses History and Other Expenses — Living Implementation Plan

Last updated: 2026-07-16
Overall status: **In progress**
Current effort: **None — PR 2 complete; PR 3 not started**

## How to use and maintain this plan

This is a living plan and the source of truth for the implementation. It must be updated as the work progresses instead of being treated as a static proposal.

For every PR effort:

1. Before coding, mark that effort **In progress**, add its branch/PR link when available, and re-check its requirements against the current product decisions.
2. While coding, update the effort when scope, assumptions, schema, API contracts, or acceptance criteria change.
3. Never silently rewrite an agreed requirement. Update the requirement, record the change in the Decision and Requirement Change Log, and identify affected completed or pending PRs.
4. Check acceptance boxes only after the behavior is implemented and verified.
5. Before merging, record tests run, known limitations, migrations, and follow-up work.
6. After merging, mark the effort **Done**, update the requirement traceability table, and set the next effort as current.
7. If implementation reveals that later PR boundaries are no longer sensible, reorganize the remaining efforts here before continuing. Keep completed history intact.

Status values used in this document: **Planned**, **In progress**, **Blocked**, **Done**, **Changed**, and **Deferred**.

## Product outcome

Vogelibizz will retain its manually configured recurring expenses while adding real bank-derived spending history. Users upload one CHF bank CSV per calendar month, review every imported debit, associate transactions manually with recurring expenses, or leave them in a calculated **Other expenses** bucket.

The recurring-expenses overview will compare configured monthly costs with historical monthly averages. The living-cost estimate will include configured recurring costs plus the calculated Other average.

## Agreed requirements

### Import and source data

- [x] **R1** — An import covers exactly one calendar month, inferred from `Booked At`.
- [x] **R2** — A CSV containing transactions from more than one month is rejected.
- [x] **R3** — There is at most one active dataset per calendar month. Re-importing that month requires explicit confirmation and replaces all of its transactions, edits, and associations atomically. Imports are never merged.
- [x] **R4** — CSV files use the attached bank format with semicolon-delimited columns: `IBAN`, `Booked At`, `Text`, `Credit/Debit Amount`, `Balance`, and `Valuta Date`.
- [x] **R5** — Rows with only `Text` are continuation lines and are appended to the preceding transaction description. Orphan continuation rows are rejected.
- [x] **R6** — Only negative debit rows are imported. Positive rows are skipped, and the user sees a warning and skipped-row count before committing the import.
- [x] **R7** — Imported amounts are expressed in CHF. No multi-currency bank-import support is required in this scope.
- [x] **R8** — The original CSV file is not retained; parsed transaction data is sufficient.
- [x] **R9** — The import reports actionable validation errors for missing headers, invalid dates or amounts, empty usable content, continuation errors, and multi-month content.

### Imported months and transactions

- [ ] **R10** — Expenses History is organized by transaction month and booked date, not by a user-facing import object.
- [ ] **R11** — The latest imported month opens by default, with previous/next navigation and a month picker.
- [ ] **R12** — Each transaction retains immutable bank description and bank amount values.
- [ ] **R13** — Each transaction also has an editable display description and effective amount, initially copied from the bank values. Editing either affects only that transaction.
- [ ] **R14** — Effective amounts accept values greater than or equal to CHF 0 and drive all calculations. This is the manual mechanism for discounts, refunds, compensation, or exclusion.
- [ ] **R15** — There is no separate ignored state. Every imported debit contributes through its effective amount.
- [ ] **R16** — Transactions support independently editable Category and Type fields. Unmatched transactions initially display these as **Unclassified**.
- [ ] **R17** — The immutable bank values remain available as secondary transaction details for traceability.

### Recurring-expense association

- [ ] **R18** — Association is manual only; there are no automatic suggestions or matching rules in this scope.
- [ ] **R19** — A transaction can reference zero or one recurring expense. A recurring expense can be referenced by many transactions.
- [ ] **R20** — An unmatched transaction belongs to Other expenses immediately.
- [ ] **R21** — Associating a transaction copies the recurring expense's current Category and Type onto the transaction. Those copied historical values remain independently editable and do not track later recurring-expense edits.
- [ ] **R22** — Users can create a recurring expense from an unmatched transaction. The form is prefilled with its editable description, effective CHF amount, Monthly billing frequency, Category, and Type; after creation, the originating transaction is associated atomically.
- [ ] **R23** — Deleting a recurring expense is a true deletion. Its historical transactions remain and become unmatched, causing their effective amounts to move into Other expenses.

### Averages, Other expenses, and totals

- [ ] **R24** — Averages use all imported months. Calendar months with no import are excluded from the divisor.
- [ ] **R25** — Within an imported month, a recurring expense with no associated transactions contributes CHF 0 for that month.
- [ ] **R26** — A recurring expense's real monthly average is the sum of its associated transactions' effective amounts across all imported months divided by the number of imported months.
- [ ] **R27** — Other's monthly average is the sum of all unmatched transactions' effective amounts across all imported months divided by the number of imported months.
- [ ] **R28** — Other has no manually configured amount. Its calculated average is its contribution to the living-cost estimate and is shown as both its monthly and real-average value. Its difference is not applicable, and Category and Type display **Mixed**.
- [ ] **R29** — The living-cost estimate is the sum of configured monthly recurring-expense amounts plus the Other average.
- [ ] **R30** — The observed monthly average is the sum of every imported transaction's effective amount divided by the number of imported months.
- [ ] **R31** — Deleting a recurring expense changes its own and Other's allocation but does not change the observed total.
- [ ] **R32** — With no imported months, actual averages and Other render as unavailable/empty rather than dividing by zero.

### Navigation and presentation

- [ ] **R33** — Expenses has two subpages: **Recurring expenses** at the existing `/expenses` route and **Expenses History** at `/expenses/history`.
- [ ] **R34** — Existing recurring-expense create/edit routes and manually configured expense behavior continue to work.
- [ ] **R35** — The recurring table preserves its existing columns and adds real monthly average and configured-versus-real difference. It also renders the synthetic Other row.
- [ ] **R36** — The recurring page shows both the living-cost estimate and observed monthly average.
- [ ] **R37** — Expenses History shows booked date, editable description, editable effective amount, recurring-expense association or Other, Category, Type, and access to original bank details.
- [ ] **R38** — Expenses History provides an **Other only** filter and monthly summary values for total, matched, and Other spending.
- [ ] **R39** — Replacing a month uses a confirmation modal that clearly warns that existing edits and associations for that month will be lost.

### Development seed data

- [x] **R40** — The local/full development seed creates one synthetic imported expense dataset for the calendar month immediately preceding the date when the seed is executed.
- [x] **R41** — The local/full development seed leaves the current calendar month without an imported dataset so the current-month CSV import flow can be exercised normally.
- [x] **R42** — Seeded history uses synthetic descriptions and amounts only, includes representative transactions and valid recurring-expense associations, and contains no personal bank data.

## Calculation contract

Let `M` be the count of imported calendar months.

```text
Recurring real monthly average(expense) =
  sum(effective amounts associated with expense) / M

Other monthly average =
  sum(effective amounts with no recurring-expense association) / M

Living-cost estimate =
  sum(configured monthly amounts for recurring expenses) + Other monthly average

Observed monthly average =
  sum(all effective imported amounts) / M
```

All imported transaction amounts in these formulas are CHF values. The existing recurring-expense billing-cycle and currency normalization remains responsible for configured monthly amounts.

## Proposed data model

Names may change during PR 1, but semantic responsibilities must remain stable or be recorded in the change log.

### `expense_months`

- `id`
- unique `month` in `YYYY-MM` form
- `source_filename`
- `imported_at`
- `last_modified`
- `imported_debit_count`
- `skipped_credit_count`

This table represents the active dataset for a month. It is not an append-only record of historical import attempts.

### `expense_transactions`

- `id`
- `expense_month_id` foreign key with cascade deletion on month replacement
- nullable `expense_id` foreign key with `ON DELETE SET NULL`
- `booked_at`
- nullable `value_date`
- immutable `original_description`
- editable `description`
- immutable positive-magnitude `original_amount`
- editable non-negative `amount`
- nullable Category and Type, rendered as Unclassified when absent
- stable source order
- `created_at`
- `last_modified`

The recurring-expense association, Category, and Type are intentionally stored on the transaction. Category and Type are historical snapshots, not live derived values.

## PR effort roadmap

Each effort should be a separately reviewable PR. A PR should leave the application buildable and avoid introducing UI that depends on unavailable backend behavior.

### PR 1 — Persistence and calculation foundations

Status: **Done**
Branch/PR: `codex/expenses-history-pr1-foundations`
Requirements: R7, R10–R17, R19–R21, R23–R32

Scope:

- Add Drizzle schemas, relations, Zod schemas, exports, and D1 migrations for imported months and transactions.
- Define explicit foreign-key behavior for replacing months and deleting recurring expenses.
- Add domain-level calculation helpers for per-expense averages, Other, living-cost estimate, and observed average.
- Define shared API/domain types without changing the existing expenses UI.
- Add focused tests for database constraints and calculation edge cases.

Acceptance checklist:

- [x] Migration applies cleanly to a populated local database.
- [x] One month cannot be inserted twice.
- [x] Deleting a month cascades to its transactions.
- [x] Deleting a recurring expense nulls transaction associations without deleting transactions.
- [x] Original and effective values are independently represented and validated.
- [x] Calculation tests cover multiple months, zero-spend months, missing calendar months, Other, deletion redistribution, and no-import behavior.
- [x] Existing expense CRUD and build checks still pass.

Verification performed: `bun run test` (11 tests, 24 assertions); `bunx tsc --noEmit --incremental false`; `bunx @biomejs/biome check src package.json`; `bun run build` (TypeScript, Biome, client and SSR production bundles); `bun run db:migrate:local` (applied `0004_abnormal_betty_brant.sql`, 8 statements); `bun run db:generate` after generation (no schema changes); `git diff --check`. The migration suite applies the full existing D1 migration chain, populates an existing recurring expense, applies PR 1, and verifies data preservation plus the new constraints and foreign-key actions.
Known limitations/follow-ups: PR 1 intentionally exposes no history/import APIs or UI. Existing expense routes were not manually exercised in a browser because they were unchanged; their schemas and route code compile in the successful production build, and the populated migration regression verifies the underlying expense data remains usable. The successful build continues to emit warnings about existing mixed static/dynamic imports, large chunks, and React PDF/fontkit exports; none is in the PR 1 expense-history paths. PR 2 remains responsible for parser/import validation and atomic replacement.

### PR 2 — Bank CSV parser and atomic month import API

Status: **Done**
Branch/PR: `codex/expenses-history-pr2-import`
Depends on: PR 1
Requirements: R1–R9, R12–R15, R39

Scope:

- Implement a server-side parser for the supplied semicolon-delimited bank format.
- Join `Text` continuation rows and preserve normalized original descriptions.
- Validate dates, amounts, headers, single-month scope, and usable debit content.
- Add an import preview response containing inferred month, debit count, skipped-credit count, total debit amount, validation warnings, and whether replacement is required.
- Add atomic commit/replace behavior with explicit acknowledgement flags.
- Ensure an unconfirmed or failed replacement cannot modify the existing month.
- Add parser fixtures derived from anonymized/synthetic data rather than committing personal bank data.
- Extend the local/full seed path (`db:seed:local` / `seed-full.sql`) with a synthetic previous-calendar-month dataset calculated at seed execution time. Keep the current calendar month unseeded for CSV import testing; do not add history data to the remote seed.

Acceptance checklist:

- [x] The supplied CSV format parses correctly, including continuation lines.
- [x] Positive rows are skipped and reported before commit.
- [x] Multi-month and malformed files are rejected with actionable errors.
- [x] A new month imports without replacement acknowledgement.
- [x] An existing month cannot change without explicit replacement acknowledgement.
- [x] Confirmed replacement deletes the previous month's edits and associations and commits the new rows atomically.
- [x] The raw CSV is not persisted or logged.
- [x] Parser and API tests cover success, warnings, validation failures, and replacement rollback.
- [x] `db:init:local` and repeated `db:seed:local` runs produce exactly one seeded previous month with valid synthetic transactions and associations.
- [x] The current calendar month remains absent after local seeding and can be imported through the normal CSV workflow without replacement confirmation.
- [x] Neither generated seed SQL nor parser fixtures contain personal bank data.

Verification performed: `bun test` (28 tests, 77 assertions, including all PR 1 database/calculation tests); `bunx tsc --noEmit --incremental false`; `bunx @biomejs/biome check src package.json`; `bun run build` (TypeScript, Biome, client and SSR production bundles); `bun run db:generate` (no schema changes); `bun run db:init:local` followed by a second `bun run db:seed:local` and Wrangler queries (exactly one `2026-06` month for the execution date, four transactions, current month `2026-07` absent); `bun run db:seed:generate` to verify the generator emits the revised history contract, followed by removal of unrelated randomized recurring-seed churn from the committed SQL; `git diff --check`; focused diff and sensitive-data/logging review.
Known limitations/follow-ups: PR 2 intentionally adds no upload/history UI, read API, transaction editing, association UI, or automatic matching. PR 3 must call preview before commit and present `replacementRequired`, warnings, and the replacement consequences; server commit independently reparses and enforces acknowledgement. Supported dates are `DD.MM.YYYY` and ISO `YYYY-MM-DD`; CHF amounts accept dot or comma decimals and apostrophe/space thousands separators. Zero amounts are rejected per D10. The existing full-seed generator randomizes unrelated recurring seed rows on each generation; PR 2 did not broaden scope to redesign it and kept those unrelated rows unchanged in committed SQL. The successful build retains existing mixed-import, bundle-size, and React PDF/fontkit warnings; none originates in PR 2.

### PR 3 — Expenses History shell, month navigation, and upload flow

Status: **Planned**
Branch/PR: _TBD_
Depends on: PR 2
Requirements: R10–R13, R17, R33–R34, R37, R39

Scope:

- Add the Recurring expenses / Expenses History subnavigation while keeping `/expenses` as the current recurring page.
- Add `/expenses/history` with latest-month loading, previous/next controls, and month picker.
- Add query hooks and read APIs for available months and one month's transaction data.
- Build the upload preview, skipped-credit warning, error presentation, and replacement-confirmation modal.
- Render the initial read-only monthly history table with original bank details available as secondary information.
- Handle empty history and missing-selected-month states.

Acceptance checklist:

- [ ] Existing `/expenses`, create, edit, and modal routes still behave correctly.
- [ ] `/expenses/history` defaults to the latest imported month.
- [ ] Month navigation reflects imported months rather than filling calendar gaps.
- [ ] Upload warnings and replacement consequences are clear before confirmation.
- [ ] Successful upload/replacement refreshes month navigation and displayed transactions.
- [ ] Original descriptions and amounts are accessible but visually secondary.
- [ ] Loading, empty, error, and mobile layouts are usable.

Verification performed: _TBD_
Known limitations/follow-ups: _TBD_

### PR 4 — Transaction review, editing, and manual association

Status: **Planned**
Branch/PR: _TBD_
Depends on: PR 3
Requirements: R13–R23, R37–R38

Scope:

- Add safe mutations for editable description, effective amount, Category, and Type.
- Add searchable manual recurring-expense association and detachment.
- Copy Category and Type at association time without establishing live inheritance.
- Show unmatched transactions as Other and add the Other-only filter.
- Add “Create recurring expense” with prefilled values and atomic post-create association.
- Add monthly summary values for total, matched, and Other spending.
- Ensure deleting a referenced recurring expense moves affected history rows to Other.

Acceptance checklist:

- [ ] Bank description and amount cannot be edited through UI or API.
- [ ] Effective amount accepts CHF 0 but rejects negative or invalid values.
- [ ] Matching is manual and one transaction has at most one association.
- [ ] Matching copies Category and Type once; later edits on either side remain independent.
- [ ] Detaching or deleting an expense moves the transaction to Other without losing edits.
- [ ] Creating a recurring expense from a row prefills agreed fields and associates only after successful creation.
- [ ] Other-only filtering and monthly summaries react to edits without a full reload.
- [ ] Mutation error and concurrent-update behavior is deliberate and tested.

Verification performed: _TBD_
Known limitations/follow-ups: _TBD_

### PR 5 — Real averages and Other on the recurring overview

Status: **Planned**
Branch/PR: _TBD_
Depends on: PR 4
Requirements: R24–R36

Scope:

- Extend expenses queries with real monthly averages or add a dedicated summary query with an explicit contract.
- Add real-average and difference presentation to the existing recurring table.
- Add the synthetic, non-editable Other row with automatic values and Mixed classification.
- Add living-cost estimate and observed monthly average to the page summary.
- Update filtering, selection, deletion, pie summaries, sorting, and totals so the synthetic row cannot accidentally use normal CRUD actions.
- Invalidate/update recurring and history queries after every transaction or expense mutation that affects calculations.

Acceptance checklist:

- [ ] Every recurring row displays the correct configured amount, real average, and difference.
- [ ] Other cannot be edited, selected, or deleted as a normal recurring expense.
- [ ] Other displays automatic values, no meaningful difference, and Mixed Category/Type.
- [ ] Living-cost and observed totals follow the calculation contract.
- [ ] No-import behavior is clear and does not display misleading zero averages.
- [ ] Transaction edits, matching, month replacement, and expense deletion refresh all affected totals.
- [ ] Existing category/type filters and charts handle Other intentionally.

Verification performed: _TBD_
Known limitations/follow-ups: _TBD_

### PR 6 — Hardening, accessibility, performance, and release readiness

Status: **Planned**
Branch/PR: _TBD_
Depends on: PR 5
Requirements: All, especially R9, R32, R34, R39

Scope:

- Run end-to-end manual scenarios across several imported months.
- Add missing regression and integration coverage discovered during earlier PRs.
- Review database indexes and query plans for month, date, association, and aggregate lookups.
- Audit upload and inline-edit accessibility, keyboard interaction, modal focus, responsive layouts, and formatting.
- Ensure bank data and raw CSV content are absent from logs and error telemetry.
- Document the supported CSV contract and recovery/replacement behavior.
- Resolve or explicitly defer every known limitation recorded by PRs 1–5.

Acceptance checklist:

- [ ] Full build, type checking, formatting/linting, and automated tests pass.
- [ ] Manual happy path: import multiple months, review Other, match rows, create an expense, edit effective amounts, and observe recalculated totals.
- [ ] Manual destructive path: replace a month and delete a referenced recurring expense.
- [ ] Invalid files and server failures preserve existing month data.
- [ ] Sensitive source data is not logged or stored as a raw file.
- [ ] Keyboard and small-screen workflows are usable.
- [ ] Requirement traceability and change logs below are current.

Verification performed: _TBD_
Known limitations/follow-ups: _TBD_

## Requirement traceability

Update the Status and Verified in columns as PRs progress.

| Requirement group | Primary PR(s) | Status | Verified in |
| --- | --- | --- | --- |
| R1–R9: CSV import | PR 2, PR 3 | In progress | PR 2 parser, preview/commit contracts, authenticated API, atomic replacement, validation, raw-data, and rollback tests; PR 3 presentation remains |
| R10–R17: month and transaction history | PR 1, PR 3, PR 4 | In progress | PR 1 schema, migration, validation, and constraint tests; UI/API behavior remains in PR 3–4 |
| R18–R23: manual association | PR 1, PR 4 | In progress | PR 1 nullable association and `ON DELETE SET NULL` tests; mutation behavior remains in PR 4 |
| R24–R32: calculations and Other | PR 1, PR 5 | In progress | PR 1 domain calculation tests; query and presentation integration remains in PR 5 |
| R33–R39: navigation and presentation | PR 3, PR 4, PR 5 | Planned | — |
| R40–R42: local development history seed | PR 2, PR 3 | Done | PR 2 in-memory repeated-seed regression and repeated Wrangler local seed verification |
| Cross-cutting hardening | PR 6 | Planned | — |

## Non-goals for this rollout

- Multiple accounts or merging several files into one month
- Multi-currency imported transactions
- Retaining or downloading original CSV files
- Automatic, suggested, or rule-based matching
- Splitting one transaction across several recurring expenses
- Import drafts or finalization workflows
- A separate ignored-transaction state
- Rolling-window averages
- Import-attempt audit history after a month is replaced

Move an item out of this list only through an explicit requirement change recorded below.

## Decision and requirement change log

Add new entries; do not remove historical entries.

| Date | ID | Change or decision | Reason | Affected requirements/PRs | Status |
| --- | --- | --- | --- | --- | --- |
| 2026-07-16 | D1 | Use `Booked At` to determine transaction date and month. | Agreed product behavior. | R1, R10; PR 2–4 | Accepted |
| 2026-07-16 | D2 | Keep immutable bank description/amount and editable effective equivalents. | Preserve traceability while allowing corrections. | R12–R14; PR 1, 3, 4 | Accepted |
| 2026-07-16 | D3 | Skip positive rows with an import warning; do not add an ignored state. | Scope is expenses only; effective amount CHF 0 covers manual exclusion. | R6, R14–R15; PR 2–4 | Accepted |
| 2026-07-16 | D4 | Use all imported months and exclude calendar gaps. | Agreed averaging behavior. | R24–R32; PR 1, 5 | Accepted |
| 2026-07-16 | D5 | Other is automatic and has no manually configured budget. | It represents spending absent from recurring declarations. | R27–R30; PR 5 | Accepted |
| 2026-07-16 | D6 | Deleting a recurring expense detaches rather than deletes its transactions. | Historical bank data remains; allocation moves into Other. | R23, R31; PR 1, 4, 5 | Accepted |
| 2026-07-16 | D7 | With no imported months, recurring real averages, Other, living-cost estimate, and observed monthly average are `null`; the configured recurring total remains separately available. | Every composite actual value depends on the unavailable Other average, and `null` prevents a misleading zero or configured-only living-cost estimate. | R29, R32; PR 1, 5 | Accepted |
| 2026-07-16 | D8 | Persist bank dates as ISO `YYYY-MM-DD` calendar dates and require source order to be unique within each imported month. | Normalized dates support month/date organization, while stable unique order preserves deterministic source ordering and catches duplicate rows during import construction. | R10, R17; PR 1–3 | Accepted |
| 2026-07-16 | D9 | Seed synthetic history only through the local/full seed: create the immediately previous calendar month dynamically and reserve the current month for CSV import. Do not add imported history to the remote seed. | Development starts with history available for review while still exercising the primary current-month import workflow; dynamic dates prevent committed seed data from becoming stale. | R40–R42; PR 2–3 | Accepted |
| 2026-07-16 | D10 | Treat a zero `Credit/Debit Amount` as an actionable validation error rather than a debit or skipped credit. Preview and commit both parse the source independently, and commit persists only the sanitized basename as source metadata. | Zero is neither a negative debit nor a positive credit under R6; reparsing avoids retaining server-side import drafts or raw CSV while keeping commit authoritative. | R1, R6, R8–R9; PR 2–3 | Accepted |

## Open questions and discovered work

Record implementation discoveries here immediately. Each entry must be resolved, converted into a requirement change, or explicitly deferred before PR 6 completes.

| ID | Discovered in | Question or work | Owner | Resolution/status |
| --- | --- | --- | --- | --- |
| O1 | Planning | Confirm whether nullable Category/Type rendered as Unclassified needs new enum values or presentation-only labels. | PR 1 | Resolved: keep database/domain values nullable and treat Unclassified as a presentation-only label; no enum expansion. |
| O2 | Planning | Select the API concurrency strategy for inline transaction edits, such as last-write-wins or `last_modified` conflict detection. | PR 4 | Planned decision |
| O3 | PR 2 | The existing full-seed generator randomizes unrelated recurring seed rows whenever it runs. | Existing tooling | Resolved for PR 2: generator and committed SQL both implement the history contract, but unrelated generated recurring rows were kept out of this diff. Redesigning deterministic recurring seed generation is outside expense-history scope. |

## Progress log

Add a brief entry whenever an effort starts, changes materially, becomes blocked, or finishes.

| Date | PR effort | Update | Tests/checks | Next action |
| --- | --- | --- | --- | --- |
| 2026-07-16 | Planning | Initial multi-PR implementation plan created from the agreed requirements. | Repository structure and current expenses flow reviewed. | Begin PR 1 after approval. |
| 2026-07-16 | PR 1 | Started persistence and calculation foundations on `codex/expenses-history-pr1-foundations`; confirmed D1 migrations live under `src/db/migrations/d1` and resolved O1 as presentation-only Unclassified. | Read the full plan and reviewed repository instructions, working tree, expense schema/migrations/APIs/calculations, and existing test setup. | Add schemas, migration, calculation domain contract, and focused tests. |
| 2026-07-16 | PR 1 | Completed persistence and calculation foundations without adding later-PR APIs or UI. Added imported-month/transaction persistence, validation and relations; explicit cascade/`SET NULL` behavior; JSON-safe calculation result types; and database/calculation regressions. Recorded D7–D8 and kept O1 presentation-only. | `bun run test` (11 tests/24 assertions); TypeScript; Biome; production build; populated local D1 migration; clean migration regeneration; `git diff --check`. | Review and merge PR 1; begin PR 2 only as a separate effort. |
| 2026-07-16 | Planning change | Added R40–R42 and D9: local/full seeding must dynamically create synthetic history for the previous calendar month while leaving the current month available for CSV import; remote seeding remains history-free. Assigned implementation and seed verification to PR 2, with UI consumption covered by PR 3. | Reviewed the configured seed paths (`db:seed:local` → `seed-full.sql`, separate remote `seed.sql`) and updated PR 2 scope, acceptance, and traceability. | Implement the revised seed contract when PR 2 begins. |
| 2026-07-16 | PR 2 | Started bank CSV parser, preview/atomic import API, and revised local seed work on `codex/expenses-history-pr2-import`. Adopted PR 1 into a `main`-based `gh stack` stack and created PR 2 directly above it. | Read the complete living plan; confirmed the clean PR 1 tree and reviewed its commits/diff, history schema/migration/tests, seed paths, API conventions, and stack topology. | Implement parser/contracts, atomic replacement, local previous-month seed, and focused regressions without beginning PR 3. |
| 2026-07-16 | PR 2 | Completed server-side CSV preview/commit APIs, actionable validation, credit warnings, D1-batch atomic replacement, raw-source protections, synthetic fixtures, and idempotent previous-month local history seeding. Recorded D10 and O3; no migration, UI, matching, or PR 3 work was added. | 28 tests/77 assertions; TypeScript; Biome; production build; clean migration regeneration; repeated real Wrangler local seed with exact previous/current-month queries; `git diff --check`; full PR 2 diff review. | Submit the stacked PR above PR 1; do not begin PR 3 until review decisions are resolved. |
