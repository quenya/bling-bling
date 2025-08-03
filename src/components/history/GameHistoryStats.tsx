import React from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { 
  Trophy, 
  Users, 
  Calendar, 
  TrendingUp, 
  Target, 
  Star,
  BarChart3,
  Award
} from 'lucide-react'
import { Card, CardHeader, CardBody } from '../ui/Card'
import { Badge } from '../ui/Badge'
import type { GameHistoryStats as StatsType, GameHistorySession } from '../../types/bowling'

interface GameHistoryStatsProps {
  stats: StatsType
  sessions: GameHistorySession[]
}

const GameHistoryStats: React.FC<GameHistoryStatsProps> = ({ stats, sessions }) => {
  // Calculate additional insights
  const getTopScores = () => {
    const allScores = sessions.flatMap(session =>
      session.results.flatMap(result =>
        result.scores.map(score => ({
          score,
          member: result.member.name,
          date: session.date
        }))
      )
    )
    return allScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
  }

  const getStreakData = () => {
    const memberStreaks = new Map<string, number>()
    const memberLastSessions = new Map<string, string>()
    
    // Sort sessions by date
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    sortedSessions.forEach(session => {
      session.results.forEach(result => {
        const memberId = result.member.id
        const lastSession = memberLastSessions.get(memberId)
        
        if (!lastSession) {
          memberStreaks.set(memberId, 1)
        } else {
          const currentStreak = memberStreaks.get(memberId) || 0
          memberStreaks.set(memberId, currentStreak + 1)
        }
        
        memberLastSessions.set(memberId, session.date)
      })
    })

    return Array.from(memberStreaks.entries())
      .map(([memberId, streak]) => {
        const member = sessions
          .flatMap(s => s.results)
          .find(r => r.member.id === memberId)?.member
        return { name: member?.name || '', streak }
      })
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 3)
  }

  const getImprovementLeaders = () => {
    const memberProgress = new Map<string, { name: string, scores: number[] }>()
    
    // Sort sessions by date
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    sortedSessions.forEach(session => {
      session.results.forEach(result => {
        const memberId = result.member.id
        const existing = memberProgress.get(memberId)
        
        if (existing) {
          existing.scores.push(result.average)
        } else {
          memberProgress.set(memberId, {
            name: result.member.name,
            scores: [result.average]
          })
        }
      })
    })

    return Array.from(memberProgress.entries())
      .map(([_, member]) => {
        if (member.scores.length < 2) return null
        
        const firstHalf = member.scores.slice(0, Math.ceil(member.scores.length / 2))
        const secondHalf = member.scores.slice(Math.ceil(member.scores.length / 2))
        
        const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length
        const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length
        
        return {
          name: member.name,
          improvement: secondAvg - firstAvg,
          from: firstAvg,
          to: secondAvg
        }
      })
      .filter(Boolean)
      .sort((a, b) => (b?.improvement || 0) - (a?.improvement || 0))
      .slice(0, 3)
  }

  const topScores = getTopScores()
  const streakData = getStreakData()
  const improvementLeaders = getImprovementLeaders()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'M월 d일', { locale: ko })
  }

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center">
            <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.totalSessions}</div>
            <div className="text-sm text-gray-600">총 세션</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.totalGames}</div>
            <div className="text-sm text-gray-600">총 게임</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <BarChart3 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {stats.averageScore.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">전체 평균</div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {topScores[0]?.score || 0}
            </div>
            <div className="text-sm text-gray-600">최고 점수</div>
          </CardBody>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performer */}
        <Card>
          <CardHeader>
            <h3 className="flex items-center gap-2 font-semibold text-gray-900">
              <Trophy className="w-5 h-5 text-yellow-500" />
              최고 성과자
            </h3>
          </CardHeader>
          <CardBody>
            {stats.topPerformer.name ? (
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">
                  {stats.topPerformer.name}
                </div>
                <div className="text-2xl font-bold text-yellow-600 mt-1">
                  {stats.topPerformer.average.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">평균 점수</div>
              </div>
            ) : (
              <div className="text-center text-gray-500">데이터 없음</div>
            )}
          </CardBody>
        </Card>

        {/* Most Active */}
        <Card>
          <CardHeader>
            <h3 className="flex items-center gap-2 font-semibold text-gray-900">
              <Users className="w-5 h-5 text-blue-500" />
              최다 참가자
            </h3>
          </CardHeader>
          <CardBody>
            {stats.mostActive.name ? (
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">
                  {stats.mostActive.name}
                </div>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {stats.mostActive.sessions}
                </div>
                <div className="text-sm text-gray-600">세션 참가</div>
              </div>
            ) : (
              <div className="text-center text-gray-500">데이터 없음</div>
            )}
          </CardBody>
        </Card>

        {/* Best Session */}
        <Card>
          <CardHeader>
            <h3 className="flex items-center gap-2 font-semibold text-gray-900">
              <Star className="w-5 h-5 text-purple-500" />
              최고 세션
            </h3>
          </CardHeader>
          <CardBody>
            {stats.bestSession.date ? (
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {formatDate(stats.bestSession.date)}
                </div>
                <div className="text-2xl font-bold text-purple-600 mt-1">
                  {stats.bestSession.average.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">세션 평균</div>
              </div>
            ) : (
              <div className="text-center text-gray-500">데이터 없음</div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Scores */}
        <Card>
          <CardHeader>
            <h3 className="flex items-center gap-2 font-semibold text-gray-900">
              <Target className="w-5 h-5 text-red-500" />
              최고 점수 TOP 5
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {topScores.length > 0 ? (
                topScores.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </Badge>
                      <div>
                        <div className="font-medium text-gray-900">{entry.member}</div>
                        <div className="text-sm text-gray-600">{formatDate(entry.date)}</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-gray-900">{entry.score}</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">데이터 없음</div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Attendance Streak */}
        <Card>
          <CardHeader>
            <h3 className="flex items-center gap-2 font-semibold text-gray-900">
              <Calendar className="w-5 h-5 text-green-500" />
              연속 참석 순위
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {streakData.length > 0 ? (
                streakData.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${
                        index === 0 ? 'bg-green-100 text-green-800' :
                        index === 1 ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {index + 1}
                      </Badge>
                      <div className="font-medium text-gray-900">{entry.name}</div>
                    </div>
                    <div className="text-lg font-bold text-gray-900">{entry.streak}회</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">데이터 없음</div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Improvement Leaders */}
      {improvementLeaders.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="flex items-center gap-2 font-semibold text-gray-900">
              <TrendingUp className="w-5 h-5 text-green-500" />
              실력 향상 리더
            </h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {improvementLeaders.map((leader, index) => (
                leader && (
                  <div key={index} className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Award className={`w-5 h-5 ${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-gray-500' :
                        'text-amber-600'
                      }`} />
                      <span className="font-semibold text-gray-900">{leader.name}</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      +{leader.improvement.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {leader.from.toFixed(1)} → {leader.to.toFixed(1)}
                    </div>
                  </div>
                )
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}

export default GameHistoryStats