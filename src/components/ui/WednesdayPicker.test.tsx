// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, cleanup } from '@testing-library/react'
import { WednesdayPicker } from './WednesdayPicker'

const openPicker = () => {
  render(<WednesdayPicker value="" onChange={vi.fn()} />)
  fireEvent.click(screen.getByText('날짜를 선택하세요'))
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('WednesdayPicker', () => {
  it('starts in the month of the latest allowed Wednesday when today is the first', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 1, 12))

    openPicker()

    expect(screen.getByRole('heading').textContent).toContain('5')
    expect(screen.getByRole('button', { name: /27일 \(수요일\)/ }).hasAttribute('disabled')).toBe(false)
  })

  it('disables future Wednesdays and allows selecting the latest permitted date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 18, 12))
    const onChange = vi.fn()
    render(<WednesdayPicker value="" onChange={onChange} />)
    fireEvent.click(screen.getByText('날짜를 선택하세요'))

    expect(screen.getByRole('button', { name: /17일 \(수요일\)/ }).hasAttribute('disabled')).toBe(false)
    expect(screen.getByRole('button', { name: /24일 \(수요일\)/ }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('button', { name: '다음 달' }).hasAttribute('disabled')).toBe(true)
    fireEvent.mouseDown(screen.getByRole('button', { name: /17일 \(수요일\)/ }))
    expect(onChange).toHaveBeenCalledWith('2026-06-17')
  })

  it('moves back a month from a month-end without skipping the previous month', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 6, 31, 12))
    openPicker()

    fireEvent.click(screen.getByRole('button', { name: '이전 달' }))

    expect(screen.getByRole('heading').textContent).toContain('6')
  })
})
