import { describe, it, expect } from 'vitest'
import { getCurrentEvent } from '../useCases/getCurrentEvent'
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
    ],
  },
]

describe('getCurrentEvent', () => {
  it('returns the event in progress', async () => {
    const clock = makeClock(new Date(2015, 0, 28, 10, 15, 0)) // 10:15am
    expect((await getCurrentEvent(makeRepository(days), clock))?.title).toBe('Keynote')
  })

  it('returns the next event when previous one ends (start boundary inclusive)', async () => {
    const clock = makeClock(new Date(2015, 0, 28, 10, 30, 0)) // exactly end of Keynote / start of next
    expect((await getCurrentEvent(makeRepository(days), clock))?.title).toBe(
      'Tweak your page in real time',
    )
  })

  it('returns null before any session begins', async () => {
    const clock = makeClock(new Date(2015, 0, 28, 9, 0, 0))
    expect(await getCurrentEvent(makeRepository(days), clock)).toBeNull()
  })

  it('returns null between sessions', async () => {
    const clock = makeClock(new Date(2015, 0, 28, 11, 15, 0)) // gap: 11:00-11:30
    expect(await getCurrentEvent(makeRepository(days), clock)).toBeNull()
  })

  it('returns null after all sessions end', async () => {
    const clock = makeClock(new Date(2015, 0, 28, 18, 0, 0))
    expect(await getCurrentEvent(makeRepository(days), clock)).toBeNull()
  })

  it('returns null when no schedule exists for the current date', async () => {
    const clock = makeClock(new Date(2015, 0, 30, 10, 15, 0)) // not a conference day
    expect(await getCurrentEvent(makeRepository(days), clock)).toBeNull()
  })
})
