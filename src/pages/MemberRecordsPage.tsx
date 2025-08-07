import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  Medal,
  User as UserIcon,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/utils/supabase';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface Member {
  id: string;
  name: string;
  email?: string;
  joined_date?: string;
  is_active: boolean;
  avatar_url?: string;
}

interface MemberStatistics {
  member_id: string;
  total_games: number;
  total_sessions: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  total_strikes: number;
  total_spares: number;
  improvement_rate: number;
  consistency_score: number;
  last_played_date?: string;
}

interface GameResult {
  id: string;
  session_id: string;
  game_number: number;
  score: number;
  strikes: number;
  spares: number;
  splits: number;
  created_at: string;
  game_sessions: {
    date: string;
    session_name?: string;
    location?: string;
  };
}

interface MemberWithStats extends Member {
  statistics?: MemberStatistics;
  gameResults?: GameResult[];
}

const fetchMembers = async (): Promise<Member[]> => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data || [];
};


// game_results에서 직접 통계 계산
const fetchRealTimeStatistics = async (): Promise<MemberStatistics[]> => {
  const { data: gameResults, error } = await supabase
    .from('game_results')
    .select(`
      member_id,
      score,
      strikes,
      spares,
      created_at,
      game_sessions!inner(
        date
      )
    `);
  
  if (error) throw error;
  if (!gameResults || gameResults.length === 0) return [];
  
  // 회원별로 통계 계산
  const memberStats: { [key: string]: MemberStatistics } = {};
  
  gameResults.forEach(result => {
    const memberId = result.member_id;
    
    if (!memberStats[memberId]) {
      memberStats[memberId] = {
        member_id: memberId,
        total_games: 0,
        total_sessions: 0,
        average_score: 0,
        highest_score: 0,
        lowest_score: 300,
        total_strikes: 0,
        total_spares: 0,
        improvement_rate: 0,
        consistency_score: 0,
        last_played_date: (result.game_sessions as any).date
      };
    }
    
    const stats = memberStats[memberId];
    stats.total_games += 1;
    stats.total_strikes += result.strikes || 0;
    stats.total_spares += result.spares || 0;
    stats.highest_score = Math.max(stats.highest_score, result.score);
    stats.lowest_score = Math.min(stats.lowest_score, result.score);
    
    // 최근 게임 날짜 업데이트
    if (new Date((result.game_sessions as any).date) > new Date(stats.last_played_date || '1970-01-01')) {
      stats.last_played_date = (result.game_sessions as any).date;
    }
  });
  
  // 평균 점수 계산
  Object.values(memberStats).forEach(stats => {
    const memberResults = gameResults.filter(r => r.member_id === stats.member_id);
    const totalScore = memberResults.reduce((sum, r) => sum + r.score, 0);
    stats.average_score = totalScore / memberResults.length;
    
    // 세션 수 계산 (중복 제거)
    const uniqueSessions = new Set(
      memberResults.map(r => (r.game_sessions as any).date)
    );
    stats.total_sessions = uniqueSessions.size;
    
    // 최저점수가 300이면 (초기값) 0으로 설정
    if (stats.lowest_score === 300) {
      stats.lowest_score = 0;
    }
  });
  
  return Object.values(memberStats);
};

const fetchMemberGameResults = async (memberId: string): Promise<GameResult[]> => {
  const { data, error } = await supabase
    .from('game_results')
    .select(`
      *,
      game_sessions!inner(
        date,
        session_name,
        location
      )
    `)
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (error) throw error;
  
  // 날짜별로 그룹화한 후 같은 날짜 내에서 게임 번호 역순(3,2,1) 정렬
  const results = (data || []).sort((a, b) => {
    const dateA = (a.game_sessions as any).date;
    const dateB = (b.game_sessions as any).date;
    
    // 먼저 날짜로 내림차순 정렬 (최신 날짜부터)
    if (dateA !== dateB) {
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    }
    
    // 같은 날짜면 게임 번호로 내림차순 정렬 (3, 2, 1 순)
    return b.game_number - a.game_number;
  });
  
  return results;
};

function MemberRecordsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['members'],
    queryFn: fetchMembers,
  });

  const { data: statistics = [], isLoading: statsLoading } = useQuery({
    queryKey: ['member-statistics-realtime'],
    queryFn: fetchRealTimeStatistics,
    staleTime: 60 * 1000, // 1분간 캐시
  });

  const { data: memberGameResults = [], isLoading: gameResultsLoading } = useQuery({
    queryKey: ['member-game-results', selectedMemberId],
    queryFn: () => selectedMemberId ? fetchMemberGameResults(selectedMemberId) : Promise.resolve([]),
    enabled: !!selectedMemberId,
  });

  const membersWithStats = useMemo((): MemberWithStats[] => {
    return members.map(member => ({
      ...member,
      statistics: statistics.find(stat => stat.member_id === member.id)
    }));
  }, [members, statistics]);

  // 실제 통계 계산 (가중평균으로 정확한 전체 평균 계산)
  const actualStatistics = useMemo(() => {
    if (statistics.length === 0) return {
      averageScore: 0,
      highestScore: 0,
      totalActiveMembers: members.filter(m => m.is_active).length
    };
    
    const activeStats = statistics.filter(stat => 
      members.some(m => m.id === stat.member_id && m.is_active)
    );
    
    if (activeStats.length === 0) return {
      averageScore: 0,
      highestScore: 0,
      totalActiveMembers: members.filter(m => m.is_active).length
    };
    
    // 가중평균 계산: 각 회원의 (평균점수 * 게임수)의 합 / 전체 게임수
    const totalWeightedScore = activeStats.reduce((sum, stat) => {
      return sum + (stat.average_score * stat.total_games);
    }, 0);
    
    const totalGames = activeStats.reduce((sum, stat) => sum + stat.total_games, 0);
    const weightedAverage = totalGames > 0 ? totalWeightedScore / totalGames : 0;
    
    const highestScore = activeStats.length > 0 
      ? Math.max(...activeStats.map(stat => stat.highest_score))
      : 0;
    
    return {
      averageScore: Math.round(weightedAverage),
      highestScore: highestScore,
      totalActiveMembers: activeStats.length
    };
  }, [statistics, members]);

  const filteredMembers = useMemo(() => {
    return membersWithStats.filter(member =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [membersWithStats, searchQuery]);

  const selectedMember = useMemo(() => {
    return filteredMembers.find(member => member.id === selectedMemberId);
  }, [filteredMembers, selectedMemberId]);

  // 선택된 회원의 날짜별 평균점수 차트 데이터 준비
  const chartData = useMemo(() => {
    if (!memberGameResults.length) return [];
    
    // 날짜별로 그룹화하여 평균 점수 계산
    const dateGroups = memberGameResults.reduce((acc, result) => {
      const date = (result.game_sessions as any).date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(result);
      return acc;
    }, {} as Record<string, GameResult[]>);
    
    // 날짜별 평균 점수 계산 후 최근 10개 날짜만 표시
    const dateAverages = Object.entries(dateGroups)
      .map(([date, results]) => {
        const totalScore = results.reduce((sum, r) => sum + r.score, 0);
        const averageScore = Math.round(totalScore / results.length);
        const totalStrikes = results.reduce((sum, r) => sum + (r.strikes || 0), 0);
        const totalSpares = results.reduce((sum, r) => sum + (r.spares || 0), 0);
        
        return {
          date: date,
          score: averageScore,
          gameCount: results.length,
          totalStrikes,
          totalSpares,
          formattedDate: new Date(date).toLocaleDateString('ko-KR', { 
            month: 'short', 
            day: 'numeric' 
          })
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10);
    
    return dateAverages;
  }, [memberGameResults]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return '-';
    return num.toLocaleString();
  };

  if (membersLoading || statsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">개인별 기록</h1>
          <p className="text-gray-600 mt-1">동호회 회원들의 개인 기록 및 통계를 확인하세요</p>
        </div>
        
        {/* 검색 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="회원 이름 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
          />
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <UserIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">총 회원</p>
              <p className="text-2xl font-semibold text-gray-900">{members.length}명</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">평균 점수</p>
              <p className="text-2xl font-semibold text-gray-900">
                {actualStatistics.averageScore}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Medal className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">최고 점수</p>
              <p className="text-2xl font-semibold text-gray-900">
                {actualStatistics.highestScore}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">활성 회원</p>
              <p className="text-2xl font-semibold text-gray-900">
                {actualStatistics.totalActiveMembers}명
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 회원 목록 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                회원 목록 ({filteredMembers.length}명)
              </h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  onClick={() => setSelectedMemberId(member.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                    selectedMemberId === member.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">{member.name}</h3>
                        {member.statistics?.average_score && (
                          <span className="text-lg font-semibold text-blue-600">
                            {Math.round(member.statistics.average_score)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center space-x-2">
                          {member.statistics?.total_games && (
                            <span className="text-sm text-gray-400">
                              {member.statistics.total_games}게임
                            </span>
                          )}
                          {member.statistics?.improvement_rate !== undefined && (
                            <div className="flex items-center">
                              {member.statistics.improvement_rate > 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-500" />
                              ) : member.statistics.improvement_rate < 0 ? (
                                <TrendingDown className="h-3 w-3 text-red-500" />
                              ) : null}
                            </div>
                          )}
                        </div>
                        {member.statistics?.highest_score && (
                          <span className="text-sm text-gray-500">
                            최고: {member.statistics.highest_score}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 선택된 회원 상세 정보 */}
        <div className="lg:col-span-2">
          {selectedMember ? (
            <div className="space-y-6">
              {/* 회원 정보 헤더 */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {selectedMember.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedMember.name}</h2>
                      <p className="text-gray-600">
                        최근 게임: {formatDate(selectedMember.statistics?.last_played_date)}
                      </p>
                    </div>
                  </div>
                  {selectedMember.statistics?.average_score && (
                    <div className="text-right">
                      <p className="text-sm text-gray-500">평균 점수</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {Math.round(selectedMember.statistics.average_score)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 통계 카드들 */}
              {selectedMember.statistics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 통계</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">총 게임</span>
                        <span className="font-semibold">{formatNumber(selectedMember.statistics.total_games)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">총 세션</span>
                        <span className="font-semibold">{formatNumber(selectedMember.statistics.total_sessions)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">평균 점수</span>
                        <span className="font-semibold text-blue-600">
                          {Math.round(selectedMember.statistics.average_score)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">점수 기록</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">최고 점수</span>
                        <span className="font-semibold text-green-600">
                          {formatNumber(selectedMember.statistics.highest_score)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">최저 점수</span>
                        <span className="font-semibold text-red-600">
                          {formatNumber(selectedMember.statistics.lowest_score)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">일관성 점수</span>
                        <span className="font-semibold">
                          {selectedMember.statistics.consistency_score?.toFixed(1) || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* 점수 추이 차트 */}
              {chartData.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                  <div className="p-4 border-b">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-gray-900">날짜별 평균점수 (최근 10일)</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="formattedDate"
                            tick={{ fontSize: 12 }}
                            stroke="#666"
                          />
                          <YAxis 
                            domain={['dataMin - 10', 'dataMax + 10']}
                            tick={{ fontSize: 12 }}
                            stroke="#666"
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                    <p className="font-semibold text-gray-900">{label}</p>
                                    <p className="text-blue-600">
                                      평균점수: <span className="font-bold">{data.score}</span>
                                    </p>
                                    <p className="text-sm text-gray-500">{data.gameCount}게임</p>
                                    <div className="flex space-x-2 text-xs text-gray-400 mt-1">
                                      <span>🎯 {data.totalStrikes}</span>
                                      <span>📍 {data.totalSpares}</span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{
                              fill: '#3b82f6',
                              strokeWidth: 2,
                              r: 4,
                            }}
                            activeDot={{
                              r: 6,
                              stroke: '#3b82f6',
                              strokeWidth: 2,
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* 최근 게임 기록 */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">최근 게임 기록</h3>
                </div>
                {gameResultsLoading ? (
                  <div className="p-6">
                    <div className="animate-pulse space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-4 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                ) : memberGameResults.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">날짜</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">게임</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">점수</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {memberGameResults.map((result) => (
                          <tr key={result.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {formatDate(result.game_sessions.date)}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {result.game_number}게임
                            </td>
                            <td className="px-4 py-2 text-sm font-semibold text-gray-900 text-right">
                              {result.score}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6">
                    <p className="text-gray-500 text-center">게임 기록이 없습니다.</p>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center">
                <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">회원을 선택하여 상세 정보를 확인하세요</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MemberRecordsPage;