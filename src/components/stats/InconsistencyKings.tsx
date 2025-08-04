import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { statisticsService } from '../../services/statistics'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface InconsistencyRecord {
  memberId: string
  memberName: string
  avatarUrl?: string
  totalGames: number
  averageScore: number
  standardDeviation: number
  highestScore: number
  lowestScore: number
  scoreRange: number
  unpredictabilityIndex: number
}

export const InconsistencyKings: React.FC = () => {
  const { data: inconsistencyKings, isLoading, error } = useQuery({
    queryKey: ['inconsistency-kings'],
    queryFn: () => statisticsService.getInconsistencyKings(),
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
          일관성 제로왕 통계를 불러오는 중 오류가 발생했습니다.
        </div>
      </Card>
    )
  }

  const getRollercoasterLevel = (standardDeviation: number) => {
    if (standardDeviation >= 35) return { emoji: '🌪️', level: '토네이도급', color: 'destructive' }
    if (standardDeviation >= 30) return { emoji: '🎢', level: '롤러코스터', color: 'default' }
    if (standardDeviation >= 25) return { emoji: '🎠', level: '회전목마', color: 'secondary' }
    if (standardDeviation >= 20) return { emoji: '🚂', level: '기차', color: 'outline' }
    return { emoji: '🚶', level: '산책', color: 'outline' }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🎢</span>
        <div>
          <h3 className="text-xl font-bold text-gray-900">일관성 제로왕 - 점수 롤러코스터</h3>
          <p className="text-sm text-gray-600">게임마다 점수 편차가 가장 큰 예측불가 플레이어들</p>
        </div>
      </div>

      {!inconsistencyKings || inconsistencyKings.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          통계를 계산할 데이터가 부족합니다. (최소 5게임 필요)
        </div>
      ) : (
        <div className="space-y-4">
          {inconsistencyKings.map((record: InconsistencyRecord, index: number) => {
            const rollercoaster = getRollercoasterLevel(record.standardDeviation)
            
            return (
              <div
                key={record.memberId}
                className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {index === 0 && <span className="text-2xl">👑</span>}
                      {index === 1 && <span className="text-2xl">🥈</span>}
                      {index === 2 && <span className="text-2xl">🥉</span>}
                      {index > 2 && (
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-purple-700">
                          {index + 1}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900">{record.memberName}</h4>
                        <Badge 
                          variant={rollercoaster.color as any}
                          className="text-xs"
                        >
                          {rollercoaster.emoji} {rollercoaster.level}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>총 {record.totalGames}게임 • 평균 {record.averageScore}점</p>
                        <p className="text-xs">
                          예측불가지수: {record.unpredictabilityIndex}% 
                          <span className="text-gray-400 ml-1">(변동계수)</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">
                      ±{record.standardDeviation}
                    </div>
                    <div className="text-xs text-gray-500">표준편차</div>
                  </div>
                </div>

                {/* 점수 범위 시각화 */}
                <div className="mt-4 pt-3 border-t border-purple-200">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                    <span>점수 범위: {record.scoreRange}점 차이</span>
                    <span>{rollercoaster.emoji} 변동성</span>
                  </div>
                  
                  <div className="relative">
                    {/* 점수 범위 바 */}
                    <div className="h-6 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full relative overflow-hidden">
                      {/* 평균 점수 마커 */}
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-purple-600 opacity-80"
                        style={{ 
                          left: `${((record.averageScore - record.lowestScore) / record.scoreRange) * 100}%` 
                        }}
                      />
                    </div>
                    
                    {/* 점수 레이블 */}
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-red-600 font-mono">
                        최저: {record.lowestScore}
                      </span>
                      <span className="text-purple-600 font-mono">
                        평균: {record.averageScore}
                      </span>
                      <span className="text-green-600 font-mono">
                        최고: {record.highestScore}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 재미있는 평가 */}
                <div className="mt-3 pt-2 border-t border-purple-100">
                  <div className="text-xs text-purple-600 text-center font-medium">
                    {record.standardDeviation >= 35 && "🌪️ 내일 점수를 예측하는 것은 불가능!"}
                    {record.standardDeviation >= 30 && record.standardDeviation < 35 && "🎢 오늘은 고득점? 저득점? 아무도 모른다!"}
                    {record.standardDeviation >= 25 && record.standardDeviation < 30 && "🎠 점수가 빙글빙글 돌아가네요"}
                    {record.standardDeviation >= 20 && record.standardDeviation < 25 && "🚂 꾸준히 흔들리는 기차같은 실력"}
                    {record.standardDeviation < 20 && "🚶 의외로 안정적인 플레이어"}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>💡 표준편차가 클수록 점수 변동이 큰 예측불가능한 플레이어</p>
          <p>🎯 예측불가지수 = (표준편차 ÷ 평균점수) × 100</p>
        </div>
      </div>
    </Card>
  )
}