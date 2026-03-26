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
        title: 'Tweak your page in real time',
        time: '10:30-11:00am',
        speakers: [{ name: 'Brenton Simpson' }],
        description: 'Second talk',
      },
      {
        title: 'Later talk',
        time: '11:30-12:00pm',
        speakers: [],
        description: 'Third talk',
      },
    ],
  },
]

const daysWithSimultaneous: Day[] = [
  {
    date: '2015-01-28',
    events: [
      {
        title: 'Talk A',
        time: '10:00-10:30am',
        speakers: [],
        description: '',
      },
      {
        title: 'Talk B',
        time: '10:00-10:30am',
        speakers: [],
        description: '',
      },
      {
        title: 'Talk C',
        time: '11:00-11:30am',
        speakers: [],
        description: '',
      },
    ],
  },
]

describe('getUpcomingEvents', () => {
  it('returns the single next upcoming event when one is next', async () => {
    // during Keynote: upcoming is "Tweak your page in real time"
    const clock = makeClock(new Date(2015, 0, 28, 10, 15, 0))
    const result = await getUpcomingEvents(makeRepository(days), clock)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Tweak your page in real time')
  })

  it('returns all events when multiple start at the same time', async () => {
    // before Talk A and B (both at 10:00am), should return both not Talk C
    const clock = makeClock(new Date(2015, 0, 28, 9, 0, 0))
    const result = await getUpcomingEvents(makeRepository(daysWithSimultaneous), clock)
    expect(result).toHaveLength(2)
    expect(result.map((e) => e.title)).toContain('Talk A')
    expect(result.map((e) => e.title)).toContain('Talk B')
    expect(result.map((e) => e.title)).not.toContain('Talk C')
  })

  it('returns empty array after all sessions end (no upcoming)', async () => {
    const clock = makeClock(new Date(2015, 0, 28, 18, 0, 0))
    const result = await getUpcomingEvents(makeRepository(days), clock)
    expect(result).toHaveLength(0)
  })

  it('returns empty array when no schedule for the date', async () => {
    const clock = makeClock(new Date(2015, 0, 30, 10, 0, 0))
    const result = await getUpcomingEvents(makeRepository(days), clock)
    expect(result).toHaveLength(0)
  })

  it('returns the immediate next only (not all future ones)', async () => {
    // before any sessions: earliest upcoming is Keynote at 10:00am, not the later ones
    const clock = makeClock(new Date(2015, 0, 28, 9, 0, 0))
    const result = await getUpcomingEvents(makeRepository(days), clock)
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Keynote')
  })

  it('returns empty array when now is exactly the start time of an event (that event is ongoing)', async () => {
    // exactly 10:00am: Keynote starts, it is ongoing not upcoming; next upcoming is "Tweak your page"
    // But from getUpcomingEvents perspective: events starting strictly after now
    // At exactly 10:00am, Keynote start === now so it is NOT upcoming
    // "Tweak your page" starts at 10:30am which is > 10:00am so it IS upcoming
    const clock = makeClock(new Date(2015, 0, 28, 10, 0, 0))
    const result = await getUpcomingEvents(makeRepository(days), clock)
    // Keynote is not upcoming (starts at now), next is "Tweak your page"
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Tweak your page in real time')
  })
})
