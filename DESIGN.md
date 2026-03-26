# Design Decisions

## Non-Functional Requirements

### Modern React Stack

The application is built on the following stack:

| Concern | Choice | Rationale |
|---|---|---|
| UI library | React 19 | Latest stable release; concurrent features available |
| Language | TypeScript 5 | End-to-end type safety; enables architectural boundaries to be enforced at compile time |
| Build tool | Vite 7 | Native ESM dev server; near-instant HMR; fastest cold starts in class |
| Unit/functional testing | Vitest + React Testing Library | Vite-native test runner; co-located config; RTL encourages testing behavior over implementation |
| E2E testing | Playwright | Cross-browser; reliable auto-wait; first-class TypeScript support |
| Linting | ESLint 9 (flat config) + typescript-eslint | Enforces code quality and React-specific rules |

## Workspace Strategy

The project uses **npm workspaces** to host multiple React applications under `apps/`. Each app:

- Has its own `package.json`, `vite.config.ts`, and test configuration.
- Can be started, built, and tested in complete isolation.
- Is compatible with **git worktrees**: checking out a branch into a separate directory gives a fully independent instance with no shared state.

### Port Isolation

Each app reads its dev server port from the `PORT` environment variable (default `5173`). Playwright's `webServer` config uses the same variable so that E2E tests always target the correct instance. When using worktrees for parallel development, set distinct `PORT` values per worktree:

```bash
# worktree A (default)
npm run dev

# worktree B
PORT=5174 npm run dev
PORT=5174 npm run test:e2e
```

`strictPort: true` is set in Vite so the dev server fails immediately if the port is already occupied, preventing silent port collisions.

### Controlling the Perceived Current Time (`VITE_NOW`)

The `getCurrentEvent` use case consults a `Clock` port. In production the clock
uses `new Date()`. For local development and testing, the perceived time can be
overridden by setting `VITE_NOW` to any ISO 8601 local datetime string:

```bash
VITE_NOW=2015-01-28T10:15:00 npm run dev   # mid-Keynote
VITE_NOW=2015-01-29T14:05:00 npm run dev   # mid-afternoon day 2
```

The variable is read once at page load (`main.tsx`); the dev server does **not**
need to be restarted between overrides — a regular browser refresh is sufficient
when using Vite HMR.

In tests, a `Clock` instance is injected directly into the component and use
cases, so no env var mocking is needed.

### Controlling the Schedule Data Source (`VITE_SCHEDULE_SOURCE`)

The schedule data source is selected at startup via `VITE_SCHEDULE_SOURCE`:

| Value | Behaviour |
|---|---|
| *(unset)* | HTTP fetch with bundled JSON as fallback (production default) |
| `"local"` | Bundled JSON only — useful when the conference site is unreachable |
| `"http"` | Live HTTP fetch only, no fallback — useful for verifying the parser |

```bash
VITE_SCHEDULE_SOURCE=local npm run dev    # offline-safe
VITE_SCHEDULE_SOURCE=http npm run dev     # test live parsing
```
