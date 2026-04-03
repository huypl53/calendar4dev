import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastState {
  toasts: ToastItem[]
  _nextId: number
  addToast: (message: string, variant?: ToastVariant) => string
  removeToast: (id: string) => void
}

// Module-level timer registry so timers can be cancelled when toasts are dismissed early
const toastTimers = new Map<string, ReturnType<typeof setTimeout>>()

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  _nextId: 0,
  addToast: (message, variant = 'info') => {
    const nextId = get()._nextId + 1
    const id = `toast-${nextId}`
    set((state) => ({ toasts: [...state.toasts, { id, message, variant }], _nextId: nextId }))
    return id
  },
  removeToast: (id) => {
    const timer = toastTimers.get(id)
    if (timer !== undefined) { clearTimeout(timer); toastTimers.delete(id) }
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },
}))

export function useToast() {
  const addToast = useToastStore((s) => s.addToast)
  const removeToast = useToastStore((s) => s.removeToast)

  return {
    toast: (message: string, variant?: ToastVariant, duration = 5000) => {
      const id = addToast(message, variant)
      const timerId = setTimeout(() => removeToast(id), duration)
      toastTimers.set(id, timerId)
      return id
    },
  }
}
