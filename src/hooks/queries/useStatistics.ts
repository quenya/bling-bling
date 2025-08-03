import { useQuery } from '@tanstack/react-query';
import { statisticsService } from '@/services/statistics';

export const STATISTICS_QUERY_KEY = 'statistics';

export const useOverallStatistics = () => {
  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'overall'],
    queryFn: statisticsService.getOverallStatistics,
  });
};

export const useMemberRankings = () => {
  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'member-rankings'],
    queryFn: statisticsService.getMemberRankings,
  });
};

export const useScoreDistribution = () => {
  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'score-distribution'],
    queryFn: statisticsService.getScoreDistribution,
  });
};

export const useMonthlyTrends = (months: number = 12) => {
  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'monthly-trends', months],
    queryFn: () => statisticsService.getMonthlyTrends(months),
  });
};

export const useWeeklyPatterns = () => {
  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'weekly-patterns'],
    queryFn: statisticsService.getWeeklyPatterns,
  });
};

export const useGameProgression = (sessionId: string) => {
  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'game-progression', sessionId],
    queryFn: () => statisticsService.getGameProgression(sessionId),
    enabled: !!sessionId,
  });
};

export const useStreakAnalysis = () => {
  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'streak-analysis'],
    queryFn: statisticsService.getStreakAnalysis,
  });
};

export const useCompetitiveAnalysis = (member1Id: string, member2Id: string) => {
  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'competitive', member1Id, member2Id],
    queryFn: () => statisticsService.getCompetitiveAnalysis(member1Id, member2Id),
    enabled: !!member1Id && !!member2Id,
  });
};

export const usePersonalBests = (memberId: string) => {
  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'personal-bests', memberId],
    queryFn: () => statisticsService.getPersonalBests(memberId),
    enabled: !!memberId,
  });
};

export const useImprovementRate = (memberId: string) => {
  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'improvement-rate', memberId],
    queryFn: () => statisticsService.getImprovementRate(memberId),
    enabled: !!memberId,
  });
};

export const useConsistencyAnalysis = (memberId: string) => {
  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'consistency', memberId],
    queryFn: () => statisticsService.getConsistencyAnalysis(memberId),
    enabled: !!memberId,
  });
};

export const useClutchPerformance = (memberId: string) => {
  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'clutch-performance', memberId],
    queryFn: () => statisticsService.getClutchPerformance(memberId),
    enabled: !!memberId,
  });
};

export const useTop5Players = () => {
  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'top5Players'],
    queryFn: () => statisticsService.getTop5Players(),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};

export const useLaneTrends = () => {
  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'laneTrends'],
    queryFn: () => statisticsService.getLaneTrends(),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: [STATISTICS_QUERY_KEY, 'dashboard'],
    queryFn: () => statisticsService.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2분
    gcTime: 5 * 60 * 1000, // 5분
  });
};