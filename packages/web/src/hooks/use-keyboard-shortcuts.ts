import { useEffect } from 'react'

interface ShortcutMap {
  [key: string]: () => void
}

/**
 * Registers global keyboard shortcuts. Ignores events when focus is inside
 * an input, textarea, select, or dialog (contentEditable).
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Skip when typing in form elements
      const target = e.target as HTMLElement
      const tag = target.tagName
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target.isContentEditable
      ) {
        return
      }

      // Skip when a dialog is open (we don't want shortcuts firing behind modals)
      if (document.querySelector('dialog[open]')) return

      // Skip modified keys (except for Cmd/Ctrl+K which opens palette)
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        shortcuts['cmd+k']?.()
        return
      }

      // For single-key shortcuts, skip if any modifier is held
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const action = shortcuts[e.key]
      if (action) {
        e.preventDefault()
        action()
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [shortcuts])
}
