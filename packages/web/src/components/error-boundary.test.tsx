import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { ErrorBoundary } from './error-boundary.js'

afterEach(() => {
  cleanup()
})

function ThrowingComponent(): never {
  throw new Error('Test error')
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Safe content</div>
      </ErrorBoundary>,
    )

    expect(screen.getByText('Safe content')).toBeInTheDocument()
  })

  it('renders fallback UI when a child throws', () => {
    // Suppress console.error from React and our handler during test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Return to today')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it('renders a "Return to today" link pointing to /week/{today}', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    )

    const link = screen.getByText('Return to today') as HTMLAnchorElement
    const today = new Date().toISOString().slice(0, 10)
    expect(link.getAttribute('href')).toBe(`/week/${today}`)

    consoleSpy.mockRestore()
  })
})
