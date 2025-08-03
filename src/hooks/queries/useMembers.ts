import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Member, MemberInsert, MemberUpdate } from '@/types/database';
import { 
  getMembers, 
  getMember, 
  getMemberStatistics, 
  createMember, 
  updateMember, 
  deleteMember, 
  getActiveMembersCount 
} from '@/services/members';

export const MEMBERS_QUERY_KEY = 'members';

export const useMembers = () => {
  return useQuery({
    queryKey: [MEMBERS_QUERY_KEY],
    queryFn: getMembers,
  });
};

export const useMember = (id: string) => {
  return useQuery({
    queryKey: [MEMBERS_QUERY_KEY, id],
    queryFn: () => getMember(id),
    enabled: !!id,
  });
};

export const useMemberStatistics = (id: string) => {
  return useQuery({
    queryKey: [MEMBERS_QUERY_KEY, id, 'statistics'],
    queryFn: () => getMemberStatistics(id),
    enabled: !!id,
  });
};

export const useActiveMembersCount = () => {
  return useQuery({
    queryKey: [MEMBERS_QUERY_KEY, 'active-count'],
    queryFn: getActiveMembersCount,
  });
};

export const useMemberNames = () => {
  return useQuery({
    queryKey: [MEMBERS_QUERY_KEY, 'names'],
    queryFn: async () => {
      const members = await getMembers();
      return members.map(member => member.name).sort((a, b) => a.localeCompare(b, 'ko', { sensitivity: 'base' }));
    },
  });
};

export const useCreateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (member: MemberInsert) => createMember(member),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEMBERS_QUERY_KEY] });
    },
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: MemberUpdate }) =>
      updateMember(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [MEMBERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [MEMBERS_QUERY_KEY, id] });
    },
  });
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MEMBERS_QUERY_KEY] });
    },
  });
};