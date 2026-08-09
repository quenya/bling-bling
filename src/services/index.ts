// Export all services
export { supabase, handleSupabaseResponse } from './supabase'

// Export individual functions from each service
export * from './members'
export * from './sessions'
export * from './gameResults'
export * from './achievements'
export * from './statistics'
export * from './gameSessions'
export * from './gameHistory'

// Re-export service objects for convenience (where available)
export { sessionsService } from './sessions'
export { achievementsService } from './achievements'
export { statisticsService } from './statistics'

// Export types from services
export type { 
  DashboardStats, 
  MemberStatsDetail, 
  FunStatistics 
} from './statistics'