import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/utils/supabase'

export interface Member {
  id: string
  name: string
  email?: string
  joined_date?: string
}

/**
 * 모든 회원 목록을 가져오는 훅
 */
export const useMembers = () => {
  return useQuery({
    queryKey: ['members'],
    queryFn: async (): Promise<Member[]> => {
      const { data, error } = await supabase
        .from('members')
        .select('id, name, email, joined_date')
        .order('name')
      
      if (error) {
        console.error('회원 목록 조회 실패:', error)
        throw error
      }
      
      return data || []
    },
    staleTime: 5 * 60 * 1000, // 5분
  })
}

/**
 * 중복 제거된 회원 이름 목록을 가져오는 훅
 */
export const useMemberNames = () => {
  return useQuery({
    queryKey: ['member-names'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('members')
        .select('name')
        .order('name')
      
      if (error) {
        console.error('회원 이름 목록 조회 실패:', error)
        throw error
      }
      
      // 중복 제거
      const uniqueNames = [...new Set((data || []).map(member => member.name))]
      return uniqueNames.filter(name => name && name.trim().length > 0)
    },
    staleTime: 5 * 60 * 1000, // 5분
  })
}