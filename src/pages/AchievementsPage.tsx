import { useState } from 'react'
import { 
  Trophy, 
  Star, 
  Award, 
  Target,
  Zap,
  Crown,
  Filter,
  Search,
  Users
} from 'lucide-react'
import { Button, Input, Badge } from '@/components/ui'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
  condition: string
  achievedBy: string[]
  totalAchievers: number
  percentage: number
}

const AchievementsPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterRarity, setFilterRarity] = useState('all')
  const [filterAchieved, setFilterAchieved] = useState('all')
  const [selectedTab, setSelectedTab] = useState('all')

  // TODO: 실제 데이터로 연동 필요
  const achievements: Achievement[] = []

  const categories = [
    { id: 'all', name: '전체', icon: Trophy },
    { id: 'score', name: '점수', icon: Target },
    { id: 'streak', name: '연속 기록', icon: Zap },
    { id: 'participation', name: '참여도', icon: Users },
    { id: 'special', name: '특별', icon: Star }
  ]

  const rarityColors = {
    common: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
    rare: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    epic: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    legendary: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' }
  }

  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         achievement.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || achievement.category === filterCategory
    const matchesRarity = filterRarity === 'all' || achievement.rarity === filterRarity
    const matchesAchieved = filterAchieved === 'all' || 
                           (filterAchieved === 'achieved' && achievement.achievedBy.length > 0) ||
                           (filterAchieved === 'not-achieved' && achievement.achievedBy.length === 0)
    
    return matchesSearch && matchesCategory && matchesRarity && matchesAchieved
  })

  const stats = {
    total: achievements.length,
    achieved: achievements.filter(a => a.achievedBy.length > 0).length,
    totalPoints: achievements.reduce((sum, a) => sum + (a.achievedBy.length > 0 ? a.points : 0), 0),
    rarest: achievements.filter(a => a.rarity === 'legendary').length
  }

  const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
    const rarity = rarityColors[achievement.rarity]
    const isAchieved = achievement.achievedBy.length > 0

    return (
      <Card className={`transition-all hover:shadow-md ${rarity.border} ${isAchieved ? '' : 'opacity-60'}`}>
        <CardBody>
          <div className="flex items-start space-x-4">
            {/* Icon */}
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl ${rarity.bg} ${rarity.border} border-2`}>
              {achievement.icon}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{achievement.name}</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant={achievement.rarity}>
                    {achievement.rarity}
                  </Badge>
                  <span className="text-sm font-medium text-gray-600">{achievement.points}pt</span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-3">{achievement.description}</p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{achievement.condition}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-600">{achievement.totalAchievers}명</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{achievement.percentage}%</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      achievement.rarity === 'legendary' ? 'bg-yellow-500' :
                      achievement.rarity === 'epic' ? 'bg-purple-500' :
                      achievement.rarity === 'rare' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`}
                    style={{ width: `${achievement.percentage}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Recent Achievers */}
              {achievement.achievedBy.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs text-gray-500 mb-1">최근 달성자:</div>
                  <div className="flex flex-wrap gap-1">
                    {achievement.achievedBy.slice(0, 3).map((name, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {name}
                      </span>
                    ))}
                    {achievement.achievedBy.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                        +{achievement.achievedBy.length - 3}명
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">업적 & 배지</h1>
          <p className="text-gray-600 mt-1">동호회 회원들의 업적과 성취를 확인합니다</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button leftIcon={<Award className="w-4 h-4" />}>
            나의 업적 보기
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">총 업적</div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.achieved}</div>
              <div className="text-sm text-gray-600">달성된 업적</div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalPoints}</div>
              <div className="text-sm text-gray-600">총 획득 포인트</div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.rarest}</div>
              <div className="text-sm text-gray-600">전설 등급</div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setFilterCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filterCategory === category.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <category.icon className="w-4 h-4" />
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="업적명으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            
            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select 
                  value={filterRarity}
                  onChange={(e) => setFilterRarity(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">모든 등급</option>
                  <option value="common">일반</option>
                  <option value="rare">희귀</option>
                  <option value="epic">에픽</option>
                  <option value="legendary">전설</option>
                </select>
              </div>
              
              <select 
                value={filterAchieved}
                onChange={(e) => setFilterAchieved(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">전체</option>
                <option value="achieved">달성됨</option>
                <option value="not-achieved">미달성</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAchievements.map(achievement => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
        
        {filteredAchievements.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardBody>
                <div className="text-center py-12">
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">업적을 찾을 수 없습니다</h3>
                  <p className="text-gray-600">검색 조건을 변경해보세요.</p>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>

      {/* Rarity Guide */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">등급 가이드</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-2"></div>
              <div className="font-medium text-gray-900">일반</div>
              <div className="text-sm text-gray-600">쉽게 달성 가능</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-200 rounded-full mx-auto mb-2"></div>
              <div className="font-medium text-gray-900">희귀</div>
              <div className="text-sm text-gray-600">어느 정도 노력 필요</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-200 rounded-full mx-auto mb-2"></div>
              <div className="font-medium text-gray-900">에픽</div>
              <div className="text-sm text-gray-600">상당한 실력 필요</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="w-8 h-8 bg-yellow-200 rounded-full mx-auto mb-2"></div>
              <div className="font-medium text-gray-900">전설</div>
              <div className="text-sm text-gray-600">매우 드문 성취</div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default AchievementsPage