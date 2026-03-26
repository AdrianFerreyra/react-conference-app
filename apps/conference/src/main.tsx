import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './infrastructure/App.tsx'
import type { Clock } from './application/ports/Clock'

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App clock={clock} />
  </StrictMode>,
)
