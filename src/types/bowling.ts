// Bowling specific types and interfaces

// OCR Related Types
export interface OCRResult {
  text: string
  confidence: number
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface ProcessedBowlingData {
  members: {
    name: string
    games: {
      gameNumber: 1 | 2 | 3
      score: number
      frames?: FrameData[]
    }[]
  }[]
  sessionInfo?: {
    date?: string
    location?: string
    lane?: number
  }
}

export interface FrameData {
  frameNumber: number
  roll1?: number | 'X' | '-'
  roll2?: number | '/' | '-'
  roll3?: number | 'X' | '/' | '-' // Only for 10th frame
  frameScore: number
  runningTotal: number
  isStrike: boolean
  isSpare: boolean
  isSplit?: boolean
}

// Statistics and Analytics Types
export interface PlayerStats {
  member: {
    id: string
    name: string
    avatar_url?: string
  }
  statistics: {
    totalGames: number
    totalSessions: number
    averageScore: number
    highestScore: number
    lowestScore: number
    totalStrikes: number
    totalSpares: number
    totalSplits: number
    improvementRate: number
    consistencyScore: number
    lastPlayedDate?: string
  }
  recentGames: {
    date: string
    scores: number[]
    average: number
  }[]
  achievements: {
    id: string
    name: string
    description: string
    badge_icon: string
    badge_color: string
    rarity: string
    achieved_date: string
  }[]
}

export interface GroupStats {
  totalPlayers: number
  totalGames: number
  totalSessions: number
  averageScore: number
  highestScore: {
    score: number
    player: string
    date: string
  }
  mostActivePlayer: {
    name: string
    gameCount: number
  }
  mvpCurrentMonth: {
    name: string
    averageScore: number
  }
}

export interface FunStats {
  luckyDayOfWeek: {
    day: string
    averageScore: number
  }
  comebackKing: {
    name: string
    improvement: number
    fromScore: number
    toScore: number
    date: string
  }
  consistencyChampion: {
    name: string
    deviation: number
    scores: number[]
  }
  almostPerfect: {
    name: string
    score: number
    missedBy: number
    date: string
  }[]
}

// Gamification Types
export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  category: string
  points: number
  condition: {
    type: string
    value: Record<string, any>
  }
}

export interface PlayerLevel {
  level: number
  title: string
  minScore: number
  maxScore: number
  color: string
  icon: string
}

export interface SeasonPass {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  challenges: Challenge[]
  rewards: Reward[]
}

export interface Challenge {
  id: string
  name: string
  description: string
  type: 'score' | 'streak' | 'participation' | 'improvement'
  target: number
  current: number
  completed: boolean
  points: number
  deadline?: string
}

export interface Reward {
  id: string
  name: string
  description: string
  type: 'badge' | 'title' | 'points' | 'special'
  value: any
  unlocked: boolean
}

// UI and Component Types
export interface BowlingTheme {
  colors: {
    primary: string
    secondary: string
    strike: string
    spare: string
    gutter: string
    success: string
    warning: string
    error: string
  }
  fonts: {
    heading: string
    body: string
    mono: string
  }
}

export interface NavigationItem {
  id: string
  label: string
  icon: string
  path: string
  badge?: number
  children?: NavigationItem[]
}

// Error and Loading States
export interface ApiResponse<T> {
  data?: T
  error?: string
  loading: boolean
  success: boolean
}

export interface UploadProgress {
  uploading: boolean
  processing: boolean
  progress: number
  stage: 'upload' | 'ocr' | 'processing' | 'complete' | 'error'
  message?: string
  error?: string
}

// Form Types
export interface GameSessionForm {
  sessionName: string
  date: string
  location: string
  startTime?: string
  endTime?: string
  laneNumber?: number
  sessionType: 'regular' | 'tournament' | 'practice'
  notes?: string
}

export interface MemberForm {
  name: string
  email?: string
  phone?: string
  joinedDate?: string
  notes?: string
}

