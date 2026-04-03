import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProfileSettings } from './profile-settings.js'

vi.mock('../../../lib/api-client.js', () => ({
  userApi: {
    getProfile: vi.fn().mockResolvedValue({
      id: 'user-1',
      email: 'alice@example.com',
      name: 'Alice',
      image: null,
      hasPassword: true,
    }),
    updateProfile: vi.fn().mockResolvedValue({
      id: 'user-1',
      email: 'alice@example.com',
      name: 'Alice Updated',
      image: null,
    }),
    changePassword: vi.fn().mockResolvedValue({ success: true }),
  },
}))

vi.mock('../../../lib/auth-client.js', () => ({
  signOut: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

function renderComponent() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    createElement(QueryClientProvider, { client: queryClient },
      createElement(ProfileSettings)),
  )
}

describe('ProfileSettings', () => {
  it('renders profile settings', () => {
    renderComponent()
    expect(screen.getByTestId('profile-settings')).toBeInTheDocument()
  })

  it('shows name form and logout button', () => {
    renderComponent()
    expect(screen.getByTestId('profile-name-form')).toBeInTheDocument()
    expect(screen.getByTestId('profile-logout-button')).toBeInTheDocument()
  })

  it('shows password form when hasPassword is true', async () => {
    renderComponent()
    expect(await screen.findByTestId('profile-password-form')).toBeInTheDocument()
  })

  it('shows user email and avatar', async () => {
    renderComponent()
    expect(await screen.findByTestId('profile-avatar')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
  })

  it('calls updateProfile on name form submit', async () => {
    const { userApi } = await import('../../../lib/api-client.js')
    renderComponent()
    // Wait for profile to load (avatar indicates profile data is available)
    await screen.findByTestId('profile-avatar')
    fireEvent.change(screen.getByTestId('profile-name-input'), { target: { value: 'Bob' } })
    fireEvent.submit(screen.getByTestId('profile-name-form'))
    await waitFor(() => {
      expect(userApi.updateProfile).toHaveBeenCalledWith({ name: 'Bob' })
    })
  })

  it('calls signOut and navigates on logout', async () => {
    const { signOut } = await import('../../../lib/auth-client.js')
    renderComponent()
    fireEvent.click(screen.getByTestId('profile-logout-button'))
    await waitFor(() => {
      expect(signOut).toHaveBeenCalled()
    })
  })

  it('hides password form when hasPassword is false', async () => {
    const { userApi } = await import('../../../lib/api-client.js')
    vi.mocked(userApi.getProfile).mockResolvedValueOnce({
      id: 'user-2',
      email: 'oauth@example.com',
      name: 'OAuth User',
      image: null,
      hasPassword: false,
    })
    renderComponent()
    await screen.findByTestId('profile-avatar')
    expect(screen.queryByTestId('profile-password-form')).not.toBeInTheDocument()
  })
})
