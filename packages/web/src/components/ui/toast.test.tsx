import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { ToastContainer } from './toast.js'
import { useToastStore } from '../../stores/toast-store.js'

beforeEach(() => {
  useToastStore.setState({ toasts: [], _nextId: 0 })
})

afterEach(() => cleanup())

describe('ToastContainer', () => {
  it('renders nothing when no toasts', () => {
    render(<ToastContainer />)
    expect(screen.queryByTestId('toast-container')).not.toBeInTheDocument()
  })

  it('renders toasts with correct variant', () => {
    useToastStore.getState().addToast('Success!', 'success')
    render(<ToastContainer />)
    expect(screen.getByText('Success!')).toBeInTheDocument()
    const toast = screen.getByText('Success!').closest('[role="status"]')
    expect(toast?.className).toContain('border-l-[var(--color-success)]')
  })

  it('renders error variant', () => {
    useToastStore.getState().addToast('Error!', 'error')
    render(<ToastContainer />)
    const toast = screen.getByText('Error!').closest('[role="alert"]')
    expect(toast).toBeInTheDocument()
    expect(toast?.className).toContain('border-l-[var(--color-danger)]')
  })

  it('renders multiple toasts stacked', () => {
    useToastStore.getState().addToast('First')
    useToastStore.getState().addToast('Second')
    render(<ToastContainer />)
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('removes toast when close button clicked', () => {
    const id = useToastStore.getState().addToast('Dismiss me')
    render(<ToastContainer />)
    expect(screen.getByText('Dismiss me')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId(`toast-close-${id}`))
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })
})
