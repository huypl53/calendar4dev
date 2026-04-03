import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, cleanup } from '@testing-library/react'
import { useKeyboardShortcuts } from './use-keyboard-shortcuts.js'

afterEach(() => cleanup())

function fireKey(key: string, opts: Partial<KeyboardEventInit> = {}) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...opts }))
}

describe('useKeyboardShortcuts', () => {
  it('calls handler for registered key', () => {
    const handler = vi.fn()
    renderHook(() => useKeyboardShortcuts({ d: handler }))
    fireKey('d')
    expect(handler).toHaveBeenCalledOnce()
  })

  it('does not call handler for unregistered key', () => {
    const handler = vi.fn()
    renderHook(() => useKeyboardShortcuts({ d: handler }))
    fireKey('x')
    expect(handler).not.toHaveBeenCalled()
  })

  it('ignores shortcuts when target is an input', () => {
    const handler = vi.fn()
    renderHook(() => useKeyboardShortcuts({ d: handler }))

    const input = document.createElement('input')
    document.body.appendChild(input)
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', bubbles: true }))
    expect(handler).not.toHaveBeenCalled()
    document.body.removeChild(input)
  })

  it('ignores shortcuts when a dialog is open', () => {
    const handler = vi.fn()
    renderHook(() => useKeyboardShortcuts({ d: handler }))

    const dialog = document.createElement('dialog')
    document.body.appendChild(dialog)
    dialog.setAttribute('open', '')
    fireKey('d')
    expect(handler).not.toHaveBeenCalled()
    document.body.removeChild(dialog)
  })

  it('handles cmd+k shortcut', () => {
    const handler = vi.fn()
    renderHook(() => useKeyboardShortcuts({ 'cmd+k': handler }))
    fireKey('k', { metaKey: true })
    expect(handler).toHaveBeenCalledOnce()
  })

  it('ignores modified keys for single-key shortcuts', () => {
    const handler = vi.fn()
    renderHook(() => useKeyboardShortcuts({ d: handler }))
    fireKey('d', { ctrlKey: true })
    expect(handler).not.toHaveBeenCalled()
  })
})
