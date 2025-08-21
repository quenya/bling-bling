import React, { useState, useMemo } from 'react'
import { 
  Search, 
  SortAsc, 
  SortDesc, 
  Calendar,
  Users,
  TrendingUp,
  Grid,
  List,
  BarChart3,
  Target
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, CardHeader, CardBody } from '../ui/Card'
import GameHistoryCard from './GameHistoryCard'
import GameHistoryStats from './GameHistoryStats'
import GameHistoryHighlights from './GameHistoryHighlights'
import DateGroupedGameHistory from './DateGroupedGameHistory'
import RecentGamesAverage from './RecentGamesAverage'
import type { 
  GameHistorySession, 
  GameHistoryStats as StatsType,
  HighlightsSummary,
  SessionHighlight
} from '../../types/bowling'

interface GameHistoryGridProps {
  sessions: GameHistorySession[]
  loading?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
  highlights?: HighlightsSummary
  showHighlights?: boolean
}

type ViewMode = 'grid' | 'list' | 'stats' | 'highlights' | 'dateGrouped' | 'recentAverage'
type SortField = 'date' | 'average' | 'participants'
type SortOrder = 'asc' | 'desc'

const GameHistoryGrid: React.FC<GameHistoryGridProps> = ({
  sessions,
  loading = false,
  onLoadMore,
  hasMore = false,
  highlights,
  showHighlights = true
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('recentAverage')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  // Filter and sort sessions
  const filteredAndSortedSessions = useMemo(() => {
    let filtered = sessions.filter(session => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          session.sessionName?.toLowerCase().includes(searchLower) ||
          session.location?.toLowerCase().includes(searchLower) ||
          session.results.some(result => 
            result.member.name.toLowerCase().includes(searchLower)
          )
        if (!matchesSearch) return false
      }

      return true
    })

    // Sort sessions
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
          break
        case 'average':
          aValue = a.results.reduce((sum, r) => sum + r.average, 0) / a.results.length
          bValue = b.results.reduce((sum, r) => sum + r.average, 0) / b.results.length
          break
        case 'participants':
          aValue = a.totalParticipants
          bValue = b.totalParticipants
          break
        default:
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
      }

      if (sortOrder === 'asc') {
        return aValue - bValue
      } else {
        return bValue - aValue
      }
    })

    return filtered
  }, [sessions, searchTerm, sortField, sortOrder])

  // Calculate stats for filtered sessions
  const stats: StatsType = useMemo(() => {
    if (filteredAndSortedSessions.length === 0) {
      return {
        totalSessions: 0,
        totalGames: 0,
        averageScore: 0,
        topPerformer: { name: '', average: 0 },
        mostActive: { name: '', sessions: 0 },
        bestSession: { date: '', average: 0 }
      }
    }

    const totalSessions = filteredAndSortedSessions.length
    const totalGames = filteredAndSortedSessions.reduce((sum, s) => sum + s.results.length * 3, 0)
    
    // Calculate overall average
    const allScores = filteredAndSortedSessions.flatMap(s => 
      s.results.flatMap(r => r.scores)
    )
    const averageScore = allScores.reduce((sum, score) => sum + score, 0) / allScores.length

    // Find top performer
    const memberAverages = new Map<string, { name: string, total: number, count: number }>()
    filteredAndSortedSessions.forEach(session => {
      session.results.forEach(result => {
        const existing = memberAverages.get(result.member.id)
        if (existing) {
          existing.total += result.average
          existing.count += 1
        } else {
          memberAverages.set(result.member.id, {
            name: result.member.name,
            total: result.average,
            count: 1
          })
        }
      })
    })

    let topPerformer = { name: '', average: 0 }
    memberAverages.forEach(member => {
      const avg = member.total / member.count
      if (avg > topPerformer.average) {
        topPerformer = { name: member.name, average: avg }
      }
    })

    // Find most active
    const memberSessions = new Map<string, { name: string, sessions: number }>()
    filteredAndSortedSessions.forEach(session => {
      session.results.forEach(result => {
        const existing = memberSessions.get(result.member.id)
        if (existing) {
          existing.sessions += 1
        } else {
          memberSessions.set(result.member.id, {
            name: result.member.name,
            sessions: 1
          })
        }
      })
    })

    let mostActive = { name: '', sessions: 0 }
    memberSessions.forEach(member => {
      if (member.sessions > mostActive.sessions) {
        mostActive = member
      }
    })

    // Find best session
    let bestSession = { date: '', average: 0 }
    filteredAndSortedSessions.forEach(session => {
      const sessionAvg = session.results.reduce((sum, r) => sum + r.average, 0) / session.results.length
      if (sessionAvg > bestSession.average) {
        bestSession = { date: session.date, average: sessionAvg }
      }
    })

    return {
      totalSessions,
      totalGames,
      averageScore,
      topPerformer,
      mostActive,
      bestSession
    }
  }, [filteredAndSortedSessions])

  // Generate highlights from sessions
  const sessionHighlights: SessionHighlight[] = useMemo(() => {
    return filteredAndSortedSessions.slice(0, 5).map(session => {
      if (session.results.length === 0) {
        return null
      }
      
      const champion = session.results.reduce((prev, current) => 
        current.average > prev.average ? current : prev
      )
      
      const topScore = session.results.reduce((prev, current) => {
        const prevMax = Math.max(...prev.scores)
        const currentMax = Math.max(...current.scores)
        return currentMax > prevMax ? current : prev
      })
      
      const topScoreValue = Math.max(...topScore.scores)
      const topScoreGameIndex = topScore.scores.indexOf(topScoreValue)
      
      // Calculate best team (top 3 performers)
      const topPerformers = session.results
        .sort((a, b) => b.average - a.average)
        .slice(0, Math.min(3, session.results.length))
      
      const bestTeam = topPerformers.length >= 2 ? {
        members: topPerformers.map(p => ({
          id: p.member.id,
          name: p.member.name,
          average: p.average
        })),
        totalAverage: topPerformers.reduce((sum, p) => sum + p.average, 0) / topPerformers.length
      } : undefined

      return {
        date: session.date,
        sessionName: session.sessionName,
        location: session.location,
        laneNumber: session.laneNumber,
        sessionType: session.sessionType,
        totalParticipants: session.totalParticipants,
        champion: {
          id: champion.member.id,
          name: champion.member.name,
          avatar_url: champion.member.avatar_url,
          average: champion.average,
          improvement: champion.improvement
        },
        topScore: {
          id: topScore.member.id,
          name: topScore.member.name,
          score: topScoreValue,
          gameNumber: (topScoreGameIndex + 1) as 1 | 2 | 3
        },
        bestTeam,
        specialAchievements: session.results
          .filter(r => r.achievements && r.achievements.length > 0)
          .flatMap(r => r.achievements!.map(achievement => ({
            memberId: r.member.id,
            memberName: r.member.name,
            achievement
          }))),
        sessionStats: {
          averageScore: session.results.reduce((sum, r) => sum + r.average, 0) / session.results.length,
          totalStrikes: session.results.reduce((sum, r) => sum + r.strikes, 0),
          totalSpares: session.results.reduce((sum, r) => sum + r.spares, 0),
          perfectGames: session.results.filter(r => r.scores.some(score => score === 300)).length
        }
      }
    }).filter(Boolean) as SessionHighlight[]
  }, [filteredAndSortedSessions])

  // Generate date grouped sessions
  const dateGroupedSessions = useMemo(() => {
    const dateGroups = new Map<string, GameHistorySession[]>()
    
    filteredAndSortedSessions.forEach(session => {
      const dateKey = session.date
      if (!dateGroups.has(dateKey)) {
        dateGroups.set(dateKey, [])
      }
      dateGroups.get(dateKey)!.push(session)
    })
    
    // Calculate team stats for each date group based on lane numbers
    const calculateTeamStats = (sessions: GameHistorySession[]) => {
      const laneTeams = new Map<string, Array<{ id: string, name: string, average: number, sessionId: string }>>()
      
      sessions.forEach(session => {
        // 레인 번호가 있는 세션만 처리
        if (session.laneNumber && session.results.length >= 1) {
          const laneKey = `레인 ${session.laneNumber}`
          
          if (!laneTeams.has(laneKey)) {
            laneTeams.set(laneKey, [])
          }
          
          // 해당 레인의 모든 참가자를 팀원으로 추가
          session.results.forEach(result => {
            laneTeams.get(laneKey)!.push({
              id: result.member.id,
              name: result.member.name,
              average: result.average,
              sessionId: session.id
            })
          })
        }
      })
      
      const teamStats = Array.from(laneTeams.entries())
        .map(([laneKey, memberPerformances]) => {
          // 멤버별 평균 계산 (같은 멤버가 여러 세션에 참여한 경우)
          const memberAverages = new Map<string, { name: string, total: number, count: number }>()
          
          memberPerformances.forEach(perf => {
            if (!memberAverages.has(perf.id)) {
              memberAverages.set(perf.id, { name: perf.name, total: 0, count: 0 })
            }
            const memberData = memberAverages.get(perf.id)!
            memberData.total += perf.average
            memberData.count += 1
          })
          
          const members = Array.from(memberAverages.entries()).map(([id, data]) => ({
            id,
            name: data.name,
            average: data.total / data.count
          }))
          
          // 레인 전체 평균 계산 (모든 참가자 포함)
          const teamAverage = memberPerformances.reduce((sum, perf) => sum + perf.average, 0) / memberPerformances.length
          
          // 참여 세션 수 계산
          const sessionCount = new Set(memberPerformances.map(p => p.sessionId)).size
          
          return {
            teamName: laneKey,
            members,
            teamAverage,
            totalGames: memberPerformances.length,
            sessionCount,
            rank: 0
          }
        })
        .filter(team => team.members.length >= 1) // 최소 1명 이상
      
      // 레인별 평균 점수로 정렬 (높은 점수부터)
      teamStats.sort((a, b) => b.teamAverage - a.teamAverage)
      teamStats.forEach((team, index) => {
        team.rank = index + 1
      })
      
      return teamStats
    }
    
    return Array.from(dateGroups.entries()).map(([date, sessions]) => {
      const allResults = sessions.flatMap(session => session.results)
      
      const totalAverage = allResults.length > 0 
        ? allResults.reduce((sum, result) => sum + result.average, 0) / allResults.length 
        : 0
      
      const champion = allResults.length > 0 
        ? allResults.reduce((best, current) => 
            current.average > best.average ? current : best
          ) 
        : { member: { id: '', name: '' }, average: 0 }
      
      const teamStats = calculateTeamStats(sessions)
      
      return {
        date,
        sessions,
        dateStats: {
          totalSessions: sessions.length,
          totalParticipants: new Set(allResults.map(r => r.member.id)).size,
          averageScore: totalAverage,
          champion: {
            id: champion.member.id,
            name: champion.member.name,
            average: champion.average
          },
          teamStats
        }
      }
    }).sort((a, b) => {
      if (sortField === 'average') {
        return sortOrder === 'desc' 
          ? b.dateStats.averageScore - a.dateStats.averageScore
          : a.dateStats.averageScore - b.dateStats.averageScore
      } else {
        return sortOrder === 'desc'
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime()
      }
    })
  }, [filteredAndSortedSessions, sortField, sortOrder])

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const handleCardToggle = (sessionId: string) => {
    setExpandedCard(expandedCard === sessionId ? null : sessionId)
  }

  const renderViewModeButtons = () => (
    <div className="flex gap-1 flex-wrap">
      <Button
        variant={viewMode === 'grid' ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => setViewMode('grid')}
        className="px-3 flex items-center gap-1"
      >
        <Grid className="w-4 h-4" />
        <span>전체</span>
      </Button>
      <Button
        variant={viewMode === 'recentAverage' ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => setViewMode('recentAverage')}
        className="px-3 flex items-center gap-1"
        title="최근 20게임 평균"
      >
        <Target className="w-4 h-4" />
        <span>최근 평균</span>
      </Button>
      <Button
        variant={viewMode === 'list' ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => setViewMode('list')}
        className="px-3 flex items-center gap-1"
      >
        <List className="w-4 h-4" />
        <span className="hidden sm:inline">목록</span>
      </Button>
      <Button
        variant={viewMode === 'dateGrouped' ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => setViewMode('dateGrouped')}
        className="px-3 flex items-center gap-1"
        title="날짜별 그룹"
      >
        <Calendar className="w-4 h-4" />
        <span className="hidden sm:inline">날짜별</span>
      </Button>
      <Button
        variant={viewMode === 'stats' ? 'primary' : 'secondary'}
        size="sm"
        onClick={() => setViewMode('stats')}
        className="px-3 flex items-center gap-1"
      >
        <BarChart3 className="w-4 h-4" />
        <span className="hidden sm:inline">통계</span>
      </Button>
    </div>
  )

  const renderSortButtons = () => (
    <div className="flex gap-1">
      {[
        { field: 'date' as SortField, label: '날짜', icon: Calendar },
        { field: 'average' as SortField, label: '평균', icon: TrendingUp },
        { field: 'participants' as SortField, label: '참가자', icon: Users }
      ].map(({ field, label, icon: Icon }) => (
        <Button
          key={field}
          variant={sortField === field ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => handleSort(field)}
          className="flex items-center gap-1"
        >
          <Icon className="w-3 h-3" />
          <span className="hidden sm:inline">{label}</span>
          {sortField === field && (
            sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
          )}
        </Button>
      ))}
    </div>
  )

  if (loading && sessions.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mt-2" />
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardBody className="space-y-4">
          {/* Top Row: Search and View Mode */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {viewMode !== 'recentAverage' && (
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="세션명, 장소, 회원명으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 ml-auto">
              {renderViewModeButtons()}
            </div>
          </div>

          {/* Second Row: Sort and Stats */}
          {viewMode !== 'recentAverage' && viewMode !== 'stats' && (
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">정렬:</span>
                {renderSortButtons()}
              </div>
              <div className="text-sm text-gray-600">
                총 {filteredAndSortedSessions.length}개 세션
              </div>
            </div>
          )}

          {/* Stats for other modes */}
          {(viewMode === 'recentAverage' || viewMode === 'stats') && (
            <div className="flex justify-end">
              <div className="text-sm text-gray-600">
                총 {filteredAndSortedSessions.length}개 세션
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Content */}
      {viewMode === 'stats' ? (
        <GameHistoryStats stats={stats} sessions={filteredAndSortedSessions} />
      ) : viewMode === 'highlights' && showHighlights ? (
        <GameHistoryHighlights 
          highlights={highlights || {
            recentHighlights: sessionHighlights,
            monthlyChampions: [],
            records: {
              highestSingleGame: { score: 0, member: '', date: '' },
              highestAverage: { average: 0, member: '', date: '' },
              mostImproved: { improvement: 0, member: '', date: '', fromScore: 0, toScore: 0 },
              perfectStreak: { member: '', sessions: 0, startDate: '' }
            },
            milestones: []
          }}
          recentSessions={sessionHighlights}
        />
      ) : viewMode === 'dateGrouped' ? (
        <DateGroupedGameHistory 
          dateGroups={dateGroupedSessions}
          loading={loading}
        />
      ) : viewMode === 'recentAverage' ? (
        <RecentGamesAverage gameCount={20} />
      ) : (
        (() => {
          // 날짜별로 그룹화
          const sessionsByDate = new Map<string, GameHistorySession[]>()
          filteredAndSortedSessions.forEach(session => {
            const dateKey = session.date
            if (!sessionsByDate.has(dateKey)) {
              sessionsByDate.set(dateKey, [])
            }
            sessionsByDate.get(dateKey)!.push(session)
          })

          const dateGroups = Array.from(sessionsByDate.entries()).sort(([dateA], [dateB]) => {
            return sortOrder === 'desc'
              ? new Date(dateB).getTime() - new Date(dateA).getTime()
              : new Date(dateA).getTime() - new Date(dateB).getTime()
          }).map(([date, sessions]) => {
            // 각 날짜 내에서 세션들을 평균점수 기준으로 정렬
            const sortedSessions = sessions.sort((a, b) => {
              const avgA = a.results.reduce((sum, r) => sum + r.average, 0) / a.results.length
              const avgB = b.results.reduce((sum, r) => sum + r.average, 0) / b.results.length
              return avgB - avgA // 높은 점수부터
            })
            return [date, sortedSessions] as [string, GameHistorySession[]]
          })

          return (
            <div className="space-y-8">
              {dateGroups.map(([date, sessions]) => (
                <div key={date} className="space-y-4">
                  {/* 날짜 헤더 */}
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {new Date(date).toLocaleDateString('ko-KR', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          weekday: 'short'
                        })}
                      </div>
                    </div>
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <div className="text-sm text-gray-600">
                      {sessions.length}개 세션
                    </div>
                  </div>

                  {/* 세션 카드들 */}
                  <div className={`grid gap-4 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}>
                    {sessions.map((session) => (
                      <GameHistoryCard
                        key={session.id}
                        session={session}
                        isExpanded={expandedCard === session.id}
                        onToggle={() => handleCardToggle(session.id)}
                        showDetails={viewMode === 'list' || expandedCard === session.id}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        })()
      )}

      {/* Empty State */}
      {filteredAndSortedSessions.length === 0 && !loading && (
        <Card>
          <CardBody className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              게임 히스토리가 없습니다
            </h3>
            <p className="text-gray-600">
              새로운 게임을 추가해보세요.
            </p>
          </CardBody>
        </Card>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button
            variant="secondary"
            onClick={onLoadMore}
            disabled={loading}
            className="min-w-32"
          >
            {loading ? '로딩 중...' : '더 보기'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default GameHistoryGrid