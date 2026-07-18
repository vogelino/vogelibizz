# Expenses History and Other Expenses — Living Implementation Plan

Last updated: 2026-07-18
Overall status: **In progress**
Current effort: **PR 7 complete locally — routed transaction editors and presentational UI refactor**

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

- [x] **R10** — Expenses History is organized by transaction month and booked date, not by a user-facing import object.
- [x] **R11** — The latest imported month opens by default, with previous/next navigation and a month picker.
- [x] **R12** — Each transaction retains immutable bank description and bank amount values.
- [x] **R13** — Each transaction also has an editable display description and effective amount, initially copied from the bank values. Editing either affects only that transaction.
- [x] **R14** — Effective amounts accept values greater than or equal to CHF 0 and drive all calculations. This is the manual mechanism for discounts, refunds, compensation, or exclusion.
- [x] **R15** — There is no separate ignored state. Every imported debit contributes through its effective amount.
- [x] **R16** — Transactions support independently editable Category and Type fields. Unmatched transactions initially display these as **Unclassified**.
- [x] **R17** — The immutable bank values remain available as secondary transaction details for traceability.

### Recurring-expense association

- [x] **R18** — Association is manual only; there are no automatic suggestions or matching rules in this scope.
- [x] **R19** — A transaction can reference zero or one recurring expense. A recurring expense can be referenced by many transactions.
- [x] **R20** — An unmatched transaction belongs to Other expenses immediately.
- [x] **R21** — Associating a transaction copies the recurring expense's current Category and Type onto the transaction. Those copied historical values remain independently editable and do not track later recurring-expense edits.
- [x] **R22** — Users can create a recurring expense from an unmatched transaction. The form is prefilled with its editable description, effective CHF amount, Monthly billing frequency, Category, and Type; after creation, the originating transaction is associated atomically.
- [x] **R23** — Deleting a recurring expense is a true deletion. Its historical transactions remain and become unmatched, causing their effective amounts to move into Other expenses.

### Averages, Other expenses, and totals

- [x] **R24** — Averages use all imported months. Calendar months with no import are excluded from the divisor.
- [x] **R25** — Within an imported month, a recurring expense with no associated transactions contributes CHF 0 for that month.
- [x] **R26** — A recurring expense's real monthly average is the sum of its associated transactions' effective amounts across all imported months divided by the number of imported months.
- [x] **R27** — Other's monthly average is the sum of all unmatched transactions' effective amounts across all imported months divided by the number of imported months.
- [x] **R28** — Other has no manually configured amount. Its calculated average is its contribution to the living-cost estimate and is shown as both its monthly and real-average value. Its difference is not applicable, and Category and Type display **Mixed**.
- [x] **R29** — The living-cost estimate is the sum of configured monthly recurring-expense amounts plus the Other average.
- [x] **R30** — The observed monthly average is the sum of every imported transaction's effective amount divided by the number of imported months.
- [x] **R31** — Deleting a recurring expense changes its own and Other's allocation but does not change the observed total.
- [x] **R32** — With no imported months, actual averages and Other render as unavailable/empty rather than dividing by zero.

### Navigation and presentation

- [x] **R33** — Expenses has two subpages: **Recurring expenses** at the existing `/expenses` route and **Expenses History** at `/expenses/history`.
- [x] **R34** — Existing recurring-expense create/edit routes and manually configured expense behavior continue to work.
- [x] **R35** — The recurring table preserves its existing columns and adds real monthly average and configured-versus-real difference. It also renders the synthetic Other row.
- [x] **R36** — The recurring page shows both the living-cost estimate and observed monthly average.
- [x] **R37** — Expenses History shows booked date, editable description, editable effective amount, recurring-expense association or Other, Category, Type, and access to original bank details.
- [x] **R38** — Expenses History provides an **Other only** filter and monthly summary values for total, matched, and Other spending.
- [x] **R39** — Replacing a month uses a confirmation modal that clearly warns that existing edits and associations for that month will be lost.

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
Branch/PR: `codex/expenses-history-pr1-foundations` — https://github.com/vogelino/vogelibizz/pull/2
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
Branch/PR: `codex/expenses-history-pr2-import` — https://github.com/vogelino/vogelibizz/pull/3
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

Status: **Done**
Branch/PR: `codex/expenses-history-pr3-history-ui` — https://github.com/vogelino/vogelibizz/pull/4
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

