import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { statisticsService } from '../../services/statistics'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface ScoreRecord {
  memberId: string
  memberName: string
  avatarUrl?: string
  score: number
  gameNumber: number
  sessionDate: string
  sessionName?: string
  gapTo200: number
}

interface AlmostPerfectData {
  hallOfFame: ScoreRecord[]
  almostThere: ScoreRecord[]
  soClose: ScoreRecord[]
  stats: {
    perfectCount: number
    almostCount: number
    closeCount: number
    totalHighScores: number
  }
}

type TabType = 'hall-of-fame' | 'almost-there' | 'so-close'

export const AlmostPerfectStats: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('hall-of-fame')

  const { data: almostPerfectData, isLoading, error } = useQuery<AlmostPerfectData>({
    queryKey: ['almost-perfect-stats'],
    queryFn: () => statisticsService.getAlmostPerfectStats(),
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
          아차상 통계를 불러오는 중 오류가 발생했습니다.
        </div>
      </Card>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 200) return 'text-yellow-600'
    if (score >= 190) return 'text-orange-600'
    return 'text-blue-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 220) return { emoji: '🔥', text: '대박!', variant: 'destructive' as const }
    if (score >= 200) return { emoji: '⭐', text: '완벽!', variant: 'default' as const }
    if (score >= 190) return { emoji: '😭', text: '아깝다!', variant: 'secondary' as const }
    return { emoji: '💪', text: '거의!', variant: 'outline' as const }
  }

  const renderScoreList = (records: ScoreRecord[], emptyMessage: string) => {
    if (!records || records.length === 0) {
      return (
        <div className="text-center text-gray-500 py-8">
          {emptyMessage}
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {records.map((record, index) => {
          const badge = getScoreBadge(record.score)
          
          return (
            <div
              key={`${record.memberId}-${record.sessionDate}-${record.gameNumber}`}
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                record.score >= 200 
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                  : record.score >= 190
                    ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200'
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {index === 0 && activeTab === 'hall-of-fame' && <span className="text-2xl">👑</span>}
                    {index === 1 && activeTab === 'hall-of-fame' && <span className="text-2xl">🥈</span>}
                    {index === 2 && activeTab === 'hall-of-fame' && <span className="text-2xl">🥉</span>}
                    {(index > 2 || activeTab !== 'hall-of-fame') && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        record.score >= 200 
                          ? 'bg-yellow-100 text-yellow-700'
                          : record.score >= 190
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-blue-100 text-blue-700'
                      }`}>
                        {index + 1}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900">{record.memberName}</h4>
                      <Badge variant={badge.variant} className="text-xs">
                        {badge.emoji} {badge.text}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>
                        {new Date(record.sessionDate).toLocaleDateString('ko-KR', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })} • {record.gameNumber}게임
                        {record.sessionName && ` • ${record.sessionName}`}
                      </p>
                      {record.gapTo200 > 0 && (
                        <p className="text-xs text-red-500 mt-1">
                          200점까지 {record.gapTo200}점 부족 😢
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(record.score)}`}>
                    {record.score}
                  </div>
                  <div className="text-xs text-gray-500">점</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const tabs = [
    {
      id: 'hall-of-fame' as TabType,
      label: '명예의 전당',
      emoji: '🏆',
      count: almostPerfectData?.stats.perfectCount || 0,
      description: '200점 이상 달성자들'
    },
    {
      id: 'almost-there' as TabType,
      label: '아차상',
      emoji: '😭',
      count: almostPerfectData?.stats.almostCount || 0,
      description: '190-199점 아쉬운 기록들'
    },
    {
      id: 'so-close' as TabType,
      label: '거의 다 왔는데',
      emoji: '💪',
      count: almostPerfectData?.stats.closeCount || 0,
      description: '180-189점 선전 기록들'
    }
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">😭</span>
        <div>
          <h3 className="text-xl font-bold text-gray-900">아차상 - 200점 문턱의 영웅들</h3>
          <p className="text-sm text-gray-600">200점에 가까웠던 아쉬운 순간들과 고득점 기록들</p>
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {almostPerfectData?.stats.perfectCount || 0}
          </div>
          <div className="text-xs text-gray-600">200점 이상</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {almostPerfectData?.stats.almostCount || 0}
          </div>
          <div className="text-xs text-gray-600">190-199점</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {almostPerfectData?.stats.closeCount || 0}
          </div>
          <div className="text-xs text-gray-600">180-189점</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">
            {almostPerfectData?.stats.totalHighScores || 0}
          </div>
          <div className="text-xs text-gray-600">고득점 총 횟수</div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 text-sm"
          >
            <span className="mr-1">{tab.emoji}</span>
            {tab.label} ({tab.count})
          </Button>
        ))}
      </div>

      {/* 선택된 탭의 설명 */}
      <div className="mb-4 text-sm text-gray-600 text-center">
        {tabs.find(tab => tab.id === activeTab)?.description}
      </div>

      {/* 탭별 콘텐츠 */}
      {activeTab === 'hall-of-fame' && renderScoreList(
        almostPerfectData?.hallOfFame || [],
        '아직 200점을 넘은 기록이 없습니다. 도전해보세요! 🎯'
      )}
      
      {activeTab === 'almost-there' && renderScoreList(
        almostPerfectData?.almostThere || [],
        '190점대 기록이 없습니다. 조금만 더 화이팅! 💪'
      )}
      
      {activeTab === 'so-close' && renderScoreList(
        almostPerfectData?.soClose || [],
        '180점대 기록이 없습니다. 고득점을 향해 도전! 🚀'
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>🎯 200점 = 볼링 마스터의 증명!</p>
          <p>💡 190점대는 "한 스트라이크만 더!" 순간들</p>
          <p>⚡ 180점대도 충분히 훌륭한 실력입니다!</p>
        </div>
      </div>
    </Card>
  )
}