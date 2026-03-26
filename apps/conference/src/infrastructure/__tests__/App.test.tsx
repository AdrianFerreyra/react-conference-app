import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders the conference title', async () => {
    render(<App />)
    // Wait for the async schedule load to settle before asserting
    await waitFor(() => screen.getByText(/day\(s\) loaded/i))
    expect(screen.getByRole('heading', { name: /React\.js Conf 2015/i })).toBeInTheDocument()
  })

  it('loads and displays schedule days', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText(/2 day\(s\) loaded/i)).toBeInTheDocument()
    })
  })
})
