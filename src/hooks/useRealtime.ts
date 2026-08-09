import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];
type TableName = keyof Tables;

interface RealtimeSubscriptionOptions {
  table: TableName;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  onInsert?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<any>) => void;
  invalidateQueries?: string[];
}

/**
 * Supabase Realtime 구독을 관리하는 커스텀 훅
 */
export const useRealtime = (options: RealtimeSubscriptionOptions) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const {
      table,
      event = '*',
      filter,
      onInsert,
      onUpdate,
      onDelete,
      invalidateQueries = [],
    } = options;

    // 채널 생성
    const channel = supabase.channel(`realtime-${table}`)
      // @ts-ignore - Supabase types issue with postgres_changes
      .on(
        'postgres_changes' as any,
        { event: event, schema: 'public', table: table, filter: filter } as any,
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log(`Realtime event on ${table}:`, payload);

          // 이벤트별 콜백 실행
          switch (payload.eventType) {
            case 'INSERT':
              onInsert?.(payload);
              break;
            case 'UPDATE':
              onUpdate?.(payload);
              break;
            case 'DELETE':
              onDelete?.(payload);
              break;
          }

          // React Query 캐시 무효화
          invalidateQueries.forEach(queryKey => {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
          });
        }
      )
      .subscribe((status) => {
        console.log(`Realtime subscription status for ${table}:`, status);
      });

    channelRef.current = channel;

    // 클린업 함수
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [options.table, options.event, options.filter, queryClient]);

  return {
    isConnected: channelRef.current?.state === 'joined',
    channel: channelRef.current,
  };
};

/**
 * 회원 데이터 실시간 구독
 */
export const useMembersRealtime = () => {
  return useRealtime({
    table: 'members',
    invalidateQueries: ['members'],
    onInsert: (payload) => {
      console.log('새 회원 추가:', payload.new);
    },
    onUpdate: (payload) => {
      console.log('회원 정보 수정:', payload.new);
    },
    onDelete: (payload) => {
      console.log('회원 삭제:', payload.old);
    },
  });
};

/**
 * 게임 세션 실시간 구독
 */
export const useSessionsRealtime = () => {
  return useRealtime({
    table: 'game_sessions',
    invalidateQueries: ['sessions'],
    onInsert: (payload) => {
      console.log('새 게임 세션 생성:', payload.new);
    },
    onUpdate: (payload) => {
      console.log('게임 세션 수정:', payload.new);
    },
  });
};

/**
 * 게임 결과 실시간 구독
 */
export const useGameResultsRealtime = (sessionId?: string) => {
  return useRealtime({
    table: 'game_results',
    filter: sessionId ? `session_id=eq.${sessionId}` : undefined,
    invalidateQueries: ['gameResults', 'statistics', 'members'],
    onInsert: (payload) => {
      console.log('새 점수 입력:', payload.new);
      // 실시간 점수 업데이트 알림 표시 가능
    },
    onUpdate: (payload) => {
      console.log('점수 수정:', payload.new);
    },
    onDelete: (payload) => {
      console.log('점수 삭제:', payload.old);
    },
  });
};

/**
 * 업적 달성 실시간 구독
 */
export const useAchievementsRealtime = () => {
  return useRealtime({
    table: 'member_achievements',
    invalidateQueries: ['memberAchievements', 'achievements'],
    onInsert: (payload) => {
      console.log('새 업적 달성:', payload.new);
      // 업적 달성 축하 메시지 표시
      showAchievementNotification(payload.new);
    },
  });
};

/**
 * 업적 달성 알림 표시
 */
const showAchievementNotification = (achievement: any) => {
  // 브라우저 알림 권한 확인 및 요청
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification('🏆 업적 달성!', {
        body: '새로운 업적을 달성했습니다!',
        icon: '/bowling-icon.png',
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('🏆 업적 달성!', {
            body: '새로운 업적을 달성했습니다!',
            icon: '/bowling-icon.png',
          });
        }
      });
    }
  }
};

/**
 * 통계 데이터 실시간 구독
 */
export const useStatisticsRealtime = () => {
  return useRealtime({
    table: 'member_statistics',
    invalidateQueries: ['statistics'],
    onUpdate: (payload) => {
      console.log('통계 업데이트:', payload.new);
    },
  });
};

/**
 * 여러 테이블을 동시에 구독하는 복합 훅
 */
export const useMultipleRealtime = () => {
  const membersRealtime = useMembersRealtime();
  const sessionsRealtime = useSessionsRealtime();
  const gameResultsRealtime = useGameResultsRealtime();
  const achievementsRealtime = useAchievementsRealtime();

  const isAllConnected = 
    membersRealtime.isConnected &&
    sessionsRealtime.isConnected &&
    gameResultsRealtime.isConnected &&
    achievementsRealtime.isConnected;

  return {
    isAllConnected,
    connections: {
      members: membersRealtime,
      sessions: sessionsRealtime,
      gameResults: gameResultsRealtime,
      achievements: achievementsRealtime,
    },
  };
};

/**
 * 실시간 연결 상태 모니터링 훅
 */
export const useRealtimeStatus = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleOnline = () => {
      console.log('네트워크 연결됨');
      // 연결 복구 시 모든 쿼리 다시 fetch
      queryClient.invalidateQueries();
    };

    const handleOffline = () => {
      console.log('네트워크 연결 끊김');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queryClient]);

  return {
    isOnline: navigator.onLine,
  };
};