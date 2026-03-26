import type { ScheduleRepository } from '../../application/ports/ScheduleRepository'
import type { Day } from '../../domain/Day'

/**
 * Tries the primary repository and, on any error, transparently delegates to
 * the fallback. This keeps the application layer unaware of availability
 * concerns.
 */
export class FallbackScheduleRepository implements ScheduleRepository {
  constructor(
    private readonly primary: ScheduleRepository,
    private readonly fallback: ScheduleRepository,
  ) {}

  async getDays(): Promise<Day[]> {
    try {
      return await this.primary.getDays()
    } catch {
      return this.fallback.getDays()
    }
  }

  async getDay(date: string): Promise<Day | null> {
    try {
      return await this.primary.getDay(date)
    } catch {
      return this.fallback.getDay(date)
    }
  }
}
