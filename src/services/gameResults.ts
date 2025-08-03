import { supabase, handleSupabaseResponse } from './supabase'
import type { GameResult, GameResultInsert, GameResultUpdate } from '@/types/database'

// Get all game results
export const getGameResults = async (sessionId?: string) => {
  let query = supabase
    .from('game_results')
    .select(`
      *,
      members (name, email),
      game_sessions (session_name, date, location)
    `)
    .order('created_at', { ascending: false })
  
  if (sessionId) {
    query = query.eq('session_id', sessionId)
  }
  
  return handleSupabaseResponse(await query)
}

// Get single game result
export const getGameResult = async (id: string) => {
  const response = await supabase
    .from('game_results')
    .select(`
      *,
      members (name, email),
      game_sessions (session_name, date, location)
    `)
    .eq('id', id)
    .single()
  
  return handleSupabaseResponse(response)
}

// Get game results by session
export const getGameResultsBySession = async (sessionId: string) => {
  const response = await supabase
    .from('game_results')
    .select(`
      *,
      members (name, email)
    `)
    .eq('session_id', sessionId)
    .order('game_number')
  
  return handleSupabaseResponse(response)
}

// Get game results by member with options
export const getGameResultsByMember = async (memberId: string, options?: { limit?: number }) => {
  let query = supabase
    .from('game_results')
    .select(`
      *,
      game_sessions (session_name, date, location)
    `)
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })
  
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  
  return handleSupabaseResponse(await query)
}

// Create game result
export const createGameResult = async (result: GameResultInsert) => {
  const response = await supabase
    .from('game_results')
    .insert(result)
    .select()
    .single()
  
  return handleSupabaseResponse(response)
}

// Create multiple game results (for batch upload)
export const createGameResults = async (results: GameResultInsert[]) => {
  const response = await supabase
    .from('game_results')
    .insert(results)
    .select()
  
  return handleSupabaseResponse(response)
}

// Create bulk game results (alias for createGameResults)
export const createBulkGameResults = async (results: GameResultInsert[]) => {
  return createGameResults(results)
}

// Update game result
export const updateGameResult = async (id: string, updates: GameResultUpdate) => {
  const response = await supabase
    .from('game_results')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  return handleSupabaseResponse(response)
}

// Delete game result
export const deleteGameResult = async (id: string) => {
  const response = await supabase
    .from('game_results')
    .delete()
    .eq('id', id)
  
  return handleSupabaseResponse(response)
}

// Get top scores
export const getTopScores = async (limit: number = 10) => {
  const response = await supabase
    .from('game_results')
    .select(`
      score,
      created_at,
      members (name),
      game_sessions (session_name, date, location)
    `)
    .order('score', { ascending: false })
    .limit(limit)
  
  return handleSupabaseResponse(response)
}

// Get recent perfect games (300 points)
export const getRecentPerfectGames = async (limit: number = 5) => {
  const response = await supabase
    .from('game_results')
    .select(`
      *,
      members (name),
      game_sessions (session_name, date, location)
    `)
    .eq('score', 300)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  return handleSupabaseResponse(response)
}

// Get high improvement games
export const getHighImprovementGames = async (limit: number = 10) => {
  const response = await supabase
    .rpc('get_high_improvement_games', { result_limit: limit })
  
  return handleSupabaseResponse(response)
}

// Get session averages
export const getSessionAverages = async (sessionId: string) => {
  const response = await supabase
    .from('game_results')
    .select('score, game_number')
    .eq('session_id', sessionId)
  
  const result = await handleSupabaseResponse(response)
  
  if (result && Array.isArray(result)) {
    const averages = {
      game1: 0,
      game2: 0,
      game3: 0,
      overall: 0
    }
    
    const gameGroups = result.reduce((acc, curr) => {
      if (!acc[curr.game_number]) acc[curr.game_number] = []
      acc[curr.game_number].push(curr.score)
      return acc
    }, {} as Record<number, number[]>)
    
    if (gameGroups[1]?.length) {
      averages.game1 = gameGroups[1].reduce((a, b) => a + b, 0) / gameGroups[1].length
    }
    if (gameGroups[2]?.length) {
      averages.game2 = gameGroups[2].reduce((a, b) => a + b, 0) / gameGroups[2].length
    }
    if (gameGroups[3]?.length) {
      averages.game3 = gameGroups[3].reduce((a, b) => a + b, 0) / gameGroups[3].length
    }
    
    const allScores = result.map(r => r.score)
    if (allScores.length) {
      averages.overall = allScores.reduce((a, b) => a + b, 0) / allScores.length
    }
    
    return averages
  }
  
  return result
}