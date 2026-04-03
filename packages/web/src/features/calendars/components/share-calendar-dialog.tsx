import { useState } from 'react'
import { Dialog } from '../../../components/ui/dialog.js'
import { Button } from '../../../components/ui/button.js'
import { useToast } from '../../../stores/toast-store.js'
import {
  useCalendarMembersQuery,
  useAddMemberMutation,
  useUpdateMemberMutation,
  useRemoveMemberMutation,
} from '../hooks/use-calendar-members-query.js'
import type { CalendarMember } from '../../../lib/api-client.js'

interface ShareCalendarDialogProps {
  open: boolean
  onClose: () => void
  calendarId: string
  calendarName: string
}

export function ShareCalendarDialog({ open, onClose, calendarId, calendarName }: ShareCalendarDialogProps) {
  const { toast } = useToast()
  const { data: members, isLoading } = useCalendarMembersQuery(calendarId)
  const addMutation = useAddMemberMutation(calendarId)
  const updateMutation = useUpdateMemberMutation(calendarId)
  const removeMutation = useRemoveMemberMutation(calendarId)

  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState<'details' | 'edit' | 'admin'>('details')

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    addMutation.mutate(
      { email: email.trim(), permissionLevel: permission },
      {
        onSuccess: () => {
          toast(`${email.trim()} added`, 'success')
          setEmail('')
        },
        onError: (err) => toast(err instanceof Error ? err.message : 'Failed to add member', 'error'),
      },
    )
  }

  function handleUpdatePermission(member: CalendarMember, level: CalendarMember['permissionLevel']) {
    updateMutation.mutate(
      { memberId: member.id, permissionLevel: level },
      {
        onSuccess: () => toast('Permission updated', 'success'),
        onError: () => toast('Failed to update permission', 'error'),
      },
    )
  }

  function handleRemove(member: CalendarMember) {
    if (!window.confirm(`Remove ${member.userEmail} from this calendar?`)) return
    removeMutation.mutate(member.id, {
      onSuccess: () => toast('Member removed', 'success'),
      onError: () => toast('Failed to remove member', 'error'),
    })
  }

  const isPending = addMutation.isPending || updateMutation.isPending || removeMutation.isPending

  return (
    <Dialog open={open} onClose={onClose} title={`Share "${calendarName}"`}>
      <div className="flex flex-col gap-[var(--space-4)]">
        {/* Add member form */}
        <form onSubmit={handleAdd} className="flex flex-col gap-[var(--space-2)]">
          <div className="flex gap-[var(--space-2)]">
            <input
              data-testid="share-email-input"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-[var(--space-2)] py-[var(--space-1)] text-[length:var(--font-size-body)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            />
            <select
              data-testid="share-permission-select"
              value={permission}
              onChange={(e) => setPermission(e.target.value as typeof permission)}
              className="rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-[var(--space-2)] py-[var(--space-1)] text-[length:var(--font-size-small)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            >
              <option value="details">View</option>
              <option value="edit">Edit</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Button
            data-testid="share-add-button"
            type="submit"
            variant="primary"
            size="sm"
            disabled={isPending || !email.trim()}
          >
            Add
          </Button>
        </form>

        {/* Member list */}
        <div className="flex flex-col gap-[var(--space-1)]">
          <div className="text-[length:var(--font-size-small)] font-[number:var(--font-weight-semibold)] text-[var(--color-text-secondary)]">
            Members
          </div>
          {isLoading ? (
            <div className="text-[length:var(--font-size-small)] text-[var(--color-text-tertiary)]">Loading…</div>
          ) : !members || members.length === 0 ? (
            <div className="text-[length:var(--font-size-small)] text-[var(--color-text-tertiary)]">
              No members yet
            </div>
          ) : (
            <div className="space-y-[var(--space-2)]">
              {members.map((member) => (
                <div
                  key={member.id}
                  data-testid={`member-row-${member.id}`}
                  className="flex items-center gap-[var(--space-2)]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[length:var(--font-size-body)] text-[var(--color-text-primary)]">
                      {member.userEmail}
                    </div>
                    {member.userName && (
                      <div className="text-[length:var(--font-size-small)] text-[var(--color-text-secondary)]">
                        {member.userName}
                      </div>
                    )}
                  </div>
                  <select
                    value={member.permissionLevel}
                    onChange={(e) => handleUpdatePermission(member, e.target.value as CalendarMember['permissionLevel'])}
                    disabled={isPending}
                    className="rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-[var(--space-1)] py-[2px] text-[length:var(--font-size-small)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
                    aria-label={`Permission for ${member.userEmail}`}
                  >
                    <option value="details">View</option>
                    <option value="edit">Edit</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    type="button"
                    data-testid={`remove-member-${member.id}`}
                    onClick={() => handleRemove(member)}
                    disabled={isPending}
                    className="shrink-0 text-[length:var(--font-size-small)] text-[var(--color-danger)] hover:opacity-80 disabled:opacity-40"
                    aria-label={`Remove ${member.userEmail}`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-[var(--space-1)]">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
