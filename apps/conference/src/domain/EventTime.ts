import type { Event } from './Event'

function toAbsoluteHour(hour: number, isPM: boolean): number {
  if (isPM) return hour === 12 ? 12 : hour + 12
  return hour === 12 ? 0 : hour
}

/**
 * Parses a time string of the form "HH:MM-HH:MMam|pm" into concrete Date objects.
 *
 * The am/pm suffix is authoritative for the end time. The start time inherits the
 * same period unless doing so would place it after the end (e.g. "11:30-12:00pm"
 * where 11:30pm > 12:00pm, so 11:30 is resolved as AM instead).
 */
export function parseEventTimeRange(
  time: string,
  date: string,
): { start: Date; end: Date } {
  const match = time.match(/^(\d+):(\d+)-(\d+):(\d+)(am|pm)$/i)
  if (!match) throw new Error(`Unparseable event time: "${time}"`)

  const startH = parseInt(match[1])
  const startM = parseInt(match[2])
  const endH = parseInt(match[3])
  const endM = parseInt(match[4])
  const isPM = match[5].toLowerCase() === 'pm'

  const [year, month, day] = date.split('-').map(Number)

  const endHour = toAbsoluteHour(endH, isPM)
  let startHour = toAbsoluteHour(startH, isPM)
  if (startHour > endHour) {
    // Start would land after end in the same half-day — flip its period
    startHour = toAbsoluteHour(startH, !isPM)
  }

  return {
    start: new Date(year, month - 1, day, startHour, startM, 0),
    end: new Date(year, month - 1, day, endHour, endM, 0),
  }
}

/** Returns true when `now` falls within [start, end) of the event on the given date. */
export function isEventOngoing(event: Event, date: string, now: Date): boolean {
  const { start, end } = parseEventTimeRange(event.time, date)
  return now >= start && now < end
}
