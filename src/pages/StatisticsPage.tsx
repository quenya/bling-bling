import React, { useState } from 'react'
import { 
  TrendingUp, 
  Trophy, 
  Target, 
  Calendar,
  Users,
  BarChart3,
  PieChart,
  LineChart,
  Sparkles
} from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Button, Badge } from '@/components/ui'
import { useTop5Players, useLaneTrends, useDashboardStats } from '@/hooks/queries/useStatistics'
import LaneTrendChart from '@/components/charts/LaneTrendChart'
import { 
  InconsistencyKings, 
  AlmostPerfectStats, 
  LuckyLanes 
} from '@/components/stats'

const StatisticsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedView, setSelectedView] = useState('overview')

  // 데이터 쿼리
  const { data: dashboardStats, isLoading: dashboardLoading } = useDashboardStats()
  const { data: topPerformers = [], isLoading: topPlayersLoading } = useTop5Players()
  const { data: laneTrends = [], isLoading: laneTrendsLoading, error: laneTrendsError } = useLaneTrends()
  

  // 전체 통계 데이터 (대시보드 통계 활용)
  const overallStats = dashboardStats || {
    totalGames: 0,
    averageScore: 0,
    highestScore: 0,
    totalMembers: 0,
    improvementRate: 0
  }

  const monthlyTrends: any[] = []
  const achievements: any[] = []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">통계 분석</h1>
          <p className="text-gray-600 mt-1">동호회 볼링 현황과 트렌드를 분석합니다</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="week">이번 주</option>
            <option value="month">이번 달</option>
            <option value="quarter">분기</option>
            <option value="year">올해</option>
          </select>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedView('overview')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedView === 'overview' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              개요
            </button>
            <button
              onClick={() => setSelectedView('detailed')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedView === 'detailed' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              상세
            </button>
          </div>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 게임 수</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardLoading ? '-' : overallStats.totalGames}</p>
                <p className="text-sm text-gray-500 mt-1">지금까지 진행한 모든 게임</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">평균 점수</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardLoading ? '-' : overallStats.averageScore}</p>
                <p className="text-sm text-gray-500 mt-1">최고: {dashboardLoading ? '-' : overallStats.highestScore}점</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">활성 회원</p>
                <p className="text-3xl font-bold text-gray-900">{dashboardLoading ? '-' : overallStats.totalMembers}</p>
                <p className="text-sm text-gray-500 mt-1">기록이 있는 총 회원 수</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Fun Stats Header */}
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-purple-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">재미있는 통계</h2>
        </div>
      </div>

      {/* Fun Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InconsistencyKings />
        <AlmostPerfectStats />
        <LuckyLanes />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">TOP 5 플레이어</h2>
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
          </CardHeader>
          <CardBody>
            {topPlayersLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-300 rounded w-20 mb-1"></div>
                        <div className="h-3 bg-gray-300 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-gray-300 rounded w-12 mb-1"></div>
                      <div className="h-3 bg-gray-300 rounded w-8"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : topPerformers.length > 0 ? (
              <div className="space-y-4">
                {topPerformers.map((player, index) => (
                  <div key={player.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-600' :
                        index === 1 ? 'bg-gray-100 text-gray-600' :
                        index === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{player.name}</div>
                        <div className="text-sm text-gray-500">{player.games}게임 참여</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{player.average}점</div>
                      <div className={`text-sm ${player.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {player.improvement >= 0 ? '+' : ''}{player.improvement}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <div>아직 충분한 데이터가 없습니다</div>
                <div className="text-sm">최소 3게임 이상 참여한 회원이 필요합니다</div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Lane Trends Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">레인별 평균 점수 추이</h2>
              <LineChart className="w-5 h-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardBody>
            <LaneTrendChart data={laneTrends} loading={laneTrendsLoading} />
          </CardBody>
        </Card>
      </div>


    </div>
  )
}

export default StatisticsPage