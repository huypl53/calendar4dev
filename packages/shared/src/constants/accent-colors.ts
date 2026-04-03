export interface AccentColorPreset {
  name: string
  hex: string
  category: 'blues' | 'greens' | 'purples' | 'warm' | 'cool' | 'vibrant'
}

export const ACCENT_COLOR_PRESETS: readonly AccentColorPreset[] = [
  // Blues
  { name: 'Cobalt', hex: '#2f81f7', category: 'blues' },
  { name: 'Azure', hex: '#58a6ff', category: 'blues' },
  { name: 'Sapphire', hex: '#388bfd', category: 'blues' },
  { name: 'Sky', hex: '#79c0ff', category: 'blues' },
  // Greens
  { name: 'Emerald', hex: '#3fb950', category: 'greens' },
  { name: 'Mint', hex: '#56d364', category: 'greens' },
  { name: 'Sage', hex: '#7ee787', category: 'greens' },
  { name: 'Lime', hex: '#a5d6a7', category: 'greens' },
  // Purples
  { name: 'Violet', hex: '#8957e5', category: 'purples' },
  { name: 'Amethyst', hex: '#a371f7', category: 'purples' },
  { name: 'Lavender', hex: '#d2a8ff', category: 'purples' },
  { name: 'Plum', hex: '#bc8cff', category: 'purples' },
  // Warm
  { name: 'Coral', hex: '#f47067', category: 'warm' },
  { name: 'Amber', hex: '#d29922', category: 'warm' },
  { name: 'Tangerine', hex: '#e3b341', category: 'warm' },
  { name: 'Rose', hex: '#f778ba', category: 'warm' },
  // Cool
  { name: 'Teal', hex: '#39d2c0', category: 'cool' },
  { name: 'Cyan', hex: '#76e4f7', category: 'cool' },
  { name: 'Slate', hex: '#768390', category: 'cool' },
  { name: 'Steel', hex: '#8b949e', category: 'cool' },
  // Vibrant
  { name: 'Electric', hex: '#1f6feb', category: 'vibrant' },
  { name: 'Neon Green', hex: '#39d353', category: 'vibrant' },
  { name: 'Hot Pink', hex: '#db61a2', category: 'vibrant' },
  { name: 'Gold', hex: '#e3b341', category: 'vibrant' },
] as const

export const DEFAULT_ACCENT_COLOR = '#2f81f7' // Cobalt
