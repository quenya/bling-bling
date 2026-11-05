import { describe, expect, it } from 'vitest'
import { getLatestAllowedWednesday, isAllowedGameDate } from './gameDate'

describe('game date rules', () => {
  it('allows today when local today is Wednesday, but never a future day', () => {
    const wednesday = new Date(2025, 0, 8, 12)
    expect(getLatestAllowedWednesday(wednesday)).toBe('2025-01-08')
    expect(isAllowedGameDate('2025-01-08', wednesday)).toBe(true)
    expect(isAllowedGameDate('2025-01-15', wednesday)).toBe(false)
  })

  it('uses the most recent Wednesday on other weekdays and across year boundaries', () => {
    const thursday = new Date(2025, 0, 2, 12)
    expect(getLatestAllowedWednesday(thursday)).toBe('2025-01-01')
    expect(isAllowedGameDate('2025-01-01', thursday)).toBe(true)
    expect(isAllowedGameDate('2025-01-08', thursday)).toBe(false)
    expect(isAllowedGameDate('2024-12-25', thursday)).toBe(true)
  })

  it('compares calendar dates in local time without UTC date shifts', () => {
    const localMidnight = new Date(2025, 2, 1, 0)
    expect(getLatestAllowedWednesday(localMidnight)).toBe('2025-02-26')
    expect(isAllowedGameDate('2025-02-26', localMidnight)).toBe(true)
    expect(isAllowedGameDate('2025-03-05', localMidnight)).toBe(false)
  })

  it('rejects malformed dates and non-Wednesdays', () => {
    const today = new Date(2025, 0, 9, 12)
    expect(isAllowedGameDate('2025-01-09', today)).toBe(false)
    expect(isAllowedGameDate('invalid', today)).toBe(false)
  })
})