- [x] Existing `/expenses`, create, edit, and modal routes still behave correctly.
- [x] `/expenses/history` defaults to the latest imported month.
- [x] Month navigation reflects imported months rather than filling calendar gaps.
- [x] Upload warnings and replacement consequences are clear before confirmation.
- [x] Successful upload/replacement refreshes month navigation and displayed transactions.
- [x] Original descriptions and amounts are accessible but visually secondary.
- [x] Loading, empty, error, and mobile layouts are usable.

Verification performed: `bun test` (31 tests, 84 assertions, including authenticated read-contract coverage); `bunx tsc --noEmit --incremental false`; `bunx @biomejs/biome check src package.json`; `bun run build` (TypeScript, Biome, client and SSR production bundles); `bun run db:generate` (no schema changes); `bun run db:init:local` plus a repeated `bun run db:seed:local` and Wrangler queries (exactly one `2026-06` seeded month for the execution date, four transactions, two valid associations); `git diff --check`; full PR 3 diff, stack, sensitive-data, accessibility, invalidation, replacement-safety, existing-expense preservation, responsive-layout, and scope reviews. Browser verification confirmed `/expenses`, create, edit, and `/expenses/history` preserve the administrator authentication redirect, both new read APIs return 401 without authentication, and no browser console warnings/errors occurred.
Known limitations/follow-ups: PR 3 intentionally keeps the history table read-only: editable transaction values, manual association/detachment, Other-only filtering, and monthly matched/Other summaries remain PR 4; recurring overview averages and totals remain PR 5; automatic matching remains a non-goal. No migration was added. An authenticated browser session was unavailable, so seeded table rendering, CSV selection, replacement-modal interaction, and responsive authenticated layouts were reviewed in code and production output but not manually exercised end to end; PR 6 retains the full authenticated accessibility and small-screen audit. The successful build retains the existing mixed static/dynamic import, bundle-size, and React PDF/fontkit warnings; none originates in the PR 3 history paths. GitHub's native Stack object remains unavailable because the repository is not enrolled in the private preview. Per D12, the three branches were pushed with `gh stack push` and draft PRs were created through GitHub's API with the verified chain PR 1 #2 → PR 2 #3 → PR 3 #4; `gh pr create` was not used.

### PR 4 — Transaction review, editing, and manual association

Status: **Done**
Branch/PR: `codex/expenses-history-pr4-transaction-review` — https://github.com/vogelino/vogelibizz/pull/5
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

- [x] Bank description and amount cannot be edited through UI or API.
- [x] Effective amount accepts CHF 0 but rejects negative or invalid values.
- [x] Matching is manual and one transaction has at most one association.
- [x] Matching copies Category and Type once; later edits on either side remain independent.
- [x] Detaching or deleting an expense moves the transaction to Other without losing edits.
- [x] Creating a recurring expense from a row prefills agreed fields and associates only after successful creation.
- [x] Other-only filtering and monthly summaries react to edits without a full reload.
- [x] Mutation error and concurrent-update behavior is deliberate and tested.

Verification performed: `bun test` (38 tests, 98 assertions, including strict immutable-field rejection, CHF 0/invalid amounts, 409/404 mutation behavior, snapshot independence, detachment preservation, deletion `SET NULL`, and atomic conflict-without-orphan coverage); `bunx tsc --noEmit --incremental false`; `bunx @biomejs/biome check src package.json`; `bun run build` (client and SSR production bundles); `bun run db:generate` (no schema changes); `bun run db:init:local` followed by a second `bun run db:seed:local` and exact Wrangler queries (one `2026-06` month, four transactions, two associations); `git diff --check`; unauthenticated HTTP checks (both mutation endpoints return 401); desktop and 390×844 browser checks (history route preserves administrator redirect, no console warnings/errors); full PR 4 diff review against PR 3 for stack scope, replacement/import preservation, immutable-bank-field protection, sensitive-data exposure, accessibility, concurrency, atomic creation/association, query invalidation, expense deletion, and PR 5 scope exclusion.
Known limitations/follow-ups: No migration is required. An authenticated browser session was unavailable, so the seeded inline edit, CHF 0, classification, association/detachment, recurring-expense creation, Other-only filter, summary refresh, error toast, and keyboard interactions were verified through compiled UI contracts, API/database tests, and responsive code review rather than an authenticated end-to-end session. The production build retains the existing mixed static/dynamic import, large-chunk, and React PDF/fontkit warnings. GitHub's native Stack object remains unavailable; D12 applies to PR 4 publication. PR 5 must consume the established invalidation behavior but must not reinterpret D13 or introduce automatic matching.

