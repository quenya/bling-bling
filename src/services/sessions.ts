import { supabase, handleSupabaseResponse } from './supabase'
import type { GameSession, GameSessionInsert, GameSessionUpdate } from '@/types/database'

export const sessionsService = {
  // Get all sessions
  async getSessions() {
    const response = await supabase
      .from('game_sessions')
      .select('*')
      .order('date', { ascending: false })
    
    return handleSupabaseResponse(response)
  },

  // Get session by ID
  async getSessionById(id: string) {
    const response = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', id)
      .single()
    
    return handleSupabaseResponse(response)
  },

  // Get session with results and members
  async getSessionWithResults(id: string) {
    const response = await supabase
      .from('game_sessions')
      .select(`
        *,
        game_results (
          *,
          members (name, email)
        )
      `)
      .eq('id', id)
      .single()
    
    return handleSupabaseResponse(response)
  },

  // Create new session
  async createSession(session: GameSessionInsert) {
    const response = await supabase
      .from('game_sessions')
      .insert(session)
      .select()
      .single()
    
    return handleSupabaseResponse(response)
  },

  // Update session
  async updateSession(id: string, updates: GameSessionUpdate) {
    const response = await supabase
      .from('game_sessions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    return handleSupabaseResponse(response)
  },

  // Delete session
  async deleteSession(id: string) {
    const response = await supabase
      .from('game_sessions')
      .delete()
      .eq('id', id)
    
    return handleSupabaseResponse(response)
  },

  // Get sessions by date range
  async getSessionsByDateRange(startDate: string, endDate: string) {
    const response = await supabase
      .from('game_sessions')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
    
    return handleSupabaseResponse(response)
  },

  // Get sessions by type
  async getSessionsByType(sessionType: 'regular' | 'tournament' | 'practice') {
    const response = await supabase
      .from('game_sessions')
      .select('*')
      .eq('session_type', sessionType)
      .order('date', { ascending: false })
    
    return handleSupabaseResponse(response)
  },

  // Get recent sessions
  async getRecentSessions(limit: number = 10) {
    const response = await supabase
      .from('game_sessions')
      .select('*')
      .order('date', { ascending: false })
      .limit(limit)
    
    return handleSupabaseResponse(response)
  },

  // Get upcoming sessions
  async getUpcomingSessions() {
    const today = new Date().toISOString().split('T')[0]
    const response = await supabase
      .from('game_sessions')
      .select('*')
      .gte('date', today)
      .order('date', { ascending: true })
    
    return handleSupabaseResponse(response)
  }
}