export interface GameResultForm {
  memberId: string
  scores: {
    game1: number
    game2: number
    game3: number
  }
  strikes?: {
    game1: number
    game2: number
    game3: number
  }
  spares?: {
    game1: number
    game2: number
    game3: number
  }
  notes?: string
}

// Chart and Visualization Types
export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }[]
}

export interface TrendData {
  period: string
  value: number
  change?: number
  changePercentage?: number
}

export interface ComparisonData {
  category: string
  current: number
  previous?: number
  average?: number
  best?: number
}

// Game History Types
export interface GameHistorySession {
  id: string
  date: string
  sessionName?: string
  location?: string
  laneNumber?: number
  sessionType: 'regular' | 'tournament' | 'practice'
  totalParticipants: number
  results: GameHistoryResult[]
  created_at: string
}

export interface GameHistoryResult {
  member: {
    id: string
    name: string
    avatar_url?: string
  }
  scores: number[]
  average: number
  strikes: number
  spares: number
  improvement?: number
  rank: number
  achievements?: string[]
}

export interface GameHistoryFilter {
  dateRange?: {
    from?: string
    to?: string
  }
  members?: string[]
  sessionType?: ('regular' | 'tournament' | 'practice')[]
  minScore?: number
  maxScore?: number
  sortBy?: 'date' | 'average' | 'participants'
  sortOrder?: 'asc' | 'desc'
}

export interface GameHistoryStats {
  totalSessions: number
  totalGames: number
  averageScore: number
  topPerformer: {
    name: string
    average: number
  }
  mostActive: {
    name: string
    sessions: number
  }
  bestSession: {
    date: string
    average: number
  }
}

// Game History Highlights Types
export interface SessionHighlight {
  date: string
  sessionName?: string
  location?: string
  laneNumber?: number
  sessionType: 'regular' | 'tournament' | 'practice'
  totalParticipants: number
  champion: {
    id: string
    name: string
    avatar_url?: string
    average: number
    improvement?: number
  }
  topScore: {
    id: string
    name: string
    score: number
    gameNumber: 1 | 2 | 3
  }
  bestTeam?: {
    members: Array<{
      id: string
      name: string
      average: number
    }>
    totalAverage: number
  }
  specialAchievements: Array<{
    memberId: string
    memberName: string
    achievement: string
    value?: number
  }>
  sessionStats: {
    averageScore: number
    totalStrikes: number
    totalSpares: number
    perfectGames: number
  }
}

// Date Grouped Game History Types
export interface DateGroupedSession {
  date: string
  sessions: GameHistorySession[]
  dateStats: {
    totalSessions: number
    totalParticipants: number
    averageScore: number
    champion: {
      id: string
      name: string
      average: number
    }
    teamStats?: TeamDayStats[]
  }
}

export interface TeamDayStats {
  teamName: string
  members: Array<{
    id: string
    name: string
    average: number
  }>
  teamAverage: number
  totalGames: number
  rank: number
}

export interface RecentGamesAverage {
  member: {
    id: string
    name: string
    avatar_url?: string
  }
  recentAverage: number
  totalGames: number
  recentGames: number
  trend?: 'up' | 'down' | 'stable'
  trendPercentage?: number
  lastSessionDate?: string
}

export interface HighlightsSummary {
  recentHighlights: SessionHighlight[]
  monthlyChampions: Array<{
    month: string
    champion: {
      name: string
      average: number
      sessions: number
    }
  }>
  records: {
    highestSingleGame: {
      score: number
      member: string
      date: string
    }
    highestAverage: {
      average: number
      member: string
      date: string
    }
    mostImproved: {
      improvement: number
      member: string
      date: string
      fromScore: number
      toScore: number
    }
    perfectStreak: {
      member: string
      sessions: number
      startDate: string
      endDate?: string
    }
  }
  milestones: Array<{
    type: 'first_200' | 'perfect_game' | 'attendance_milestone' | 'improvement_milestone'
    member: string
    date: string
    value: number
    description: string
  }>
}

// Export all types
export type {
  Database,
  Member,
  GameSession,
  GameResult,
  Achievement,
  MemberAchievement,
  MemberStatistics,
  UploadHistory
} from './database'