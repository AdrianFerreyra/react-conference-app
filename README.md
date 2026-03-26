# React Conference App

A conference schedule viewer for [React.js Conf 2015](https://conf2015.reactjs.org/schedule.html), built as a clean example of **Hexagonal Architecture** (Ports and Adapters) in a React application.

The app shows attendees what is happening **right now** and what is coming up next, with a time-travel control for exploring other moments in the schedule.

## Features

- **Now playing** — highlights the currently ongoing session with title, speakers, time, and description.
- **Coming up next** — lists the next three upcoming sessions across both conference days.
- **Time travel** — a datetime input lets you scrub to any point in the schedule without reloading the page.
- **Resilient data loading** — fetches live schedule data from the official conference site, with a bundled JSON fallback when the network is unavailable.

## Architecture

The codebase follows a strict three-layer **Hexagonal Architecture** (Ports and Adapters). Dependencies flow inward only:

```
Infrastructure → Application → Domain
```

| Layer | Location | Contents |
|---|---|---|
| **Domain** | `src/domain/` | Pure TypeScript entities and time logic. No external deps. |
| **Application** | `src/application/` | Use cases and port interfaces (contracts). No framework coupling. |
| **Infrastructure** | `src/infrastructure/` | React components, schedule adapters, composition root. |

Use cases are plain async functions that accept ports (interfaces) as arguments. Concrete adapters are wired at the composition root (`main.tsx`), making it trivial to swap implementations in tests or alternative builds.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for a detailed breakdown and [`DESIGN.md`](./DESIGN.md) for stack choices and non-functional decisions.

## Getting Started

```bash
npm install
npm run dev        # starts dev server at http://localhost:5173
```

## Testing

```bash
npm test           # unit + functional tests (Vitest)
npm run test:e2e   # end-to-end tests (Playwright, Chromium)
```

The test suite covers all three layers:

| Scope | Tool | What is tested |
|---|---|---|
| Domain | Vitest | Time parsing, event state logic, entity structure |
| Application | Vitest | All three use cases with mock ports |
| Infrastructure | Vitest + RTL | Adapters (HTTP parser, fallback), App component, TimeTravelBar |
| E2E | Playwright | Full user flows: title, schedule load, time travel, current/upcoming events |

## Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `5173` | Dev server port. Playwright reads the same value for E2E targets. |
| `VITE_NOW` | *(real time)* | Override perceived current time (ISO 8601). Useful for local demos. |
| `VITE_SCHEDULE_SOURCE` | *(HTTP + fallback)* | `"local"` forces bundled JSON; `"http"` forces live fetch; unset uses HTTP with JSON fallback. |

### Time travel in development

```bash
# Simulate being mid-Keynote on day 1
VITE_NOW=2015-01-28T10:15:00 npm run dev

# Simulate afternoon of day 2
VITE_NOW=2015-01-29T14:05:00 npm run dev
```

The in-app time travel bar also lets you change the perceived time interactively at runtime.

### Parallel worktrees

Each worktree can run its own dev server and E2E suite without conflicts by setting a distinct `PORT`:

```bash
# worktree A (default)
npm run dev

# worktree B
PORT=5174 npm run dev
PORT=5174 npm run test:e2e
```
