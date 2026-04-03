import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from './ui-store.js'

describe('useUIStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useUIStore.setState({
      sidebarOpen: false,
      theme: 'dark',
      density: 'compact',
    })
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
})
