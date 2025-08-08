import React, { useMemo, useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Trophy, 
  Target,
  Calendar,
  Hash,
  SortAsc,
  SortDesc,
  BarChart3
} from 'lucide-react'
import { Card, CardHeader, CardBody } from '../ui/Card'
import { Button } from '../ui/Button'
import { useRecentGamesAverages } from '../../hooks/queries/useGameHistory'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { RecentGamesAverage } from '../../types/bowling'

type SortField = 'average' | 'name' | 'games' | 'trend'
type SortOrder = 'asc' | 'desc'

interface RecentGamesAverageProps {
  gameCount?: number
}

const RecentGamesAverageComponent: React.FC<RecentGamesAverageProps> = ({
  gameCount = 20
}) => {
  const { data: recentAverages = [], isLoading, error } = useRecentGamesAverages(gameCount)
  const [sortField, setSortField] = useState<SortField>('average')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // 정렬된 데이터
  const sortedAverages = useMemo(() => {
    const sorted = [...recentAverages].sort((a: RecentGamesAverage, b: RecentGamesAverage) => {
      let aValue: number | string
      let bValue: number | string

      switch (sortField) {
        case 'average':
          aValue = a.recentAverage
          bValue = b.recentAverage
          break
        case 'name':
          aValue = a.member.name
          bValue = b.member.name
          break
        case 'games':
          aValue = a.recentGames
          bValue = b.recentGames
          break
        case 'trend':
          aValue = a.trendPercentage || 0
          bValue = b.trendPercentage || 0
          break
        default:
          aValue = a.recentAverage
          bValue = b.recentAverage
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue, 'ko')
          : bValue.localeCompare(aValue, 'ko')
      }

      return sortOrder === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number)
    })

    return sorted
  }, [recentAverages, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder(field === 'name' ? 'asc' : 'desc')
    }
  }

  const renderTrendIcon = (trend?: 'up' | 'down' | 'stable', percentage?: number) => {
    if (!trend) return null

    switch (trend) {
      case 'up':
        return (
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="w-4 h-4" />
            {percentage && <span className="text-xs">+{percentage.toFixed(1)}%</span>}
          </div>
        )
      case 'down':
        return (
          <div className="flex items-center gap-1 text-red-600">
            <TrendingDown className="w-4 h-4" />
            {percentage && <span className="text-xs">-{percentage.toFixed(1)}%</span>}
          </div>
        )
      case 'stable':
        return (
          <div className="flex items-center gap-1 text-gray-500">
            <Minus className="w-4 h-4" />
            <span className="text-xs">±{percentage?.toFixed(1) || 0}%</span>
          </div>
        )
    }
  }

  const renderSortButton = (field: SortField, label: string, icon: React.ElementType) => {
    const Icon = icon
    const isActive = sortField === field
    
    return (
      <Button
        key={field}
        variant={isActive ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => handleSort(field)}
        className="flex items-center gap-1"
      >
        <Icon className="w-3 h-3" />
        <span className="hidden sm:inline">{label}</span>
        {isActive && (
          sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
        )}
      </Button>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">최근 {gameCount}게임 평균</h2>
              <p className="text-gray-600">회원별 최근 게임 성과를 확인하세요</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardBody>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            데이터를 불러올 수 없습니다
          </h3>
          <p className="text-gray-600">
            {error.message || '알 수 없는 오류가 발생했습니다.'}
          </p>
        </CardBody>
      </Card>
    )
  }

  if (sortedAverages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">최근 {gameCount}게임 평균</h2>
              <p className="text-gray-600">회원별 최근 게임 성과를 확인하세요</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            게임 데이터가 없습니다
          </h3>
          <p className="text-gray-600">
            최근 게임 기록이 없거나 충분하지 않습니다.
          </p>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">최근 {gameCount}게임 평균</h2>
              <p className="text-gray-600">회원별 최근 게임 성과를 확인하세요</p>
            </div>
          </div>
          
          {/* 정렬 버튼 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 hidden sm:inline">정렬:</span>
            <div className="flex gap-1">
              {renderSortButton('average', '평균', Target)}
              {renderSortButton('name', '이름', Hash)}
              {renderSortButton('games', '게임수', Calendar)}
              {renderSortButton('trend', '트렌드', TrendingUp)}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardBody>
        <div className="space-y-3">
          {sortedAverages.map((data, index) => (
            <div
              key={data.member.id}
              className={`p-4 rounded-lg border transition-colors ${
                index < 3 
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* 순위 */}
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                    index === 0 
                      ? 'bg-yellow-500 text-white'
                      : index === 1
                      ? 'bg-gray-400 text-white'
                      : index === 2
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index < 3 ? <Trophy className="w-4 h-4" /> : index + 1}
                  </div>

                  {/* 회원 정보 */}
                  <div className="flex items-center gap-3">
                    {data.member.avatar_url ? (
                      <img
                        src={data.member.avatar_url}
                        alt={data.member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        {data.member.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{data.member.name}</div>
                      <div className="text-sm text-gray-500">
                        최근 {data.recentGames}게임 / 총 {data.totalGames}게임
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* 트렌드 */}
                  <div className="text-center">
                    {renderTrendIcon(data.trend, data.trendPercentage)}
                    <div className="text-xs text-gray-500 mt-1">트렌드</div>
                  </div>

                  {/* 평균 점수 */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {data.recentAverage.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-500">평균</div>
                  </div>
                </div>
              </div>

              {/* 마지막 게임 날짜 */}
              {data.lastSessionDate && (
                <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  마지막 게임: {format(new Date(data.lastSessionDate), 'yyyy년 M월 d일', { locale: ko })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 통계 요약 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">
                {sortedAverages.length}명
              </div>
              <div className="text-sm text-gray-600">총 회원</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {(sortedAverages.reduce((sum, data) => sum + data.recentAverage, 0) / sortedAverages.length).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">전체 평균</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {Math.max(...sortedAverages.map(data => data.recentAverage)).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">최고 평균</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {sortedAverages.filter(data => data.trend === 'up').length}명
              </div>
              <div className="text-sm text-gray-600">상승 트렌드</div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export default RecentGamesAverageComponent
