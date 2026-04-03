import { create } from 'zustand'

export interface UIState {
  sidebarOpen: boolean
  theme: 'dark' | 'light'
  density: 'compact' | 'comfortable'
  toggleSidebar: () => void
  setTheme: (theme: 'dark' | 'light') => void
  toggleDensity: () => void
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: false,
  theme: 'dark',
  density: 'compact',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
  toggleDensity: () =>
    set((state) => ({
      density: state.density === 'compact' ? 'comfortable' : 'compact',
    })),
}))
