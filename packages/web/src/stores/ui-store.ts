import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UIState {
  sidebarOpen: boolean
  theme: 'dark' | 'light'
  density: 'compact' | 'comfortable'
  accentColor: string
  toggleSidebar: () => void
  setTheme: (theme: 'dark' | 'light') => void
  toggleTheme: () => void
  setDensity: (density: 'compact' | 'comfortable') => void
  toggleDensity: () => void
  setAccentColor: (color: string) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      theme: 'dark',
      density: 'compact',
      accentColor: '#2f81f7',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setDensity: (density) => set({ density }),
      toggleDensity: () =>
        set((state) => ({
          density: state.density === 'compact' ? 'comfortable' : 'compact',
        })),
      setAccentColor: (color) => set({ accentColor: color }),
    }),
    {
      name: 'dev-calendar-ui',
      partialize: (state) => ({
        theme: state.theme,
        density: state.density,
        accentColor: state.accentColor,
      }),
    },
  ),
)
