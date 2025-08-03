import React from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { 
  Trophy, 
  Crown, 
  Target, 
  Users, 
  TrendingUp, 
  Star,
  Award,
  Zap,
  Calendar,
  MapPin,
  Medal
} from 'lucide-react'
import { Card, CardHeader, CardBody } from '../ui/Card'
import { Badge } from '../ui/Badge'
import type { SessionHighlight, HighlightsSummary } from '../../types/bowling'

interface GameHistoryHighlightsProps {
  highlights: HighlightsSummary
  recentSessions?: SessionHighlight[]
  showAll?: boolean
}

const GameHistoryHighlights: React.FC<GameHistoryHighlightsProps> = ({
  highlights,
  recentSessions = [],
  showAll = false
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'M월 d일 (eee)', { locale: ko })
  }

  const getSessionTypeColor = (type: string) => {
    const colors = {
      regular: 'bg-blue-100 text-blue-800',
      tournament: 'bg-red-100 text-red-800',
      practice: 'bg-green-100 text-green-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getSessionTypeLabel = (type: string) => {
    const labels = {
      regular: '정기모임',
      tournament: '토너먼트',
      practice: '연습게임'
    }
    return labels[type as keyof typeof labels] || type
  }

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case 'first_200':
        return <Target className="w-4 h-4 text-red-500" />
      case 'perfect_game':
        return <Star className="w-4 h-4 text-yellow-500" />
      case 'attendance_milestone':
        return <Calendar className="w-4 h-4 text-blue-500" />
      case 'improvement_milestone':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      default:
        return <Award className="w-4 h-4 text-purple-500" />
    }
  }

  const sessionsToShow = showAll ? recentSessions : recentSessions.slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Recent Session Highlights */}
      {sessionsToShow.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-bold text-gray-900">최근 게임 하이라이트</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {sessionsToShow.map((session, index) => (
              <Card key={session.date} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-gray-900">
                        {formatDate(session.date)}
                      </span>
                    </div>
                    <Badge className={getSessionTypeColor(session.sessionType)}>
                      {getSessionTypeLabel(session.sessionType)}
                    </Badge>
                  </div>
                  
                  {session.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span>{session.location}</span>
                      {session.laneNumber && <span>• {session.laneNumber}레인</span>}
                    </div>
                  )}
                </CardHeader>

                <CardBody className="space-y-4">
                  {/* Champion */}
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Crown className="w-6 h-6 text-yellow-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        🏆 {session.champion.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        평균 {session.champion.average.toFixed(1)}점
                        {session.champion.improvement && session.champion.improvement > 0 && (
                          <span className="ml-2 text-green-600">
                            (+{session.champion.improvement.toFixed(1)})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Top Score */}
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <Target className="w-6 h-6 text-red-600" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        🎯 최고 점수: {session.topScore.score}점
                      </div>
                      <div className="text-sm text-gray-600">
                        {session.topScore.name} • {session.topScore.gameNumber}게임
                      </div>
                    </div>
                  </div>

                  {/* Best Team */}
                  {session.bestTeam && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          👥 베스트 팀 (평균 {session.bestTeam.totalAverage.toFixed(1)}점)
                        </div>
                        <div className="text-sm text-gray-600">
                          {session.bestTeam.members.map(m => m.name).join(', ')}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Special Achievements */}
                  {session.specialAchievements.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">🏅 특별 업적</div>
                      <div className="space-y-1">
                        {session.specialAchievements.map((achievement, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <Award className="w-3 h-3 text-purple-500" />
                            <span className="font-medium">{achievement.memberName}</span>
                            <span className="text-gray-600">• {achievement.achievement}</span>
                            {achievement.value && (
                              <span className="text-purple-600">({achievement.value})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Session Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {session.sessionStats.averageScore.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-600">세션 평균</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {session.sessionStats.totalStrikes}
                      </div>
                      <div className="text-xs text-gray-600">총 스트라이크</div>
                    </div>
                  </div>
                </CardBody>

                {/* Position Badge */}
                {index < 3 && (
                  <div className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    'bg-amber-600'
                  }`}>
                    {index + 1}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Records & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* All-Time Records */}
        <Card>
          <CardHeader>
            <h3 className="flex items-center gap-2 font-bold text-gray-900">
              <Trophy className="w-5 h-5 text-yellow-500" />
              역대 기록
            </h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <div className="font-semibold text-gray-900">최고 단일 게임</div>
                  <div className="text-sm text-gray-600">
                    {highlights.records.highestSingleGame.member} • {formatDate(highlights.records.highestSingleGame.date)}
                  </div>
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {highlights.records.highestSingleGame.score}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-semibold text-gray-900">최고 평균 점수</div>
                  <div className="text-sm text-gray-600">
                    {highlights.records.highestAverage.member} • {formatDate(highlights.records.highestAverage.date)}
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {highlights.records.highestAverage.average.toFixed(1)}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="font-semibold text-gray-900">최대 상승폭</div>
                  <div className="text-sm text-gray-600">
                    {highlights.records.mostImproved.member} • {formatDate(highlights.records.mostImproved.date)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {highlights.records.mostImproved.fromScore} → {highlights.records.mostImproved.toScore}
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  +{highlights.records.mostImproved.improvement.toFixed(1)}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <div className="font-semibold text-gray-900">연속 출석</div>
                  <div className="text-sm text-gray-600">
                    {highlights.records.perfectStreak.member}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(highlights.records.perfectStreak.startDate)}부터
                  </div>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {highlights.records.perfectStreak.sessions}회
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Recent Milestones */}
        <Card>
          <CardHeader>
            <h3 className="flex items-center gap-2 font-bold text-gray-900">
              <Star className="w-5 h-5 text-purple-500" />
              최근 마일스톤
            </h3>
          </CardHeader>
          <CardBody>
            {highlights.milestones.length > 0 ? (
              <div className="space-y-3">
                {highlights.milestones.slice(0, 6).map((milestone, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {getMilestoneIcon(milestone.type)}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {milestone.member}
                      </div>
                      <div className="text-sm text-gray-600">
                        {milestone.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(milestone.date)}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-purple-600">
                      {milestone.value}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Star className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>아직 마일스톤이 없습니다</p>
                <p className="text-sm">첫 번째 기록을 세워보세요!</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Monthly Champions */}
      {highlights.monthlyChampions.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="flex items-center gap-2 font-bold text-gray-900">
              <Crown className="w-5 h-5 text-yellow-500" />
              월간 챔피언
            </h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {highlights.monthlyChampions.slice(0, 6).map((champion, index) => (
                <div key={champion.month} className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
                  <Medal className={`w-6 h-6 ${
                    index === 0 ? 'text-yellow-500' :
                    index === 1 ? 'text-gray-400' :
                    index === 2 ? 'text-amber-600' :
                    'text-blue-500'
                  }`} />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {champion.champion.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {champion.month} • 평균 {champion.champion.average.toFixed(1)}점
                    </div>
                    <div className="text-xs text-gray-500">
                      {champion.champion.sessions}회 참가
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}

export default GameHistoryHighlights