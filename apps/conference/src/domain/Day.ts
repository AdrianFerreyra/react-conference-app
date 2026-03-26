import type { Event } from './Event'

export interface Day {
  /** Identity: ISO 8601 date string (YYYY-MM-DD) */
  date: string
  events: Event[]
}
