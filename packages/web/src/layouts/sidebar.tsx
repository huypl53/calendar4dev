export function Sidebar() {
  return (
    <aside
      data-testid="sidebar"
      className="overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4"
    >
      <div className="font-sans text-xs text-[var(--color-text-secondary)]">
        Mini Calendar
      </div>
      <div className="mt-4 font-sans text-xs text-[var(--color-text-secondary)]">
        Calendar List
      </div>
    </aside>
  )
}
