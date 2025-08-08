import React from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { 
  Calendar, 
  Trophy, 
  Users, 
  Target,
  ChevronDown,
  ChevronUp,
  Star,
  MapPin,
  Hash,
  TrendingUp
} from 'lucide-react'
import { Card, CardBody, CardHeader } from '../ui/Card'
import { useDateGroupedGameHistory } from '../../hooks/queries/useGameHistory'
import type { DateGroupedSession } from '../../types/bowling'

type GameType = 'all' | 'mini' | 'large'

interface DateGroupedGameHistoryProps {
  dateGroups?: DateGroupedSession[]
  loading?: boolean
}

export const DateGroupedGameHistory: React.FC<DateGroupedGameHistoryProps> = ({
  dateGroups: propDateGroups,
  loading: propLoading
}) => {
  // 직접 데이터를 가져오되, props로 전달된 경우 우선 사용
  const { 
    data: fetchedDateGroups = [], 
    isLoading: fetchLoading 
  } = useDateGroupedGameHistory({ limit: 1000 })

  const allDateGroups = propDateGroups || fetchedDateGroups
  const loading = propLoading !== undefined ? propLoading : fetchLoading

  const [expandedDates, setExpandedDates] = React.useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = React.useState<GameType>('all')

  // 탭에 따른 데이터 필터링
  const dateGroups = React.useMemo(() => {
    if (activeTab === 'all') {
      return allDateGroups
    }
    
    return allDateGroups.map(dateGroup => {
      const filteredSessions = dateGroup.sessions.filter(session => {
        const sessionName = session.sessionName?.toLowerCase() || ''
        if (activeTab === 'mini') {
          return sessionName.includes('미니게임')
        } else if (activeTab === 'large') {
          return sessionName.includes('라지게임')
        }
        return true
      })
      
      if (filteredSessions.length === 0) {
        return null
      }
      
      // 필터링된 세션들로 통계 재계산
      const allResults = filteredSessions.flatMap(session => session.results)
      const totalAverage = allResults.length > 0 
        ? allResults.reduce((sum, result) => sum + result.average, 0) / allResults.length 
        : 0
      
      const champion = allResults.reduce((best, current) => 
        current.average > best.average ? current : best
      , { member: { id: '', name: '' }, average: 0 })
      
      return {
        ...dateGroup,
        sessions: filteredSessions,
        dateStats: {
          ...dateGroup.dateStats,
          totalSessions: filteredSessions.length,
          totalParticipants: new Set(allResults.map(r => r.member.id)).size,
          averageScore: totalAverage,
          champion: {
            id: champion.member.id,
            name: champion.member.name,
            average: champion.average
          }
        }
      }
    }).filter(Boolean) as DateGroupedSession[]
  }, [allDateGroups, activeTab])

  const toggleDateExpansion = (date: string) => {
    const newExpanded = new Set(expandedDates)
    if (newExpanded.has(date)) {
      newExpanded.delete(date)
    } else {
      newExpanded.add(date)
    }
    setExpandedDates(newExpanded)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  if (dateGroups.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          게임 기록이 없습니다
        </h3>
        <p className="text-gray-600">
          아직 등록된 게임 기록이 없습니다.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            전체
            <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
              {allDateGroups.length}일 ({allDateGroups.reduce((sum, group) => sum + group.sessions.length, 0)}게임)
            </span>
          </button>
          <button
            onClick={() => setActiveTab('mini')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'mini'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            미니게임
            <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
              {allDateGroups.filter(group => 
                group.sessions.some(s => s.sessionName?.includes('미니게임'))
              ).length}일 ({allDateGroups.reduce((sum, group) => 
                sum + group.sessions.filter(s => s.sessionName?.includes('미니게임')).length, 0
              )}게임)
            </span>
          </button>
          <button
            onClick={() => setActiveTab('large')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'large'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            라지게임
            <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
              {allDateGroups.filter(group => 
                group.sessions.some(s => s.sessionName?.includes('라지게임'))
              ).length}일 ({allDateGroups.reduce((sum, group) => 
                sum + group.sessions.filter(s => s.sessionName?.includes('라지게임')).length, 0
              )}게임)
            </span>
          </button>
        </nav>
      </div>

      {/* 게임 히스토리 내용 */}
      <div className="space-y-4">
        {dateGroups.map((dateGroup) => {
        const isExpanded = expandedDates.has(dateGroup.date)
        const formattedDate = format(new Date(dateGroup.date), 'yyyy년 M월 d일 (EEEE)', { locale: ko })

        return (
          <Card key={dateGroup.date} className="overflow-hidden">
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleDateExpansion(dateGroup.date)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {formattedDate}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {dateGroup.dateStats.totalParticipants}명 참여
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        평균 {dateGroup.dateStats.averageScore.toFixed(1)}점
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        {dateGroup.dateStats.champion.name} ({dateGroup.dateStats.champion.average.toFixed(1)}점)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {dateGroup.dateStats.totalSessions}개 세션
                    </div>
                    <div className="text-xs text-gray-500">
                      클릭하여 {isExpanded ? '접기' : '상세보기'}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </CardHeader>

            {isExpanded && (
              <CardBody className="border-t border-gray-200">
                <div className="grid gap-6">
                  {/* 세션별 상세 정보 */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Hash className="w-4 h-4 text-blue-500" />
                      세션별 상세 정보 ({dateGroup.sessions.length}개 세션)
                    </h4>
                    <div className="grid gap-4">
                      {dateGroup.sessions
                        .sort((a, b) => {
                          const avgA = a.results.reduce((sum, r) => sum + r.average, 0) / a.results.length
                          const avgB = b.results.reduce((sum, r) => sum + r.average, 0) / b.results.length
                          return avgB - avgA // 레인별 평균점수 내림차순 정렬
                        })
                        .map((session, sessionIndex) => {
                        const sessionAverage = session.results.reduce((sum, r) => sum + r.average, 0) / session.results.length
                        const sessionHighest = Math.max(...session.results.flatMap(r => r.scores))
                        
                        return (
                          <div key={session.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                  <Hash className="w-3 h-3" />
                                  레인 {session.laneNumber || sessionIndex + 1}
                                </div>
                                {session.sessionName && (
                                  <span className="text-gray-700 font-medium">{session.sessionName}</span>
                                )}
                                {session.location && (
                                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                                    <MapPin className="w-3 h-3" />
                                    {session.location}
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-500">레인 평균</div>
                                <div className="font-semibold text-blue-600 flex items-center gap-1">
                                  <TrendingUp className="w-4 h-4" />
                                  {sessionAverage.toFixed(1)}점
                                </div>
                              </div>
                            </div>
                            
                            {/* 해당 세션의 모든 참가자 점수 */}
                            <div className="space-y-3">
                              <h5 className="font-medium text-gray-800 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                참가자 ({session.results.length}명)
                              </h5>
                              <div className="grid gap-3">
                                {session.results
                                  .sort((a, b) => b.average - a.average) // 평균 점수 순으로 정렬
                                  .map((result, resultIndex) => (
                                  <div key={result.member.id} className={`flex items-center justify-between p-3 rounded-lg ${
                                    resultIndex === 0 ? 'bg-yellow-50 border border-yellow-200' :
                                    resultIndex === 1 ? 'bg-gray-50 border border-gray-200' :
                                    resultIndex === 2 ? 'bg-orange-50 border border-orange-200' :
                                    'bg-gray-50 border border-gray-100'
                                  }`}>
                                    <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                        resultIndex === 0 ? 'bg-yellow-400 text-yellow-900' :
                                        resultIndex === 1 ? 'bg-gray-400 text-gray-900' :
                                        resultIndex === 2 ? 'bg-orange-400 text-orange-900' :
                                        'bg-blue-100 text-blue-800'
                                      }`}>
                                        {resultIndex + 1}
                                      </div>
                                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                        {result.member.name.charAt(0)}
                                      </div>
                                      <div>
                                        <div className="font-medium text-gray-900">{result.member.name}</div>
                                        <div className="text-sm text-gray-600">
                                          게임별 점수: {result.scores.join(', ')}점
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-semibold text-gray-900 text-lg">{result.average.toFixed(1)}점</div>
                                      <div className="text-sm text-gray-500">평균</div>
                                      {Math.max(...result.scores) === sessionHighest && (
                                        <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                                          <Star className="w-3 h-3" />
                                          최고점수
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 전체 게임 결과 */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      이날의 전체 순위
                    </h4>
                    
                    {/* 모든 세션의 결과를 하나로 합쳐서 표시 */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                      {(() => {
                        // 모든 세션의 결과를 합치고 멤버별로 그룹화
                        const allResults = dateGroup.sessions.flatMap(session => session.results)
                        const memberResults = new Map<string, {
                          member: { id: string, name: string, avatar_url?: string }
                          allScores: number[]
                          totalGames: number
                          average: number
                          sessions: string[]
                          sessionDetails: Array<{sessionName: string, laneNumber?: number, scores: number[], average: number}>
                        }>()

                        // 멤버별 데이터 집계
                        allResults.forEach(result => {
                          const memberId = result.member.id
                          if (!memberResults.has(memberId)) {
                            memberResults.set(memberId, {
                              member: result.member,
                              allScores: [],
                              totalGames: 0,
                              average: 0,
                              sessions: [],
                              sessionDetails: []
                            })
                          }
                          
                          const memberData = memberResults.get(memberId)!
                          memberData.allScores.push(...result.scores)
                          memberData.totalGames += result.scores.length
                          
                          // 세션 정보 추가
                          const session = dateGroup.sessions.find(s => 
                            s.results.some(r => r.member.id === memberId && r.scores === result.scores)
                          )
                          
                          const sessionName = session?.sessionName || '세션'
                          if (!memberData.sessions.includes(sessionName)) {
                            memberData.sessions.push(sessionName)
                          }
                          
                          memberData.sessionDetails.push({
                            sessionName: sessionName,
                            laneNumber: session?.laneNumber,
                            scores: result.scores,
                            average: result.average
                          })
                        })

                        // 평균 계산 및 정렬
                        const sortedResults = Array.from(memberResults.values())
                          .map(memberData => {
                            memberData.average = memberData.allScores.reduce((sum, score) => sum + score, 0) / memberData.allScores.length
                            return memberData
                          })
                          .sort((a, b) => b.average - a.average)

                        return (
                          <div className="space-y-4">
                            {/* 헤더 */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="text-lg font-semibold text-gray-900">
                                🏆 종합 순위 (상위 3위)
                              </div>
                              <div className="text-sm text-gray-600">
                                총 {sortedResults.length}명 참여 • 전체 평균 {dateGroup.dateStats.averageScore.toFixed(1)}점
                              </div>
                            </div>

                            {/* 순위 목록 */}
                            <div className="space-y-3">
                              {sortedResults.slice(0, 3).map((memberData, index) => (
                                <div 
                                  key={memberData.member.id}
                                  className={`p-4 rounded-lg border-2 ${
                                    index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-400 shadow-lg' :
                                    index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-400 shadow-md' :
                                    index === 2 ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-400 shadow-md' :
                                    'bg-white border-gray-200 shadow-sm'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-4">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                        index === 1 ? 'bg-gray-400 text-gray-900' :
                                        index === 2 ? 'bg-orange-400 text-orange-900' :
                                        'bg-blue-100 text-blue-800'
                                      }`}>
                                        {index + 1}
                                      </div>
                                      <div>
                                        <div className="text-xl font-bold text-gray-900">
                                          {memberData.member.name}
                                          {index === 0 && <span className="ml-2 text-yellow-600">👑</span>}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          참여 세션: {memberData.sessions.join(', ')}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-2xl font-bold text-gray-900">
                                        {memberData.average.toFixed(1)}점
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        총 {memberData.totalGames}게임 평균
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* 세션별 상세 점수 */}
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <div className="grid gap-2">
                                      {memberData.sessionDetails.map((detail, detailIndex) => (
                                        <div key={detailIndex} className="flex items-center justify-between text-sm">
                                          <div className="flex items-center gap-2">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                              레인 {detail.laneNumber || '?'}
                                            </span>
                                            <span className="text-gray-600">{detail.sessionName}</span>
                                          </div>
                                          <div className="text-right">
                                            <div className="font-medium text-gray-900">
                                              평균 {detail.average.toFixed(1)}점
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              게임별: {detail.scores.join(', ')}점
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </CardBody>
            )}
          </Card>
        )
      })}
      </div>
    </div>
  )
}

export default DateGroupedGameHistory