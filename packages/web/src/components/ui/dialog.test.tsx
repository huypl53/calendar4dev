import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { Dialog } from './dialog.js'

// jsdom doesn't implement showModal/close on <dialog>
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  })
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open')
  })
})

import { beforeAll } from 'vitest'

afterEach(() => cleanup())

describe('Dialog', () => {
  it('calls showModal when open is true', () => {
    render(
      <Dialog open onClose={vi.fn()}>
        <p>Content</p>
      </Dialog>,
    )
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled()
  })

  it('renders title when provided', () => {
    render(
      <Dialog open onClose={vi.fn()} title="My Dialog">
        <p>Content</p>
      </Dialog>,
    )
    expect(screen.getByText('My Dialog')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <Dialog open onClose={vi.fn()}>
        <p>Dialog content</p>
      </Dialog>,
    )
    expect(screen.getByText('Dialog content')).toBeInTheDocument()
  })

  it('calls onClose when native close event fires (Escape)', () => {
    const onClose = vi.fn()
    render(
      <Dialog open onClose={onClose}>
        <p>Content</p>
      </Dialog>,
    )
    screen.getByTestId('dialog').dispatchEvent(new Event('close'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when clicking the dialog backdrop', () => {
    const onClose = vi.fn()
    render(
      <Dialog open onClose={onClose}>
        <p>Content</p>
      </Dialog>,
    )
    // Click on the dialog element itself (backdrop area)
    fireEvent.click(screen.getByTestId('dialog'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not call onClose when clicking content area', () => {
    const onClose = vi.fn()
    render(
      <Dialog open onClose={onClose}>
        <p>Click me</p>
      </Dialog>,
    )
    fireEvent.click(screen.getByText('Click me'))
    expect(onClose).not.toHaveBeenCalled()
  })
})
