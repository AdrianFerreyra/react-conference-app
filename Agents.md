# Agents

This file is the entry point for AI agents working in this repository. Read this first, then follow the links below for deeper context.

## Supporting Documentation

| Document | Purpose |
|---|---|
| [DESIGN.md](./DESIGN.md) | Non-functional requirements, stack choices, and port isolation strategy for parallel development |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Ports and adapters structure, layer responsibilities, entity model, and file layout |
| [README.md](./README.md) | Product brief and goals |
| [data/schedule.md](./data/schedule.md) | Human-readable conference schedule (reference) |

## Quick Reference

### Monorepo Layout

```
react-conference-app/
├── apps/
│   └── conference/   ← main application
├── data/             ← canonical schedule data (shared)
├── DESIGN.md
├── ARCHITECTURE.md
└── Agents.md         ← you are here
```

### Running the App

```bash
# From repo root
npm run dev            # start dev server (default port 5173)
npm run test           # run unit + functional tests
npm run test:e2e       # run E2E tests (starts dev server automatically)

# Worktree / parallel instance
PORT=5174 npm run dev
PORT=5174 npm run test:e2e
```

### Running Tests Inside an App Workspace

```bash
cd apps/conference
npm run test           # vitest (unit + functional, watch-off)
npm run test:watch     # vitest watch mode
npm run test:e2e       # playwright
npm run test:e2e:ui    # playwright interactive UI
```

### Key Architectural Rules

1. **Domain has no imports** from application or infrastructure.
2. **Application imports only domain** types and defines port interfaces.
3. **Infrastructure imports everything** but is never imported by domain or application.
4. **Use cases are plain functions** — no React, no framework coupling.
5. **Ports are injected** — adapters are wired at the composition root (`main.tsx` / `App.tsx`), never inside domain or application code.
