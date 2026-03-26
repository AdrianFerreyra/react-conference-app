import type { ScheduleRepository } from '../../application/ports/ScheduleRepository'
import type { Day } from '../../domain/Day'
import scheduleData from './schedule.json'

export class InMemoryScheduleRepository implements ScheduleRepository {
  async getDays(): Promise<Day[]> {
    return Object.entries(scheduleData.schedule).map(([date, events]) => ({
      date,
      events: events.map((e) => ({
        title: e.title,
        time: e.time,
        speakers: e.speakers.map((name) => ({ name })),
        description: e.description,
      })),
    }))
  }

  async getDay(date: string): Promise<Day | null> {
    const days = await this.getDays()
    return days.find((d) => d.date === date) ?? null
  }
}
