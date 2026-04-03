import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastState {
  toasts: ToastItem[]
  addToast: (message: string, variant?: ToastVariant) => string
  removeToast: (id: string) => void
}

let nextId = 0

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  addToast: (message, variant = 'info') => {
    const id = `toast-${++nextId}`
    set((state) => ({ toasts: [...state.toasts, { id, message, variant }] }))
    return id
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

export function useToast() {
  const addToast = useToastStore((s) => s.addToast)
  const removeToast = useToastStore((s) => s.removeToast)

  return {
    toast: (message: string, variant?: ToastVariant, duration = 5000) => {
      const id = addToast(message, variant)
      setTimeout(() => removeToast(id), duration)
      return id
    },
  }
}
