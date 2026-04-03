import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react'
import { Tooltip } from './tooltip.js'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('Tooltip', () => {
  it('does not show tooltip by default', () => {
    render(
      <Tooltip content="Help text">
        <button type="button">Hover me</button>
      </Tooltip>,
    )
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows tooltip after hover delay', () => {
    render(
      <Tooltip content="Help text">
        <button type="button">Hover me</button>
      </Tooltip>,
    )
    fireEvent.mouseEnter(screen.getByText('Hover me').parentElement!)
    act(() => { vi.advanceTimersByTime(300) })
    expect(screen.getByRole('tooltip')).toHaveTextContent('Help text')
  })

  it('does not show tooltip before delay completes', () => {
    render(
      <Tooltip content="Help text">
        <button type="button">Hover me</button>
      </Tooltip>,
    )
    fireEvent.mouseEnter(screen.getByText('Hover me').parentElement!)
    act(() => { vi.advanceTimersByTime(200) })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('hides tooltip on mouse leave', () => {
    render(
      <Tooltip content="Help text">
        <button type="button">Hover me</button>
      </Tooltip>,
    )
    const wrapper = screen.getByText('Hover me').parentElement!
    fireEvent.mouseEnter(wrapper)
    act(() => { vi.advanceTimersByTime(300) })
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    fireEvent.mouseLeave(wrapper)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows tooltip on focus', () => {
    render(
      <Tooltip content="Keyboard hint">
        <button type="button">Focus me</button>
      </Tooltip>,
    )
    fireEvent.focus(screen.getByText('Focus me').parentElement!)
    act(() => { vi.advanceTimersByTime(300) })
    expect(screen.getByRole('tooltip')).toHaveTextContent('Keyboard hint')
  })

  it('hides tooltip on blur', () => {
    render(
      <Tooltip content="Keyboard hint">
        <button type="button">Focus me</button>
      </Tooltip>,
    )
    const wrapper = screen.getByText('Focus me').parentElement!
    fireEvent.focus(wrapper)
    act(() => { vi.advanceTimersByTime(300) })
    fireEvent.blur(wrapper)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('cancels show if mouse leaves before delay', () => {
    render(
      <Tooltip content="Help text">
        <button type="button">Hover me</button>
      </Tooltip>,
    )
    const wrapper = screen.getByText('Hover me').parentElement!
    fireEvent.mouseEnter(wrapper)
    act(() => { vi.advanceTimersByTime(100) })
    fireEvent.mouseLeave(wrapper)
    act(() => { vi.advanceTimersByTime(300) })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})
