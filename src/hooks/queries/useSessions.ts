import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { GameSession, GameSessionInsert, GameSessionUpdate } from '@/types/database';
import * as sessionsService from '@/services/sessions';

export const SESSIONS_QUERY_KEY = 'sessions';

export const useSessions = (options?: { limit?: number; offset?: number }) => {
  return useQuery({
    queryKey: [SESSIONS_QUERY_KEY, options],
    queryFn: () => sessionsService.getSessions(options),
  });
};

export const useSession = (id: string) => {
  return useQuery({
    queryKey: [SESSIONS_QUERY_KEY, id],
    queryFn: () => sessionsService.getSession(id),
    enabled: !!id,
  });
};

export const useSessionWithResults = (id: string) => {
  return useQuery({
    queryKey: [SESSIONS_QUERY_KEY, id, 'with-results'],
    queryFn: () => sessionsService.getSessionWithResults(id),
    enabled: !!id,
  });
};

export const useRecentSessions = (limit: number = 5) => {
  return useQuery({
    queryKey: [SESSIONS_QUERY_KEY, 'recent', limit],
    queryFn: () => sessionsService.getRecentSessions(limit),
  });
};

export const useSessionsByMember = (memberId: string, options?: { limit?: number }) => {
  return useQuery({
    queryKey: [SESSIONS_QUERY_KEY, 'member', memberId, options],
    queryFn: () => sessionsService.getSessionsByMember(memberId, options),
    enabled: !!memberId,
  });
};

export const useSessionsByDateRange = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: [SESSIONS_QUERY_KEY, 'date-range', startDate, endDate],
    queryFn: () => sessionsService.getSessionsByDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (session: GameSessionInsert) => sessionsService.createSession(session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SESSIONS_QUERY_KEY] });
    },
  });
};

export const useUpdateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: GameSessionUpdate }) =>
      sessionsService.updateSession(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [SESSIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SESSIONS_QUERY_KEY, id] });
    },
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sessionsService.deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SESSIONS_QUERY_KEY] });
    },
  });
};