import { useState } from 'react'
import { 
  Search, 
  Plus, 
  Filter,
  MoreVertical,
  User,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Award
} from 'lucide-react'
import { Button, Input, Badge } from '@/components/ui'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'

interface Member {
  id: string
  name: string
  email?: string
  phone?: string
  joinedDate: string
  isActive: boolean
  avatarUrl?: string
  stats: {
    totalGames: number
    averageScore: number
    highestScore: number
    improvementRate: number
    lastPlayed?: string
  }
  achievements: number
  level: string
}

const MembersPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [showAddMember, setShowAddMember] = useState(false)

  // Mock data - 실제로는 API에서 가져올 데이터
  const members: Member[] = []

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && member.isActive) ||
                         (filterStatus === 'inactive' && !member.isActive)
    
    return matchesSearch && matchesFilter
  })

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'Pro': return 'legendary'
      case 'Advanced': return 'epic'
      case 'Intermediate': return 'rare'
      case 'Beginner': return 'common'
      default: return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  const MemberCard = ({ member }: { member: Member }) => (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {/* Avatar */}
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              {member.avatarUrl ? (
                <img src={member.avatarUrl} alt={member.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-gray-400" />
              )}
            </div>
            
            {/* Member Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                <Badge variant={getLevelBadgeVariant(member.level) as any}>
                  {member.level}
                </Badge>
                <Badge variant={member.isActive ? 'success' : 'default'} size="sm">
                  {member.isActive ? '활성' : '비활성'}
                </Badge>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                {member.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>{member.email}</span>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>{member.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>가입일: {formatDate(member.joinedDate)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
        
        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">{member.stats.totalGames}</div>
              <div className="text-xs text-gray-500">총 게임</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">{member.stats.averageScore}</div>
              <div className="text-xs text-gray-500">평균 점수</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">{member.stats.highestScore}</div>
              <div className="text-xs text-gray-500">최고 점수</div>
            </div>
            <div>
              <div className="flex items-center justify-center space-x-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-lg font-semibold text-green-600">+{member.stats.improvementRate}%</span>
              </div>
              <div className="text-xs text-gray-500">향상률</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Award className="w-4 h-4 text-yellow-500" />
              <span>{member.achievements}개 업적</span>
            </div>
            {member.stats.lastPlayed && (
              <div>마지막 플레이: {formatDate(member.stats.lastPlayed)}</div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">회원 관리</h1>
          <p className="text-gray-600 mt-1">동호회 회원들의 정보와 기록을 관리합니다</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={() => setShowAddMember(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            회원 추가
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="이름 또는 이메일로 검색..."
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
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">전체</option>
                  <option value="active">활성 회원</option>
                  <option value="inactive">비활성 회원</option>
                </select>
              </div>
              
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="name">이름순</option>
                <option value="joinDate">가입일순</option>
                <option value="averageScore">평균점수순</option>
                <option value="totalGames">게임수순</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{members.length}</div>
              <div className="text-sm text-gray-600">총 회원</div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{members.filter(m => m.isActive).length}</div>
              <div className="text-sm text-gray-600">활성 회원</div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(members.reduce((sum, m) => sum + m.stats.averageScore, 0) / members.length)}
              </div>
              <div className="text-sm text-gray-600">평균 점수</div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(members.reduce((sum, m) => sum + m.stats.totalGames, 0) / members.length)}
              </div>
              <div className="text-sm text-gray-600">평균 게임수</div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Members List */}
      <div className="space-y-4">
        {filteredMembers.map(member => (
          <MemberCard key={member.id} member={member} />
        ))}
        
        {filteredMembers.length === 0 && (
          <Card>
            <CardBody>
              <div className="text-center py-12">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">회원을 찾을 수 없습니다</h3>
                <p className="text-gray-600">검색 조건을 변경하거나 새 회원을 추가해보세요.</p>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Add Member Modal Placeholder */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">새 회원 추가</h2>
                <button 
                  onClick={() => setShowAddMember(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Input label="이름" placeholder="회원 이름을 입력하세요" />
                <Input label="이메일" type="email" placeholder="이메일 주소를 입력하세요" />
                <Input label="전화번호" placeholder="전화번호를 입력하세요" />
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowAddMember(false)}>
                    취소
                  </Button>
                  <Button onClick={() => setShowAddMember(false)}>
                    추가
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}

export default MembersPage