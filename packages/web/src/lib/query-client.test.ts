import { describe, it, expect } from 'vitest'
import { queryClient } from './query-client.js'

describe('queryClient', () => {
  it('has staleTime of 1 minute', () => {
    expect(queryClient.getDefaultOptions().queries?.staleTime).toBe(60_000)
  })

  it('has gcTime of 5 minutes', () => {
    expect(queryClient.getDefaultOptions().queries?.gcTime).toBe(300_000)
  })

  it('has retry set to 1', () => {
    expect(queryClient.getDefaultOptions().queries?.retry).toBe(1)
  })

  it('has refetchOnWindowFocus disabled', () => {
    expect(queryClient.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(false)
  })
})
