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
  Award
} from 'lucide-react'
import { Card, CardBody, CardHeader } from '../ui/Card'
import type { DateGroupedSession } from '../../types/bowling'

interface DateGroupedGameHistoryProps {
  dateGroups: DateGroupedSession[]
  loading?: boolean
}

export const DateGroupedGameHistory: React.FC<DateGroupedGameHistoryProps> = ({
  dateGroups,
  loading
}) => {
  const [expandedDates, setExpandedDates] = React.useState<Set<string>>(new Set())

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
                  {/* 레인별 팀 순위 */}
                  {dateGroup.dateStats.teamStats && dateGroup.dateStats.teamStats.length > 0 && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-yellow-500" />
                        레인별 팀 순위 ({dateGroup.dateStats.teamStats.length}개 레인)
                      </h4>
                      <div className="grid gap-3">
                        {dateGroup.dateStats.teamStats
                          .sort((a, b) => b.teamAverage - a.teamAverage)
                          .map((team, index) => (
                          <div 
                            key={`${team.teamName}-${index}`}
                            className={`p-4 rounded-lg border ${
                              index === 0 ? 'bg-yellow-50 border-yellow-300 shadow-md' :
                              index === 1 ? 'bg-gray-50 border-gray-300' :
                              index === 2 ? 'bg-orange-50 border-orange-300' :
                              'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                  index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                  index === 1 ? 'bg-gray-400 text-gray-900' :
                                  index === 2 ? 'bg-orange-400 text-orange-900' :
                                  'bg-blue-400 text-blue-900'
                                }`}>
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">
                                    {team.teamName}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {team.members.length}명 참여 • {team.sessionCount || 1}세션
                                  </div>
                                  <div className="text-sm font-bold text-blue-600">
                                    팀 평균: {team.teamAverage.toFixed(1)}점
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">
                                  평균 {team.teamAverage.toFixed(1)}점
                                </div>
                                <div className="text-sm text-gray-600">
                                  총 {team.totalGames}게임
                                </div>
                              </div>
                            </div>
                            
                            {/* 레인 참가자 목록 */}
                            <div>
                              <div className="text-sm font-medium text-gray-700 mb-2">참가자</div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                {team.members.map((member, memberIndex) => {
                                  const diffFromTeamAvg = member.average - team.teamAverage
                                  return (
                                    <div 
                                      key={`${member.id}-${memberIndex}`}
                                      className="px-2 py-1 bg-white rounded border border-gray-200"
                                    >
                                      <div className="font-medium text-gray-900 text-xs">
                                        {member.name}
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        {member.average.toFixed(1)}점
                                      </div>
                                      <div className={`text-xs ${
                                        diffFromTeamAvg > 0 ? 'text-green-600' : 
                                        diffFromTeamAvg < 0 ? 'text-red-600' : 'text-gray-500'
                                      }`}>
                                        {diffFromTeamAvg > 0 ? '+' : ''}{diffFromTeamAvg.toFixed(1)}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 전체 게임 결과 */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-blue-500" />
                      전체 게임 결과 ({dateGroup.sessions.length}개 세션)
                    </h4>
                    
                    {/* 모든 세션의 결과를 하나로 합쳐서 표시 */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {(() => {
                        // 모든 세션의 결과를 합치고 멤버별로 그룹화
                        const allResults = dateGroup.sessions.flatMap(session => session.results)
                        const memberResults = new Map<string, {
                          member: { id: string, name: string, avatar_url?: string }
                          allScores: number[]
                          totalGames: number
                          average: number
                          sessions: string[]
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
                              sessions: []
                            })
                          }
                          
                          const memberData = memberResults.get(memberId)!
                          memberData.allScores.push(...result.scores)
                          memberData.totalGames += result.scores.length
                          
                          // 세션 이름 추가 (중복 방지)
                          const sessionName = dateGroup.sessions.find(s => 
                            s.results.some(r => r.member.id === memberId)
                          )?.sessionName || '세션'
                          if (!memberData.sessions.includes(sessionName)) {
                            memberData.sessions.push(sessionName)
                          }
                        })

                        // 평균 계산 및 정렬
                        const sortedResults = Array.from(memberResults.values())
                          .map(memberData => {
                            memberData.average = memberData.allScores.reduce((sum, score) => sum + score, 0) / memberData.allScores.length
                            return memberData
                          })
                          .sort((a, b) => b.average - a.average)

                        return (
                          <div className="space-y-3">
                            {/* 헤더 */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="text-lg font-semibold text-gray-900">
                                이날의 전체 순위
                              </div>
                              <div className="text-sm text-gray-600">
                                총 {sortedResults.length}명 참여
                              </div>
                            </div>

                            {/* 순위 목록 */}
                            <div className="grid gap-3">
                              {sortedResults.map((memberData, index) => (
                                <div 
                                  key={memberData.member.id}
                                  className={`p-4 rounded-lg border ${
                                    index === 0 ? 'bg-yellow-50 border-yellow-300 shadow-md' :
                                    index === 1 ? 'bg-gray-50 border-gray-300' :
                                    index === 2 ? 'bg-orange-50 border-orange-300' :
                                    'bg-white border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                        index === 1 ? 'bg-gray-400 text-gray-900' :
                                        index === 2 ? 'bg-orange-400 text-orange-900' :
                                        'bg-blue-100 text-blue-800'
                                      }`}>
                                        {index + 1}
                                      </div>
                                      <div>
                                        <div className="font-semibold text-gray-900">
                                          {memberData.member.name}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          {memberData.sessions.join(', ')} 참여
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-gray-900">
                                        평균 {memberData.average.toFixed(1)}점
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {memberData.totalGames}게임
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        개별 점수: {memberData.allScores.join(', ')}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* 세션별 요약 */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                              <h5 className="font-medium text-gray-900 mb-3">세션별 요약</h5>
                              <div className="grid gap-2">
                                {dateGroup.sessions.map((session) => {
                                  const sessionAverage = session.results.reduce((sum, r) => sum + r.average, 0) / session.results.length
                                  return (
                                    <div key={session.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                      <div className="text-sm">
                                        <span className="font-medium">{session.sessionName || '세션'}</span>
                                        {session.location && <span className="text-gray-600"> • {session.location}</span>}
                                        {session.laneNumber && <span className="text-gray-600"> • {session.laneNumber}레인</span>}
                                      </div>
                                      <div className="text-sm">
                                        <span className="font-medium text-gray-900">평균 {sessionAverage.toFixed(1)}점</span>
                                        <span className="text-gray-600 ml-2">({session.totalParticipants}명)</span>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
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
  )
}

export default DateGroupedGameHistory