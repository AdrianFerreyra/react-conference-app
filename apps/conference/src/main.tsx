import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './infrastructure/App.tsx'
import type { Clock } from './application/ports/Clock'
import { HttpScheduleRepository } from './infrastructure/adapters/HttpScheduleRepository'
import { InMemoryScheduleRepository } from './infrastructure/adapters/InMemoryScheduleRepository'
import { FallbackScheduleRepository } from './infrastructure/adapters/FallbackScheduleRepository'

/**
 * Override the perceived current time for local testing:
 *   VITE_NOW=2015-01-28T10:15:00 npm run dev
 *
 * Any ISO 8601 local datetime string is accepted. When unset the real system
 * clock is used.
 */
const clock: Clock = import.meta.env.VITE_NOW
  ? { now: () => new Date(import.meta.env.VITE_NOW as string) }
  : { now: () => new Date() }

/**
 * Select the schedule data source:
 *   VITE_SCHEDULE_SOURCE=local  — bundled JSON only (no network)
 *   VITE_SCHEDULE_SOURCE=http   — live website only (no fallback)
 *   (unset)                     — live website with JSON fallback (default)
 */
const inMemory = new InMemoryScheduleRepository()
const repository =
  import.meta.env.VITE_SCHEDULE_SOURCE === 'local'
    ? inMemory
    : import.meta.env.VITE_SCHEDULE_SOURCE === 'http'
      ? new HttpScheduleRepository()
      : new FallbackScheduleRepository(new HttpScheduleRepository(), inMemory)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App clock={clock} repository={repository} />
  </StrictMode>,
)
