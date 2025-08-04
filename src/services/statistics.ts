import { supabase, handleSupabaseResponse } from './supabase'

export interface DashboardStats {
  totalGames: number
  totalMembers: number
  averageScore: number
  highestScore: number
  recentGames: number
  activeMembers: number
}

export interface MemberStatsDetail {
  memberId: string
  memberName: string
  totalGames: number
  averageScore: number
  highestScore: number
  lowestScore: number
  totalStrikes: number
  totalSpares: number
  improvementRate: number
  consistencyScore: number
  lastPlayedDate?: string
}

export interface FunStatistics {
  luckyDayOfWeek: {
    day: string
    averageScore: number
  }
  comebackKing: {
    memberId: string
    memberName: string
    improvement: number
    sessionDate: string
  }
  consistencyChampion: {
    memberId: string
    memberName: string
    standardDeviation: number
  }
  almostPerfect: Array<{
    memberId: string
    memberName: string
    score: number
    sessionDate: string
  }>
}

export const statisticsService = {
  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // 총 게임수 계산 (모든 게임 결과의 개수)
      const { data: totalGamesData, error: totalGamesError } = await supabase
        .from('game_results')
        .select('id', { count: 'exact' })
      
      if (totalGamesError) throw totalGamesError

      // 모든 게임의 평균 점수와 최고점
      const { data: scoresData, error: scoresError } = await supabase
        .from('game_results')
        .select('score')
      
      if (scoresError) throw scoresError

      // 활성 회원수 (기록이 있는 모든 회원)
      const { data: membersData, error: membersError } = await supabase
        .from('game_results')
        .select('member_id')
      
      if (membersError) throw membersError

      const totalGames = totalGamesData?.length || 0
      const scores = scoresData?.map(d => d.score) || []
      const averageScore = scores.length > 0 ? 
        Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10 : 0
      const highestScore = scores.length > 0 ? Math.max(...scores) : 0
      
      const uniqueMembers = new Set(membersData?.map(d => d.member_id) || [])
      const totalMembers = uniqueMembers.size

      return {
        totalGames,
        totalMembers,
        averageScore,
        highestScore,
        recentGames: 0, // 사용하지 않음
        activeMembers: totalMembers // 활성 회원은 총 회원과 동일
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        totalGames: 0,
        totalMembers: 0,
        averageScore: 0,
        highestScore: 0,
        recentGames: 0,
        activeMembers: 0
      }
    }
  },

  // Get member statistics with details
  async getMemberStatistics(memberId?: string): Promise<MemberStatsDetail[]> {
    const response = await supabase
      .rpc('get_member_statistics_detailed', {
        target_member_id: memberId
      })
    
    return handleSupabaseResponse(response)
  },

  // Get fun statistics
  async getFunStatistics(): Promise<FunStatistics> {
    const response = await supabase
      .rpc('get_fun_statistics')
    
    return handleSupabaseResponse(response)
  },

  // Get score distribution
  async getScoreDistribution() {
    const response = await supabase
      .rpc('get_score_distribution')
    
    return handleSupabaseResponse(response)
  },

  // Get monthly trends
  async getMonthlyTrends(year: number = new Date().getFullYear()) {
    const response = await supabase
      .rpc('get_monthly_trends', { target_year: year })
    
    return handleSupabaseResponse(response)
  },

  // Get top performers for a period
  async getTopPerformers(
    startDate?: string, 
    endDate?: string, 
    limit: number = 10
  ) {
    const response = await supabase
      .rpc('get_top_performers_detailed', {
        start_date: startDate,
        end_date: endDate,
        result_limit: limit
      })
    
    return handleSupabaseResponse(response)
  },

  // Get member performance over time
  async getMemberPerformanceOverTime(
    memberId: string, 
    startDate?: string, 
    endDate?: string
  ) {
    let query = supabase
      .from('game_results')
      .select(`
        score,
        game_number,
        strikes,
        spares,
        created_at,
        game_sessions!inner(date, session_name)
      `)
      .eq('member_id', memberId)

    if (startDate) {
      query = query.gte('game_sessions.date', startDate)
    }
    if (endDate) {
      query = query.lte('game_sessions.date', endDate)
    }

    const response = await query
      .order('game_sessions.date', { ascending: true })
    
    return handleSupabaseResponse(response)
  },

  // Get session comparison
  async getSessionComparison(sessionIds: string[]) {
    const response = await supabase
      .rpc('compare_sessions', { session_ids: sessionIds })
    
    return handleSupabaseResponse(response)
  },

  // Get improvement statistics
  async getImprovementStatistics(memberId?: string) {
    const response = await supabase
      .rpc('get_improvement_statistics', {
        target_member_id: memberId
      })
    
    return handleSupabaseResponse(response)
  },

  // Get strike and spare statistics
  async getStrikeSpareStatistics(memberId?: string) {
    const response = await supabase
      .rpc('get_strike_spare_statistics', {
        target_member_id: memberId
      })
    
    return handleSupabaseResponse(response)
  },

  // Get day of week statistics
  async getDayOfWeekStatistics() {
    const response = await supabase
      .rpc('get_day_of_week_statistics')
    
    return handleSupabaseResponse(response)
  },

  // Get participation statistics
  async getParticipationStatistics() {
    const response = await supabase
      .rpc('get_participation_statistics')
    
    return handleSupabaseResponse(response)
  },

  // Get head-to-head comparison
  async getHeadToHeadComparison(member1Id: string, member2Id: string) {
    const response = await supabase
      .rpc('get_head_to_head_comparison', {
        member1_id: member1Id,
        member2_id: member2Id
      })
    
    return handleSupabaseResponse(response)
  },

  // Get location statistics
  async getLocationStatistics() {
    const response = await supabase
      .from('game_sessions')
      .select(`
        location,
        game_results(score)
      `)
      .not('location', 'is', null)

    const data = handleSupabaseResponse(response)
    
    if (!data) return []

    // Process data to calculate location stats
    const locationStats = data.reduce((acc: any[], session) => {
      const existing = acc.find(item => item.location === session.location)
      const scores = session.game_results?.map((r: any) => r.score) || []
      
      if (existing) {
        existing.totalGames += scores.length
        existing.scores.push(...scores)
      } else {
        acc.push({
          location: session.location,
          totalGames: scores.length,
          scores: [...scores]
        })
      }
      
      return acc
    }, [])

    return locationStats.map(stat => ({
      location: stat.location,
      totalGames: stat.totalGames,
      averageScore: stat.scores.length > 0 
        ? stat.scores.reduce((sum: number, score: number) => sum + score, 0) / stat.scores.length
        : 0,
      highestScore: stat.scores.length > 0 ? Math.max(...stat.scores) : 0
    }))
  },

  // Update member statistics (cache refresh)
  async updateMemberStatistics(memberId: string) {
    const response = await supabase
      .rpc('update_member_statistics', { target_member_id: memberId })
    
    return handleSupabaseResponse(response)
  },

  // Update all member statistics
  async updateAllMemberStatistics() {
    const response = await supabase
      .rpc('update_all_member_statistics')
    
    return handleSupabaseResponse(response)
  },

  // Get top 5 players based on overall average
  async getTop5Players(): Promise<any[]> {
    try {
      const { data: gameResults, error } = await supabase
        .from('game_results')
        .select(`
          member_id,
          session_id,
          score,
          game_number,
          members!inner(id, name, avatar_url)
        `)

      if (error) throw error

      // 회원별 세션별 게임 점수 집계
      const sessionScores = new Map<string, Map<string, number[]>>() // memberId -> sessionId -> scores[]

      gameResults?.forEach(result => {
        const memberId = result.member_id
        const sessionId = result.session_id
        
        if (!sessionScores.has(memberId)) {
          sessionScores.set(memberId, new Map())
        }
        
        const memberSessions = sessionScores.get(memberId)!
        if (!memberSessions.has(sessionId)) {
          memberSessions.set(sessionId, [])
        }
        
        memberSessions.get(sessionId)!.push(result.score)
      })

      // 회원별 통계 계산
      const playerStats = new Map<string, {
        member: any
        sessionAverages: number[]
        sessionCount: number
        totalScore: number
        bestScore: number
      }>()

      sessionScores.forEach((memberSessions, memberId) => {
        const member = gameResults?.find(r => r.member_id === memberId)?.members
        const sessionAverages: number[] = []
        let totalScore = 0
        let bestScore = 0

        memberSessions.forEach((scores) => {
          if (scores.length === 3) { // 완전한 세션 (3게임)
            const sessionAvg = scores.reduce((sum, score) => sum + score, 0) / 3
            sessionAverages.push(sessionAvg)
            totalScore += sessionAvg
            bestScore = Math.max(bestScore, ...scores)
          }
        })

        if (sessionAverages.length > 0) {
          playerStats.set(memberId, {
            member,
            sessionAverages,
            sessionCount: sessionAverages.length,
            totalScore,
            bestScore
          })
        }
      })

      // Top 5 플레이어 계산 및 정렬
      const topPlayers = Array.from(playerStats.entries())
        .filter(([_, data]) => data.sessionCount >= 3) // 최소 3세션 이상 참여
        .map(([memberId, data]) => {
          const averageScore = data.totalScore / data.sessionCount
          
          // 향상률 계산 (최근 3세션 vs 처음 3세션)
          const firstThreeAvg = data.sessionAverages.slice(0, 3).reduce((sum, score) => sum + score, 0) / 3
          const lastThreeAvg = data.sessionAverages.slice(-3).reduce((sum, score) => sum + score, 0) / 3
          const improvementRate = data.sessionAverages.length >= 6 
            ? ((lastThreeAvg - firstThreeAvg) / firstThreeAvg) * 100 
            : 0

          return {
            id: data.member.id,
            name: data.member.name,
            avatar_url: data.member.avatar_url,
            games: data.sessionCount,
            average: Math.round(averageScore * 10) / 10,
            improvement: Math.round(improvementRate * 10) / 10,
            bestScore: data.bestScore
          }
        })
        .sort((a, b) => b.average - a.average)
        .slice(0, 5)

      return topPlayers
    } catch (error) {
      console.error('Error fetching top 5 players:', error)
      return []
    }
  },

  // Get lane trends for chart
  async getLaneTrends(): Promise<any[]> {
    try {
      const { data: gameResults, error } = await supabase
        .from('game_results')
        .select(`
          score,
          game_number,
          session_id,
          game_sessions!inner(
            date,
            lane_number
          )
        `)
        .not('game_sessions.lane_number', 'is', null)

      if (error) throw error


      // 세션별, 레인별 점수 집계
      const sessionScores = new Map<string, number[]>() // sessionId -> scores[]
      const sessionInfo = new Map<string, any>() // sessionId -> {date, lane}

      gameResults?.forEach(result => {
        const sessionId = result.session_id
        const session = Array.isArray(result.game_sessions) ? result.game_sessions[0] : result.game_sessions

        // session이 존재하는지 확인
        if (!session) return

        if (!sessionScores.has(sessionId)) {
          sessionScores.set(sessionId, [])
          sessionInfo.set(sessionId, {
            date: session.date,
            laneNumber: session.lane_number
          })
        }
        
        sessionScores.get(sessionId)!.push(result.score)
      })


      // 레인별, 날짜별 평균 계산
      const laneData = new Map<string, {
        laneNumber: number
        scores: number[]
        gameCount: number
        date: string
      }>()

      sessionScores.forEach((scores, sessionId) => {
        const info = sessionInfo.get(sessionId)!
        if (scores.length > 0 && scores.length % 3 === 0) { // 3의 배수인 세션만 처리 (완전한 세션)
          const sessionAvg = scores.reduce((sum, score) => sum + score, 0) / scores.length
          const key = `${info.laneNumber}-${info.date}`

          if (!laneData.has(key)) {
            laneData.set(key, {
              laneNumber: info.laneNumber,
              scores: [],
              gameCount: 0,
              date: info.date
            })
          }

          const data = laneData.get(key)!
          data.scores.push(sessionAvg)
          data.gameCount += 1
        }
      })

      // 레인별 추이 데이터 생성
      const trends = Array.from(laneData.values())
        .map(data => ({
          laneNumber: data.laneNumber,
          averageScore: Math.round((data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length) * 10) / 10,
          gameCount: data.gameCount,
          date: data.date,
          formattedDate: new Date(data.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      // 레인별로 그룹화
      const laneGroups = new Map<number, any[]>()
      trends.forEach(trend => {
        if (!laneGroups.has(trend.laneNumber)) {
          laneGroups.set(trend.laneNumber, [])
        }
        laneGroups.get(trend.laneNumber)!.push(trend)
      })

      const finalResult = Array.from(laneGroups.entries()).map(([laneNumber, data]) => {
        // 레인별 전체 평균 계산
        const overallAverage = data.reduce((sum, item) => sum + item.averageScore, 0) / data.length
        
        return {
          laneNumber,
          data,
          overallAverage: Math.round(overallAverage * 10) / 10
        }
      })
      // 레인별 평균 점수 기준으로 내림차순 정렬 (높은 점수부터)
      .sort((a, b) => b.overallAverage - a.overallAverage)
      
      return finalResult
    } catch (error) {
      console.error('Error fetching lane trends:', error)
      return []
    }
  }
}