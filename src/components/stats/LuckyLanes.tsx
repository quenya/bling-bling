import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { statisticsService } from '../../services/statistics'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface LaneRecord {
  laneNumber: number
  averageScore: number
  totalGames: number
  perfectGames: number
  perfectGameRate: number
  uniqueMembers: number
  uniqueSessions: number
  bestScore: number
  bestScoreMember: string
  luckIndex: number
  rating: string
}

type SortType = 'luck-index' | 'average-score' | 'perfect-rate' | 'total-games'

export const LuckyLanes: React.FC = () => {
  const [sortBy, setSortBy] = useState<SortType>('luck-index')

  const { data: luckyLanes, isLoading, error } = useQuery<LaneRecord[]>({
    queryKey: ['lucky-lanes'],
    queryFn: () => statisticsService.getLuckyLanes(),
    staleTime: 1000 * 60 * 5, // 5분
  })

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          행운의 레인 통계를 불러오는 중 오류가 발생했습니다.
        </div>
      </Card>
    )
  }

  const sortedLanes = luckyLanes ? [...luckyLanes].sort((a, b) => {
    switch (sortBy) {
      case 'luck-index':
        return b.luckIndex - a.luckIndex
      case 'average-score':
        return b.averageScore - a.averageScore
      case 'perfect-rate':
        return b.perfectGameRate - a.perfectGameRate
      case 'total-games':
        return b.totalGames - a.totalGames
      default:
        return b.luckIndex - a.luckIndex
    }
  }) : []

  const getRatingColor = (rating: string) => {
    if (rating.includes('대박')) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    if (rating.includes('행운')) return 'text-green-600 bg-green-50 border-green-200'
    if (rating.includes('좋은')) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (rating.includes('무난')) return 'text-gray-600 bg-gray-50 border-gray-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getRatingEmoji = (index: number, rating: string) => {
    if (index === 0) return '👑'
    if (index === 1) return '🥈'  
    if (index === 2) return '🥉'
    if (rating.includes('대박')) return '🌟'
    if (rating.includes('행운')) return '✨'
    if (rating.includes('좋은')) return '😊'
    if (rating.includes('무난')) return '😐'
    return '😅'
  }

  const sortOptions = [
    { id: 'luck-index' as SortType, label: '행운지수', emoji: '🍀' },
    { id: 'average-score' as SortType, label: '평균점수', emoji: '📊' },
    { id: 'perfect-rate' as SortType, label: '200점이상율', emoji: '⭐' },
    { id: 'total-games' as SortType, label: '총게임수', emoji: '🎳' }
  ]

  const getRecommendation = (lane: LaneRecord) => {
    if (lane.luckIndex >= 160) return "오늘 꼭 이 레인에서 치세요! 🎯" 
    if (lane.luckIndex >= 150) return "이 레인 강력 추천! ⭐"
    if (lane.luckIndex >= 140) return "괜찮은 레인이에요 👍"
    if (lane.luckIndex >= 130) return "평범한 레인입니다 😐"
    return "다른 레인을 고려해보세요 😅"
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🌟</span>
        <div>
          <h3 className="text-xl font-bold text-gray-900">행운의 레인 - 레인별 운세 통계</h3>
          <p className="text-sm text-gray-600">어떤 레인에서 치면 고득점이 나올까요?</p>
        </div>
      </div>

      {!luckyLanes || luckyLanes.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          레인별 통계 데이터가 없습니다.
        </div>
      ) : (
        <>
          {/* 정렬 옵션 */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-sm text-gray-600 self-center mr-2">정렬:</span>
            {sortOptions.map((option) => (
              <Button
                key={option.id}
                variant={sortBy === option.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy(option.id)}
                className="text-xs"
              >
                <span className="mr-1">{option.emoji}</span>
                {option.label}
              </Button>
            ))}
          </div>

          {/* 레인 목록 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            {sortedLanes.map((lane, index) => (
              <div
                key={lane.laneNumber}
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${getRatingColor(lane.rating)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 text-2xl">
                      {getRatingEmoji(index, lane.rating)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-gray-900">
                          {lane.laneNumber}번 레인
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {lane.rating}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {getRecommendation(lane)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold text-purple-600">
                      {lane.luckIndex}
                    </div>
                    <div className="text-xs text-gray-500">행운지수</div>
                  </div>
                </div>

                {/* 상세 통계 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-blue-600">{lane.averageScore}</div>
                    <div className="text-xs text-gray-500">평균점수</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-green-600">{lane.perfectGameRate}%</div>
                    <div className="text-xs text-gray-500">200점이상율</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-orange-600">{lane.totalGames}</div>
                    <div className="text-xs text-gray-500">총게임수</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-purple-600">{lane.uniqueMembers}</div>
                    <div className="text-xs text-gray-500">참여회원</div>
                  </div>
                </div>

                {/* 최고 기록 */}
                <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      🏆 최고 기록: <span className="font-bold">{lane.bestScore}점</span>
                    </span>
                    <span className="font-medium text-gray-700">
                      {lane.bestScoreMember}
                    </span>
                  </div>
                  {lane.perfectGames > 0 && (
                    <div className="text-xs text-gray-600 mt-1">
                      ⭐ 200점 이상 달성: {lane.perfectGames}회
                    </div>
                  )}
                </div>

                {/* 행운 지수 바 */}
                <div className="mt-3 pt-2 border-t border-current border-opacity-20">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>행운 지수</span>
                    <span>{lane.luckIndex}/200</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        lane.luckIndex >= 160 ? 'bg-yellow-400' :
                        lane.luckIndex >= 150 ? 'bg-green-400' :
                        lane.luckIndex >= 140 ? 'bg-blue-400' :
                        lane.luckIndex >= 130 ? 'bg-gray-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${Math.min((lane.luckIndex / 200) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 하단 설명 */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center text-xs text-gray-500 space-y-1">
              <p>🍀 행운지수 = 평균점수 + (200점이상율 × 2)</p>
              <p>🎯 160이상: 대박레인, 150이상: 행운레인, 140이상: 좋은레인</p>
              <p>📊 더 많은 데이터가 쌓일수록 정확해집니다!</p>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}