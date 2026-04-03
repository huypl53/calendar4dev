import { useState } from 'react'
import { useUIStore } from '../../../stores/ui-store.js'
import { ACCENT_COLOR_PRESETS } from '@dev-calendar/shared'

const HEX_RE = /^#[0-9a-fA-F]{6}$/

export function AppearanceSettings() {
  const theme = useUIStore((s) => s.theme)
  const density = useUIStore((s) => s.density)
  const accentColor = useUIStore((s) => s.accentColor)
  const setTheme = useUIStore((s) => s.setTheme)
  const toggleDensity = useUIStore((s) => s.toggleDensity)
  const setAccentColor = useUIStore((s) => s.setAccentColor)

  const [customHex, setCustomHex] = useState('')
  const [hexError, setHexError] = useState(false)

  function handleCustomHex() {
    const value = customHex.startsWith('#') ? customHex : `#${customHex}`
    if (HEX_RE.test(value)) {
      setAccentColor(value)
      setHexError(false)
    } else {
      setHexError(true)
    }
  }

  return (
    <div data-testid="appearance-settings" className="space-y-4">
      {/* Theme */}
      <fieldset>
        <legend className="mb-1 text-[var(--font-size-small)] font-[var(--font-weight-medium)] text-[var(--color-text-secondary)]">
          Theme
        </legend>
        <div className="flex gap-1">
          <button
            type="button"
            data-testid="theme-dark"
            onClick={() => setTheme('dark')}
            className={`rounded px-3 py-1 text-[var(--font-size-small)] ${
              theme === 'dark'
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]'
            }`}
          >
            Dark
          </button>
          <button
            type="button"
            data-testid="theme-light"
            onClick={() => setTheme('light')}
            className={`rounded px-3 py-1 text-[var(--font-size-small)] ${
              theme === 'light'
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]'
            }`}
          >
            Light
          </button>
        </div>
      </fieldset>

      {/* Density */}
      <fieldset>
        <legend className="mb-1 text-[var(--font-size-small)] font-[var(--font-weight-medium)] text-[var(--color-text-secondary)]">
          Density
        </legend>
        <div className="flex gap-1">
          <button
            type="button"
            data-testid="density-compact"
            onClick={() => { if (density !== 'compact') toggleDensity() }}
            className={`rounded px-3 py-1 text-[var(--font-size-small)] ${
              density === 'compact'
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]'
            }`}
          >
            Compact
          </button>
          <button
            type="button"
            data-testid="density-comfortable"
            onClick={() => { if (density !== 'comfortable') toggleDensity() }}
            className={`rounded px-3 py-1 text-[var(--font-size-small)] ${
              density === 'comfortable'
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]'
            }`}
          >
            Comfortable
          </button>
        </div>
      </fieldset>

      {/* Accent Color */}
      <fieldset>
        <legend className="mb-1 text-[var(--font-size-small)] font-[var(--font-weight-medium)] text-[var(--color-text-secondary)]">
          Accent Color
        </legend>
        <div className="flex flex-wrap gap-1">
          {ACCENT_COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              title={preset.name}
              data-testid={`accent-${preset.name.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setAccentColor(preset.hex)}
              className="relative flex h-6 w-6 items-center justify-center rounded-full"
              style={{ backgroundColor: preset.hex }}
            >
              {accentColor === preset.hex && (
                <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 6l3 3 5-5" />
                </svg>
              )}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-1">
          <input
            type="text"
            placeholder="#hex"
            value={customHex}
            onChange={(e) => { setCustomHex(e.target.value); setHexError(false) }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCustomHex() }}
            data-testid="custom-hex-input"
            className={`w-24 rounded border px-2 py-1 text-[var(--font-size-small)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] ${
              hexError ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]'
            }`}
          />
          <button
            type="button"
            data-testid="apply-custom-hex"
            onClick={handleCustomHex}
            className="rounded bg-[var(--color-bg-tertiary)] px-2 py-1 text-[var(--font-size-small)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          >
            Apply
          </button>
        </div>
      </fieldset>
    </div>
  )
}
