// Database schema types for Supabase
export interface Database {
  public: {
    Tables: {
      members: {
        Row: Member
        Insert: MemberInsert
        Update: MemberUpdate
      }
      game_sessions: {
        Row: GameSession
        Insert: GameSessionInsert
        Update: GameSessionUpdate
      }
      game_results: {
        Row: GameResult
        Insert: GameResultInsert
        Update: GameResultUpdate
      }
      upload_history: {
        Row: UploadHistory
        Insert: UploadHistoryInsert
        Update: UploadHistoryUpdate
      }
      member_statistics: {
        Row: MemberStatistics
        Insert: MemberStatisticsInsert
        Update: MemberStatisticsUpdate
      }
      achievements: {
        Row: Achievement
        Insert: AchievementInsert
        Update: AchievementUpdate
      }
      member_achievements: {
        Row: MemberAchievement
        Insert: MemberAchievementInsert
        Update: MemberAchievementUpdate
      }
    }
  }
}

// Member types
export interface Member {
  id: string
  name: string
  email?: string
  phone?: string
  joined_date: string
  is_active: boolean
  avatar_url?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface MemberInsert {
  id?: string
  name: string
  email?: string
  phone?: string
  joined_date?: string
  is_active?: boolean
  avatar_url?: string
  notes?: string
}

export interface MemberUpdate {
  name?: string
  email?: string
  phone?: string
  joined_date?: string
  is_active?: boolean
  avatar_url?: string
  notes?: string
  updated_at?: string
}

// Game Session types
export interface GameSession {
  id: string
  session_name?: string
  date: string
  location?: string
  start_time?: string
  end_time?: string
  lane_number?: number
  total_participants: number
  session_type: 'regular' | 'tournament' | 'practice'
  notes?: string
  created_at: string
  updated_at: string
}

export interface GameSessionInsert {
  id?: string
  session_name?: string
  date: string
  location?: string
  start_time?: string
  end_time?: string
  lane_number?: number
  total_participants?: number
  session_type?: 'regular' | 'tournament' | 'practice'
  notes?: string
}

export interface GameSessionUpdate {
  session_name?: string
  date?: string
  location?: string
  start_time?: string
  end_time?: string
  lane_number?: number
  total_participants?: number
  session_type?: 'regular' | 'tournament' | 'practice'
  notes?: string
  updated_at?: string
}

// Game Result types
export interface GameResult {
  id: string
  session_id: string
  member_id: string
  game_number: 1 | 2 | 3
  score: number
  strikes: number
  spares: number
  splits: number
  frame_scores?: FrameScore[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface GameResultInsert {
  id?: string
  session_id: string
  member_id: string
  game_number: 1 | 2 | 3
  score: number
  strikes?: number
  spares?: number
  splits?: number
  frame_scores?: FrameScore[]
  notes?: string
}

export interface GameResultUpdate {
  score?: number
  strikes?: number
  spares?: number
  splits?: number
  frame_scores?: FrameScore[]
  notes?: string
  updated_at?: string
}

// Frame Score for detailed bowling scoring
export interface FrameScore {
  frame: number
  roll1?: number
  roll2?: number
  roll3?: number // Only for 10th frame
  isStrike: boolean
  isSpare: boolean
  frameScore: number
  runningTotal: number
}

// Upload History types
export interface UploadHistory {
  id: string
  session_id?: string
  image_url: string
  original_filename?: string
  file_size?: number
  image_width?: number
  image_height?: number
  processed_date: string
  ocr_raw_text?: string
  ocr_confidence?: number
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message?: string
  created_at: string
}

export interface UploadHistoryInsert {
  id?: string
  session_id?: string
  image_url: string
  original_filename?: string
  file_size?: number
  image_width?: number
  image_height?: number
  ocr_raw_text?: string
  ocr_confidence?: number
  processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
  error_message?: string
}

export interface UploadHistoryUpdate {
  session_id?: string
  ocr_raw_text?: string
  ocr_confidence?: number
  processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
  error_message?: string
}

// Member Statistics types
export interface MemberStatistics {
  id: string
  member_id: string
  total_games: number
  total_sessions: number
  average_score: number
  highest_score: number
  lowest_score: number
  total_strikes: number
  total_spares: number
  total_splits: number
  improvement_rate: number
  consistency_score: number
  last_played_date?: string
  created_at: string
  updated_at: string
}

export interface MemberStatisticsInsert {
  id?: string
  member_id: string
  total_games?: number
  total_sessions?: number
  average_score?: number
  highest_score?: number
  lowest_score?: number
  total_strikes?: number
  total_spares?: number
  total_splits?: number
  improvement_rate?: number
  consistency_score?: number
  last_played_date?: string
}

export interface MemberStatisticsUpdate {
  total_games?: number
  total_sessions?: number
  average_score?: number
  highest_score?: number
  lowest_score?: number
  total_strikes?: number
  total_spares?: number
  total_splits?: number
  improvement_rate?: number
  consistency_score?: number
  last_played_date?: string
  updated_at?: string
}

// Achievement types
export interface Achievement {
  id: string
  name: string
  description?: string
  badge_icon?: string
  badge_color: string
  category?: string
  condition_type?: string
  condition_value?: Record<string, any>
  points: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  is_active: boolean
  created_at: string
}

export interface AchievementInsert {
  id?: string
  name: string
  description?: string
  badge_icon?: string
  badge_color?: string
  category?: string
  condition_type?: string
  condition_value?: Record<string, any>
  points?: number
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
  is_active?: boolean
}

export interface AchievementUpdate {
  name?: string
  description?: string
  badge_icon?: string
  badge_color?: string
  category?: string
  condition_type?: string
  condition_value?: Record<string, any>
  points?: number
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
  is_active?: boolean
}

// Member Achievement types
export interface MemberAchievement {
  id: string
  member_id: string
  achievement_id: string
  achieved_date: string
  achieved_value?: Record<string, any>
  session_id?: string
  created_at: string
}

export interface MemberAchievementInsert {
  id?: string
  member_id: string
  achievement_id: string
  achieved_date?: string
  achieved_value?: Record<string, any>
  session_id?: string
}

export interface MemberAchievementUpdate {
  achieved_value?: Record<string, any>
  session_id?: string
}