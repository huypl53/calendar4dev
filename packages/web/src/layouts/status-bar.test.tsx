import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { StatusBar } from './status-bar.js'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('StatusBar', () => {
  it('renders current time', () => {
    render(<StatusBar />)
    expect(screen.getByTestId('status-bar-time')).toBeInTheDocument()
    expect(screen.getByTestId('status-bar-time').textContent).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/i)
  })

  it('renders sync status', () => {
    render(<StatusBar />)
    expect(screen.getByTestId('status-bar-sync')).toHaveTextContent('Synced')
  })

  it('uses density token for height', () => {
    render(<StatusBar />)
    const footer = screen.getByTestId('status-bar')
    expect(footer.style.height).toBe('var(--density-status-bar-height)')
  })
})
