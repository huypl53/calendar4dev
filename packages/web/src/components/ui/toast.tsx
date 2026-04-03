import { useToastStore, type ToastVariant } from '../../stores/toast-store.js'

const variantClasses: Record<ToastVariant, string> = {
  success: 'border-l-[var(--color-success)] bg-[var(--color-bg-secondary)]',
  error: 'border-l-[var(--color-danger)] bg-[var(--color-bg-secondary)]',
  info: 'border-l-[var(--color-accent)] bg-[var(--color-bg-secondary)]',
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div
      data-testid="toast-container"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          data-testid={`toast-${toast.id}`}
          role={toast.variant === 'error' ? 'alert' : 'status'}
          className={`flex items-center gap-2 rounded border-l-4 px-4 py-3 shadow-lg text-[length:var(--font-size-small)] text-[var(--color-text-primary)] ${variantClasses[toast.variant]}`}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            data-testid={`toast-close-${toast.id}`}
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss notification"
            className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  )
}
