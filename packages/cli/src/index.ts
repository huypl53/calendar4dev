#!/usr/bin/env node

const API_URL = process.env.DEVCAL_API_URL || 'http://localhost:3001'
const AUTH_TOKEN = process.env.DEVCAL_AUTH_TOKEN || ''

interface ApiOptions {
  method?: string
  body?: string
}

async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {}),
    },
    body: opts.body,
  })

  if (res.status === 204) return undefined as T

  const json = await res.json()
  if (!res.ok) {
    const err = json.error ?? { message: 'Request failed' }
    console.error(`Error: ${err.message}`)
    process.exit(1)
  }
  return json
}

function formatTable(rows: Record<string, unknown>[], columns: string[]): string {
  if (rows.length === 0) return '(no results)'

  const widths = columns.map((col) =>
    Math.max(col.length, ...rows.map((r) => String(r[col] ?? '').length)),
  )

  const header = columns.map((col, i) => col.padEnd(widths[i]!)).join('  ')
  const separator = widths.map((w) => '-'.repeat(w)).join('  ')
  const body = rows
    .map((r) => columns.map((col, i) => String(r[col] ?? '').padEnd(widths[i]!)).join('  '))
    .join('\n')

  return `${header}\n${separator}\n${body}`
}

async function listCalendars(json: boolean) {
  const res = await api<{ data: Record<string, unknown>[] }>('/api/calendars')
  if (json) {
    console.log(JSON.stringify(res.data, null, 2))
  } else {
    console.log(formatTable(res.data, ['id', 'name', 'color', 'isPrimary']))
  }
}

async function listEvents(json: boolean) {
  const today = new Date().toISOString().slice(0, 10)
  const endDate = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  const qs = `startDate=${today}&endDate=${endDate}`
  const res = await api<{ data: Record<string, unknown>[] }>(`/api/events?${qs}`)
  if (json) {
    console.log(JSON.stringify(res.data, null, 2))
  } else {
    console.log(formatTable(res.data, ['id', 'title', 'startTime', 'endTime']))
  }
}

async function createEvent(title: string, start: string, end: string, calendarId: string) {
  const res = await api<{ data: Record<string, unknown> }>('/api/events', {
    method: 'POST',
    body: JSON.stringify({
      calendarId,
      title,
      startTime: new Date(start).toISOString(),
      endTime: new Date(end).toISOString(),
    }),
  })
  console.log(`Created event: ${res.data.id}`)
}

function usage() {
  console.log(`
devcal — Dev Calendar CLI

Usage:
  devcal calendars list [--json]
  devcal events list [--json]
  devcal events create <title> <start> <end> <calendarId>

Environment:
  DEVCAL_API_URL    API base URL (default: http://localhost:3001)
  DEVCAL_AUTH_TOKEN Bearer token for authentication
`)
}

async function main() {
  const args = process.argv.slice(2)
  const json = args.includes('--json')
  const filtered = args.filter((a: string) => a !== '--json')

  const [resource, action, ...rest] = filtered

  if (resource === 'calendars' && action === 'list') {
    await listCalendars(json)
  } else if (resource === 'events' && action === 'list') {
    await listEvents(json)
  } else if (resource === 'events' && action === 'create') {
    if (rest.length < 4) {
      console.error('Usage: devcal events create <title> <start> <end> <calendarId>')
      process.exit(1)
    }
    await createEvent(rest[0]!, rest[1]!, rest[2]!, rest[3]!)
  } else {
    usage()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