### PR 5 — Real averages and Other on the recurring overview

Status: **Done**
Branch/PR: `codex/expenses-history-pr5-recurring-overview` — https://github.com/vogelino/vogelibizz/pull/6
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

- [x] Every recurring row displays the correct configured amount, real average, and difference.
- [x] Other cannot be edited, selected, or deleted as a normal recurring expense.
- [x] Other displays automatic values, no meaningful difference, and Mixed Category/Type.
- [x] Living-cost and observed totals follow the calculation contract.
- [x] No-import behavior is clear and does not display misleading zero averages.
- [x] Transaction edits, matching, month replacement, and expense deletion refresh all affected totals.
- [x] Existing category/type filters and charts handle Other intentionally.

Verification performed: `bun test` (44 tests, 111 assertions, including existing multi-month/calendar-gap/zero-spend/deletion-redistribution calculations plus overview row, Mixed filter/chart, no-import, target-currency normalization, and authenticated summary-contract coverage); `bunx tsc --noEmit --incremental false`; `bunx @biomejs/biome check src package.json`; `bun run build` (client and SSR production bundles); `bun run db:generate` (no schema changes); `bun run db:init:local` followed by a second `bun run db:seed:local` and an exact Wrangler aggregate query (one `2026-06` month, four transactions, two matched, CHF 196.05 observed total, CHF 81.65 Other total); `git diff --check`; unauthenticated browser route and HTTP checks (`/expenses` preserves the administrator login redirect with no console warnings/errors, and the overview API returns 401); full PR 5 diff review for calculation currency, synthetic-row CRUD isolation, filtering/sorting/selection/deletion, chart/totals behavior, invalidation coverage, D13 preservation, and PR 6 scope exclusion.
Known limitations/follow-ups: No migration is required. An authenticated browser session remained unavailable, so signed-in recurring-row rendering, filter/chart interactions, mutations, and small-screen behavior were verified through production output, typed UI contracts, focused unit/API/database tests, and code review rather than an authenticated end-to-end session; PR 6 retains the full signed-in accessibility, keyboard, and responsive audit. The production build retains the existing mixed static/dynamic import, large-chunk, and React PDF/fontkit warnings. The summary converts imported CHF amounts into the configured target currency using the same exchange-rate and billing-cycle normalization as configured recurring expenses before presenting comparisons.

### PR 6 — Hardening, accessibility, performance, and release readiness

Status: **Done**
Branch/PR: `codex/expenses-history-pr6-hardening` — https://github.com/vogelino/vogelibizz/pull/7
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

- [x] Full build, type checking, formatting/linting, and automated tests pass.
- [x] Manual happy path: import multiple months, review Other, match rows, create an expense, edit effective amounts, and observe recalculated totals.
- [x] Manual destructive path: replace a month and delete a referenced recurring expense.
- [x] Invalid files and server failures preserve existing month data.
- [x] Sensitive source data is not logged or stored as a raw file.
- [x] Keyboard and small-screen workflows are usable.
- [x] Requirement traceability and change logs below are current.

