import { useState } from 'react'
import { useUIStore } from '../../../stores/ui-store.js'
import type { DefaultView } from '../../../stores/ui-store.js'
import { ACCENT_COLOR_PRESETS } from '@dev-calendar/shared'
import { Button } from '../../../components/ui/index.js'

const HEX_RE = /^#[0-9a-fA-F]{6}$/

export function AppearanceSettings() {
  const theme = useUIStore((s) => s.theme)
  const density = useUIStore((s) => s.density)
  const accentColor = useUIStore((s) => s.accentColor)
  const setTheme = useUIStore((s) => s.setTheme)
  const setDensity = useUIStore((s) => s.setDensity)
  const setAccentColor = useUIStore((s) => s.setAccentColor)
  const defaultView = useUIStore((s) => s.defaultView)
  const setDefaultView = useUIStore((s) => s.setDefaultView)

  const [customHex, setCustomHex] = useState('')
  const [hexError, setHexError] = useState(false)

  function handleCustomHex() {
    const raw = customHex.startsWith('#') ? customHex : `#${customHex}`
    const value = raw.toLowerCase()
    if (HEX_RE.test(value)) {
      setAccentColor(value)
      setHexError(false)
      setCustomHex('')
    } else {
      setHexError(true)
    }
  }

  return (
    <div data-testid="appearance-settings" className="space-y-4">
      {/* Theme */}
      <fieldset>
        <legend className="mb-1 text-[length:var(--font-size-small)] font-[number:var(--font-weight-medium)] text-[var(--color-text-secondary)]">
          Theme
        </legend>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={theme === 'dark' ? 'primary' : 'secondary'}
            data-testid="theme-dark"
            onClick={() => setTheme('dark')}
          >
            Dark
          </Button>
          <Button
            size="sm"
            variant={theme === 'light' ? 'primary' : 'secondary'}
            data-testid="theme-light"
            onClick={() => setTheme('light')}
          >
            Light
          </Button>
        </div>
      </fieldset>

      {/* Density */}
      <fieldset>
        <legend className="mb-1 text-[length:var(--font-size-small)] font-[number:var(--font-weight-medium)] text-[var(--color-text-secondary)]">
          Density
        </legend>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={density === 'compact' ? 'primary' : 'secondary'}
            data-testid="density-compact"
            onClick={() => setDensity('compact')}
          >
            Compact
          </Button>
          <Button
            size="sm"
            variant={density === 'comfortable' ? 'primary' : 'secondary'}
            data-testid="density-comfortable"
            onClick={() => setDensity('comfortable')}
          >
            Comfortable
          </Button>
        </div>
      </fieldset>

      {/* Default View */}
      <fieldset>
        <legend className="mb-1 text-[length:var(--font-size-small)] font-[number:var(--font-weight-medium)] text-[var(--color-text-secondary)]">
          Default View
        </legend>
        <div className="flex gap-1">
          {(['day', 'week', 'month', 'schedule'] as const).map((v) => (
            <Button
              key={v}
              size="sm"
              variant={defaultView === v ? 'primary' : 'secondary'}
              data-testid={`default-view-${v}`}
              onClick={() => setDefaultView(v as DefaultView)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </Button>
          ))}
        </div>
      </fieldset>

      {/* Accent Color */}
      <fieldset>
        <legend className="mb-1 text-[length:var(--font-size-small)] font-[number:var(--font-weight-medium)] text-[var(--color-text-secondary)]">
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
            className={`w-24 rounded border px-2 py-1 text-[length:var(--font-size-small)] bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] ${
              hexError ? 'border-[var(--color-danger)]' : 'border-[var(--color-border)]'
            }`}
          />
          <Button
            size="sm"
            variant="secondary"
            data-testid="apply-custom-hex"
            onClick={handleCustomHex}
          >
            Apply
          </Button>
        </div>
      </fieldset>
    </div>
  )
}
