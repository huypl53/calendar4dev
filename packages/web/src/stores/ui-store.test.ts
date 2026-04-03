import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useUIStore } from './ui-store.js'

describe('useUIStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      sidebarOpen: false,
      theme: 'dark',
      density: 'compact',
      accentColor: '#2f81f7',
    })
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('initial defaults', () => {
    it('has sidebarOpen set to false', () => {
      expect(useUIStore.getState().sidebarOpen).toBe(false)
    })

    it('has theme set to dark', () => {
      expect(useUIStore.getState().theme).toBe('dark')
    })

    it('has density set to compact', () => {
      expect(useUIStore.getState().density).toBe('compact')
    })

    it('has accentColor set to Cobalt', () => {
      expect(useUIStore.getState().accentColor).toBe('#2f81f7')
    })
  })

  describe('toggleSidebar', () => {
    it('toggles sidebar from closed to open', () => {
      useUIStore.getState().toggleSidebar()
      expect(useUIStore.getState().sidebarOpen).toBe(true)
    })

    it('toggles sidebar from open to closed', () => {
      useUIStore.getState().toggleSidebar()
      useUIStore.getState().toggleSidebar()
      expect(useUIStore.getState().sidebarOpen).toBe(false)
    })
  })

  describe('setTheme', () => {
    it('sets theme to light', () => {
      useUIStore.getState().setTheme('light')
      expect(useUIStore.getState().theme).toBe('light')
    })

    it('sets theme to dark', () => {
      useUIStore.getState().setTheme('light')
      useUIStore.getState().setTheme('dark')
      expect(useUIStore.getState().theme).toBe('dark')
    })
  })

  describe('toggleTheme', () => {
    it('toggles from dark to light', () => {
      useUIStore.getState().toggleTheme()
      expect(useUIStore.getState().theme).toBe('light')
    })

    it('toggles from light to dark', () => {
      useUIStore.getState().toggleTheme()
      useUIStore.getState().toggleTheme()
      expect(useUIStore.getState().theme).toBe('dark')
    })
  })

  describe('setDensity', () => {
    it('sets density to comfortable', () => {
      useUIStore.getState().setDensity('comfortable')
      expect(useUIStore.getState().density).toBe('comfortable')
    })

    it('sets density to compact', () => {
      useUIStore.getState().setDensity('comfortable')
      useUIStore.getState().setDensity('compact')
      expect(useUIStore.getState().density).toBe('compact')
    })
  })

  describe('toggleDensity', () => {
    it('toggles density from compact to comfortable', () => {
      useUIStore.getState().toggleDensity()
      expect(useUIStore.getState().density).toBe('comfortable')
    })

    it('toggles density from comfortable to compact', () => {
      useUIStore.getState().toggleDensity()
      useUIStore.getState().toggleDensity()
      expect(useUIStore.getState().density).toBe('compact')
    })
  })

  describe('setAccentColor', () => {
    it('sets accent color to a new value', () => {
      useUIStore.getState().setAccentColor('#ff0000')
      expect(useUIStore.getState().accentColor).toBe('#ff0000')
    })
  })

  describe('persist middleware', () => {
    it('persists theme, density, and accentColor to localStorage', () => {
      useUIStore.getState().setTheme('light')
      useUIStore.getState().toggleDensity()
      useUIStore.getState().setAccentColor('#3fb950')

      const stored = JSON.parse(localStorage.getItem('dev-calendar-ui') ?? '{}')
      expect(stored.state.theme).toBe('light')
      expect(stored.state.density).toBe('comfortable')
      expect(stored.state.accentColor).toBe('#3fb950')
    })

    it('does NOT persist sidebarOpen', () => {
      useUIStore.getState().toggleSidebar()
      expect(useUIStore.getState().sidebarOpen).toBe(true)

      const stored = JSON.parse(localStorage.getItem('dev-calendar-ui') ?? '{}')
      expect(stored.state.sidebarOpen).toBeUndefined()
    })
  })
})
