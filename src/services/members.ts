import { supabase, handleSupabaseResponse } from './supabase'
import type { Member, MemberInsert, MemberUpdate } from '@/types/database'

// Get all members
export const getMembers = async () => {
  const response = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false })
  
  return handleSupabaseResponse(response)
}

// Get member by ID
export const getMember = async (id: string) => {
  const response = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single()
  
  return handleSupabaseResponse(response)
}

// Get member with statistics
export const getMemberStatistics = async (id: string) => {
  const response = await supabase
    .from('members')
    .select(`
      *,
      member_statistics (*)
    `)
    .eq('id', id)
    .single()
  
  return handleSupabaseResponse(response)
}

// Create new member
export const createMember = async (member: MemberInsert) => {
  const response = await supabase
    .from('members')
    .insert(member)
    .select()
    .single()
  
  return handleSupabaseResponse(response)
}

// Update member
export const updateMember = async (id: string, updates: MemberUpdate) => {
  const response = await supabase
    .from('members')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  return handleSupabaseResponse(response)
}

// Delete member
export const deleteMember = async (id: string) => {
  const response = await supabase
    .from('members')
    .delete()
    .eq('id', id)
  
  return handleSupabaseResponse(response)
}

// Get active members only
export const getActiveMembers = async () => {
  const response = await supabase
    .from('members')
    .select('*')
    .eq('is_active', true)
    .order('name')
  
  return handleSupabaseResponse(response)
}

// Get active members count
export const getActiveMembersCount = async () => {
  const response = await supabase
    .from('members')
    .select('id', { count: 'exact' })
    .eq('is_active', true)
  
  return handleSupabaseResponse(response)
}

// Search members
export const searchMembers = async (query: string) => {
  const response = await supabase
    .from('members')
    .select('*')
    .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
    .order('name')
  
  return handleSupabaseResponse(response)
}

