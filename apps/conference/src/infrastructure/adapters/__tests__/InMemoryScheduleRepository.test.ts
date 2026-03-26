import { describe, it, expect } from 'vitest'
import { InMemoryScheduleRepository } from '../InMemoryScheduleRepository'

describe('InMemoryScheduleRepository', () => {
  describe('getDays', () => {
    it('returns all days from the bundled schedule', async () => {
      const repo = new InMemoryScheduleRepository()
      const days = await repo.getDays()
      expect(days).toHaveLength(2)
      expect(days.map((d) => d.date)).toEqual(['2015-01-28', '2015-01-29'])
    })

    it('correctly maps event title, time, and description', async () => {
      const repo = new InMemoryScheduleRepository()
      const days = await repo.getDays()
      const firstEvent = days[0].events[0]
      expect(firstEvent.title).toBe('Keynote')
      expect(firstEvent.time).toBe('10:00-10:30am')
      expect(firstEvent.description).toBe('Opening remarks')
    })

    it('correctly maps speakers from string array to { name } objects', async () => {
      const repo = new InMemoryScheduleRepository()
      const days = await repo.getDays()
      const keynote = days[0].events[0]
      expect(keynote.speakers).toEqual([
        { name: 'Tom Occhino' },
        { name: 'Christopher Chedeau' },
      ])
    })

    it('correctly maps a single-speaker event', async () => {
      const repo = new InMemoryScheduleRepository()
      const days = await repo.getDays()
      const secondEvent = days[0].events[1]
      expect(secondEvent.speakers).toEqual([{ name: 'Brenton Simpson' }])
    })
  })

  describe('getDay', () => {
    it('returns the correct day for a known date', async () => {
      const repo = new InMemoryScheduleRepository()
      const day = await repo.getDay('2015-01-29')
      expect(day).not.toBeNull()
      expect(day?.date).toBe('2015-01-29')
      expect(day?.events[0].title).toBe('React Native')
    })

    it('returns null for an unknown date', async () => {
      const repo = new InMemoryScheduleRepository()
      const day = await repo.getDay('1999-01-01')
      expect(day).toBeNull()
    })
  })
})
