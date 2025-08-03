import { supabase } from '../utils/supabase'
import type { 
  GameHistorySession, 
  GameHistoryResult,
  HighlightsSummary,
  DateGroupedSession,
  TeamDayStats
} from '../types/bowling'

// 게임 세션과 결과를 함께 조회
export const getGameHistory = async (options?: {
  limit?: number
  offset?: number
  dateFrom?: string
  dateTo?: string
}) => {
  try {
    const { limit = 20, offset = 0, dateFrom, dateTo } = options || {}

    let query = supabase
      .from('game_sessions')
      .select(`
        *,
        game_results(
          *,
          members(
            id,
            name,
            avatar_url
          )
        )
      `)
      .order('date', { ascending: false })

    // 날짜 필터링
    if (dateFrom) {
      query = query.gte('date', dateFrom)
    }
    if (dateTo) {
      query = query.lte('date', dateTo)
    }

    // 페이지네이션
    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      throw error
    }

    return transformToGameHistory(data || [])
  } catch (error) {
    console.error('Error fetching game history:', error)
    throw error
  }
}

// DB 데이터를 GameHistorySession 형태로 변환
const transformToGameHistory = (data: any[]): GameHistorySession[] => {
  return data.map(session => {
    // 게임 결과를 회원별로 그룹화
    const memberResults = new Map<string, any>()
    
    session.game_results?.forEach((result: any) => {
      const memberId = result.member_id
      if (!memberResults.has(memberId)) {
        memberResults.set(memberId, {
          member: result.members,
          scores: [],
          strikes: 0,
          spares: 0,
          rank: 0,
          achievements: []
        })
      }
      
      const memberData = memberResults.get(memberId)!
      memberData.scores[result.game_number - 1] = result.score
      memberData.strikes += result.strikes || 0
      memberData.spares += result.spares || 0
    })

    // 각 회원의 평균 계산 및 순위 매기기
    const results: GameHistoryResult[] = Array.from(memberResults.values()).map(data => {
      const validScores = data.scores.filter((score: number) => score > 0)
      const average = validScores.length > 0 
        ? validScores.reduce((sum: number, score: number) => sum + score, 0) / validScores.length 
        : 0

      return {
        member: {
          id: data.member.id,
          name: data.member.name,
          avatar_url: data.member.avatar_url
        },
        scores: data.scores.filter((score: number) => score > 0),
        average,
        strikes: data.strikes,
        spares: data.spares,
        rank: 0, // 아래에서 계산
        achievements: data.achievements
      }
    })

    // 평균 점수로 순위 매기기
    results.sort((a, b) => b.average - a.average)
    results.forEach((result, index) => {
      result.rank = index + 1
    })

    return {
      id: session.id,
      date: session.date,
      sessionName: session.session_name,
      location: session.location,
      laneNumber: session.lane_number,
      sessionType: session.session_type,
      totalParticipants: session.total_participants,
      results,
      created_at: session.created_at
    }
  })
}

// 하이라이트 요약 데이터 생성
export const generateHighlightsSummary = async (): Promise<HighlightsSummary> => {
  try {
    // 최근 6개월 데이터 조회
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    const sessions = await getGameHistory({
      limit: 100,
      dateFrom: sixMonthsAgo.toISOString().split('T')[0]
    })

    // 역대 최고 기록들 계산
    let highestSingleGame = { score: 0, member: '', date: '' }
    let highestAverage = { average: 0, member: '', date: '' }
    let mostImproved = { improvement: 0, member: '', date: '', fromScore: 0, toScore: 0 }

    // 월간 챔피언 계산
    const monthlyChampions: any[] = []
    const memberMonthlyStats = new Map<string, Map<string, { total: number, count: number, name: string }>>()

    sessions.forEach(session => {
      const monthKey = session.date.substring(0, 7) // YYYY-MM
      
      session.results.forEach(result => {
        // 최고 단일 게임 기록
        const maxScore = Math.max(...result.scores)
        if (maxScore > highestSingleGame.score) {
          highestSingleGame = {
            score: maxScore,
            member: result.member.name,
            date: session.date
          }
        }

        // 최고 평균 기록
        if (result.average > highestAverage.average) {
          highestAverage = {
            average: result.average,
            member: result.member.name,
            date: session.date
          }
        }

        // 월간 통계 수집
        if (!memberMonthlyStats.has(result.member.id)) {
          memberMonthlyStats.set(result.member.id, new Map())
        }
        const memberStats = memberMonthlyStats.get(result.member.id)!
        
        if (!memberStats.has(monthKey)) {
          memberStats.set(monthKey, { total: 0, count: 0, name: result.member.name })
        }
        const monthStats = memberStats.get(monthKey)!
        monthStats.total += result.average
        monthStats.count += 1
      })
    })

    // 월간 챔피언 결정
    const monthKeys = Array.from(new Set(sessions.map(s => s.date.substring(0, 7)))).sort().reverse()
    
    monthKeys.slice(0, 6).forEach(monthKey => {
      let monthChampion = { name: '', average: 0, sessions: 0 }
      
      memberMonthlyStats.forEach((memberStats) => {
        const monthData = memberStats.get(monthKey)
        if (monthData && monthData.count >= 2) { // 최소 2회 참가
          const average = monthData.total / monthData.count
          if (average > monthChampion.average) {
            monthChampion = {
              name: monthData.name,
              average,
              sessions: monthData.count
            }
          }
        }
      })

      if (monthChampion.name) {
        const [year, month] = monthKey.split('-')
        monthlyChampions.push({
          month: `${year}년 ${parseInt(month)}월`,
          champion: monthChampion
        })
      }
    })

    // 연속 출석 기록 계산 (단순화)
    const perfectStreak = {
      member: sessions.length > 0 ? sessions[0].results[0]?.member.name || '' : '',
      sessions: Math.min(sessions.length, 8),
      startDate: sessions.length > 0 ? sessions[sessions.length - 1].date : ''
    }

    // 마일스톤 생성 (최근 달성)
    const milestones: any[] = []
    sessions.slice(0, 5).forEach(session => {
      session.results.forEach(result => {
        const maxScore = Math.max(...result.scores)
        
        // 200점 돌파
        if (maxScore >= 200) {
          milestones.push({
            type: 'first_200',
            member: result.member.name,
            date: session.date,
            value: maxScore,
            description: `${maxScore}점으로 200점 돌파!`
          })
        }
        
        // 개인 최고 기록 (평균 180점 이상)
        if (result.average >= 180) {
          milestones.push({
            type: 'perfect_game',
            member: result.member.name,
            date: session.date,
            value: Math.round(result.average),
            description: `평균 ${result.average.toFixed(1)}점 달성`
          })
        }
      })
    })

    return {
      recentHighlights: [],
      monthlyChampions,
      records: {
        highestSingleGame,
        highestAverage,
        mostImproved,
        perfectStreak
      },
      milestones: milestones.slice(0, 10)
    }
  } catch (error) {
    console.error('Error generating highlights summary:', error)
    return {
      recentHighlights: [],
      monthlyChampions: [],
      records: {
        highestSingleGame: { score: 0, member: '', date: '' },
        highestAverage: { average: 0, member: '', date: '' },
        mostImproved: { improvement: 0, member: '', date: '', fromScore: 0, toScore: 0 },
        perfectStreak: { member: '', sessions: 0, startDate: '' }
      },
      milestones: []
    }
  }
}

