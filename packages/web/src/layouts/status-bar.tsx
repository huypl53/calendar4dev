export function StatusBar() {
  return (
    <footer
      data-testid="status-bar"
      className="col-span-full flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 font-mono text-[var(--color-text-tertiary)]"
      style={{ height: 'var(--density-status-bar-height)', fontSize: 'var(--font-size-tiny)' }}
    >
      <span>10:00 AM</span>
      <span>Synced</span>
    </footer>
  )
}
