import { useEffect, useRef, type ReactNode } from 'react'

export interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      data-testid="dialog"
      onClose={onClose}
      onClick={(e) => {
        // Close on backdrop click (click on dialog element itself, not its content)
        if (e.target === ref.current) onClose()
      }}
      className="m-auto max-w-lg rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-0 text-[var(--color-text-primary)] shadow-xl backdrop:bg-black/50"
    >
      <div className="p-[var(--space-4)]" onClick={(e) => e.stopPropagation()}>
        {title && (
          <h2 className="mb-[var(--space-3)] text-[length:var(--font-size-heading)] font-[number:var(--font-weight-semibold)]">
            {title}
          </h2>
        )}
        {children}
      </div>
    </dialog>
  )
}
