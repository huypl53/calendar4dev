import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { TimeGutter } from './time-gutter.js'

afterEach(() => cleanup())

describe('TimeGutter', () => {
  it('renders the time gutter container', () => {
    render(<TimeGutter />)
    expect(screen.getByTestId('time-gutter')).toBeInTheDocument()
  })

  it('renders 24 hour slots', () => {
    render(<TimeGutter />)
    for (let h = 0; h < 24; h++) {
      expect(screen.getByTestId(`gutter-hour-${h}`)).toBeInTheDocument()
    }
  })

  it('does not render a label for hour 0 (midnight)', () => {
    render(<TimeGutter />)
    const slot = screen.getByTestId('gutter-hour-0')
    expect(slot.textContent).toBe('')
  })

  it('renders hour labels from 1 AM to 11 PM', () => {
    render(<TimeGutter />)
    expect(screen.getByText('1 AM')).toBeInTheDocument()
    expect(screen.getByText('12 PM')).toBeInTheDocument()
    expect(screen.getByText('11 PM')).toBeInTheDocument()
  })

  it('uses density-row-height token for slot height', () => {
    render(<TimeGutter />)
    const slot = screen.getByTestId('gutter-hour-0')
    expect(slot.style.height).toBe('var(--density-row-height)')
  })
})