// 날짜별 그룹화된 게임 히스토리 조회
export const getDateGroupedGameHistory = async (options?: {
  limit?: number
  offset?: number
  dateFrom?: string
  dateTo?: string
  sortBy?: 'date' | 'average'
  sortOrder?: 'asc' | 'desc'
}): Promise<DateGroupedSession[]> => {
  try {
    const sessions = await getGameHistory(options)
    
    // 날짜별로 세션 그룹화
    const dateGroups = new Map<string, GameHistorySession[]>()
    
    sessions.forEach(session => {
      const dateKey = session.date
      if (!dateGroups.has(dateKey)) {
        dateGroups.set(dateKey, [])
      }
      dateGroups.get(dateKey)!.push(session)
    })
    
    // 날짜별 통계 계산
    const dateGroupedSessions: DateGroupedSession[] = Array.from(dateGroups.entries()).map(([date, sessions]) => {
      const allResults = sessions.flatMap(session => session.results)
      
      // 날짜별 전체 평균
      const totalAverage = allResults.length > 0 
        ? allResults.reduce((sum, result) => sum + result.average, 0) / allResults.length 
        : 0
      
      // 날짜별 챔피언 (가장 높은 평균)
      const champion = allResults.reduce((best, current) => 
        current.average > best.average ? current : best
      , { member: { id: '', name: '' }, average: 0 })
      
      // 팀별 통계 계산
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
    })
    
    // 정렬
    const { sortBy = 'date', sortOrder = 'desc' } = options || {}
    dateGroupedSessions.sort((a, b) => {
      let comparison = 0
      
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (sortBy === 'average') {
        comparison = a.dateStats.averageScore - b.dateStats.averageScore
      }
      
      return sortOrder === 'desc' ? -comparison : comparison
    })
    
    return dateGroupedSessions
    
  } catch (error) {
    console.error('Error fetching date grouped game history:', error)
    throw error
  }
}

// 팀별 통계 계산 (동일 날짜의 세션들을 기준으로)
const calculateTeamStats = (sessions: GameHistorySession[]): TeamDayStats[] => {
  // 모든 참가자를 세션별로 그룹화
  const teamCombinations = new Map<string, Array<{ id: string, name: string, average: number }>>()
  
  sessions.forEach(session => {
    // 2명 이상이 같이 참여한 경우를 팀으로 간주
    if (session.results.length >= 2) {
      // 세션 내에서 상위 50% 참가자들을 팀으로 간주 (최소 2명)
      const sortedResults = [...session.results].sort((a, b) => b.average - a.average)
      const teamSize = Math.max(2, Math.min(4, Math.ceil(sortedResults.length / 2)))
      const topMembers = sortedResults.slice(0, teamSize)
      
      // 팀 이름 생성 (멤버 이름들을 정렬해서 조합)
      const teamName = topMembers
        .map(m => m.member.name)
        .sort()
        .join(' & ')
      
      if (!teamCombinations.has(teamName)) {
        teamCombinations.set(teamName, [])
      }
      
      teamCombinations.get(teamName)!.push(...topMembers.map(member => ({
        id: member.member.id,
        name: member.member.name,
        average: member.average
      })))
    }
  })
  
  // 팀별 평균 계산
  const teamStats: TeamDayStats[] = Array.from(teamCombinations.entries())
    .map(([teamName, memberPerformances]) => {
      // 같은 멤버의 여러 게임 결과가 있을 수 있으므로 평균 계산
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
      
      const teamAverage = members.reduce((sum, member) => sum + member.average, 0) / members.length
      const totalGames = memberPerformances.length
      
      return {
        teamName,
        members,
        teamAverage,
        totalGames,
        rank: 0 // 아래에서 계산
      }
    })
    .filter(team => team.members.length >= 2) // 최소 2명 이상의 팀만
  
  // 팀 순위 매기기 (평균 점수 기준)
  teamStats.sort((a, b) => b.teamAverage - a.teamAverage)
  teamStats.forEach((team, index) => {
    team.rank = index + 1
  })
  
  return teamStats.slice(0, 5) // 상위 5팀만 반환
}