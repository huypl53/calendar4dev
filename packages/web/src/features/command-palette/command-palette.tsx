import { useState, useEffect, useRef, useCallback } from 'react'
import type { Command } from './commands.js'
import { fuzzyMatch } from './commands.js'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  commands: Command[]
}

export function CommandPalette({ open, onClose, commands }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = query
    ? commands.filter((cmd) => fuzzyMatch(query, cmd.label))
    : commands

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      // Focus input after dialog renders
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  // Clamp selectedIndex when filtered list changes
  useEffect(() => {
    setSelectedIndex((prev) => Math.min(prev, Math.max(filtered.length - 1, 0)))
  }, [filtered.length])

  const executeCommand = useCallback(
    (cmd: Command) => {
      onClose()
      // Run action after dialog closes to avoid focus issues
      requestAnimationFrame(() => cmd.action())
    },
    [onClose],
  )

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => (i + 1) % filtered.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const cmd = filtered[selectedIndex]
      if (cmd) executeCommand(cmd)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const item = list.children[selectedIndex] as HTMLElement | undefined
    item?.scrollIntoView?.({ block: 'nearest' })
  }, [selectedIndex])

  if (!open) return null

  return (
    <div
      data-testid="command-palette-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[20vh]"
      onClick={onClose}
    >
      <div
        data-testid="command-palette"
        className="w-full max-w-md overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center border-b border-[var(--color-border)] px-[var(--space-3)]">
          <span className="mr-[var(--space-2)] text-[var(--color-text-tertiary)]">
            &gt;
          </span>
          <input
            ref={inputRef}
            data-testid="command-palette-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command..."
            className="flex-1 bg-transparent py-[var(--space-3)] font-mono text-[length:var(--font-size-body)] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)]"
          />
        </div>

        <div
          ref={listRef}
          data-testid="command-palette-list"
          className="max-h-64 overflow-auto py-[var(--space-1)]"
          role="listbox"
        >
          {filtered.length === 0 && (
            <div className="px-[var(--space-3)] py-[var(--space-2)] text-[length:var(--font-size-small)] text-[var(--color-text-tertiary)]">
              No matching commands
            </div>
          )}
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              type="button"
              role="option"
              aria-selected={i === selectedIndex}
              data-testid={`command-item-${cmd.id}`}
              onClick={() => executeCommand(cmd)}
              className={`flex w-full items-center justify-between px-[var(--space-3)] py-[var(--space-2)] text-left text-[length:var(--font-size-body)] ${
                i === selectedIndex
                  ? 'bg-[var(--color-accent)] text-[var(--color-text-on-accent)]'
                  : 'text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]'
              }`}
            >
              <span>{cmd.label}</span>
              {cmd.shortcut && (
                <kbd
                  className={`rounded border px-1 font-mono text-[length:var(--font-size-tiny)] ${
                    i === selectedIndex
                      ? 'border-white/30 text-[var(--color-text-on-accent)]'
                      : 'border-[var(--color-border)] text-[var(--color-text-secondary)]'
                  }`}
                >
                  {cmd.shortcut}
                </kbd>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
