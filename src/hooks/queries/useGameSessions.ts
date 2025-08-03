import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { GameSession, GameSessionInsert, GameSessionUpdate } from '@/types/database';
import { 
  getGameSessions, 
  getGameSession, 
  createGameSession, 
  updateGameSession, 
  deleteGameSession 
} from '@/services/gameSessions';

export const GAME_SESSIONS_QUERY_KEY = 'gameSessions';

export const useGameSessions = () => {
  return useQuery({
    queryKey: [GAME_SESSIONS_QUERY_KEY],
    queryFn: getGameSessions,
  });
};

export const useGameSession = (id: string) => {
  return useQuery({
    queryKey: [GAME_SESSIONS_QUERY_KEY, id],
    queryFn: () => getGameSession(id),
    enabled: !!id,
  });
};

export const useCreateGameSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (session: GameSessionInsert) => createGameSession(session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GAME_SESSIONS_QUERY_KEY] });
    },
  });
};

export const useUpdateGameSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: GameSessionUpdate }) =>
      updateGameSession(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [GAME_SESSIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [GAME_SESSIONS_QUERY_KEY, id] });
    },
  });
};

export const useDeleteGameSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteGameSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GAME_SESSIONS_QUERY_KEY] });
    },
  });
};