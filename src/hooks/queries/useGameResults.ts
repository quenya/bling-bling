import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { GameResult, GameResultInsert, GameResultUpdate } from '@/types/database';
import { 
  getGameResults, 
  getGameResult, 
  getGameResultsByMember, 
  getTopScores, 
  getRecentPerfectGames, 
  getHighImprovementGames, 
  getSessionAverages, 
  createGameResult, 
  createBulkGameResults, 
  updateGameResult, 
  deleteGameResult 
} from '@/services/gameResults';

export const GAME_RESULTS_QUERY_KEY = 'gameResults';

export const useGameResults = (sessionId?: string) => {
  return useQuery({
    queryKey: [GAME_RESULTS_QUERY_KEY, sessionId],
    queryFn: () => getGameResults(sessionId),
  });
};

export const useGameResult = (id: string) => {
  return useQuery({
    queryKey: [GAME_RESULTS_QUERY_KEY, 'single', id],
    queryFn: () => getGameResult(id),
    enabled: !!id,
  });
};

export const useGameResultsByMember = (memberId: string, options?: { limit?: number }) => {
  return useQuery({
    queryKey: [GAME_RESULTS_QUERY_KEY, 'member', memberId, options],
    queryFn: () => getGameResultsByMember(memberId, options),
    enabled: !!memberId,
  });
};

export const useTopScores = (limit: number = 10) => {
  return useQuery({
    queryKey: [GAME_RESULTS_QUERY_KEY, 'top-scores', limit],
    queryFn: () => getTopScores(limit),
  });
};

export const useRecentPerfectGames = (limit: number = 5) => {
  return useQuery({
    queryKey: [GAME_RESULTS_QUERY_KEY, 'perfect-games', limit],
    queryFn: () => getRecentPerfectGames(limit),
  });
};

export const useHighImprovementGames = (limit: number = 10) => {
  return useQuery({
    queryKey: [GAME_RESULTS_QUERY_KEY, 'high-improvement', limit],
    queryFn: () => getHighImprovementGames(limit),
  });
};

export const useSessionAverages = (sessionId: string) => {
  return useQuery({
    queryKey: [GAME_RESULTS_QUERY_KEY, 'session-averages', sessionId],
    queryFn: () => getSessionAverages(sessionId),
    enabled: !!sessionId,
  });
};

export const useCreateGameResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameResult: GameResultInsert) => createGameResult(gameResult),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GAME_RESULTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [GAME_RESULTS_QUERY_KEY, variables.session_id] });
      // 멤버 통계도 업데이트
      queryClient.invalidateQueries({ queryKey: ['members', variables.member_id, 'statistics'] });
    },
  });
};

export const useCreateBulkGameResults = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameResults: GameResultInsert[]) => 
      createBulkGameResults(gameResults),
    onSuccess: (_, variables) => {
      // 배치로 무효화하여 성능 최적화
      const queries = [
        { queryKey: [GAME_RESULTS_QUERY_KEY] },
      ];
      
      // 세션별로 무효화
      const sessionIds = [...new Set(variables.map(gr => gr.session_id))];
      sessionIds.forEach(sessionId => {
        queries.push({ queryKey: [GAME_RESULTS_QUERY_KEY, sessionId] });
      });

      // 멤버별 통계 무효화
      const memberIds = [...new Set(variables.map(gr => gr.member_id))];
      memberIds.forEach(memberId => {
        queries.push({ queryKey: ['members', memberId, 'statistics'] });
      });

      // 한 번에 모든 쿼리 무효화
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          queries.some(q => 
            query.queryKey.length >= q.queryKey.length && 
            q.queryKey.every((key, i) => query.queryKey[i] === key)
          )
      });
    },
    onError: (error) => {
      console.error('Bulk game results creation failed:', error);
    },
    retry: 1, // 1번만 재시도
    retryDelay: 1000, // 1초 후 재시도
  });
};

export const useUpdateGameResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: GameResultUpdate }) =>
      updateGameResult(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [GAME_RESULTS_QUERY_KEY] });
      if (data?.session_id) {
        queryClient.invalidateQueries({ queryKey: [GAME_RESULTS_QUERY_KEY, data.session_id] });
      }
      if (data?.member_id) {
        queryClient.invalidateQueries({ queryKey: ['members', data.member_id, 'statistics'] });
      }
    },
  });
};

export const useDeleteGameResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteGameResult(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GAME_RESULTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};