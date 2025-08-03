import { supabase, handleSupabaseResponse } from './supabase'
import type { Achievement, MemberAchievement, MemberAchievementInsert } from '@/types/database'

export const achievementsService = {
  // Get all achievements
  async getAchievements() {
    const response = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
    
    return handleSupabaseResponse(response)
  },

  // Get achievement by ID
  async getAchievementById(id: string) {
    const response = await supabase
      .from('achievements')
      .select('*')
      .eq('id', id)
      .single()
    
    return handleSupabaseResponse(response)
  },

  // Get achievements by category
  async getAchievementsByCategory(category: string) {
    const response = await supabase
      .from('achievements')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('points', { ascending: true })
    
    return handleSupabaseResponse(response)
  },

  // Get achievements by rarity
  async getAchievementsByRarity(rarity: 'common' | 'rare' | 'epic' | 'legendary') {
    const response = await supabase
      .from('achievements')
      .select('*')
      .eq('rarity', rarity)
      .eq('is_active', true)
      .order('points', { ascending: true })
    
    return handleSupabaseResponse(response)
  },

  // Get member achievements
  async getMemberAchievements(memberId: string) {
    const response = await supabase
      .from('member_achievements')
      .select(`
        *,
        achievements (*)
      `)
      .eq('member_id', memberId)
      .order('achieved_date', { ascending: false })
    
    return handleSupabaseResponse(response)
  },

  // Get all member achievements with member info
  async getAllMemberAchievements() {
    const response = await supabase
      .from('member_achievements')
      .select(`
        *,
        members (name, email),
        achievements (name, description, badge_icon, rarity)
      `)
      .order('achieved_date', { ascending: false })
    
    return handleSupabaseResponse(response)
  },

  // Award achievement to member
  async awardAchievement(memberAchievement: MemberAchievementInsert) {
    // Check if achievement already exists for this member
    const existingResponse = await supabase
      .from('member_achievements')
      .select('id')
      .eq('member_id', memberAchievement.member_id)
      .eq('achievement_id', memberAchievement.achievement_id)
      .maybeSingle()

    if (existingResponse.data) {
      throw new Error('Achievement already awarded to this member')
    }

    const response = await supabase
      .from('member_achievements')
      .insert(memberAchievement)
      .select(`
        *,
        achievements (*)
      `)
      .single()
    
    return handleSupabaseResponse(response)
  },

  // Remove achievement from member
  async removeAchievement(memberId: string, achievementId: string) {
    const response = await supabase
      .from('member_achievements')
      .delete()
      .eq('member_id', memberId)
      .eq('achievement_id', achievementId)
    
    return handleSupabaseResponse(response)
  },

  // Get achievement statistics
  async getAchievementStatistics() {
    const response = await supabase
      .rpc('get_achievement_statistics')
    
    return handleSupabaseResponse(response)
  },

  // Get member's achievement progress
  async getMemberAchievementProgress(memberId: string) {
    const [achievements, memberAchievements] = await Promise.all([
      this.getAchievements(),
      this.getMemberAchievements(memberId)
    ])

    if (!achievements || !memberAchievements) {
      return null
    }

    const achievedIds = new Set(memberAchievements.map(ma => ma.achievement_id))
    
    return achievements.map(achievement => ({
      ...achievement,
      isAchieved: achievedIds.has(achievement.id),
      achievedDate: memberAchievements.find(ma => ma.achievement_id === achievement.id)?.achieved_date
    }))
  },

  // Get recent achievements (for dashboard)
  async getRecentAchievements(limit: number = 10) {
    const response = await supabase
      .from('member_achievements')
      .select(`
        *,
        members (name),
        achievements (name, description, badge_icon, rarity)
      `)
      .order('achieved_date', { ascending: false })
      .limit(limit)
    
    return handleSupabaseResponse(response)
  },

  // Get achievement leaderboard (members with most achievements)
  async getAchievementLeaderboard(limit: number = 20) {
    const response = await supabase
      .rpc('get_achievement_leaderboard', { result_limit: limit })
    
    return handleSupabaseResponse(response)
  },

  // Check and award automatic achievements for a member
  async checkAndAwardAchievements(memberId: string, sessionId?: string) {
    // This would typically be called after game results are added
    // Implementation would check various conditions and award achievements
    
    const response = await supabase
      .rpc('check_and_award_achievements', {
        member_id: memberId,
        session_id: sessionId
      })
    
    return handleSupabaseResponse(response)
  }
}