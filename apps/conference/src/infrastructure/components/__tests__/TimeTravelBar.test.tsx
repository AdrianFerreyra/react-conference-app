import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TimeTravelBar from '../TimeTravelBar'

const baseTime = new Date(2015, 0, 28, 10, 15, 0) // 2015-01-28T10:15

describe('TimeTravelBar', () => {
  it('renders a datetime-local input with a value matching the currentTime prop', () => {
    render(<TimeTravelBar currentTime={baseTime} onTimeChange={vi.fn()} onReset={vi.fn()} />)
    const input = screen.getByTestId('time-travel-input')
    expect(input).toHaveAttribute('type', 'datetime-local')
    expect(input).toHaveValue('2015-01-28T10:15')
  })

  it('calls onTimeChange with a Date when the input changes to a valid datetime string', () => {
    const onTimeChange = vi.fn()
    render(<TimeTravelBar currentTime={baseTime} onTimeChange={onTimeChange} onReset={vi.fn()} />)
    const input = screen.getByTestId('time-travel-input')
    fireEvent.change(input, { target: { value: '2015-01-28T17:45' } })
    expect(onTimeChange).toHaveBeenCalledOnce()
    expect(onTimeChange).toHaveBeenCalledWith(new Date('2015-01-28T17:45'))
  })

  it('does not call onTimeChange when the input value is cleared', () => {
    const onTimeChange = vi.fn()
    render(<TimeTravelBar currentTime={baseTime} onTimeChange={onTimeChange} onReset={vi.fn()} />)
    const input = screen.getByTestId('time-travel-input')
    fireEvent.change(input, { target: { value: '' } })
    expect(onTimeChange).not.toHaveBeenCalled()
  })

  it('does not call onTimeChange when the input value is an invalid date string', () => {
    const onTimeChange = vi.fn()
    render(<TimeTravelBar currentTime={baseTime} onTimeChange={onTimeChange} onReset={vi.fn()} />)
    const input = screen.getByTestId('time-travel-input')
    fireEvent.change(input, { target: { value: 'not-a-date' } })
    expect(onTimeChange).not.toHaveBeenCalled()
  })

  it('renders a reset button with the correct testid and aria-label', () => {
    render(<TimeTravelBar currentTime={baseTime} onTimeChange={vi.fn()} onReset={vi.fn()} />)
    const button = screen.getByTestId('time-travel-reset')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label', 'Reset to now')
  })

  it('calls onReset when the reset button is clicked', () => {
    const onReset = vi.fn()
    render(<TimeTravelBar currentTime={baseTime} onTimeChange={vi.fn()} onReset={onReset} />)
    fireEvent.click(screen.getByTestId('time-travel-reset'))
    expect(onReset).toHaveBeenCalledOnce()
  })
})
