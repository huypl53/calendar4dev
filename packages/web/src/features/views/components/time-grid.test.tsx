import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { TimeGrid } from './time-grid.js'

afterEach(() => cleanup())

describe('TimeGrid', () => {
  it('renders the time grid container', () => {
    render(<TimeGrid dayCount={7} />)
    expect(screen.getByTestId('time-grid')).toBeInTheDocument()
  })

  it('renders 24 rows × dayCount columns of grid cells', () => {
    render(<TimeGrid dayCount={7} />)
    // 24 hours × 7 columns = 168 cells
    for (let h = 0; h < 24; h++) {
      for (let c = 0; c < 7; c++) {
        expect(screen.getByTestId(`grid-cell-${h}-${c}`)).toBeInTheDocument()
      }
    }
  })

  it('uses density-row-height token for cell height', () => {
    render(<TimeGrid dayCount={7} />)
    const cell = screen.getByTestId('grid-cell-0-0')
    expect(cell.style.height).toBe('var(--density-row-height)')
  })

  it('sets correct grid columns for given dayCount', () => {
    render(<TimeGrid dayCount={5} />)
    const grid = screen.getByTestId('time-grid')
    expect(grid.style.gridTemplateColumns).toBe('repeat(5, 1fr)')
  })

  it('renders 24×5=120 cells when dayCount=5', () => {
    render(<TimeGrid dayCount={5} />)
    for (let h = 0; h < 24; h++) {
      for (let c = 0; c < 5; c++) {
        expect(screen.getByTestId(`grid-cell-${h}-${c}`)).toBeInTheDocument()
      }
    }
  })
})
