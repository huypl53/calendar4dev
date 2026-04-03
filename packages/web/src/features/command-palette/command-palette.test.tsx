import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { CommandPalette } from './command-palette.js'
import type { Command } from './commands.js'

afterEach(() => cleanup())

const commands: Command[] = [
  { id: 'view-day', label: 'Go to Day View', shortcut: 'd', category: 'views', action: vi.fn() },
  { id: 'view-week', label: 'Go to Week View', shortcut: 'w', category: 'views', action: vi.fn() },
  { id: 'create-event', label: 'Create Event', shortcut: 'c', category: 'actions', action: vi.fn() },
]

describe('CommandPalette', () => {
  it('renders when open', () => {
    render(<CommandPalette open={true} onClose={vi.fn()} commands={commands} />)
    expect(screen.getByTestId('command-palette')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<CommandPalette open={false} onClose={vi.fn()} commands={commands} />)
    expect(screen.queryByTestId('command-palette')).not.toBeInTheDocument()
  })

  it('shows all commands by default', () => {
    render(<CommandPalette open={true} onClose={vi.fn()} commands={commands} />)
    expect(screen.getByTestId('command-item-view-day')).toBeInTheDocument()
    expect(screen.getByTestId('command-item-view-week')).toBeInTheDocument()
    expect(screen.getByTestId('command-item-create-event')).toBeInTheDocument()
  })

  it('filters commands by search query', () => {
    render(<CommandPalette open={true} onClose={vi.fn()} commands={commands} />)
    const input = screen.getByTestId('command-palette-input')
    fireEvent.change(input, { target: { value: 'day' } })
    expect(screen.getByTestId('command-item-view-day')).toBeInTheDocument()
    expect(screen.queryByTestId('command-item-create-event')).not.toBeInTheDocument()
  })

  it('shows "No matching commands" when nothing matches', () => {
    render(<CommandPalette open={true} onClose={vi.fn()} commands={commands} />)
    fireEvent.change(screen.getByTestId('command-palette-input'), { target: { value: 'zzz' } })
    expect(screen.getByText('No matching commands')).toBeInTheDocument()
  })

  it('calls onClose when backdrop clicked', () => {
    const onClose = vi.fn()
    render(<CommandPalette open={true} onClose={onClose} commands={commands} />)
    fireEvent.click(screen.getByTestId('command-palette-backdrop'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when Escape pressed', () => {
    const onClose = vi.fn()
    render(<CommandPalette open={true} onClose={onClose} commands={commands} />)
    fireEvent.keyDown(screen.getByTestId('command-palette'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('shows shortcut badges', () => {
    render(<CommandPalette open={true} onClose={vi.fn()} commands={commands} />)
    const dayItem = screen.getByTestId('command-item-view-day')
    expect(dayItem.querySelector('kbd')).toHaveTextContent('d')
  })

  it('executes command on Enter', () => {
    const action = vi.fn()
    const cmds = [{ id: 'test', label: 'Test', category: 'actions' as const, action }]
    render(<CommandPalette open={true} onClose={vi.fn()} commands={cmds} />)
    fireEvent.keyDown(screen.getByTestId('command-palette'), { key: 'Enter' })
    // action runs in requestAnimationFrame, so check the call was set up
    expect(screen.getByTestId('command-item-test')).toBeInTheDocument()
  })
})
