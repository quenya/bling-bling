import { useQuery } from '@tanstack/react-query'
import { getGameHistory, generateHighlightsSummary, getDateGroupedGameHistory, getRecentGamesAverages } from '../../services/gameHistory'
import type { GameHistorySession, HighlightsSummary, DateGroupedSession, RecentGamesAverage } from '../../types/bowling'

// 게임 히스토리 조회
export const useGameHistory = (options?: {
  limit?: number
  offset?: number
  dateFrom?: string
  dateTo?: string
}) => {
  return useQuery<GameHistorySession[], Error>({
    queryKey: ['gameHistory', options],
    queryFn: () => getGameHistory(options),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  })
}

// 하이라이트 요약 데이터 조회
export const useGameHistoryHighlights = () => {
  return useQuery<HighlightsSummary, Error>({
    queryKey: ['gameHistoryHighlights'],
    queryFn: generateHighlightsSummary,
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 30 * 60 * 1000, // 30분
  })
}

// 날짜별 그룹화된 게임 히스토리 조회
export const useDateGroupedGameHistory = (options?: {
  limit?: number
  offset?: number
  dateFrom?: string
  dateTo?: string
  sortBy?: 'date' | 'average'
  sortOrder?: 'asc' | 'desc'
}) => {
  return useQuery<DateGroupedSession[], Error>({
    queryKey: ['dateGroupedGameHistory', options],
    queryFn: () => getDateGroupedGameHistory(options),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  })
}

// 최근 N게임 평균 조회
export const useRecentGamesAverages = (gameCount: number = 20) => {
  return useQuery<RecentGamesAverage[], Error>({
    queryKey: ['recentGamesAverages', gameCount],
    queryFn: () => getRecentGamesAverages(gameCount),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  })
}