import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-[var(--color-bg-primary)]">
          <div className="text-center">
            <h1 className="mb-4 font-sans text-xl font-semibold text-[var(--color-text-primary)]">
              Something went wrong
            </h1>
            <a
              href={`/week/${getTodayISO()}`}
              className="font-sans text-sm text-[var(--color-accent)] underline hover:text-[var(--color-accent)]/80"
            >
              Return to today
            </a>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
