---
name: refactor-react-components
description: Refactor this app's React and TypeScript pages and features using view hooks, discriminated state, URL-backed view state, domain-oriented props, concept-based component folders, one component per TSX file, named prop types, and re-export-only barrels. Use when splitting large TSX files, separating data from presentation, reducing prop drilling or repetition, or reorganizing feature components.
---

# Refactor React Components

## Before editing

- Inspect the complete target feature and at least one well-organized sibling feature. Match the repository's established folder, naming, barrel, and import conventions.
- Sketch the intended tree before moving code. Identify the feature entry, controller hook, pure view-model logic, concept component folders, private implementation files, and public exports.
- Search all current consumers so moves preserve the feature's external API or update every deep import deliberately.

## Page architecture

- For a complex page, prefer `route → Page → useXPage → XView → section components`.
- Keep the route file responsible for validated search parameters, loader prefetching through shared query options, and selecting the feature page component.
- Make the page entry a minimal bridge from `useXPage()` to `XView`.
- Let `useXPage` own page queries, mutations, `Route.useSearch()`, `useNavigate({ from: Route.fullPath })`, derived view models, and navigation actions.
- Return a named discriminated union such as `pending | error | empty | ready`. Put complete render data and an `actions` object on the ready state instead of passing nullable query results through the view tree.
- Derive substantial view data in a pure `getXView`-style function and memoize it in the page hook.
- Stabilize actions passed into the view and memoize the action bundle when its identity crosses the render boundary.
- Store shareable view state such as filters, selected periods, and comparisons in validated route search. Preserve unrelated search keys, omit canonical defaults, and use `replace: true` for view-only changes.
- Keep ephemeral interaction state such as dialog visibility, temporary file selection, and local row selection beside the UI that consumes it.

## Component boundaries

- Keep at most one React component in each `.tsx` file, including private or unexported components.
- Keep state and transformations at the narrowest component or folder that consumes them.
- Pass cohesive domain objects such as `view` or `dashboard` instead of expanding them into many props. Use explicit values for small presentational primitives.
- Keep behavioral callbacks at the layer that owns the behavior.
- Give every component with props a named props type. Prefer local component-specific types over shared base-prop types.
- Extract repetition only when it represents the same concept. Place shared helpers at the lowest folder common to their consumers, and promote them only after sibling consumers exist.
- Put JSX and logic in descriptively named files. When a feature has multiple related component files, group them under `components/<concept>/` instead of leaving a flat feature root.
- Memoize derived objects, collections, or callbacks only when identity stability benefits a child, effect, or expensive calculation.

## Public boundaries

- Use `components/<concept>/index.ts` to expose the concept's intended public component while sibling helpers and subcomponents remain private and use direct relative imports.
- Use a feature-root `index.ts` when the feature has external consumers. Export only the supported feature entry points and update consumers to import from that boundary.
- Keep every barrel re-export-only. Do not interpret “keep private components out of the barrel” as a reason to omit useful concept folders or public boundaries.
- Avoid filenames that differ only by capitalization.

## Before finishing

- Inspect the resulting tree and compare it with the sibling convention chosen before editing.
- Verify every `.tsx` file contains at most one component.
- Verify barrels contain only re-exports, private components are absent from barrels, and external consumers do not deep-import implementation files.
- Check that props remain domain-oriented and abstractions live at the narrowest useful scope.
- Run focused tests, TypeScript, formatting/lint checks, and `git diff --check`.
