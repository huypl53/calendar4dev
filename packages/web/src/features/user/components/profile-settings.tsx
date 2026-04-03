import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '../../../components/ui/button.js'
import { useToast } from '../../../stores/toast-store.js'
import { signOut } from '../../../lib/auth-client.js'
import {
  useUserProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} from '../hooks/use-user-profile-mutation.js'

export function ProfileSettings() {
  const { data: profile } = useUserProfileQuery()
  const updateMutation = useUpdateProfileMutation()
  const changePwMutation = useChangePasswordMutation()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')

  useEffect(() => {
    if (profile) setName(profile.name ?? '')
  }, [profile?.id])

  function handleUpdateName(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    updateMutation.mutate(
      { name: name.trim() },
      {
        onSuccess: () => toast('Name updated', 'success'),
        onError: () => toast('Failed to update name', 'error'),
      },
    )
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPw !== confirmPw) {
      toast('New passwords do not match', 'error')
      return
    }
    changePwMutation.mutate(
      { currentPassword: currentPw, newPassword: newPw },
      {
        onSuccess: () => {
          toast('Password changed', 'success')
          setCurrentPw('')
          setNewPw('')
          setConfirmPw('')
        },
        onError: (err) =>
          toast(err instanceof Error ? err.message : 'Failed to change password', 'error'),
      },
    )
  }

  async function handleLogout() {
    await signOut()
    void navigate({ to: '/login' })
  }

  const inputClass =
    'w-full rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-[var(--space-2)] py-[var(--space-1)] text-[length:var(--font-size-small)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]'
  const labelClass = 'mb-[var(--space-1)] block text-[length:var(--font-size-tiny)] text-[var(--color-text-secondary)]'

  return (
    <div data-testid="profile-settings" className="space-y-[var(--space-4)]">
      {/* User email + avatar initials */}
      {profile && (
        <div className="flex items-center gap-[var(--space-2)]">
          <div
            data-testid="profile-avatar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-[length:var(--font-size-small)] font-[number:var(--font-weight-semibold)] text-white"
          >
            {profile.image ? (
              <img src={profile.image} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              (profile.name ?? profile.email).slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[length:var(--font-size-small)] font-[number:var(--font-weight-medium)] text-[var(--color-text-primary)]">
              {profile.name ?? profile.email}
            </div>
            <div className="truncate text-[length:var(--font-size-tiny)] text-[var(--color-text-tertiary)]">
              {profile.email}
            </div>
          </div>
        </div>
      )}

      {/* Display name */}
      <form onSubmit={handleUpdateName} data-testid="profile-name-form" className="space-y-[var(--space-2)]">
        <div>
          <label className={labelClass}>Display name</label>
          <input
            data-testid="profile-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <Button
          data-testid="profile-name-save"
          type="submit"
          variant="primary"
          size="sm"
          disabled={updateMutation.isPending}
        >
          Save
        </Button>
      </form>

      {/* Password change — only for credential accounts */}
      {profile?.hasPassword && (
        <form onSubmit={handleChangePassword} data-testid="profile-password-form" className="space-y-[var(--space-2)]">
          <div className="text-[length:var(--font-size-tiny)] font-[number:var(--font-weight-semibold)] uppercase text-[var(--color-text-secondary)]">
            Change Password
          </div>
          <div>
            <label className={labelClass}>Current password</label>
            <input
              data-testid="profile-current-password"
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>New password</label>
            <input
              data-testid="profile-new-password"
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              required
              minLength={8}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Confirm new password</label>
            <input
              data-testid="profile-confirm-password"
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <Button
            data-testid="profile-password-save"
            type="submit"
            variant="primary"
            size="sm"
            disabled={changePwMutation.isPending}
          >
            Change Password
          </Button>
        </form>
      )}

      {/* Logout */}
      <div className="border-t border-[var(--color-border)] pt-[var(--space-2)]">
        <Button
          data-testid="profile-logout-button"
          variant="danger"
          size="sm"
          onClick={() => void handleLogout()}
        >
          Log out
        </Button>
      </div>
    </div>
  )
}
