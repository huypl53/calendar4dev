export function StatusBar() {
  return (
    <footer
      data-testid="status-bar"
      className="col-span-full flex h-7 items-center justify-between border-t border-[var(--color-text-primary)]/10 bg-[var(--color-bg-primary)] px-4 font-mono text-[10px] text-[var(--color-text-primary)]/50"
    >
      <span>10:00 AM</span>
      <span>Synced</span>
    </footer>
  )
}
