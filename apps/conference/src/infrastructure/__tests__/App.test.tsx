import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from '../App'
import type { Clock } from '../../application/ports/Clock'
import { InMemoryScheduleRepository } from '../adapters/InMemoryScheduleRepository'

function makeClock(date: Date): Clock {
  return { now: () => date }
}

const repository = new InMemoryScheduleRepository()

// 2015-01-28 10:15am — during Keynote (10:00-10:30am)
const duringKeynote = makeClock(new Date(2015, 0, 28, 10, 15, 0))
// 2015-01-28 11:15am — gap between sessions (11:00-11:30)
const betweenSessions = makeClock(new Date(2015, 0, 28, 11, 15, 0))

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

  it('shows a "no ongoing event" message when between sessions', async () => {
    render(<App clock={betweenSessions} repository={repository} />)
    await waitFor(() => {
      expect(screen.getByText(/No ongoing event right now/i)).toBeInTheDocument()
    })
  })
})
