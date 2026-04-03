import { describe, it, expect } from 'vitest'
import { ACCENT_COLOR_PRESETS, DEFAULT_ACCENT_COLOR } from './accent-colors.js'

describe('accent-colors', () => {
  it('has 24 preset colors', () => {
    expect(ACCENT_COLOR_PRESETS).toHaveLength(24)
  })

  it('each preset has name, hex, and category', () => {
    for (const preset of ACCENT_COLOR_PRESETS) {
      expect(preset.name).toBeTruthy()
      expect(preset.hex).toMatch(/^#[0-9a-f]{6}$/i)
      expect(['blues', 'greens', 'purples', 'warm', 'cool', 'vibrant']).toContain(preset.category)
    }
  })

  it('has 6 categories with 4 colors each', () => {
    const categories = new Map<string, number>()
    for (const preset of ACCENT_COLOR_PRESETS) {
      categories.set(preset.category, (categories.get(preset.category) ?? 0) + 1)
    }
    expect(categories.size).toBe(6)
    for (const [, count] of categories) {
      expect(count).toBe(4)
    }
  })

  it('default accent color is Cobalt (#2f81f7)', () => {
    expect(DEFAULT_ACCENT_COLOR).toBe('#2f81f7')
    const cobalt = ACCENT_COLOR_PRESETS.find((p) => p.name === 'Cobalt')
    expect(cobalt).toBeDefined()
    expect(cobalt!.hex).toBe(DEFAULT_ACCENT_COLOR)
  })

  it('has unique names', () => {
    const names = ACCENT_COLOR_PRESETS.map((p) => p.name)
    expect(new Set(names).size).toBe(names.length)
  })
})
