import React, { useState } from 'react'
import { 
  Trophy, 
  Medal, 
  Award,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { Card, CardBody } from '../ui/Card'
import { Badge } from '../ui/Badge'
import type { GameHistorySession } from '../../types/bowling'

interface GameHistoryCardProps {
  session: GameHistorySession
  isExpanded?: boolean
  onToggle?: () => void
}

const GameHistoryCard: React.FC<GameHistoryCardProps> = ({
  session,
  isExpanded = false,
  onToggle
}) => {
  const [expanded, setExpanded] = useState(isExpanded)

  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    } else {
      setExpanded(!expanded)
    }
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
      <CardBody className="pt-3">
        {/* Top 3 Quick View */}
        <div className="flex items-stretch gap-3">
          <div className="flex min-w-12 flex-col items-center justify-center rounded-md bg-blue-50 px-2 text-blue-700">
            <span className="text-lg font-bold leading-tight">{session.laneNumber ?? '-'}</span>
            <span className="text-xs">레인</span>
          </div>
          <div className="flex-1 space-y-2">
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
        </div>

        {/* Expanded Details */}
        {(onToggle ? isExpanded : expanded) && (
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