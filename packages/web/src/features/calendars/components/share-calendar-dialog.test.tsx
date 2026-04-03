import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ShareCalendarDialog } from './share-calendar-dialog.js'

const mockMembers = [
  { id: 'mem-1', calendarId: 'cal-1', userId: 'user-2', userEmail: 'bob@example.com', userName: 'Bob', permissionLevel: 'details' as const, createdAt: '2026-01-01T00:00:00.000Z' },
]

vi.mock('../../../lib/api-client.js', () => ({
  calendarMembersApi: {
    list: vi.fn().mockResolvedValue([]),
    add: vi.fn().mockResolvedValue({ id: 'mem-new' }),
    update: vi.fn().mockResolvedValue({}),
    remove: vi.fn().mockResolvedValue(undefined),
  },
}))

// jsdom doesn't implement HTMLDialogElement methods
HTMLDialogElement.prototype.showModal = vi.fn()
HTMLDialogElement.prototype.close = vi.fn()

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function renderDialog(props: Partial<React.ComponentProps<typeof ShareCalendarDialog>> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    calendarId: 'cal-1',
    calendarName: 'My Calendar',
    ...props,
  }
  return render(
    createElement(QueryClientProvider, { client: queryClient },
      createElement(ShareCalendarDialog, defaultProps)),
  )
}

describe('ShareCalendarDialog', () => {
  it('renders share dialog with email input', () => {
    renderDialog()
    expect(screen.getByTestId('share-email-input')).toBeInTheDocument()
    expect(screen.getByTestId('share-permission-select')).toBeInTheDocument()
    expect(screen.getByTestId('share-add-button')).toBeInTheDocument()
  })

  it('shows calendar name in title', () => {
    renderDialog({ calendarName: 'Work' })
    expect(screen.getByText(/Share "Work"/)).toBeInTheDocument()
  })

  it('shows loading state for members', () => {
    renderDialog()
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('shows no members message when empty', async () => {
    renderDialog()
    expect(await screen.findByText('No members yet')).toBeInTheDocument()
  })

  it('shows members list when data loaded', async () => {
    const { calendarMembersApi } = await import('../../../lib/api-client.js')
    vi.mocked(calendarMembersApi.list).mockResolvedValueOnce(mockMembers)
    renderDialog()
    expect(await screen.findByTestId('member-row-mem-1')).toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('shows remove button for each member', async () => {
    const { calendarMembersApi } = await import('../../../lib/api-client.js')
    vi.mocked(calendarMembersApi.list).mockResolvedValueOnce(mockMembers)
    renderDialog()
    expect(await screen.findByTestId('remove-member-mem-1')).toBeInTheDocument()
  })

  it('disables add button when email is empty', () => {
    renderDialog()
    expect(screen.getByTestId('share-add-button')).toBeDisabled()
  })

  it('enables add button when email is entered', () => {
    renderDialog()
    fireEvent.change(screen.getByTestId('share-email-input'), { target: { value: 'test@example.com' } })
    expect(screen.getByTestId('share-add-button')).not.toBeDisabled()
  })

  it('calls add member on form submit', async () => {
    const { calendarMembersApi } = await import('../../../lib/api-client.js')
    renderDialog()
    fireEvent.change(screen.getByTestId('share-email-input'), { target: { value: 'new@example.com' } })
    fireEvent.change(screen.getByTestId('share-permission-select'), { target: { value: 'edit' } })
    fireEvent.click(screen.getByTestId('share-add-button'))
    await waitFor(() => {
      expect(calendarMembersApi.add).toHaveBeenCalledWith('cal-1', { email: 'new@example.com', permissionLevel: 'edit' })
    })
  })

  it('calls remove with confirm on remove button click', async () => {
    const { calendarMembersApi } = await import('../../../lib/api-client.js')
    vi.mocked(calendarMembersApi.list).mockResolvedValueOnce(mockMembers)
    vi.spyOn(window, 'confirm').mockReturnValueOnce(true)
    renderDialog()
    const removeBtn = await screen.findByTestId('remove-member-mem-1')
    fireEvent.click(removeBtn)
    await waitFor(() => {
      expect(calendarMembersApi.remove).toHaveBeenCalledWith('cal-1', 'mem-1')
    })
  })

  it('does not remove when confirm is cancelled', async () => {
    const { calendarMembersApi } = await import('../../../lib/api-client.js')
    vi.mocked(calendarMembersApi.list).mockResolvedValueOnce(mockMembers)
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false)
    renderDialog()
    const removeBtn = await screen.findByTestId('remove-member-mem-1')
    fireEvent.click(removeBtn)
    await waitFor(() => {
      expect(calendarMembersApi.remove).not.toHaveBeenCalled()
    })
  })
})
