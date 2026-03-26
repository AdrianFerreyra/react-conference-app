import { describe, it, expect } from 'vitest'
import { getUpcomingEvents } from '../useCases/getUpcomingEvents'
import type { Clock } from '../ports/Clock'
import type { ScheduleRepository } from '../ports/ScheduleRepository'
import type { Day } from '../../domain/Day'

function makeClock(date: Date): Clock {
  return { now: () => date }
}

function makeRepository(days: Day[]): ScheduleRepository {
  return {
    getDays: async () => days,
    getDay: async (date) => days.find((d) => d.date === date) ?? null,
  }
}

const days: Day[] = [
  {
    date: '2015-01-28',
    events: [
      {
        title: 'Keynote',
        time: '10:00-10:30am',
        speakers: [{ name: 'Tom Occhino' }],
        description: 'Opening remarks',
      },
      {
        title: 'Talk A',
        time: '10:30-11:00am',
        speakers: [{ name: 'Speaker A' }],
        description: 'Talk A description',
      },
      {
        title: 'Talk B',
        time: '2:00-2:30pm',
        speakers: [{ name: 'Speaker B' }],
        description: 'Talk B description',
      },
      {
        title: 'Talk C',
        time: '2:30-3:00pm',
        speakers: [{ name: 'Speaker C' }],
        description: 'Talk C description',
      },
    ],
  },
  {
    date: '2015-01-29',
    events: [
      {
        title: 'Day 2 Keynote',
        time: '10:00-10:30am',
        speakers: [{ name: 'Speaker D' }],
        description: 'Day 2 opening',
      },
      {
        title: 'Day 2 Talk',
        time: '10:30-11:00am',
        speakers: [{ name: 'Speaker E' }],
        description: 'Day 2 second talk',
      },
    ],
  },
]

describe('getUpcomingEvents', () => {
  it('returns next N events when there are many upcoming', async () => {
    // Before the conference starts — all events are upcoming
    const clock = makeClock(new Date(2015, 0, 28, 9, 0, 0))
    const result = await getUpcomingEvents(makeRepository(days), clock, 3)
    expect(result).toHaveLength(3)
    expect(result[0].title).toBe('Keynote')
    expect(result[1].title).toBe('Talk A')
    expect(result[2].title).toBe('Talk B')
  })

  it('returns empty array when no upcoming events (after conference)', async () => {
    // After the last event on day 2
    const clock = makeClock(new Date(2015, 0, 29, 23, 0, 0))
    const result = await getUpcomingEvents(makeRepository(days), clock)
    expect(result).toEqual([])
  })

  it('returns remaining day 1 events plus all day 2 events when time-traveling to day 1 afternoon', async () => {
    // During Talk B on day 1 (2:00-2:30pm) — Talk B is ongoing, Talk C is next on day 1, then all of day 2
    const clock = makeClock(new Date(2015, 0, 28, 14, 10, 0)) // 2:10pm
    const result = await getUpcomingEvents(makeRepository(days), clock, 10)
    // Talk B starts at 2:00 which is NOT strictly after now (14:10 > 14:00), so Talk B is ongoing
    // Talk C starts at 2:30 — strictly after 2:10, so included
    // Day 2 Keynote starts at 10:00am Jan 29 — included
    // Day 2 Talk starts at 10:30am Jan 29 — included
    expect(result.map((e) => e.title)).toEqual([
      'Talk C',
      'Day 2 Keynote',
      'Day 2 Talk',
    ])
  })

  it('respects the limit parameter', async () => {
    const clock = makeClock(new Date(2015, 0, 28, 9, 0, 0))
    const result = await getUpcomingEvents(makeRepository(days), clock, 2)
    expect(result).toHaveLength(2)
  })

  it('does not include the currently ongoing event (start is not strictly after now)', async () => {
    // Exactly at the start of Keynote — it is ongoing, not upcoming
    const clock = makeClock(new Date(2015, 0, 28, 10, 0, 0))
    const result = await getUpcomingEvents(makeRepository(days), clock, 10)
    expect(result.map((e) => e.title)).not.toContain('Keynote')
    // Talk A starts at 10:30 — strictly after 10:00, so it should be upcoming
    expect(result[0].title).toBe('Talk A')
  })
})
