export function Sidebar() {
  return (
    <aside
      data-testid="sidebar"
      className="overflow-hidden border-r border-[var(--color-text-primary)]/10 bg-[var(--color-bg-primary)] p-4"
    >
      <div className="font-sans text-xs text-[var(--color-text-primary)]/70">
        Mini Calendar
      </div>
      <div className="mt-4 font-sans text-xs text-[var(--color-text-primary)]/70">
        Calendar List
      </div>
    </aside>
  )
}
