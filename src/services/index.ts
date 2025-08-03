// Export all services
export { supabase, handleSupabaseResponse } from './supabase'
export { membersService } from './members'
export { sessionsService } from './sessions'
export { gameResultsService } from './gameResults'
export { achievementsService } from './achievements'
export { statisticsService } from './statistics'

// Export types from services
export type { 
  DashboardStats, 
  MemberStatsDetail, 
  FunStatistics 
} from './statistics'