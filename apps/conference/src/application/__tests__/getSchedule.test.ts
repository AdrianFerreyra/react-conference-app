import { describe, it, expect } from 'vitest'
import { getSchedule } from '../useCases/getSchedule'
import type { ScheduleRepository } from '../ports/ScheduleRepository'
import type { Day } from '../../domain/Day'

function makeRepository(days: Day[]): ScheduleRepository {
  return {
    getDays: async () => days,
    getDay: async (date) => days.find((d) => d.date === date) ?? null,
  }
}

describe('getSchedule', () => {
  it('returns all days from the repository', async () => {
    const days: Day[] = [
      { date: '2015-01-28', events: [] },
      { date: '2015-01-29', events: [] },
    ]
    const result = await getSchedule(makeRepository(days))
    expect(result).toHaveLength(2)
    expect(result.map((d) => d.date)).toEqual(['2015-01-28', '2015-01-29'])
  })

  it('returns an empty array when no days exist', async () => {
    const result = await getSchedule(makeRepository([]))
    expect(result).toEqual([])
  })
})
