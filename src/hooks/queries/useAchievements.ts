import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Achievement, MemberAchievement, MemberAchievementInsert } from '@/types/database';
import * as achievementsService from '@/services/achievements';

export const ACHIEVEMENTS_QUERY_KEY = 'achievements';
export const MEMBER_ACHIEVEMENTS_QUERY_KEY = 'memberAchievements';

export const useAchievements = () => {
  return useQuery({
    queryKey: [ACHIEVEMENTS_QUERY_KEY],
    queryFn: achievementsService.getAchievements,
  });
};

export const useAchievement = (id: string) => {
  return useQuery({
    queryKey: [ACHIEVEMENTS_QUERY_KEY, id],
    queryFn: () => achievementsService.getAchievement(id),
    enabled: !!id,
  });
};

export const useMemberAchievements = (memberId: string) => {
  return useQuery({
    queryKey: [MEMBER_ACHIEVEMENTS_QUERY_KEY, memberId],
    queryFn: () => achievementsService.getMemberAchievements(memberId),
    enabled: !!memberId,
  });
};

export const useRecentAchievements = (limit: number = 10) => {
  return useQuery({
    queryKey: [MEMBER_ACHIEVEMENTS_QUERY_KEY, 'recent', limit],
    queryFn: () => achievementsService.getRecentAchievements(limit),
  });
};

export const useAchievementLeaderboard = (achievementId: string) => {
  return useQuery({
    queryKey: [MEMBER_ACHIEVEMENTS_QUERY_KEY, 'leaderboard', achievementId],
    queryFn: () => achievementsService.getAchievementLeaderboard(achievementId),
    enabled: !!achievementId,
  });
};

export const useCheckEligibleAchievements = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => achievementsService.checkEligibleAchievements(memberId),
    onSuccess: (_, memberId) => {
      // 해당 멤버의 업적 목록을 새로고침
      queryClient.invalidateQueries({ 
        queryKey: [MEMBER_ACHIEVEMENTS_QUERY_KEY, memberId] 
      });
      // 최근 업적 목록도 새로고침
      queryClient.invalidateQueries({ 
        queryKey: [MEMBER_ACHIEVEMENTS_QUERY_KEY, 'recent'] 
      });
    },
  });
};

export const useGrantAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberAchievement: MemberAchievementInsert) => 
      achievementsService.grantAchievement(memberAchievement),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [MEMBER_ACHIEVEMENTS_QUERY_KEY, variables.member_id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [MEMBER_ACHIEVEMENTS_QUERY_KEY, 'recent'] 
      });
      if (variables.achievement_id) {
        queryClient.invalidateQueries({ 
          queryKey: [MEMBER_ACHIEVEMENTS_QUERY_KEY, 'leaderboard', variables.achievement_id] 
        });
      }
    },
  });
};

export const useRevokeAchievement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, achievementId }: { memberId: string; achievementId: string }) =>
      achievementsService.revokeAchievement(memberId, achievementId),
    onSuccess: (_, { memberId, achievementId }) => {
      queryClient.invalidateQueries({ 
        queryKey: [MEMBER_ACHIEVEMENTS_QUERY_KEY, memberId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [MEMBER_ACHIEVEMENTS_QUERY_KEY, 'recent'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [MEMBER_ACHIEVEMENTS_QUERY_KEY, 'leaderboard', achievementId] 
      });
    },
  });
};