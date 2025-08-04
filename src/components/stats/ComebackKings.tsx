import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { statisticsService } from '../../services/statistics'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface ComebackRecord {
  memberId: string
  memberName: string
  avatarUrl?: string
  sessionDate: string
  sessionName?: string
  game1Score: number
  game3Score: number
  improvement: number
  improvementRate: number
  allScores: number[]
}

export const ComebackKings: React.FC = () => {
  const { data: comebackKings, isLoading, error } = useQuery({
    queryKey: ['comeback-kings'],
    queryFn: () => statisticsService.getComebackKings(),
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
          컴백왕 통계를 불러오는 중 오류가 발생했습니다.
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🎭</span>
        <div>
          <h3 className="text-xl font-bold text-gray-900">컴백왕 - 역전의 드라마왕</h3>
          <p className="text-sm text-gray-600">1게임 대비 3게임에서 가장 큰 상승을 보인 회원들</p>
        </div>
      </div>

      {!comebackKings || comebackKings.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          아직 컴백 기록이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {comebackKings.map((record: ComebackRecord, index: number) => (
            <div
              key={`${record.memberId}-${record.sessionDate}`}
              className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {index === 0 && <span className="text-2xl">👑</span>}
                    {index === 1 && <span className="text-2xl">🥈</span>}
                    {index === 2 && <span className="text-2xl">🥉</span>}
                    {index > 2 && (
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm font-bold text-orange-700">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900">{record.memberName}</h4>
                      <Badge 
                        variant={record.improvement >= 50 ? 'destructive' : record.improvement >= 30 ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        +{record.improvement}점
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(record.sessionDate).toLocaleDateString('ko-KR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                      {record.sessionName && ` • ${record.sessionName}`}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm font-mono">
                    <span className="text-gray-500">{record.game1Score}</span>
                    <span className="text-orange-500">→</span>
                    <span className="text-green-600 font-bold">{record.game3Score}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    상승률: +{record.improvementRate}%
                  </div>
                </div>
              </div>

              {/* 3게임 점수 변화 그래프 */}
              <div className="mt-4 pt-3 border-t border-orange-200">
                <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                  <span>게임별 점수:</span>
                </div>
                <div className="flex items-end gap-1 h-12">
                  {record.allScores.map((score, gameIndex) => {
                    const maxScore = Math.max(...record.allScores)
                    const height = (score / maxScore) * 100
                    const isImprovement = gameIndex > 0 && score > record.allScores[gameIndex - 1]
                    
                    return (
                      <div
                        key={gameIndex}
                        className="flex-1 flex flex-col items-center"
                      >
                        <div
                          className={`w-full rounded-t ${
                            gameIndex === 0 
                              ? 'bg-red-300' 
                              : gameIndex === 2 
                                ? 'bg-green-400' 
                                : 'bg-yellow-300'
                          } transition-all`}
                          style={{ height: `${height}%` }}
                        />
                        <div className="text-xs mt-1 font-mono">
                          {score}
                          {isImprovement && (
                            <span className="text-green-500 ml-1">↗</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-center text-xs text-gray-500">
          💡 컴백의 정의: 1게임 대비 3게임에서 점수가 상승한 경우만 집계
        </div>
      </div>
    </Card>
  )
}