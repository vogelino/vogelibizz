---
name: refactor-react-components
description: Refactor this app's React and TypeScript pages using view hooks, discriminated page state, URL-backed view state, domain-oriented props, local abstractions, named prop types, and re-export-only barrels. Use when splitting large TSX pages, separating data from presentation, reducing prop drilling or repetition, or reorganizing feature components.
---

# Refactor React Components

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

- Keep state and transformations at the narrowest component or folder that consumes them.
- Pass cohesive domain objects such as `view` or `dashboard` instead of expanding them into many props. Use explicit values for small presentational primitives.
- Keep behavioral callbacks at the layer that owns the behavior.
- Give every component with props a named props type. Prefer local component-specific types over shared base-prop types.
- Extract repetition only when it represents the same concept. Place shared helpers at the lowest folder common to their consumers, and promote them only after sibling consumers exist.
- Put JSX and logic in descriptively named files. Keep `index.ts` barrels limited to public re-exports; keep private helpers, types, and subcomponents out of the barrel.
- Memoize derived objects, collections, or callbacks only when identity stability benefits a child, effect, or expensive calculation.

Before finishing, check that props remain domain-oriented, abstractions live at the narrowest useful scope, and barrels contain no implementation logic.
