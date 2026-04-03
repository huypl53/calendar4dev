import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react'

export interface DropdownMenuItem {
  label: string
  onClick: () => void
  icon?: ReactNode
}

export interface DropdownMenuProps {
  trigger: ReactNode
  items: DropdownMenuItem[]
  align?: 'left' | 'right'
}

export function DropdownMenu({ trigger, items, align = 'left' }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    setFocusedIndex(-1)
  }, [])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close()
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, close])

  useEffect(() => {
    if (open && focusedIndex >= 0 && menuRef.current) {
      const items = menuRef.current.querySelectorAll<HTMLButtonElement>('[data-menu-item]')
      items[focusedIndex]?.focus()
    }
  }, [focusedIndex, open])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex((i) => (i + 1) % items.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex((i) => (i - 1 + items.length) % items.length)
    }
  }

  return (
    <div ref={containerRef} className="relative inline-block" onKeyDown={handleKeyDown}>
      <span
        data-testid="dropdown-trigger"
        onClick={() => { setOpen(!open); setFocusedIndex(-1) }}
      >
        {trigger}
      </span>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          data-testid="dropdown-menu"
          className={`absolute z-50 mt-1 min-w-[160px] rounded border border-[var(--color-border)] bg-[var(--color-bg-secondary)] py-1 shadow-lg ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item, index) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              data-menu-item
              data-testid={`dropdown-item-${index}`}
              tabIndex={focusedIndex === index ? 0 : -1}
              onClick={() => { item.onClick(); close() }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[length:var(--font-size-small)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)] focus:bg-[var(--color-bg-tertiary)] focus:outline-none"
            >
              {item.icon && <span className="h-4 w-4">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
