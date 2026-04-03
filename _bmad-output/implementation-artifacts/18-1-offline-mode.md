# Story 18-1: Offline Awareness & Indicator

Status: ready-for-dev

## Story

As a user,
I want the app to clearly show when I am offline and still display my cached calendar data,
so that I know my changes may not be saved and can still read my schedule without connectivity.

## Acceptance Criteria

1. AppShell subscribes to `navigator.onLine` and the `window` `online`/`offline` events; stores `isOnline: boolean` in component state
2. Status bar shows an amber dot + "Offline" text label when `isOnline` is false
3. React Query `queryClient` is configured with `networkMode: 'offlineFirst'` so cached query data remains visible when offline
4. Status bar shows a "Stale" indicator when React Query reports cached data is stale while offline
5. Going back online removes both indicators within one event cycle (no manual refresh required)

## Tasks / Subtasks

- [ ] Task 1: Online/offline state in AppShell
  - [ ] Initialise `isOnline` state from `navigator.onLine`
  - [ ] Add `useEffect` that registers `window.addEventListener('online', ...)` and `window.addEventListener('offline', ...)`
  - [ ] Update `isOnline` state in each handler; clean up listeners on unmount
  - [ ] Pass `isOnline` down to StatusBar (or via context)

- [ ] Task 2: Status bar offline indicator
  - [ ] Accept `isOnline` prop (or read from context) in StatusBar
  - [ ] When offline: render amber filled circle + "Offline" text in the status bar
  - [ ] When back online: remove the indicator without page reload

- [ ] Task 3: React Query offline config
  - [ ] Set `defaultOptions: { queries: { networkMode: 'offlineFirst' } }` on `queryClient`
  - [ ] Subscribe to `queryClient.getQueryCache().subscribe(...)` or use `useIsFetching`/`useIsStale` to detect stale state
  - [ ] Show a "Stale" badge in the status bar when data is stale and the user is offline

- [ ] Task 4: Tests
  - [ ] Test AppShell: mock `navigator.onLine = false` and `offline` event → `isOnline` becomes false
  - [ ] Test StatusBar: renders offline indicator when `isOnline` prop is false, hides it when true
  - [ ] Run typecheck + tests

## What NOT to Build

- **No offline mutation queue** — mutations (create/edit/delete) still fail when offline, post-MVP
- **No service worker** — no background caching or fetch interception, post-MVP
- **No background sync** — no automatic re-sync of failed mutations when connectivity returns, post-MVP
