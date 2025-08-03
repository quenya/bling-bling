import { supabase, handleSupabaseResponse } from './supabase'
import type { GameSession, GameSessionInsert, GameSessionUpdate } from '@/types/database'

// Get all game sessions
export const getGameSessions = async () => {
  const response = await supabase
    .from('game_sessions')
    .select('*')
    .order('date', { ascending: false })
  
  return handleSupabaseResponse(response)
}

// Get single game session
export const getGameSession = async (id: string) => {
  const response = await supabase
    .from('game_sessions')
    .select('*')
    .eq('id', id)
    .single()
  
  return handleSupabaseResponse(response)
}

// Create game session
export const createGameSession = async (session: GameSessionInsert) => {
  const response = await supabase
    .from('game_sessions')
    .insert(session)
    .select()
    .single()
  
  return handleSupabaseResponse(response)
}

// Update game session
export const updateGameSession = async (id: string, updates: GameSessionUpdate) => {
  const response = await supabase
    .from('game_sessions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  return handleSupabaseResponse(response)
}

// Delete game session
export const deleteGameSession = async (id: string) => {
  const response = await supabase
    .from('game_sessions')
    .delete()
    .eq('id', id)
  
  return handleSupabaseResponse(response)
}

// Find session by date and lane number
export const findSessionByDateAndLane = async (date: string, laneNumber: number) => {
  const response = await supabase
    .from('game_sessions')
    .select('*')
    .eq('date', date)
    .eq('lane_number', laneNumber)
    .maybeSingle()
  
  return handleSupabaseResponse(response)
}