import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { AppearanceSettings } from './appearance-settings.js'
import { useUIStore } from '../../../stores/ui-store.js'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

beforeEach(() => {
  useUIStore.setState({
    sidebarOpen: false,
    theme: 'dark',
    density: 'compact',
    accentColor: '#2f81f7',
  })
})

describe('AppearanceSettings', () => {
  it('renders theme, density, and accent color controls', () => {
    render(<AppearanceSettings />)

    expect(screen.getByTestId('theme-dark')).toBeInTheDocument()
    expect(screen.getByTestId('theme-light')).toBeInTheDocument()
    expect(screen.getByTestId('density-compact')).toBeInTheDocument()
    expect(screen.getByTestId('density-comfortable')).toBeInTheDocument()
    expect(screen.getByTestId('accent-cobalt')).toBeInTheDocument()
    expect(screen.getByTestId('custom-hex-input')).toBeInTheDocument()
  })

  it('clicking light theme button calls setTheme with light', () => {
    render(<AppearanceSettings />)
    fireEvent.click(screen.getByTestId('theme-light'))
    expect(useUIStore.getState().theme).toBe('light')
  })

  it('clicking dark theme button calls setTheme with dark', () => {
    useUIStore.setState({ theme: 'light' })
    render(<AppearanceSettings />)
    fireEvent.click(screen.getByTestId('theme-dark'))
    expect(useUIStore.getState().theme).toBe('dark')
  })

  it('clicking comfortable density button toggles density', () => {
    render(<AppearanceSettings />)
    fireEvent.click(screen.getByTestId('density-comfortable'))
    expect(useUIStore.getState().density).toBe('comfortable')
  })

  it('clicking an accent color preset sets accent color', () => {
    render(<AppearanceSettings />)
    fireEvent.click(screen.getByTestId('accent-emerald'))
    expect(useUIStore.getState().accentColor).toBe('#3fb950')
  })

  it('applying a valid custom hex sets accent color', () => {
    render(<AppearanceSettings />)
    const input = screen.getByTestId('custom-hex-input')
    fireEvent.change(input, { target: { value: '#ff5500' } })
    fireEvent.click(screen.getByTestId('apply-custom-hex'))
    expect(useUIStore.getState().accentColor).toBe('#ff5500')
  })

  it('applying an invalid custom hex does not change accent color', () => {
    render(<AppearanceSettings />)
    const input = screen.getByTestId('custom-hex-input')
    fireEvent.change(input, { target: { value: 'not-hex' } })
    fireEvent.click(screen.getByTestId('apply-custom-hex'))
    expect(useUIStore.getState().accentColor).toBe('#2f81f7')
  })
})
