const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const getLatestAllowedWednesday = (now = new Date()): string => {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const daysSinceWednesday = (today.getDay() - 3 + 7) % 7
  today.setDate(today.getDate() - daysSinceWednesday)
  return formatLocalDate(today)
}

export const isAllowedGameDate = (date: string, now = new Date()): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  const [year, month, day] = date.split('-').map(Number)
  const parsed = new Date(year, month - 1, day)
  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) return false
  return parsed.getDay() === 3 && date <= getLatestAllowedWednesday(now)
}