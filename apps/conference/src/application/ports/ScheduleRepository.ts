import type { Day } from '../../domain/Day'

export interface ScheduleRepository {
  getDays(): Promise<Day[]>
  getDay(date: string): Promise<Day | null>
}
