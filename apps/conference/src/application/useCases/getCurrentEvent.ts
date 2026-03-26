import type { Event } from '../../domain/Event'
import { isEventOngoing } from '../../domain/EventTime'
import type { Clock } from '../ports/Clock'
import type { ScheduleRepository } from '../ports/ScheduleRepository'

export async function getCurrentEvent(
  repository: ScheduleRepository,
  clock: Clock,
): Promise<Event | null> {
  const now = clock.now()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const scheduleDay = await repository.getDay(date)
  if (!scheduleDay) return null

  return scheduleDay.events.find((event) => isEventOngoing(event, date, now)) ?? null
}
