import { Dialog } from '../../components/ui/dialog.js'
import type { Command } from './commands.js'

interface ShortcutHelpDialogProps {
  open: boolean
  onClose: () => void
  commands: Command[]
}

const CATEGORY_LABELS: Record<string, string> = {
  views: 'Views',
  navigation: 'Navigation',
  actions: 'Actions',
}

const CATEGORY_ORDER = ['views', 'navigation', 'actions']

export function ShortcutHelpDialog({ open, onClose, commands }: ShortcutHelpDialogProps) {
  const shortcutCommands = commands.filter((c) => c.shortcut)
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat] ?? cat,
    items: shortcutCommands.filter((c) => c.category === cat),
  })).filter((g) => g.items.length > 0)

  return (
    <Dialog open={open} onClose={onClose} title="Keyboard Shortcuts">
      <div data-testid="shortcut-help" className="space-y-[var(--space-4)]">
        {/* Global shortcut */}
        <div className="flex items-center justify-between">
          <span className="text-[length:var(--font-size-body)] text-[var(--color-text-primary)]">
            Open Command Palette
          </span>
          <kbd className="rounded border border-[var(--color-border)] px-[var(--space-1)] font-mono text-[length:var(--font-size-small)] text-[var(--color-text-secondary)]">
            Cmd+K
          </kbd>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[length:var(--font-size-body)] text-[var(--color-text-primary)]">
            Show Shortcuts
          </span>
          <kbd className="rounded border border-[var(--color-border)] px-[var(--space-1)] font-mono text-[length:var(--font-size-small)] text-[var(--color-text-secondary)]">
            ?
          </kbd>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[length:var(--font-size-body)] text-[var(--color-text-primary)]">
            Navigate Prev / Next
          </span>
          <div className="flex gap-[var(--space-1)]">
            <kbd className="rounded border border-[var(--color-border)] px-[var(--space-1)] font-mono text-[length:var(--font-size-small)] text-[var(--color-text-secondary)]">
              j
            </kbd>
            <kbd className="rounded border border-[var(--color-border)] px-[var(--space-1)] font-mono text-[length:var(--font-size-small)] text-[var(--color-text-secondary)]">
              k
            </kbd>
          </div>
        </div>

        {grouped.map(({ category, label, items }) => (
          <div key={category}>
            <h3 className="mb-[var(--space-2)] text-[length:var(--font-size-small)] font-[number:var(--font-weight-semibold)] text-[var(--color-text-secondary)] uppercase">
              {label}
            </h3>
            <div className="space-y-[var(--space-2)]">
              {items.map((cmd) => (
                <div key={cmd.id} className="flex items-center justify-between">
                  <span className="text-[length:var(--font-size-body)] text-[var(--color-text-primary)]">
                    {cmd.label}
                  </span>
                  <kbd className="rounded border border-[var(--color-border)] px-[var(--space-1)] font-mono text-[length:var(--font-size-small)] text-[var(--color-text-secondary)]">
                    {cmd.shortcut}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Dialog>
  )
}