Verification performed: `bun run test` (47 tests, 125 assertions, including a two-month review/deletion/replacement integration scenario, native database-proxy receiver regression, raw-source/no-console coverage, atomic rollback, D13 conflicts, no-import calculations, and migration query-plan assertions); `bunx tsc --noEmit --incremental false`; `bunx @biomejs/biome check src package.json`; `bun run build` (client and SSR production bundles); `bun run db:generate` (no additional schema changes); migration `0005_cynical_hellcat.sql` applied to the populated local D1 database; repeated `bun run db:init:local` / `bun run db:seed:local` restored exactly one synthetic `2026-06` month with four transactions, two matches, CHF 196.05 observed, and CHF 81.65 Other; real `EXPLAIN QUERY PLAN` plus the automated query-plan regression confirm month lookup uses `expense_months_month_unique`, association lookup uses `expense_transactions_expense_idx`, and ordered month reads use `expense_transactions_month_booked_order_idx` without a temporary B-tree; `git diff --check`; focused sensitive-data/logging, D12/D13, non-goal, migration, and full PR 6 diff reviews. Manual local scenarios used synthetic June/July data through the real UI and authenticated endpoints with a temporary development-only authentication bypass that was removed and verified absent from the final diff: new-month preview/import with a skipped-credit warning; Other review; description/effective-amount/classification editing; manual association; atomic create-and-associate; recurring-overview recalculation; invalid multi-month rejection with the prior dataset unchanged; failed server write with the prior dataset unchanged; confirmed replacement; and referenced-expense deletion moving CHF 84.50 from Matched to Other while the observed average remained identical. Clean desktop and 390×844 browser passes verified row-specific accessible names, native keyboard controls, disclosure focus styles, explicit safe-default replacement focus/trigger restoration, contained focusable table scrolling (390 px page width, no page overflow, 342 px viewport over a 1,070 px table), responsive recurring/history pages, and no browser console warnings/errors.
Known limitations/follow-ups: GitHub's native Stack object remains unavailable, so D12 still governs publication and D13 is unchanged. The production build succeeds with the pre-existing mixed static/dynamic import, large-chunk, React PDF/fontkit, and Wrangler log-path warnings; none originates in the expense-history implementation, and redesigning application-wide bundling/PDF dependencies is explicitly deferred outside this rollout. The existing full-seed generator still randomizes unrelated recurring seed rows; O3 remains explicitly deferred outside expense-history scope, while the committed/generated history seed itself is deterministic in shape, synthetic, idempotent, and date-relative. Existing exchange-rate refresh diagnostics may log currency codes/counts, but the expense-history import/read/mutation paths log neither bank values nor raw CSV and persist no raw file. No automatic matching, new non-goal, or rollout expansion was added.

### PR 7 — Routed transaction editors and presentational UI refactor

Status: **Done**
Branch/PR: `codex/expenses-history-pr7-routed-editors`
Depends on: PR 6
Requirements: R13–R23, R33–R38; D13–D15

Scope:

- Restore Expenses History to a read-only TanStack `DataTable` consistent with the application's other resource lists.
- Move transaction editing, manual association/detachment, and original-bank-value review into canonical full-page and masked responsive-modal routes.
- Use TanStack Form for transaction editing and recurring-expense creation from a transaction.
- Reuse the existing Combobox, Checkbox, form wrappers, amount input behavior, responsive dialog, route masking, query, and table patterns instead of maintaining history-only controls.
- Keep bank transactions import-owned: no manual transaction-create route or automatic matching is introduced.
- Preserve D13 tokens, 409 reload behavior, invalidation/refetch behavior, and atomic create-and-associate semantics.
- Separate route/query/mutation containers from prop-driven presentation components across the new history UI and the PR 5 overview additions where practical without changing calculations or presentation requirements.

Acceptance checklist:

- [x] The monthly history list uses the shared TanStack `DataTable` and contains no inline mutation controls.
- [x] Direct transaction-edit URLs load independently, while table links use the existing masked responsive-modal pattern.
- [x] Transaction fields use TanStack Form and shared Combobox/Checkbox/amount/form primitives.
- [x] Existing association is selected explicitly by recurring-expense ID; no name inference, suggestion, or automatic matching is added.
- [x] Create recurring expense is a routed form prefilled from the transaction and remains an atomic create-and-associate mutation.
- [x] Every transaction mutation submits `lastModified`; success and 409 conflict refetch the required history/overview data safely.
- [x] Import, month navigation, summary, replacement confirmation, empty/error/loading states, and recurring overview retain their behavior through presentational components with stateful containers.
- [x] Existing recurring expense create/edit routes continue to work.
- [x] Focus restoration, keyboard access, document-body table scrolling, sticky toolbar/header behavior, and direct-route navigation are preserved by the shared route/modal/table primitives and verified through typed route generation, accessibility checks, production output, and focused code review.
- [x] Full tests, TypeScript, Biome, production build, and `git diff --check` pass.

