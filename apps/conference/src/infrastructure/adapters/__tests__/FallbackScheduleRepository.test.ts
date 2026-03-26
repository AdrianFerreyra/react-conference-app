import { describe, it, expect } from 'vitest'
import { FallbackScheduleRepository } from '../FallbackScheduleRepository'
import type { ScheduleRepository } from '../../../application/ports/ScheduleRepository'
import type { Day } from '../../../domain/Day'

function makeRepo(days: Day[]): ScheduleRepository {
  return {
    getDays: async () => days,
    getDay: async (date) => days.find((d) => d.date === date) ?? null,
  }
}

function makeFailingRepo(message = 'network error'): ScheduleRepository {
  return {
    getDays: async () => { throw new Error(message) },
    getDay: async () => { throw new Error(message) },
  }
}

const primaryDays: Day[] = [{ date: '2015-01-28', events: [{ title: 'From primary', time: '10:00-10:30am', speakers: [], description: '' }] }]
const fallbackDays: Day[] = [{ date: '2015-01-28', events: [{ title: 'From fallback', time: '10:00-10:30am', speakers: [], description: '' }] }]

describe('FallbackScheduleRepository', () => {
  describe('getDays', () => {
    it('returns primary data when primary succeeds', async () => {
      const repo = new FallbackScheduleRepository(makeRepo(primaryDays), makeRepo(fallbackDays))
      const days = await repo.getDays()
      expect(days[0].events[0].title).toBe('From primary')
    })

    it('returns fallback data when primary throws', async () => {
      const repo = new FallbackScheduleRepository(makeFailingRepo(), makeRepo(fallbackDays))
      const days = await repo.getDays()
      expect(days[0].events[0].title).toBe('From fallback')
    })
  })

  describe('getDay', () => {
    it('returns primary day when primary succeeds', async () => {
      const repo = new FallbackScheduleRepository(makeRepo(primaryDays), makeRepo(fallbackDays))
      const day = await repo.getDay('2015-01-28')
      expect(day?.events[0].title).toBe('From primary')
    })

    it('returns fallback day when primary throws', async () => {
      const repo = new FallbackScheduleRepository(makeFailingRepo(), makeRepo(fallbackDays))
      const day = await repo.getDay('2015-01-28')
      expect(day?.events[0].title).toBe('From fallback')
    })

    it('returns null when fallback has no matching day', async () => {
      const repo = new FallbackScheduleRepository(makeFailingRepo(), makeRepo(fallbackDays))
      expect(await repo.getDay('1999-01-01')).toBeNull()
    })
  })
})
