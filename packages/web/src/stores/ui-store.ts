import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DefaultView = 'day' | 'week' | 'month' | 'schedule'

export interface UIState {
  sidebarOpen: boolean
  theme: 'dark' | 'light'
  density: 'compact' | 'comfortable'
  accentColor: string
  defaultView: DefaultView
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setTheme: (theme: 'dark' | 'light') => void
  toggleTheme: () => void
  setDensity: (density: 'compact' | 'comfortable') => void
  toggleDensity: () => void
  setAccentColor: (color: string) => void
  setDefaultView: (view: DefaultView) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      theme: 'dark',
      density: 'compact',
      accentColor: '#2f81f7',
      defaultView: 'week',
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
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
      setDefaultView: (view) => set({ defaultView: view }),
    }),
    {
      name: 'dev-calendar-ui',
      partialize: (state) => ({
        theme: state.theme,
        density: state.density,
        accentColor: state.accentColor,
        defaultView: state.defaultView,
      }),
    },
  ),
)
