import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { DropdownMenu } from './dropdown-menu.js'

afterEach(() => cleanup())

const items = [
  { label: 'Edit', onClick: vi.fn() },
  { label: 'Delete', onClick: vi.fn() },
  { label: 'Share', onClick: vi.fn() },
]

describe('DropdownMenu', () => {
  it('does not show menu by default', () => {
    render(<DropdownMenu trigger={<button type="button">Open</button>} items={items} />)
    expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument()
  })

  it('shows menu on trigger click', () => {
    render(<DropdownMenu trigger={<button type="button">Open</button>} items={items} />)
    fireEvent.click(screen.getByTestId('dropdown-trigger'))
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
  })

  it('renders all menu items', () => {
    render(<DropdownMenu trigger={<button type="button">Open</button>} items={items} />)
    fireEvent.click(screen.getByTestId('dropdown-trigger'))
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.getByText('Share')).toBeInTheDocument()
  })

  it('calls item onClick and closes menu on item click', () => {
    render(<DropdownMenu trigger={<button type="button">Open</button>} items={items} />)
    fireEvent.click(screen.getByTestId('dropdown-trigger'))
    fireEvent.click(screen.getByText('Edit'))
    expect(items[0]!.onClick).toHaveBeenCalledOnce()
    expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument()
  })

  it('closes menu on Escape key', () => {
    render(<DropdownMenu trigger={<button type="button">Open</button>} items={items} />)
    fireEvent.click(screen.getByTestId('dropdown-trigger'))
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument()
  })

  it('closes menu on outside click', () => {
    render(
      <div>
        <DropdownMenu trigger={<button type="button">Open</button>} items={items} />
        <button type="button" data-testid="outside">Outside</button>
      </div>,
    )
    fireEvent.click(screen.getByTestId('dropdown-trigger'))
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument()
    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument()
  })

  it('navigates items with arrow keys', () => {
    render(<DropdownMenu trigger={<button type="button">Open</button>} items={items} />)
    fireEvent.click(screen.getByTestId('dropdown-trigger'))
    const container = screen.getByTestId('dropdown-trigger').parentElement!
    fireEvent.keyDown(container, { key: 'ArrowDown' })
    expect(screen.getByTestId('dropdown-item-0')).toHaveFocus()
    fireEvent.keyDown(container, { key: 'ArrowDown' })
    expect(screen.getByTestId('dropdown-item-1')).toHaveFocus()
  })
})
