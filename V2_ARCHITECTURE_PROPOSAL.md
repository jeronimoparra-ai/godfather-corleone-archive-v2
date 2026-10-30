# V2 Architecture Proposal

Baseline: Bootstrap 5.3 frontend scaffold at `V2/`. This document defines the
proposed organization, contracts, state model, integration points, grid plan,
responsive breakpoints, accessibility strategy, and maintainability rules for
the V2 application. It is a design blueprint only — no production code is
introduced here.

---

## 1. File Organization

Goal: one-way dependency flow, feature slices that colocate behavior, and a
clear boundary between the build pipeline (`public/`, build config) and the
application source (`src/`). Bootstrap 5.3 provides the layout/component
foundation; application code stays on top of it without fighting the framework.

```
V2/
├── public/
│   ├── index.html                  # Application shell (no build step)
│   ├── assets/
│   │   ├── css/                    # Hand-authored CSS compiled to here
│   │   └── images/                 # Unhashed, versionless assets
│   └── favicon.ico
├── src/
│   ├── main.ts                     # Entry: bootstrap, DI/config, mount
│   ├── styles/
│   │   ├── _tokens.scss            # Design tokens (colors, spacing, radius)
│   │   ├── _bootstrap-overrides.scss  # Bootstrap theme overrides
│   │   └── app.scss                # Style entry (imports tokens + overrides)
│   ├── components/                 # Presentational, framework-agnostic-ish
│   │   ├── common/                 # Buttons, cards, modals, alerts (core)
│   │   ├── layout/                 # Navbar, footer, sidebar, shell, grid wrappers
│   │   └── features/               # Feature-scoped presentational pieces
│   ├── features/                   # Feature slices (colocated)
│   │   ├── auth/                   # Login, register, password reset
│   │   ├── dashboard/              # Stats, widgets, charts surface
│   │   ├── settings/               # Profile, preferences, notifications
│   │   └── alerts/                 # Notification list / bell
│   ├── stores/                     # Global state
│   │   ├── index.ts                # Store registry / factory
│   │   └── __tests__/              # Store unit tests
│   ├── services/                   # External integrations & data fetching
│   │   ├── api.ts                  # Fetch wrapper, interceptors, auth
│   │   ├── api/
│   │   │   ├── auth.api.ts
│   │   │   ├── dashboard.api.ts
│   │   │   └── index.ts
│   │   └── integrations.ts         # Third-party SDK wiring (maps, analytics)
│   ├── types/                      # Shared TypeScript contracts (see §2)
│   │   ├── api.ts
│   │   ├── entities.ts
│   │   └── ui.ts
│   ├── utils/                      # Pure helpers, formatters, validators
│   │   ├── format.ts
│   │   ├── validate.ts
│   │   └── keys.ts
│   ├── hooks/                      # Custom UI logic hooks
│   ├── i18n/                       # Locale data, message catalogs, init
│   ├── constants/                    # App constants, route table, statuses
│   │   ├── routes.ts
│   │   └── statuses.ts
│   ├── router/                     # Route definitions, guards, async loading
│   ├── assets/                       # Source images/fonts (vite publicCopy/source)
│   ├── config/                       # Env config, feature flags, build config
│   └── tests/                        # e2e + component test suites
├── docs/
│   ├── architecture/                 # This doc + ADRs
│   └── testing.md                    # Test strategy and runbooks
├── scripts/                          # Custom dev/test scripts
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### Organization rules
1. **Source vs. shipped assets.** Never place build-input files in `public/`;
   `public/` holds only what the server serves verbatim. Build inputs live in
   `src/` and are compiled by Vite.
2. **Features slice.** Each `features/*/` contains its own components, hooks,
   and service calls, so a feature can be developed and tested in isolation.
3. **Shared primitives live in `components/` and top-level `src/`**. Only
   genuinely reusable, feature-independent code shares the root of `src/`.
4. **Tests mirror source.** Structure `foo/__tests__/*.test.ts` next to `foo/`
   (or colocated `*.test.ts`). One test file per source file where feasible.
5. **No production code in `docs/` or `scripts/`**. Documentation and tools
   only.

---

## 2. Contracts

Contracts are the explicit, versioned interfaces between subsystems. They are
declared in TypeScript and enforced by the compiler; every boundary must have
one.

### 2.1 API contracts
- Defined in `types/api.ts` as TypeScript interfaces and Zod schemas (or
  comparable runtime validator).
- Each API version has its own contract file; breaking changes increment the
  minor version and ship a migration note.
- Requests and responses are never cast from `any`; the fetch wrapper
  deserializes and validates at the boundary (see `services/api.ts`).

```ts
// types/api.ts (example shape)
export interface User { id: string; username: string; email: string; }
export interface LoginRequest { username: string; password: string; }
export interface LoginResponse { user: User; token: string; }
```

### 2.2 Event contracts
- Custom DOM events and publish/subscribe topics are named constants in
  `constants/events.ts` (not string literals scattered through code).
- Topic naming: `feature:verb` (e.g., `alerts:refresh`, `dashboard:load`).
- Payload types are documented in the same constant file.

```ts
// constants/events.ts
export const Events = { ALERTS_REFRESH: 'alerts:refresh' } as const;
export type EventTopic = typeof Events[keyof typeof Events];
```

### 2.3 Component contracts
- Props and emits are typed via the framework's typing system (Vue props/
  emits, React interfaces, or vanilla custom-element/declare).
- Every shared component exposes a JSDoc contract of props, events, slots, and
  accessibility attributes.
- Components that wrap Bootstrap 5.3 widgets declare an internal contract so
  that the framework API does not leak into the application layer.

### 2.4 Error contract
- Network failures, validation errors, and domain errors share one shape so
  UI and retry logic treat them uniformly:

```ts
export interface AppError {
  code: string;          // machine-readable, e.g. 'UNAUTHORIZED'
  message: string;       // human-readable, i18n-keyed
  details?: unknown;     // optional structured payload
  status?: number;       // HTTP status when applicable
}
```

---

## 3. State Management

Goal: clear separation of **server state**, **global UI state**, **URL state**,
and **local UI state**, with a single source of truth where it matters and no
duplication.

### 3.1 State categories
| Category        | Tool                              | Ownership                     |
|-----------------|-----------------------------------|-------------------------------|
| Server state    | TanStack Query (or SWR)           | `services/` / `stores/`       |
| Global UI state | Pinia / Zustand (single store)    | `stores/`                     |
| URL state       | Router query / params             | `router/`                     |
| Local UI state  | Component state / `useState`      | Component scope only          |
| Persistent UI   | LocalStorage / IndexedDB (via wrapper) | `utils/persistence.ts`  |

### 3.2 Server state rule
- Cache, dedup, background refetch, and stale-while-revalidate all happen in
  the query layer. Application code never calls `fetch` directly from a
  component.
- Cache invalidation is triggered by explicit invalidation keys, not by
  mutating responses.

### 3.3 Global UI state shape (example)
```ts
interface GlobalState {
  auth: { status: 'idle' | 'loading' | 'authenticated' | 'anonymous'; user: User | null; };
  ui: { sidebar: { open: boolean; }, notifications: { unread: number; }, modal: { open: boolean; id: string | null; }; };
  settings: { locale: string; theme: 'light' | 'dark' | 'system'; };
}
```

### 3.4 Update rules
1. **Never mutate state directly.** All updates go through store actions or
   reducers.
2. **Server state is read-only in application code.** Components cannot
   `push()` or `merge()` API results; they either query or invalidate.
3. **Async actions are thin.** The store only orchestrates; services hold the
   logic. No async code lives in getters.
4. **Persistence is automatic for `settings` only.** Do not persist auth
   tokens between sessions; handle re-auth explicitly.
5. **Derive, don't duplicate.** Computed UI values come from selectors,
   never stored as separate state.

---

## 4. Integration

### 4.1 Bootstrap 5.3
- JS widgets are initialized via the framework's ES module build:
  `import { Alert, Button, Modal, Offcanvas, Toast } from 'bootstrap';`
- **Do not** ship bundled Bootstrap JS globally. Import only the widgets a
  feature actually uses (tree-shaking).
- Widget instances are stored per-element and cleaned up (`dispose()`) in
  `useEffect`/`destroy` hooks so destroyed DOM does not leak.
- Use Bootstrap's form controls and breakpoints as the base; extend with
  custom classes, never override Bootstrap CSS with `!important` (see §8).

### 4.2 API integration
- Single fetch wrapper in `services/api.ts` handles base URL, auth headers,
  JSON serialization, timeout, and error normalization (`AppError` from §2.4).
- Auth token is attached via an interceptor; on `401`, the wrapper triggers a
  single forced refresh and rejects the request.
- All API client modules (`services/api/`) import from typed contracts, keeping
  the network layer independent of components.

### 4.3 Third-party libraries
- Each external dependency is recorded in `package.json` with a pinned version
  and a one-line purpose in a dependency-purpose comment or `package.json`
  `"description"`/lockfile note.
- SDKs that expose global state (maps, analytics) are initialized once in
  `services/integrations.ts` and exposed through a typed facade.
- No library is added without a documented reason and a replacement cost note.

### 4.4 Environment & feature flags
- Vite env variables follow `VITE_*` and are validated at startup by a config
  module (`config/env.ts`) that throws a clear error on missing required
  values.
- Feature flags live in `config/featureFlags.ts`, driven by the environment,
  and are read through a small `useFeature` hook so components stay flag-free.

### 4.5 i18n
- Catalogs are JSON files per locale in `i18n/locales/`. The active locale is
  part of `settings` state and synced with the router for deep-linking.

---

## 5. Bootstrap Grid Plan

Bootstrap 5.3's grid (`container > row > col`) is the layout primitive for the
shell and content areas. The proposal fixes how it is layered onto the app.

### 5.1 Layer structure
```
shell (flex column, min-height 100%)
├── navbar (fixed top, consumes spacing)
├── body (flex: 1, display flex column)
│   ├── sidebar (fixed or offcanvas depending on breakpoint)
│   └── main (flex: 1, display flex column)
│       └── <page / feature router view>
│           └── container (fluid, padding r/z)
│               └── row > col...
```

### 5.2 Grid usage rules
1. **`container`/`container-fluid`** — only inside page content. The shell
   itself is a custom flex container; do not nest Bootstrap containers for the
   shell padding.
2. **Rows** — never nest rows without a column wrapper in between (Bootstrap
   gutters have no offset sibling support).
3. **Columns** — prefer `col-*` over arbitrary widths; use `col-12 col-md-6`
   style sequential classes, not calc() hacks.
4. **Gutters** — standard gutter values (1.5rem horizontal, 1rem vertical by
   default). Override per-page only through the `$gutter` SCSS token, not
   inline margins.
5. **Offsets / ordering** — avoid `offset-*` in layouts that must be identical
   in DOM order; use flexbox utilities (`ms-auto`, `order-*`) for fine-grained
   shifting while keeping DOM semantic order.

### 5.3 Responsive layering
- The shell is **desktop-first**; on `< lg` the sidebar becomes an offcanvas
  invoked by a navbar toggle.
- Page-level grids can override nesting per breakpoint via the breakpoint plan
  in §6.
- Grid examples live in `docs/architecture/grid-plan.md` with visual Wireframe
  ASCII (no production layout code).

---

## 6. Responsive Breakpoints

Baseline: Bootstrap 5.3 default breakpoints, extended by one application token.

| Alias | Value   | Usage                              |
|-------|---------|------------------------------------|
| xs    | 0px     | Unconstrained (mobile-first)       |
| sm    | 576px   | Mobile compact APIs                |
| md    | 768px   | Tablet portrait                    |
| lg    | 992px   | Desktop shell, sidebar visible     |
| xl    | 1200px  | Wide desktop                       |
| xxl   | 1400px  | Large desktop / 4K work surface    |
| admin | 1600px  | Optional: admin dashboard extension|

### 6.1 Rules
1. **Mobile-first** — every rule sets the base (smallest) style first, then
   adds `@media (min-width: ...)` overrides.
2. **Breakpoint names are constants.** Do not inline pixel values in classes;
   import from `config/breakpoints.ts` (or Bootstrap's map) so they stay in
   sync with the grid.
3. **Match the design system.** The 576/768/992/1200/1400 set is enforced in
   `styles/_tokens.scss` as `$breakpoints`. New products must use this set;
   the `admin` extension exists only for the admin shell and can be removed.
4. **Test with the smallest and largest targets**: 320px phone, 1280px laptop,
   1920px+ wide. E2E suite runs a viewport matrix (see §8).
5. **Touch targets** — any interactive element is ≥44×44px on `< md` (Bootstrap
   `_reboot` reset already provides the floor; verify custom buttons).

### 6.2 Breakpoint helper (SCSS)
```scss
@use 'tokens' as *;
@each $name, $val in $breakpoints {
  @media (min-width: $val) { @content; }
}
```
Consumed as `@include at-breakpoint(md) { ... }`.

---

## 7. Accessibility Strategy

Accessibility is a requirement, not a polish layer. The goal is WCAG 2.1 AA
for the application shell and features.

### 7.1 Core rules
1. **Semantic HTML first.** Use real elements: `<button>`, `<nav>`, `<main>`,
   `<aside>`, `<table>`, `<ul>/<ol>`. Bootstrap classes never replace
   semantics.
2. **No keyboard traps.** Every focusable widget can be reached and exited by
   keyboard alone. Custom widgets implement `Tab`/`Shift+Tab` and Escape-to-close
   for overlays.
3. **Focus management.** Routing and overlays move focus deliberately:
   - Page transitions: focus moves to the new page's main heading or skip link.
   - Modals/offcanvas: focus is trapped and returned on close.
   - Dynamic list updates: the changed item receives focus when it is the
     result of an action.
4. **ARIA where HTML is insufficient.** `role`/`aria-*` only to fill gaps:
   - `aria-live="polite"` for toast/notification regions.
   - `aria-label` on icon-only buttons.
   - `aria-expanded` on toggle buttons and accordion triggers.
5. **Forms.** Every input has an explicit `<label>` (linked via `for` or
   wrapped). Errors are associated with inputs via `aria-describedby` and
   announced through `aria-live`.
6. **Color and contrast.** Do not rely on color alone to convey state (add
   icons/text). Contrast ≥ 4.5:1 normal text, 3:1 large text and UI components.
   Tokens in `styles/_tokens.scss` guarantee the palette passes by construction.
7. **Respect system preferences.** Respect `prefers-reduced-motion` and
   `prefers-color-scheme` (via the `theme: 'system'` setting).
8. **Skip link and skip-to-nav** on every page so keyboard and screen-reader
   users bypass the shell.

### 7.2 Testing
- Unit tests assert no reduced-motion/disabled-focus regressions for critical
  components.
- Manual keyboard-only walkthrough of the shell before each milestone.
- Screen-reader pass (NVDA/JAWS or VoiceOver) on the two highest-risk flows
  (login, error/alert surface).

---

## 8. Maintainability Recommendations

### 8.1 Toolchain
| Area       | Tool                                          | Rule |
|------------|-----------------------------------------------|------|
| Language   | TypeScript, strict mode (`"strict": true`)    | No `any` at module boundaries |
| Formatting | Prettier (JSON/JS/TS/CSS/MD), default config  | Pre-commit hook |
| Linting    | ESLint (airbnb-base + React/Vue plugin)       | No lint errors in CI |
| Style      | Stylelint (Sass) + Bootstrap lint rules       | No deprecated classes |
| Types      | tsc --noEmit in CI                             | Type-check on every PR |
| Build      | Vite                                        | Versioned cache, build passes on CI |

### 8.2 Code quality gates
1. **No production code without tests.** Unit coverage for stores/services;
   component tests for all presentational components; e2e for critical paths.
2. **Commit convention.** Conventional Commits: `feat:`, `fix:`, `docs:`,
   `chore:`… so CHANGELOG rolls from the git history.
3. **ADR discipline.** Architectural decisions are written as one-page ADRs
   in `docs/architecture/` (title, context, decision, consequences). If it's
   not written down, it didn't happen.
4. **Review checklist.** PRs must document: which contract changed, which
   store/saga changed, which breakpoint story changed, and a11y/design
   notes where relevant.
5. **Performance.** Budget: budget the JS bundle (Vite build analytics),
   lazy-load above-the-fold routes, and debounce/throttle search and
   reflow-heavy widgets. No layout thrashing in the hot path.

### 8.3 Testing strategy
- **Unit** (`tests/unit/`): stores, utils, API contract validators, formatters.
- **Component** (`tests/component/`): presentational components with mocked
  stores/Bootstrap widgets (no real network).
- **E2E** (`tests/e2e/`): Cypress or Playwright covering login, dashboard
  load, alert refresh, and a responsive matrix (320 / 768 / 1024 / 1440px).
- **Accessibility**: automated axe checks in CI + manual keyboard pass on
  critical flows (see §7.2).

### 8.4 Documentation maintenance
- `README.md`: quickstart, env vars, run commands, architecture pointer.
- `docs/architecture/adr/`: one file per decision (template `N-title.md`).
- `docs/testing.md`: test commands, coverage thresholds, how to add a suite.
- Code comments are for **why**, not **what**: the compiler and types answer
  the what; comment the reason for a non-obvious choice.

---

## Appendix A — Quick Reference

- **File protocol:** `src/featurename/` slices contain components, hooks,
  service calls; `components/common/` and `components/layout/` hold shared
  visuals.
- **Contracts:** `types/api.ts` (API shapes), `constants/events.ts` (topics),
  `services/api.ts` (fetch + `AppError`).
- **State:** server → TanStack Query; global UI → Pinia/Zustand; URL →
  router; local → component; persistent → `settings` only.
- **Integration:** Bootstrap 5.3 ES module widgets, env `VITE_*`, i18n JSON.
- **Grid:** `container > row > col`, mobile-first, nested rows only under
  columns.
- **Breakpoints:** xs 0, sm 576, md 768, lg 992, xl 1200, xxl 1400 (+admin 1600).
- **a11y:** semantics, keyboard, focus management, ARIA gaps, contrast, reduced
  motion, skip link.
- **Maintainability:** strict TS, Prettier+ESLint+Stylelint, tsc CI gate,
  conventional commits, ADRs, coverage gates, performance budget.
