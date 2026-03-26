import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react'
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
    await waitFor(() => screen.getByText(/2 days/i))
    expect(screen.getByRole('heading', { name: /React\.js Conf 2015/i })).toBeInTheDocument()
  })

  it('loads and displays the number of schedule days', async () => {
    render(<App clock={duringKeynote} repository={repository} />)
    await waitFor(() => {
      expect(screen.getByText(/2 days/i)).toBeInTheDocument()
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

  it('shows upcoming events based on selected time via time travel', async () => {
    render(<App clock={duringKeynote} repository={repository} />)
    await waitFor(() => {
      expect(screen.getByText(/2 days/i)).toBeInTheDocument()
    })

    // Time travel to 5:45pm on Jan 28 — during last session; day 2 events should be upcoming
    const input = screen.getByTestId('time-travel-input')
    fireEvent.change(input, { target: { value: '2015-01-28T17:45' } })

    await waitFor(() => {
      expect(screen.getByRole('region', { name: 'Upcoming events' })).toBeInTheDocument()
    })
    expect(screen.getByText(/React Native/)).toBeInTheDocument()
  })

  it('shows the description of the current event', async () => {
    render(<App clock={duringKeynote} repository={repository} />)
    const currentSection = await screen.findByRole('region', { name: 'Current event' })
    expect(within(currentSection).getByText('Opening remarks')).toBeInTheDocument()
  })

  it('shows the description of a selected upcoming event', async () => {
    render(<App clock={duringKeynote} repository={repository} />)
    const upcomingSection = await screen.findByRole('region', { name: 'Upcoming events' })
    const firstCard = within(upcomingSection).getAllByRole('article')[0]
    fireEvent.click(firstCard)
    expect(within(firstCard).getByText(/Bringing instant-feedback/)).toBeInTheDocument()
  })

  it('does not show the description of unselected upcoming events', async () => {
    render(<App clock={duringKeynote} repository={repository} />)
    const upcomingSection = await screen.findByRole('region', { name: 'Upcoming events' })
    const cards = within(upcomingSection).getAllByRole('article')
    fireEvent.click(cards[0])
    for (const card of cards.slice(1)) {
      expect(within(card).queryByRole('paragraph')).not.toBeInTheDocument()
    }
  })

  it('time travel reset button restores clock time', async () => {
    render(<App clock={duringKeynote} repository={repository} />)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Keynote' })).toBeInTheDocument()
    })

    // Time travel to after the conference
    const input = screen.getByTestId('time-travel-input')
    fireEvent.change(input, { target: { value: '2015-01-30T10:00' } })

    await waitFor(() => {
      expect(screen.getByText(/No ongoing event right now/i)).toBeInTheDocument()
    })

    // Click reset
    fireEvent.click(screen.getByTestId('time-travel-reset'))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Keynote' })).toBeInTheDocument()
    })
  })
})
