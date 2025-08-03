// Re-export all types from different modules
export * from './database'
export * from './bowling'

// Common utility types
export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export interface SortConfig {
  field: string
  direction: 'asc' | 'desc'
}

export interface FilterConfig {
  [key: string]: any
}

export interface DateRange {
  start: string
  end: string
}

// Component Props Types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

// API Types
export interface ApiError {
  message: string
  code?: string
  details?: any
}

export interface ApiSuccessResponse<T = any> {
  data: T
  message?: string
}

export interface ApiErrorResponse {
  error: ApiError
}

// Local Storage Types
export interface LocalStorageData {
  theme?: 'light' | 'dark'
  language?: 'ko' | 'en'
  preferences?: {
    showTutorial: boolean
    autoSave: boolean
    notifications: boolean
  }
}