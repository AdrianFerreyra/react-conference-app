import { describe, it, expect } from 'vitest'
import type { Day } from '../Day'

describe('Day', () => {
  it('uses date as identity', () => {
    const day: Day = { date: '2015-01-28', events: [] }
    expect(day.date).toBe('2015-01-28')
  })

  it('can hold multiple events', () => {
    const day: Day = {
      date: '2015-01-28',
      events: [
        {
          title: 'Keynote',
          time: '10:00-10:30am',
          speakers: [{ name: 'Tom Occhino' }],
          description: 'Opening remarks',
        },
        {
          title: 'React Native',
          time: '10:30-11:00am',
          speakers: [{ name: 'Christopher Chedeau' }],
          description: 'React framework extending beyond web browsers',
        },
      ],
    }
    expect(day.events).toHaveLength(2)
  })

  it('allows a speaker to appear on multiple events', () => {
    const speaker = { name: 'Christopher Chedeau' }
    const day: Day = {
      date: '2015-01-29',
      events: [
        { title: 'Keynote', time: '10:00am', speakers: [speaker], description: '' },
        { title: 'React Native', time: '10:30am', speakers: [speaker], description: '' },
      ],
    }
    const allSpeakers = day.events.flatMap((e) => e.speakers)
    expect(allSpeakers.filter((s) => s.name === 'Christopher Chedeau')).toHaveLength(2)
  })
})
