import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from '../App'
import type { Clock } from '../../application/ports/Clock'
import { InMemoryScheduleRepository } from '../adapters/InMemoryScheduleRepository'

function makeClock(date: Date): Clock {
  return { now: () => date }
}

const repository = new InMemoryScheduleRepository()

// 2015-01-28 10:15am — during Keynote (10:00-10:30am); upcoming: "Tweak your page..."
const duringKeynote = makeClock(new Date(2015, 0, 28, 10, 15, 0))
// 2015-01-28 11:15am — gap between sessions (11:00-11:30am); upcoming: "Unlocking..." at 11:30am
const betweenSessions = makeClock(new Date(2015, 0, 28, 11, 15, 0))
// 2015-01-28 09:00am — before any session; upcoming: Keynote at 10:00am
const beforeSessions = makeClock(new Date(2015, 0, 28, 9, 0, 0))
// 2015-01-28 10:45am — during "Tweak your page..." (10:30-11:00am); upcoming: "Unlocking..." at 11:30am
const duringTweak = makeClock(new Date(2015, 0, 28, 10, 45, 0))

describe('App', () => {
  it('renders the conference title', async () => {
    render(<App clock={duringKeynote} repository={repository} />)
    await waitFor(() => screen.getByText(/day\(s\) loaded/i))
    expect(screen.getByRole('heading', { name: /React\.js Conf 2015/i })).toBeInTheDocument()
  })

  it('loads and displays the number of schedule days', async () => {
    render(<App clock={duringKeynote} repository={repository} />)
    await waitFor(() => {
      expect(screen.getByText(/2 day\(s\) loaded/i)).toBeInTheDocument()
    })
  })

  it('shows full details of the ongoing event', async () => {
    render(<App clock={duringKeynote} repository={repository} />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Keynote' })).toBeInTheDocument()
    })
    expect(screen.getByText('10:00-10:30am')).toBeInTheDocument()
    expect(screen.getByText('Opening remarks')).toBeInTheDocument()
    expect(screen.getByText(/Tom Occhino/)).toBeInTheDocument()
  })

  it('shows a "no ongoing event" message when after all sessions end', async () => {
    const afterAllSessions = makeClock(new Date(2015, 0, 28, 20, 0, 0))
    render(<App clock={afterAllSessions} repository={repository} />)
    await waitFor(() => {
      expect(screen.getByText(/No ongoing event right now/i)).toBeInTheDocument()
    })
  })

  // BDD Scenario 1: Ongoing + one upcoming
  it('shows both ongoing and upcoming sections when there is an ongoing event and one upcoming', async () => {
    render(<App clock={duringKeynote} repository={repository} />)
    await waitFor(() => {
      expect(screen.getByRole('region', { name: 'Current event' })).toBeInTheDocument()
    })
    expect(screen.getByRole('region', { name: 'Upcoming events' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Keynote' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: 'Tweak your page in real time, without leaving the comfort of your editor',
      }),
    ).toBeInTheDocument()
  })

  // BDD Scenario 2: Ongoing + upcoming (after a gap)
  it('shows ongoing and upcoming sections during second talk with upcoming after gap', async () => {
    render(<App clock={duringTweak} repository={repository} />)
    await waitFor(() => {
      expect(screen.getByRole('region', { name: 'Current event' })).toBeInTheDocument()
    })
    expect(screen.getByRole('region', { name: 'Upcoming events' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: 'Tweak your page in real time, without leaving the comfort of your editor',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: 'Unlocking the structure of your React applications with the AST',
      }),
    ).toBeInTheDocument()
  })

  // BDD Scenario 3: No ongoing + one upcoming
  it('shows upcoming section but no ongoing section before sessions begin', async () => {
    render(<App clock={beforeSessions} repository={repository} />)
    await waitFor(() => {
      expect(screen.getByRole('region', { name: 'Upcoming events' })).toBeInTheDocument()
    })
    expect(screen.queryByRole('region', { name: 'Current event' })).not.toBeInTheDocument()
    expect(screen.queryByText(/No ongoing event right now/i)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Keynote' })).toBeInTheDocument()
  })

  // BDD Scenario 4: No ongoing + upcoming (between sessions)
  it('shows upcoming section but no ongoing section when between sessions', async () => {
    render(<App clock={betweenSessions} repository={repository} />)
    await waitFor(() => {
      expect(screen.getByRole('region', { name: 'Upcoming events' })).toBeInTheDocument()
    })
    expect(screen.queryByRole('region', { name: 'Current event' })).not.toBeInTheDocument()
    expect(screen.queryByText(/No ongoing event right now/i)).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: 'Unlocking the structure of your React applications with the AST',
      }),
    ).toBeInTheDocument()
  })
})
