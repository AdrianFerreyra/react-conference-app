import type { Event } from '../../domain/Event'
import { parseEventTimeRange } from '../../domain/EventTime'
import type { Clock } from '../ports/Clock'
import type { ScheduleRepository } from '../ports/ScheduleRepository'

export async function getUpcomingEvents(
  repository: ScheduleRepository,
  clock: Clock,
  limit = 3,
): Promise<Event[]> {
  const now = clock.now()
  const days = await repository.getDays()

  const upcoming: Event[] = []

  for (const day of days) {
    for (const event of day.events) {
      const { start } = parseEventTimeRange(event.time, day.date)
      if (start > now) {
        upcoming.push(event)
      }
    }
  }

  return upcoming.slice(0, limit)
}
