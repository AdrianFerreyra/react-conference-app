# Architecture

## Pattern: Ports and Adapters (Hexagonal Architecture)

The application is divided into three layers. Dependencies flow strictly inward: Infrastructure → Application → Domain. The domain has no dependencies.

```
┌─────────────────────────────────────────────┐
│              Infrastructure                 │
│  React components, app wiring, adapters     │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │            Application                │  │
│  │  Use cases, port interfaces           │  │
│  │                                       │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │            Domain               │  │  │
│  │  │  Entities, value objects        │  │  │
│  │  │  No external dependencies       │  │  │
│  │  └─────────────────────────────────┘  │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## Layers

### Domain (`src/domain/`)

Pure TypeScript types and logic representing the conference model. No framework imports, no side effects.

#### Entities

| Entity | Identity | Fields |
|---|---|---|
| `Speaker` | `name` | `name: string` |
| `Event` | `title` | `title`, `time`, `speakers: Speaker[]`, `description` |
| `Day` | `date` (ISO 8601) | `date`, `events: Event[]` |

#### Relationships

- A `Day` is composed of zero or more `Event`s.
- An `Event` references one or more `Speaker`s.
- A `Speaker` may appear on multiple `Event`s (`*..*` cardinality).

```
Day (id: date) ──< Event (id: title) >── Speaker (id: name)
```

#### Time Logic (`EventTime.ts`)

All time-related calculations live in the domain as pure functions:

| Function | Signature | Purpose |
|---|---|---|
| `parseEventTimeRange` | `(time: string, date: string) → { start: Date, end: Date }` | Parses `"HH:MM-HH:MMam/pm"` format into concrete Date objects. Handles AM/PM inference and noon crossing. |
| `isEventOngoing` | `(event: Event, date: string, now: Date) → boolean` | True if `now` falls within `[start, end)`. |
| `isEventUpcoming` | `(event: Event, date: string, now: Date) → boolean` | True if the event starts strictly after `now`. |

---

### Application (`src/application/`)

Orchestrates the domain through use cases. Defines **ports** (interfaces) that the infrastructure must implement.

#### Ports (`src/application/ports/`)

```typescript
interface Clock {
  now(): Date;
}

interface ScheduleRepository {
  getDays(): Promise<Day[]>;
  getDay(date: string): Promise<Day | null>;
}
```

#### Use Cases (`src/application/useCases/`)

Plain async functions that accept ports as arguments. No framework coupling.

| Use Case | Signature | Purpose |
|---|---|---|
| `getSchedule` | `(repo: ScheduleRepository): Promise<Day[]>` | Returns all conference days. |
| `getCurrentEvent` | `(repo: ScheduleRepository, clock: Clock): Promise<Event \| null>` | Returns the event currently in progress, or `null` if between sessions. |
| `getUpcomingEvents` | `(repo: ScheduleRepository, clock: Clock, limit?: number): Promise<Event[]>` | Returns the next `limit` (default 3) upcoming events across all days, in chronological order. |

---

### Infrastructure (`src/infrastructure/`)

Contains everything that touches the outside world: React components, data adapters, and app wiring.

#### Adapters (`src/infrastructure/adapters/`)

Concrete implementations of application ports:

| Adapter | Port | Behaviour |
|---|---|---|
| `InMemoryScheduleRepository` | `ScheduleRepository` | Loads bundled `schedule.json` at import time. Used as a reliable fallback. |
| `HttpScheduleRepository` | `ScheduleRepository` | Fetches and parses the official React Conf 2015 schedule HTML. Normalises speaker names, skips non-talk rows, and caches the result per session. |
| `FallbackScheduleRepository` | `ScheduleRepository` | Wraps a primary and a secondary adapter. Calls the primary; on any error transparently falls back to the secondary. The application layer is unaware of the fallback logic. |

#### React Components

| Component | Props | Purpose |
|---|---|---|
| `App` | `{ clock: Clock, repository: ScheduleRepository }` | Composition root and main UI. Fetches and renders the number of days, the current event, and the upcoming events list. Manages time-travel state. |
| `TimeTravelBar` | `{ currentTime: Date, onTimeChange: (d: Date) => void, onReset: () => void }` | A `datetime-local` input and reset button that let users explore the schedule at an arbitrary point in time without reloading the page. |

#### Composition Root (`main.tsx`)

The single place where concrete adapters are instantiated and injected:

```
main.tsx
  ├── Clock implementation  ← reads VITE_NOW env var (or uses real Date)
  ├── HttpScheduleRepository (primary)
  ├── InMemoryScheduleRepository (fallback)
  ├── FallbackScheduleRepository wrapping both
  └── <App clock={...} repository={...} />
```

The `VITE_SCHEDULE_SOURCE` env var can override this wiring at build time:
- `"local"` — skips HTTP, uses bundled JSON only.
- `"http"` — uses HTTP with no fallback.
- *(unset)* — HTTP with JSON fallback (production default).

---

## File Structure

```
apps/conference/
├── e2e/                              # Playwright E2E tests
│   └── schedule.spec.ts
└── src/
    ├── domain/
    │   ├── __tests__/                # Unit tests for domain logic
    │   │   ├── Day.test.ts
    │   │   └── EventTime.test.ts
    │   ├── Day.ts
    │   ├── Event.ts
    │   ├── EventTime.ts
    │   └── Speaker.ts
    ├── application/
    │   ├── __tests__/                # Functional tests for use cases
    │   │   ├── getSchedule.test.ts
    │   │   ├── getCurrentEvent.test.ts
    │   │   └── getUpcomingEvents.test.ts
    │   ├── ports/
    │   │   ├── Clock.ts
    │   │   └── ScheduleRepository.ts
    │   └── useCases/
    │       ├── getSchedule.ts
    │       ├── getCurrentEvent.ts
    │       └── getUpcomingEvents.ts
    ├── infrastructure/
    │   ├── __tests__/                # Component tests
    │   │   └── App.test.tsx
    │   ├── adapters/
    │   │   ├── __tests__/            # Adapter unit tests
    │   │   │   ├── InMemoryScheduleRepository.test.ts
    │   │   │   ├── HttpScheduleRepository.test.ts
    │   │   │   └── FallbackScheduleRepository.test.ts
    │   │   ├── schedule.json         # Bundled schedule data
    │   │   ├── InMemoryScheduleRepository.ts
    │   │   ├── HttpScheduleRepository.ts
    │   │   └── FallbackScheduleRepository.ts
    │   ├── components/
    │   │   ├── __tests__/            # Component unit tests
    │   │   │   └── TimeTravelBar.test.tsx
    │   │   └── TimeTravelBar.tsx
    │   └── App.tsx
    ├── index.css
    ├── main.tsx                      # Vite entry point + composition root
    └── test-setup.ts                 # Vitest global setup
```
