import { describe, it, expect } from 'vitest'
import { parseEventTimeRange, isEventOngoing } from '../EventTime'

describe('parseEventTimeRange', () => {
  it('parses a morning AM range', () => {
    const { start, end } = parseEventTimeRange('10:00-10:30am', '2015-01-28')
    expect(start).toEqual(new Date(2015, 0, 28, 10, 0, 0))
    expect(end).toEqual(new Date(2015, 0, 28, 10, 30, 0))
  })

  it('parses a PM range', () => {
    const { start, end } = parseEventTimeRange('2:00-2:30pm', '2015-01-28')
    expect(start).toEqual(new Date(2015, 0, 28, 14, 0, 0))
    expect(end).toEqual(new Date(2015, 0, 28, 14, 30, 0))
  })

  it('handles a range that crosses noon (11:30-12:00pm)', () => {
    const { start, end } = parseEventTimeRange('11:30-12:00pm', '2015-01-28')
    expect(start).toEqual(new Date(2015, 0, 28, 11, 30, 0))
    expect(end).toEqual(new Date(2015, 0, 28, 12, 0, 0))
  })

  it('parses an evening PM range with different start/end hours', () => {
    const { start, end } = parseEventTimeRange('5:30-6:00pm', '2015-01-28')
    expect(start).toEqual(new Date(2015, 0, 28, 17, 30, 0))
    expect(end).toEqual(new Date(2015, 0, 28, 18, 0, 0))
  })

  it('throws on an unrecognised format', () => {
    expect(() => parseEventTimeRange('bad', '2015-01-28')).toThrow()
  })
})

describe('isEventOngoing', () => {
  const event = { title: 'Keynote', time: '10:00-10:30am', speakers: [], description: '' }

  it('returns true when now is within the window', () => {
    expect(isEventOngoing(event, '2015-01-28', new Date(2015, 0, 28, 10, 15, 0))).toBe(true)
  })

  it('returns true at the start boundary (inclusive)', () => {
    expect(isEventOngoing(event, '2015-01-28', new Date(2015, 0, 28, 10, 0, 0))).toBe(true)
  })

  it('returns false at the end boundary (exclusive)', () => {
    expect(isEventOngoing(event, '2015-01-28', new Date(2015, 0, 28, 10, 30, 0))).toBe(false)
  })

  it('returns false before the event starts', () => {
    expect(isEventOngoing(event, '2015-01-28', new Date(2015, 0, 28, 9, 59, 0))).toBe(false)
  })
})