Verification performed: `bunx @biomejs/biome check src`; `bunx tsc --noEmit --incremental false`; `bun test` (47 tests, 129 assertions, including the new authenticated transaction-detail read contract plus the complete D13/atomicity/import/calculation/database suite); `bun run build` (client and SSR production bundles with all new canonical and modal route chunks); `git diff --check`; generated-route inspection; searches confirming the removed inline row and absence of history-native select/datalist/checkbox controls; local `gh stack view --json` confirming PR 7 directly above the latest PR 6 commit; unauthenticated browser verification confirming the history guard redirects to login without console warnings.
Known limitations/follow-ups: The signed-in visual interaction pass could not be completed in this session because the available browser was unauthenticated and two pre-existing user-owned Vite processes were concurrently regenerating `routeTree.gen.ts`, making an additional temporary authenticated dev server unstable. Those processes were deliberately preserved. The temporary development-only authentication bypass used for the attempted check was removed and confirmed absent from the diff. The shared responsive modal, document-body table scrolling, focus behavior, and route-mask contracts compile and build successfully, but a signed-in click-through remains advisable before publication. This effort deliberately does not add a manual bank-transaction create route, because imported bank rows remain the source of truth, and does not change D12, D13, calculations, import behavior, automatic-matching policy, or rollout non-goals.

## Requirement traceability

Update the Status and Verified in columns as PRs progress.

| Requirement group | Primary PR(s) | Status | Verified in |
| --- | --- | --- | --- |
| R1–R9: CSV import | PR 2, PR 3 | Done | PR 2 parser, preview/commit contracts, authenticated API, atomic replacement, validation, raw-data, and rollback tests; PR 3 preview, warning, error, confirmation, refresh, and empty-history presentation |
| R10–R17: month and transaction history | PR 1, PR 3, PR 4 | Done | PR 1 schema, migration, validation, and constraints; PR 3 reads/navigation/traceability; PR 4 strict editable-field mutations, CHF 0 validation, classification UI/API, concurrency, and reactive summaries |
| R18–R23: manual association | PR 1, PR 4 | Done | PR 1 nullable association and `ON DELETE SET NULL`; PR 4 manual search, one-association mutation contract, snapshot copying, detachment/deletion preservation, and atomic create-associate coverage |
| R24–R32: calculations and Other | PR 1, PR 5 | Done | PR 1 domain calculation tests; PR 5 authenticated aggregate query, target-currency normalization, synthetic Other integration, totals, filters/charts, no-import rendering, and invalidation coverage |
| R33–R39: navigation and presentation | PR 3, PR 4, PR 5 | Done | PR 3 subnavigation, history route, read-only transaction presentation, and replacement modal; PR 4 transaction review; PR 5 recurring averages, differences, Other, living-cost estimate, and observed average |
| R40–R42: local development history seed | PR 2, PR 3 | Done | PR 2 in-memory repeated-seed regression and repeated Wrangler local seed verification |
| Cross-cutting hardening | PR 6 | Done | PR 6 multi-month/destructive integration, real D1 atomic-batch manual scenarios, migration/query-plan checks, raw-source/no-log review, operator documentation, accessibility/focus/keyboard audit, 390×844 responsive browser pass, full automated/build verification, and resolved/deferred PR 1–5 limitations |
| Routed editor/presentational refactor | PR 7 | Done | Read-only shared DataTable; full-page and masked edit/create-associate routes; TanStack Form; explicit ID association; D13-safe query invalidation; presentational history/overview extraction; full automated/build verification |

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
| 2026-07-16 | D11 | Keep source filenames out of the PR 3 read APIs and UI; expose only month metadata plus the parsed immutable and effective transaction values needed for history review. | The filename is not required for transaction-month navigation or traceability and may itself contain sensitive information; the raw CSV remains unpersisted under R8. | R8, R10, R17; PR 3 | Accepted |
| 2026-07-16 | D12 | While GitHub Stacked PRs remains unavailable for this repository, preserve the local `gh stack` topology, push with `gh stack push`, and create draft chained PRs through GitHub's API with each PR targeting the branch immediately below it. Do not use `gh pr create`. | The user explicitly authorized local stacking plus ordinary chained PR publication so PR 4 can proceed without the private-preview GitHub Stack object. | PR publication workflow; PR 1–5 | Accepted |
| 2026-07-16 | D13 | Transaction mutations use optimistic concurrency with the read contract's opaque `lastModified` token. Every mutation must submit the token it read; the server updates only when it still matches, returns the updated transaction and a new token on success, returns 409 with a safe reload instruction on mismatch, 404 when the transaction or selected recurring expense no longer exists, and 400 for invalid or immutable fields. Clients invalidate/refetch affected history queries after success or conflict. Atomic create-and-associate first claims the token and conditionally creates/associates within one D1 batch, so a conflict cannot leave an unassociated recurring expense. | Prevent silent lost updates during inline review while keeping the API explicit and testable. | O2; R13–R23, R37–R38; PR 4 | Accepted |
| 2026-07-18 | D14 | Replace inline transaction editing with a read-only shared TanStack table plus canonical full-page and masked responsive-modal edit/create-associate routes. Bank transactions remain import-owned, so “create” means creating and atomically associating a recurring expense from an imported transaction, not manually creating a bank transaction. | This matches the established resource-list and routed-form architecture, makes the table reusable, and separates presentation from query/mutation/form state without changing transaction semantics. | R13–R23, R33–R38; PR 7 | Accepted |
| 2026-07-18 | D15 | Keep the document body as the history table's vertical and horizontal scroll container; do not introduce a nested overflow container around the table. The toolbar and table header remain sticky relative to the document viewport below the global header. | A nested `overflow-x-auto` ancestor also becomes the sticky containing block, preventing viewport-relative sticky behavior and creating competing scroll regions. | R33–R38; PR 7 | Accepted |

