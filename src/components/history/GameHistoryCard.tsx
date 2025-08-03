import React, { useState } from 'react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { 
  ChevronDown, 
  ChevronUp, 
  Trophy, 
  Medal, 
  Award,
  TrendingUp,
  TrendingDown,
  Users,
  MapPin,
  Calendar,
  Target
} from 'lucide-react'
import { Card, CardHeader, CardBody } from '../ui/Card'
import { Badge } from '../ui/Badge'
import type { GameHistorySession } from '../../types/bowling'

interface GameHistoryCardProps {
  session: GameHistorySession
  isExpanded?: boolean
  onToggle?: () => void
  showDetails?: boolean
}

const GameHistoryCard: React.FC<GameHistoryCardProps> = ({
  session,
  isExpanded = false,
  onToggle,
  showDetails = true
}) => {
  const [expanded, setExpanded] = useState(isExpanded)

  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    } else {
      setExpanded(!expanded)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'M월 d일 (eee)', { locale: ko })
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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-4 h-4 text-yellow-500" />
      case 2:
        return <Medal className="w-4 h-4 text-gray-400" />
      case 3:
        return <Award className="w-4 h-4 text-amber-600" />
      default:
        return null
    }
  }

  const topThree = session.results
    .sort((a, b) => b.average - a.average)
    .slice(0, 3)

  const sessionAverage = session.results.reduce((sum, result) => sum + result.average, 0) / session.results.length

  return (
    <Card 
      variant="default" 
      className="hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={handleToggle}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
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
          {showDetails && (
            <button 
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                handleToggle()
              }}
            >
              {(onToggle ? isExpanded : expanded) ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
          {session.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{session.location}</span>
            </div>
          )}
          {session.laneNumber && (
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              <span>{session.laneNumber}레인</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{session.totalParticipants}명 참가</span>
          </div>
        </div>
      </CardHeader>

      <CardBody className="pt-3">
        {/* Top 3 Quick View */}
        <div className="space-y-2">
          {topThree.map((result, index) => (
            <div key={result.member.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getRankIcon(index + 1)}
                  <span className="font-medium text-gray-900">
                    {result.member.name}
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {result.average.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {result.improvement !== undefined && (
                  <div className={`flex items-center gap-1 text-xs ${
                    result.improvement > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.improvement > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{Math.abs(result.improvement).toFixed(1)}</span>
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  {result.scores.join(' • ')}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Expanded Details */}
        {(onToggle ? isExpanded : expanded) && showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Session Stats */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">세션 통계</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">평균 점수:</span>
                    <span className="font-medium">{sessionAverage.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">최고 점수:</span>
                    <span className="font-medium">{Math.max(...session.results.map(r => Math.max(...r.scores)))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">참가자 수:</span>
                    <span className="font-medium">{session.totalParticipants}명</span>
                  </div>
                </div>
              </div>

              {/* All Results */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">전체 결과</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {session.results
                    .sort((a, b) => b.average - a.average)
                    .map((result, index) => (
                      <div key={result.member.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-6 text-center font-medium text-gray-500">
                            {index + 1}
                          </span>
                          <span>{result.member.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{result.average.toFixed(1)}</span>
                          <span className="text-gray-500 text-xs">
                            ({result.scores.join(', ')})
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Achievements */}
            {session.results.some(r => r.achievements && r.achievements.length > 0) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">이번 게임 업적</h4>
                <div className="space-y-2">
                  {session.results
                    .filter(r => r.achievements && r.achievements.length > 0)
                    .map(result => (
                      <div key={result.member.id} className="flex items-center gap-2">
                        <span className="text-sm font-medium">{result.member.name}:</span>
                        <div className="flex gap-1">
                          {result.achievements!.map((achievement, index) => (
                            <Badge key={index} className="bg-yellow-100 text-yellow-800 text-xs">
                              {achievement}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default GameHistoryCard