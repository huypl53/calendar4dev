import { describe, it, expect, vi } from 'vitest'
import { createCommands, fuzzyMatch } from './commands.js'

describe('fuzzyMatch', () => {
  it('matches exact string', () => {
    expect(fuzzyMatch('Day View', 'Go to Day View')).toBe(true)
  })

  it('matches subsequence', () => {
    expect(fuzzyMatch('dv', 'Go to Day View')).toBe(true)
  })

  it('is case insensitive', () => {
    expect(fuzzyMatch('DAY', 'Go to Day View')).toBe(true)
  })

  it('returns false for non-matching', () => {
    expect(fuzzyMatch('xyz', 'Go to Day View')).toBe(false)
  })

  it('matches empty query', () => {
    expect(fuzzyMatch('', 'anything')).toBe(true)
  })
})

describe('createCommands', () => {
  it('returns an array of commands', () => {
    const commands = createCommands({
      navigate: vi.fn(),
      today: '2026-04-03',
      toggleTheme: vi.fn(),
      toggleDensity: vi.fn(),
      toggleSidebar: vi.fn(),
      openCreateEvent: vi.fn(),
    })
    expect(commands.length).toBeGreaterThan(0)
    expect(commands.every((c) => c.id && c.label && c.category)).toBe(true)
  })

  it('has view commands with shortcuts', () => {
    const commands = createCommands({
      navigate: vi.fn(),
      today: '2026-04-03',
      toggleTheme: vi.fn(),
      toggleDensity: vi.fn(),
      toggleSidebar: vi.fn(),
      openCreateEvent: vi.fn(),
    })
    const viewDay = commands.find((c) => c.id === 'view-day')
    expect(viewDay?.shortcut).toBe('d')
  })

  it('navigates when view command executed', () => {
    const navigate = vi.fn()
    const commands = createCommands({
      navigate,
      today: '2026-04-03',
      toggleTheme: vi.fn(),
      toggleDensity: vi.fn(),
      toggleSidebar: vi.fn(),
      openCreateEvent: vi.fn(),
    })
    commands.find((c) => c.id === 'view-week')!.action()
    expect(navigate).toHaveBeenCalledWith('/week/2026-04-03')
  })

  it('calls openCreateEvent for create-event command', () => {
    const openCreateEvent = vi.fn()
    const commands = createCommands({
      navigate: vi.fn(),
      today: '2026-04-03',
      toggleTheme: vi.fn(),
      toggleDensity: vi.fn(),
      toggleSidebar: vi.fn(),
      openCreateEvent,
    })
    commands.find((c) => c.id === 'create-event')!.action()
    expect(openCreateEvent).toHaveBeenCalled()
  })
})
