import React, { useState } from 'react'
import { X, Calendar, Users, Trophy, Target } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Badge } from '../ui/Badge'
import type { GameHistoryFilter as FilterType } from '../../types/bowling'

interface GameHistoryFilterProps {
  filter: FilterType
  onFilterChange: (filter: FilterType) => void
  onReset: () => void
}

const GameHistoryFilter: React.FC<GameHistoryFilterProps> = ({
  filter,
  onFilterChange,
  onReset
}) => {
  const [tempFilter, setTempFilter] = useState<FilterType>(filter)

  const handleApply = () => {
    onFilterChange(tempFilter)
  }

  const handleReset = () => {
    setTempFilter({})
    onReset()
  }

  const handleDateRangeChange = (field: 'from' | 'to', value: string) => {
    setTempFilter(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }))
  }

  const handleSessionTypeToggle = (type: 'regular' | 'tournament' | 'practice') => {
    setTempFilter(prev => {
      const currentTypes = prev.sessionType || []
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter(t => t !== type)
        : [...currentTypes, type]
      
      return {
        ...prev,
        sessionType: newTypes.length > 0 ? newTypes : undefined
      }
    })
  }

  const getSessionTypeLabel = (type: string) => {
    const labels = {
      regular: '정기모임',
      tournament: '토너먼트',
      practice: '연습게임'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getSessionTypeColor = (type: string) => {
    const colors = {
      regular: 'bg-blue-100 text-blue-800',
      tournament: 'bg-red-100 text-red-800',
      practice: 'bg-green-100 text-green-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const hasActiveFilters = () => {
    return Object.keys(filter).length > 0 && Object.values(filter).some(value => {
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0
      return value !== undefined && value !== null && value !== ''
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4" />
            날짜 범위
          </label>
          <div className="space-y-2">
            <Input
              type="date"
              placeholder="시작 날짜"
              value={tempFilter.dateRange?.from || ''}
              onChange={(e) => handleDateRangeChange('from', e.target.value)}
              className="text-sm"
            />
            <Input
              type="date"
              placeholder="종료 날짜"
              value={tempFilter.dateRange?.to || ''}
              onChange={(e) => handleDateRangeChange('to', e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        {/* Session Types */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Trophy className="w-4 h-4" />
            게임 유형
          </label>
          <div className="space-y-2">
            {(['regular', 'tournament', 'practice'] as const).map(type => (
              <label key={type} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={tempFilter.sessionType?.includes(type) || false}
                  onChange={() => handleSessionTypeToggle(type)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{getSessionTypeLabel(type)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Score Range */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Target className="w-4 h-4" />
            점수 범위
          </label>
          <div className="space-y-2">
            <Input
              type="number"
              placeholder="최소 점수"
              value={tempFilter.minScore || ''}
              onChange={(e) => setTempFilter(prev => ({
                ...prev,
                minScore: e.target.value ? parseInt(e.target.value) : undefined
              }))}
              className="text-sm"
              min="0"
              max="300"
            />
            <Input
              type="number"
              placeholder="최대 점수"
              value={tempFilter.maxScore || ''}
              onChange={(e) => setTempFilter(prev => ({
                ...prev,
                maxScore: e.target.value ? parseInt(e.target.value) : undefined
              }))}
              className="text-sm"
              min="0"
              max="300"
            />
          </div>
        </div>

        {/* Members */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Users className="w-4 h-4" />
            회원 필터
          </label>
          <Input
            placeholder="회원 ID 입력"
            value=""
            onChange={() => {}}
            className="text-sm"
            disabled
          />
          <p className="text-xs text-gray-500">
            회원 선택 기능은 추후 구현 예정
          </p>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">활성 필터:</span>
          
          {filter.dateRange?.from && (
            <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {filter.dateRange.from}부터
              <button
                onClick={() => handleDateRangeChange('from', '')}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {filter.dateRange?.to && (
            <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {filter.dateRange.to}까지
              <button
                onClick={() => handleDateRangeChange('to', '')}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {filter.sessionType?.map(type => (
            <Badge key={type} className={`${getSessionTypeColor(type)} flex items-center gap-1`}>
              <Trophy className="w-3 h-3" />
              {getSessionTypeLabel(type)}
              <button
                onClick={() => handleSessionTypeToggle(type)}
                className="ml-1 hover:opacity-70 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          
          {filter.minScore && (
            <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
              <Target className="w-3 h-3" />
              {filter.minScore}점 이상
              <button
                onClick={() => setTempFilter(prev => ({ ...prev, minScore: undefined }))}
                className="ml-1 hover:bg-green-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          
          {filter.maxScore && (
            <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
              <Target className="w-3 h-3" />
              {filter.maxScore}점 이하
              <button
                onClick={() => setTempFilter(prev => ({ ...prev, maxScore: undefined }))}
                className="ml-1 hover:bg-green-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
        <Button
          variant="primary"
          size="sm"
          onClick={handleApply}
          className="min-w-16"
        >
          적용
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleReset}
          className="min-w-16"
        >
          초기화
        </Button>
        {hasActiveFilters() && (
          <span className="text-xs text-gray-500">
            {Object.keys(filter).length}개의 필터가 적용되어 있습니다
          </span>
        )}
      </div>
    </div>
  )
}

export default GameHistoryFilter