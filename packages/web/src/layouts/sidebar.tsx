import { useState } from 'react'
import { AppearanceSettings } from '../features/settings/index.js'
import { MiniCalendar } from '../features/calendars/components/mini-calendar.js'
import { CalendarList } from '../features/calendars/components/calendar-list.js'
import { ProfileSettings } from '../features/user/components/profile-settings.js'

interface SidebarProps {
  embedded?: boolean
}

type Panel = 'settings' | 'profile' | null

function SidebarContent() {
  const [panel, setPanel] = useState<Panel>(null)

  function toggle(name: Panel) {
    setPanel((prev) => (prev === name ? null : name))
  }

  return (
    <>
      <div className="flex-1 space-y-[var(--space-4)] overflow-auto p-[var(--space-3)]">
        <MiniCalendar />
        <CalendarList />
      </div>

      <div className="border-t border-[var(--color-border)] p-2 space-y-1">
        <button
          type="button"
          data-testid="settings-toggle"
          onClick={() => toggle('settings')}
          className="flex w-full items-center gap-2 rounded px-2 py-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
          style={{ fontSize: 'var(--font-size-small)' }}
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M7.429 1.525a6.593 6.593 0 011.142 0c.036.003.108.036.137.146l.289 1.105c.147.56.55.967.997 1.189.174.086.341.183.501.29.417.278.97.423 1.53.27l1.102-.303c.11-.03.175.016.195.046.219.31.41.641.573.989.014.031.022.11-.059.19l-.815.806c-.411.406-.562.957-.53 1.456a4.588 4.588 0 010 .582c-.032.499.119 1.05.53 1.456l.815.806c.08.08.073.159.059.19a6.494 6.494 0 01-.573.99c-.02.029-.086.074-.195.045l-1.103-.303c-.559-.153-1.112-.008-1.529.27-.16.107-.327.204-.5.29-.449.222-.851.628-.998 1.189l-.289 1.105c-.029.11-.101.143-.137.146a6.613 6.613 0 01-1.142 0c-.036-.003-.108-.037-.137-.146l-.289-1.105c-.147-.56-.55-.967-.997-1.189a4.502 4.502 0 01-.501-.29c-.417-.278-.97-.423-1.53-.27l-1.102.303c-.11.03-.175-.016-.195-.046a6.492 6.492 0 01-.573-.989c-.014-.031-.022-.11.059-.19l.815-.806c.411-.406.562-.957.53-1.456a4.587 4.587 0 010-.582c.032-.499-.119-1.05-.53-1.456l-.815-.806c-.08-.08-.073-.159-.059-.19a6.44 6.44 0 01.573-.99c.02-.029.086-.074.195-.045l1.103.303c.559.153 1.112.008 1.529-.27.16-.107.327-.204.5-.29.449-.222.851-.628.998-1.189l.289-1.105c.029-.11.101-.143.137-.146zM8 0a7.998 7.998 0 00-1.315.108 1.028 1.028 0 00-.8.836l-.29 1.106a.574.574 0 01-.261.378 5.26 5.26 0 00-.582.34.573.573 0 01-.456.08l-1.103-.303a1.03 1.03 0 00-1.108.423 7.477 7.477 0 00-.662 1.146 1.028 1.028 0 00.308 1.26l.815.806a.574.574 0 01.195.398 5.17 5.17 0 000 .676.574.574 0 01-.195.398l-.815.806a1.028 1.028 0 00-.308 1.26c.186.394.408.77.662 1.146.276.407.755.579 1.108.423l1.103-.303a.573.573 0 01.456.08 5.26 5.26 0 00.582.34.574.574 0 01.26.378l.29 1.106c.093.376.377.696.8.836C7.127 15.964 7.56 16 8 16s.873-.036 1.315-.108a1.028 1.028 0 00.8-.836l.29-1.106a.574.574 0 01.261-.378 5.26 5.26 0 00.582-.34.573.573 0 01.456-.08l1.103.303a1.03 1.03 0 001.108-.423c.254-.376.476-.752.662-1.146a1.028 1.028 0 00-.308-1.26l-.815-.806a.574.574 0 01-.195-.398 5.184 5.184 0 000-.676.574.574 0 01.195-.398l.815-.806a1.028 1.028 0 00.308-1.26 7.477 7.477 0 00-.662-1.146 1.03 1.03 0 00-1.108-.423l-1.103.303a.573.573 0 01-.456-.08 5.26 5.26 0 00-.582-.34.574.574 0 01-.26-.378L9.315.944a1.028 1.028 0 00-.8-.836A7.998 7.998 0 008 0zM8 5a3 3 0 100 6 3 3 0 000-6zM6 8a2 2 0 114 0 2 2 0 01-4 0z" />
          </svg>
          Settings
        </button>

        <button
          type="button"
          data-testid="profile-toggle"
          onClick={() => toggle('profile')}
          className="flex w-full items-center gap-2 rounded px-2 py-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
          style={{ fontSize: 'var(--font-size-small)' }}
        >
          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3z"/>
          </svg>
          Profile
        </button>

        {panel === 'settings' && (
          <div className="mt-2" data-testid="settings-panel">
            <AppearanceSettings />
          </div>
        )}

        {panel === 'profile' && (
          <div className="mt-2" data-testid="profile-panel">
            <ProfileSettings />
          </div>
        )}
      </div>
    </>
  )
}

export function Sidebar({ embedded = true }: SidebarProps) {
  if (!embedded) {
    return <SidebarContent />
  }

  return (
    <aside
      data-testid="sidebar"
      className="flex flex-col overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
    >
      <SidebarContent />
    </aside>
  )
}