## Open questions and discovered work

Record implementation discoveries here immediately. Each entry must be resolved, converted into a requirement change, or explicitly deferred before PR 6 completes.

| ID | Discovered in | Question or work | Owner | Resolution/status |
| --- | --- | --- | --- | --- |
| O1 | Planning | Confirm whether nullable Category/Type rendered as Unclassified needs new enum values or presentation-only labels. | PR 1 | Resolved: keep database/domain values nullable and treat Unclassified as a presentation-only label; no enum expansion. |
| O2 | Planning | Select the API concurrency strategy for inline transaction edits, such as last-write-wins or `last_modified` conflict detection. | PR 4 | Resolved by D13: optimistic `lastModified` preconditions, 409 conflicts, refetch-on-conflict, and atomic token-claim create/associate tests. |
| O3 | PR 2 | The existing full-seed generator randomizes unrelated recurring seed rows whenever it runs. | Existing tooling | Explicitly deferred at PR 6: generator and committed SQL both implement the history contract, and the history seed is synthetic, date-relative, and idempotent; redesigning unrelated randomized recurring rows remains outside expense-history scope. |

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
| 2026-07-16 | PR 3 | Started Expenses History shell, imported-month navigation, read APIs, and upload preview/commit UI on `codex/expenses-history-pr3-history-ui`, directly above PR 2. Confirmed the worktree was clean and the local stack topology was `main` → PR 1 → PR 2 before creating PR 3; GitHub PR objects were not yet published. | Read the complete living plan and repository instruction files; verified local branches and commits with `gh stack view`. | Inspect PR 2 contracts and the existing UI/API/test/seed conventions before implementing PR 3 only. |
| 2026-07-16 | PR 3 | Completed the Expenses subnavigation, authenticated month-list/detail APIs and query hooks, imported-month navigation, read-only transaction table with secondary bank details, and preview/import/replacement UI. Recorded D11; no PR 4 editing/association/summary work, PR 5 overview work, or automatic matching was added. | 31 tests/84 assertions; TypeScript; Biome; production build; clean migration regeneration; repeated real Wrangler local seed and exact data queries; unauthenticated browser/HTTP route checks; `git diff --check`; full PR 3 diff and boundary review. | Submit the stack with PR 3 targeting PR 2; PR 4 must resolve O2 before adding transaction mutations. |
| 2026-07-16 | PR 3 | Stacked publication blocked after the verified PR 3 commit: `gh stack submit --auto` stopped because stacked PRs are not enabled for `vogelino/vogelibizz`. Confirmed administrator permission, enabled normal pull requests, a 404 from GitHub's internal stack endpoint, no existing GitHub PR objects, and no exposed CLI/API enablement setting. | Re-ran `gh stack view`; inspected repository permission and stack capability without using `gh pr create` or creating remote PRs. | Enable GitHub stacked PRs for the repository/account, then rerun `gh stack submit --auto` and record all three PR links and bases. Do not begin PR 4. |
| 2026-07-16 | PR 3 | Publication blocker resolved through D12 after explicit user authorization. Pushed the intact local stack and created draft chained PRs through GitHub's API: PR 1 #2 targets `main`, PR 2 #3 targets PR 1, and PR 3 #4 targets PR 2. | `gh stack view --json`; `gh stack push`; GitHub PR metadata verified for all three heads, bases, links, draft state, and open state. | Commit the publication record on PR 3, then create PR 4 directly above it. |
| 2026-07-16 | PR 4 | Started transaction review, editing, and manual association on `codex/expenses-history-pr4-transaction-review`, directly above the updated PR 3 commit. Resolved O2 through D13 before mutation implementation. | Clean tree; complete plan reread; verified local/GitHub PR 1–3 chain; reviewed PR 1 schema/FKs, PR 2 replacement/seed behavior, PR 3 reads/upload invalidation/history UI/routes, existing expense CRUD/forms/query hooks, and relevant tests. | Implement PR 4 mutation contracts, atomic create/associate, reactive review UI, and focused regressions only. |
| 2026-07-16 | PR 4 | Completed transaction review/editing and manual association only. Added strict optimistic mutations, immutable bank-field protection, CHF 0 support, classification edits, manual search/detach, one-time classification snapshots, atomic Monthly/CHF recurring creation, Other filtering, monthly total/matched/Other summaries, and history invalidation after transaction mutations and recurring-expense deletion. No PR 5 averages/synthetic row or automatic matching was added. | 38 tests/98 assertions; TypeScript; Biome; production build; clean migration regeneration; repeated local migration/seed and exact queries; unauthenticated endpoint/browser auth checks; desktop/mobile console review; `git diff --check`; full PR 4 boundary/security/accessibility/concurrency/atomicity/invalidation review. | Commit and publish PR 4 through D12, verify its base is PR 3, record the link, and do not begin PR 5. |
| 2026-07-16 | PR 4 | Published draft PR #5 through D12 after `gh stack push`; PR 4 targets PR 3's branch. GitHub's private-preview Stack object remains unavailable, so `gh stack submit --auto` was not used and `gh pr create` was never used. | Verified all four GitHub PR heads, bases, open/draft states, and links plus the local `gh stack view` topology. | PR 4 is ready for review. Do not begin PR 5 until review decisions are resolved. |
| 2026-07-16 | PR 5 | Started recurring-overview real averages, synthetic Other, and calculation-aware totals on `codex/expenses-history-pr5-recurring-overview`, directly above PR 4. Confirmed the worktree was clean, PRs 1–4 remained intact, all four GitHub draft PRs had the required chained bases, and the local stack topology was correct before creating PR 5. | Read the complete living plan and repository instructions; verified branch ancestry, GitHub PR metadata, and `gh stack view`. | Inspect PRs 1–4 contracts plus the complete existing recurring overview and tests, then implement PR 5 only without changing D13 or beginning PR 6 hardening. |
| 2026-07-16 | PR 5 | Completed recurring-overview averages, configured-minus-real differences, the synthetic non-CRUD Other row, living-cost and observed summaries, deliberate Mixed filtering/chart behavior, and every required calculation invalidation. Added an authenticated target-currency summary query that reuses PR 1's calculation contract; no migration, D13 change, automatic matching, import/history redesign, or PR 6 hardening was added. | 44 tests/111 assertions; TypeScript; Biome; production build; clean schema generation; repeated local migration/seed plus exact aggregate query; unauthenticated browser/API auth checks; `git diff --check`; full PR 5 boundary/calculation/CRUD/invalidation review. | Commit and publish PR 5 through D12 with PR 4 as its base, record the draft PR link, and leave PR 6 unstarted. |
| 2026-07-16 | PR 5 | Published draft PR #6 through D12 after `gh stack push`; PR 5 targets PR 4's `codex/expenses-history-pr4-transaction-review` branch. GitHub's private-preview Stack object remains unavailable, and `gh pr create` was not used. | Verified PR #6 is open and draft with the exact PR 5 head and PR 4 base; rechecked the five-branch local `gh stack view` topology. | PR 5 is ready for review. Leave PR 6 unstarted until review decisions are resolved. |
| 2026-07-16 | PR 6 | Started hardening, accessibility, performance, documentation, regression, and release-readiness work on `codex/expenses-history-pr6-hardening`, directly above PR 5. Confirmed the worktree was clean, every local PR 1–5 head matched GitHub, all five PRs were open drafts with the required chained bases, and the local `gh stack` topology was intact before creating PR 6. | Read the complete living plan and repository instructions; verified branch ancestry, GitHub PR metadata, and `gh stack view`. | Audit the complete PR 1–5 implementation and resolve or explicitly defer every PR 6 limitation and acceptance item without changing D12, D13, or rollout non-goals. |
| 2026-07-16 | PR 6 | Completed the defined hardening effort. Fixed the real D1 raw-batch incompatibility found by the manual import/create scenario by using native bound D1 statements while preserving atomic replacement and D13 create/associate semantics; added a composite ordered-month index and query-plan regression; added multi-month destructive/recalculation and no-log coverage; hardened upload, row controls, modal focus, keyboard interaction, and small-screen table scrolling; and documented the CSV/privacy/recovery contract. No requirement or PR boundary changed, D12/D13 remain intact, and automatic matching/non-goals were not expanded. | 47 tests/125 assertions; TypeScript; Biome; client/SSR production build; clean schema regeneration; populated migration plus repeated real local seed; exact aggregate and `EXPLAIN QUERY PLAN` checks; synthetic desktop/mobile manual happy, invalid, failed-write, replacement, and deletion scenarios; clean 390×844 browser console/layout pass; sensitive-data and full-diff review; `git diff --check`. | Commit and publish PR 6 through D12 with PR 5 as its base, record the draft PR link, and leave the worktree clean. |
| 2026-07-16 | PR 6 | Published draft PR #7 through D12 after `gh stack push`; PR 6 targets PR 5's `codex/expenses-history-pr5-recurring-overview` branch. GitHub's private-preview Stack object remains unavailable, the local six-branch topology is intact, and `gh pr create` was not used. | Verified PR #7 is open and draft with the exact PR 6 head and PR 5 base; final remote six-PR metadata and clean-tree verification follow this publication-record commit. | PR 6 and the complete expenses-history rollout are ready for stacked review. |
| 2026-07-18 | PR 7 | Started routed transaction editors and presentational UI refactoring on `codex/expenses-history-pr7-routed-editors`, directly above the latest local PR 6 work. Recorded D14 before implementation: the history table becomes read-only and editing/create-associate move to canonical full-page and masked modal routes; imported transactions remain import-owned. | Re-read the complete living plan; verified a clean PR 6 worktree and ancestry; reviewed existing resource create/edit routes, route masking, `FormPageLayout`, `ResponsiveModal`, TanStack Form, TanStack Table/DataTable, Combobox, Checkbox, query, mutation, and D13 patterns. | Implement detail loading, routed forms, the shared table, and component boundaries without changing D12/D13 or rollout non-goals. |
| 2026-07-18 | PR 7 | Completed the routed-editor refactor locally. Replaced the inline row with the shared TanStack DataTable; added direct detail reads plus full-page/masked edit and atomic create-associate routes; moved fields to TanStack Form and explicit ID-valued Comboboxes; centralized D13-safe mutation invalidation; and extracted prop-driven history and recurring-overview presentation. Registered the branch directly above the latest local PR 6 commit in the existing `gh stack`. No manual bank-transaction creation, automatic matching, calculation change, or non-goal expansion was added. | 47 tests/129 assertions; TypeScript; Biome; client/SSR production build; generated-route and no-inline-control searches; `git diff --check`; unauthenticated guard browser check. Signed-in visual interaction remains limited as recorded in PR 7 known limitations. | Review the local PR 7 diff and perform a signed-in click-through when the existing development servers are available; publish only when requested, following D12. |
| 2026-07-18 | PR 7 follow-up | Recorded D15 and removed the history table's nested overflow region so the document body owns scrolling and sticky positioning. Made the shared toolbar sticky below the global header with an opaque layer above the sticky table header, and removed the obsolete focusable scroll-region label. Preserved the existing responsive minimum table width and screen-reader caption work. | Biome on changed UI files; TypeScript; 47 tests/129 assertions; `git diff --check`. Signed-in visual verification remains subject to the recorded local-server limitation. | Perform the signed-in sticky/scroll click-through when the existing development server conflict is cleared; publish only when requested, following D12. |
