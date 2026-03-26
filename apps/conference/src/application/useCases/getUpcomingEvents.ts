import type { Event } from '../../domain/Event'
import { isEventUpcoming, parseEventTimeRange } from '../../domain/EventTime'
import type { Clock } from '../ports/Clock'
import type { ScheduleRepository } from '../ports/ScheduleRepository'

export async function getUpcomingEvents(
  repository: ScheduleRepository,
  clock: Clock,
): Promise<Event[]> {
  const now = clock.now()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const scheduleDay = await repository.getDay(date)
  if (!scheduleDay) return []

  const upcoming = scheduleDay.events.filter((event) => isEventUpcoming(event, date, now))
  if (upcoming.length === 0) return []

  const startTimes = upcoming.map((event) => parseEventTimeRange(event.time, date).start)
  const earliestMs = Math.min(...startTimes.map((t) => t.getTime()))

  return upcoming.filter(
    (event) => parseEventTimeRange(event.time, date).start.getTime() === earliestMs,
  )
}
