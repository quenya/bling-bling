import { 
  Trophy, 
  Target, 
  Users,
  BarChart3,
  LineChart,
  Sparkles,
  TrendingUp,
  Activity
} from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { useTop5Players, useLaneTrends, useDashboardStats } from '@/hooks/queries/useStatistics'
import LaneTrendChart from '@/components/charts/LaneTrendChart'
import { 
  InconsistencyKings, 
  AlmostPerfectStats, 
  LuckyLanes, 
  SynergyBestStats
} from '@/components/stats'

const StatisticsPage = () => {
  // 데이터 쿼리
  const { data: dashboardStats, isLoading: dashboardLoading } = useDashboardStats()
  const { data: topPerformers = [], isLoading: topPlayersLoading } = useTop5Players()
  const { data: laneTrends = [], isLoading: laneTrendsLoading } = useLaneTrends()

  // 전체 통계 데이터 (대시보드 통계 활용)
  const overallStats = dashboardStats || {
    totalGames: 0,
    totalGameDays: 0,
    averageScore: 0,
    highestScore: 0,
    highestScoreMemberName: '',
    highestScoreDate: '',
    highestScoreGameNumber: 0,
    totalMembers: 0,
    improvementRate: 0
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="px-4 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">통계 분석</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">동호회 볼링 현황과 트렌드를 분석합니다</p>
      </div>

      {/* Overall Stats - 모바일에서는 1열, 태블릿 2열, 데스크탑 3열 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0">
        <Card>
          <CardBody className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">총 게임 일자</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{dashboardLoading ? '-' : overallStats.totalGameDays}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">총 게임수: {dashboardLoading ? '-' : overallStats.totalGames}회</p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg ml-2">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">평균 점수</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{dashboardLoading ? '-' : overallStats.averageScore}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                  최고: {dashboardLoading ? '-' : overallStats.highestScore}점
                  {overallStats.highestScoreMemberName && ` (${overallStats.highestScoreMemberName})`}
                </p>
                {overallStats.highestScoreDate && overallStats.highestScoreGameNumber && (
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {new Date(overallStats.highestScoreDate).toLocaleDateString('ko-KR')} • {overallStats.highestScoreGameNumber}게임
                  </p>
                )}
              </div>
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg ml-2">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardBody className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">활성 회원</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{dashboardLoading ? '-' : overallStats.totalMembers}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">기록이 있는 총 회원 수</p>
              </div>
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg ml-2">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tabs */}
      <div className="px-4 sm:px-0">
        <Tabs defaultValue="ranking" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="ranking" className="flex items-center gap-2 px-3 sm:px-4 py-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">랭킹</span>
              <span className="sm:hidden">순위</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2 px-3 sm:px-4 py-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">트렌드</span>
              <span className="sm:hidden">추이</span>
            </TabsTrigger>
            <TabsTrigger value="fun" className="flex items-center gap-2 px-3 sm:px-4 py-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">재미있는 통계</span>
              <span className="sm:hidden">재미</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2 px-3 sm:px-4 py-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">분석</span>
              <span className="sm:hidden">분석</span>
            </TabsTrigger>
          </TabsList>

          {/* 랭킹 탭 */}
          <TabsContent value="ranking">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Top Performers */}
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">TOP 5 플레이어</h2>
                    <Trophy className="w-5 h-5 text-yellow-500" />
                  </div>
                </CardHeader>
                <CardBody className="p-4 sm:p-6 pt-0">
                  {topPlayersLoading ? (
                    <div className="space-y-3 sm:space-y-4">
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
                    <div className="space-y-3 sm:space-y-4">
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
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">{player.name}</div>
                              <div className="text-sm text-gray-500">{player.games}게임 참여</div>
                            </div>
                          </div>
                          <div className="text-right ml-2">
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
                      <div className="text-sm sm:text-base">아직 충분한 데이터가 없습니다</div>
                      <div className="text-xs sm:text-sm">최소 3게임 이상 참여한 회원이 필요합니다</div>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* 시너지 통계 */}
              <SynergyBestStats />
            </div>
          </TabsContent>

          {/* 트렌드 탭 */}
          <TabsContent value="trends">
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {/* Lane Trends Chart */}
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">레인별 평균 점수 추이</h2>
                    <LineChart className="w-5 h-5 text-blue-500" />
                  </div>
                </CardHeader>
                <CardBody className="p-4 sm:p-6 pt-0">
                  <LaneTrendChart data={laneTrends} loading={laneTrendsLoading} />
                </CardBody>
              </Card>
            </div>
          </TabsContent>

          {/* 재미있는 통계 탭 */}
          <TabsContent value="fun">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <InconsistencyKings />
              <AlmostPerfectStats />
              <LuckyLanes />
              <div className="lg:col-span-2">
                {/* 빈 공간이나 추가 통계를 위한 자리 */}
              </div>
            </div>
          </TabsContent>

          {/* 분석 탭 */}
          <TabsContent value="analysis">
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">고급 분석 기능</h3>
              <p className="text-sm">추후 업데이트 예정입니다.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default StatisticsPage