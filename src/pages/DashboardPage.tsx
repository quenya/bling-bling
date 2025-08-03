import { useState } from 'react'
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Trophy,
  Target,
  Star,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

const DashboardPage = () => {
  const [timeRange, setTimeRange] = useState('month')

  // Mock data - 실제로는 API에서 가져올 데이터
  const stats = {
    totalGames: 0,
    averageScore: 0,
    totalMembers: 0,
    thisMonthGames: 0,
    improvementRate: 0,
    attendanceRate: 0
  }

  const recentGames: any[] = []

  const topPerformers: any[] = []

  const recentAchievements: any[] = []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-600 mt-1">동호회 볼링 현황을 한눈에 확인하세요</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="week">이번 주</option>
            <option value="month">이번 달</option>
            <option value="quarter">분기</option>
            <option value="year">올해</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 게임 수</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalGames}</p>
              <div className="flex items-center mt-2">
                <ArrowUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+12 이번달</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">평균 점수</p>
              <p className="text-3xl font-bold text-gray-900">{stats.averageScore}</p>
              <div className="flex items-center mt-2">
                <ArrowUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 ml-1">+{stats.improvementRate}%</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">활성 회원</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalMembers}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-600">{stats.attendanceRate}% 참석률</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Games */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">최근 게임</h2>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                전체 보기
              </button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {recentGames.map((game) => (
              <div key={game.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{game.location}</div>
                  <div className="text-sm text-gray-500">{game.date}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{game.avgScore}점</div>
                  <div className="text-sm text-gray-500">{game.players}명 참여</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">이번 달 TOP 3</h2>
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
          <div className="p-6 space-y-4">
            {topPerformers.map((player, index) => (
              <div key={player.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-600' :
                    index === 1 ? 'bg-gray-100 text-gray-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{player.name}</div>
                    <div className="text-sm text-gray-500">평균 {player.score}점</div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <ArrowUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">{player.improvement}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">최근 업적</h2>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              전체 보기
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentAchievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  achievement.rarity === 'epic' ? 'bg-purple-100' : 'bg-blue-100'
                }`}>
                  <Star className={`w-5 h-5 ${
                    achievement.rarity === 'epic' ? 'text-purple-600' : 'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{achievement.achievement}</div>
                  <div className="text-sm text-gray-500">{achievement.player}</div>
                  <div className="text-xs text-gray-400">{achievement.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage