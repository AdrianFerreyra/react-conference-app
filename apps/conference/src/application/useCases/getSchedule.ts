import type { Day } from '../../domain/Day'
import type { ScheduleRepository } from '../ports/ScheduleRepository'

export async function getSchedule(repository: ScheduleRepository): Promise<Day[]> {
  return repository.getDays()
}
