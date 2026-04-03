import { useUIStore } from '../stores/ui-store.js'

export function Header() {
  return (
    <header
      data-testid="header"
      className="col-span-full flex h-12 items-center gap-4 border-b border-[var(--color-text-primary)]/10 bg-[var(--color-bg-primary)] px-4"
    >
      <button
        type="button"
        aria-label="Toggle sidebar"
        onClick={() => useUIStore.getState().toggleSidebar()}
        className="flex h-8 w-8 items-center justify-center rounded hover:bg-white/10"
      >
        <span className="text-[var(--color-text-primary)]">&#9776;</span>
      </button>

      <span className="font-sans text-sm font-semibold text-[var(--color-text-primary)]">
        Dev Calendar
      </span>

      <nav className="ml-auto flex gap-2 font-mono text-xs text-[var(--color-text-primary)]/70">
        <span>D</span>
        <span>W</span>
        <span>M</span>
        <span>A</span>
      </nav>
    </header>
  )
}
