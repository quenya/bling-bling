import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface WednesdayPickerProps {
  value: string
  onChange: (date: string) => void
  error?: string
  className?: string
}

export const WednesdayPicker: React.FC<WednesdayPickerProps> = ({
  value,
  onChange,
  error,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 수요일인지 확인하는 함수
  const isWednesday = (date: Date) => {
    return date.getDay() === 3
  }

  // 해당 월의 모든 수요일 가져오기
  const getWednesdaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const wednesdays = []
    
    // 해당 월의 첫 번째 날부터 마지막 날까지 확인
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const currentDate = new Date(year, month, day)
      if (isWednesday(currentDate)) {
        wednesdays.push(currentDate)
      }
    }
    
    return wednesdays
  }

  // 날짜를 YYYY-MM-DD 형식으로 변환 (시간대 문제 방지)
  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 날짜를 한국어 형식으로 표시
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '날짜를 선택하세요'
    // YYYY-MM-DD 형식의 문자열을 직접 파싱하여 시간대 문제 방지
    const [year, month, day] = dateString.split('-').map(Number)
    return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')} (수)`
  }

  // 드롭다운 위치 계산
  const updateDropdownPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }

  // 달력 열기
  const openCalendar = () => {
    updateDropdownPosition()
    setIsOpen(true)
  }

  // 월 변경
  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  // 외부 클릭 감지 및 스크롤/리사이즈 이벤트
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleScroll = () => {
      if (isOpen) {
        updateDropdownPosition()
      }
    }

    const handleResize = () => {
      if (isOpen) {
        updateDropdownPosition()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('scroll', handleScroll, true)
      window.addEventListener('resize', handleResize)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [isOpen])

  const wednesdays = getWednesdaysInMonth(currentMonth)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <>
      <div ref={containerRef} className="relative">
        <div
          onClick={() => {
            if (!isOpen) updateDropdownPosition()
            setIsOpen(!isOpen)
          }}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${
            error ? 'border-red-500' : ''
          } ${className}`}
        >
          <div className="flex items-center justify-between">
            <span className={value ? 'text-gray-900' : 'text-gray-500'}>
              {formatDisplayDate(value)}
            </span>
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>

      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed z-50 bg-white border border-gray-300 rounded-md shadow-lg"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            marginTop: '4px'
          }}
        >
          {/* 월 네비게이션 */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <button
              type="button"
              onClick={() => changeMonth('prev')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="font-medium text-gray-900">
              {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
            </h3>
            <button
              type="button"
              onClick={() => changeMonth('next')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 수요일 목록 */}
          <div className="p-2 max-h-60 overflow-y-auto">
            {wednesdays.length > 0 ? (
              wednesdays.map(wednesday => {
                const dateString = formatDate(wednesday)
                const isSelected = value === dateString
                const isPast = wednesday < today
                
                return (
                  <button
                    key={dateString}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      onChange(dateString)
                      setIsOpen(false)
                    }}
                    className={`w-full px-3 py-2 text-left rounded hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center justify-between ${
                      isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                    } ${isPast ? 'text-gray-600' : ''}`}
                  >
                    <span>
                      {wednesday.getDate()}일 (수요일)
                      {isPast && ' - 지난 날짜'}
                    </span>
                    {isSelected && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                  </button>
                )
              })
            ) : (
              <p className="px-3 py-2 text-gray-500 text-sm">이 달에는 선택 가능한 수요일이 없습니다.</p>
            )}
          </div>

          {/* 안내 메시지 */}
          <div className="p-3 border-t border-gray-200 bg-blue-50">
            <p className="text-xs text-blue-600">
              📅 게임은 매주 수요일에만 진행됩니다
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}