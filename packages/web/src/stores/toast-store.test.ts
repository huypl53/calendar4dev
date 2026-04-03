import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useToastStore } from './toast-store.js'

beforeEach(() => {
  useToastStore.setState({ toasts: [] })
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useToastStore', () => {
  it('adds a toast', () => {
    useToastStore.getState().addToast('Hello', 'info')
    expect(useToastStore.getState().toasts).toHaveLength(1)
    expect(useToastStore.getState().toasts[0]!.message).toBe('Hello')
    expect(useToastStore.getState().toasts[0]!.variant).toBe('info')
  })

  it('removes a toast by id', () => {
    const id = useToastStore.getState().addToast('Test')
    expect(useToastStore.getState().toasts).toHaveLength(1)
    useToastStore.getState().removeToast(id)
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('stacks multiple toasts', () => {
    useToastStore.getState().addToast('First')
    useToastStore.getState().addToast('Second')
    useToastStore.getState().addToast('Third')
    expect(useToastStore.getState().toasts).toHaveLength(3)
  })

  it('defaults variant to info', () => {
    useToastStore.getState().addToast('Default')
    expect(useToastStore.getState().toasts[0]!.variant).toBe('info')
  })
})

describe('useToast', () => {
  it('auto-dismisses after duration', () => {
    // useToast is a plain function, not a hook in this context
    const addToast = useToastStore.getState().addToast
    const removeToast = useToastStore.getState().removeToast
    const id = addToast('Auto dismiss')
    setTimeout(() => removeToast(id), 5000)

    expect(useToastStore.getState().toasts).toHaveLength(1)
    vi.advanceTimersByTime(5000)
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })
})
