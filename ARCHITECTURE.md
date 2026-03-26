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

## Layers

### Domain (`src/domain/`)

Pure TypeScript types representing the conference model. No framework imports, no side effects.

#### Entities

| Entity | Identity | Fields |
|---|---|---|
| `Speaker` | `name` | `name: string` |
| `Event` | `title` | `title`, `time`, `speakers: Speaker[]`, `description` |
| `Day` | `date` (ISO 8601) | `date`, `events: Event[]` |

#### Relationships

- A `Day` is composed of zero or more `Event`s.
- An `Event` references one or more `Speaker`s.
- A `Speaker` may appear on multiple `Event`s (`*..* ` cardinality).

```
Day (id: date) ──< Event (id: title) >── Speaker (id: name)
```

### Application (`src/application/`)

Orchestrates the domain through use cases. Defines **ports** (interfaces) that the infrastructure must implement.

#### Ports (`src/application/ports/`)

```typescript
interface ScheduleRepository {
  getDays(): Promise<Day[]>;
  getDay(date: string): Promise<Day | null>;
}
```

#### Use Cases (`src/application/useCases/`)

Plain async functions that accept ports as arguments. No framework coupling.

```typescript
getSchedule(repo: ScheduleRepository): Promise<Day[]>
```

### Infrastructure (`src/infrastructure/`)

Contains everything that touches the outside world: React components, data adapters, and app wiring.

#### Adapters (`src/infrastructure/adapters/`)

Concrete implementations of application ports.

- `InMemoryScheduleRepository` — implements `ScheduleRepository` using bundled JSON data.

#### React Components

React components live entirely in this layer. They call use cases, passing adapter instances resolved at the composition root (`main.tsx` or the top-level `App.tsx`).

## File Structure

```
apps/conference/
├── e2e/                          # Playwright E2E tests
├── src/
│   ├── domain/
│   │   ├── __tests__/            # Unit tests for domain logic
│   │   ├── Day.ts
│   │   ├── Event.ts
│   │   └── Speaker.ts
│   ├── application/
│   │   ├── __tests__/            # Functional tests for use cases
│   │   ├── ports/
│   │   │   └── ScheduleRepository.ts
│   │   └── useCases/
│   │       └── getSchedule.ts
│   ├── infrastructure/
│   │   ├── adapters/
│   │   │   └── InMemoryScheduleRepository.ts
│   │   └── App.tsx               # Composition root / UI shell
│   ├── index.css
│   ├── main.tsx                  # Vite entry point
│   └── test-setup.ts             # Vitest global setup
├── index.html
├── package.json
├── playwright.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```
