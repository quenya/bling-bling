import { useState } from 'react'
import { 
  Calendar,
  MapPin,
  Users,
  Clock,
  Plus,
  Filter,
  Search,
  Eye,
  Edit,
  MoreVertical
} from 'lucide-react'
import { Button, Input, Badge } from '@/components/ui'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'

interface GameSession {
  id: string
  sessionName: string
  date: string
  location: string
  startTime?: string
  endTime?: string
  laneNumber?: number
  participants: number
  sessionType: 'regular' | 'tournament' | 'practice'
  averageScore: number
  highestScore: number
  status: 'completed' | 'ongoing' | 'scheduled'
  notes?: string
}

const SessionsPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState('2024-01')
  const [showAddSession, setShowAddSession] = useState(false)

  // Mock data - 실제로는 API에서 가져올 데이터
  const sessions: GameSession[] = []

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.sessionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = filterType === 'all' || session.sessionType === filterType
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus
    const matchesMonth = session.date.startsWith(selectedMonth)
    
    return matchesSearch && matchesType && matchesStatus && matchesMonth
  })

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case 'regular': return '정기모임'
      case 'tournament': return '토너먼트'
      case 'practice': return '연습모임'
      default: return type
    }
  }

  const getSessionTypeBadge = (type: string) => {
    switch (type) {
      case 'regular': return 'default'
      case 'tournament': return 'legendary'
      case 'practice': return 'common'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return '완료'
      case 'ongoing': return '진행 중'
      case 'scheduled': return '예정'
      default: return status
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'success'
      case 'ongoing': return 'warning'
      case 'scheduled': return 'default'
      default: return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    })
  }

  const SessionCard = ({ session }: { session: GameSession }) => (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900">{session.sessionName}</h3>
                <Badge variant={getSessionTypeBadge(session.sessionType) as any}>
                  {getSessionTypeLabel(session.sessionType)}
                </Badge>
                <Badge variant={getStatusBadge(session.status) as any} size="sm">
                  {getStatusLabel(session.status)}
                </Badge>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            
            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(session.date)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{session.location}</span>
                  {session.laneNumber && <span>(레인 {session.laneNumber})</span>}
                </div>
                {session.startTime && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{session.startTime} - {session.endTime}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{session.participants}명 참여</span>
                </div>
                {session.status === 'completed' && (
                  <>
                    <div className="text-sm text-gray-600">
                      평균 점수: <span className="font-medium text-gray-900">{session.averageScore}점</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      최고 점수: <span className="font-medium text-gray-900">{session.highestScore}점</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Notes */}
            {session.notes && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{session.notes}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
          <Button variant="outline" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
            상세보기
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Edit className="w-4 h-4" />}>
            편집
          </Button>
        </div>
      </CardBody>
    </Card>
  )

  const sessionStats = {
    total: sessions.length,
    completed: sessions.filter(s => s.status === 'completed').length,
    scheduled: sessions.filter(s => s.status === 'scheduled').length,
    averageParticipants: Math.round(
      sessions.filter(s => s.participants > 0).reduce((sum, s) => sum + s.participants, 0) / 
      sessions.filter(s => s.participants > 0).length
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">게임 세션</h1>
          <p className="text-gray-600 mt-1">볼링 게임 세션을 관리하고 기록을 확인합니다</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button 
            onClick={() => setShowAddSession(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            세션 추가
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{sessionStats.total}</div>
              <div className="text-sm text-gray-600">총 세션</div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{sessionStats.completed}</div>
              <div className="text-sm text-gray-600">완료된 세션</div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{sessionStats.scheduled}</div>
              <div className="text-sm text-gray-600">예정된 세션</div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{sessionStats.averageParticipants}</div>
              <div className="text-sm text-gray-600">평균 참여자</div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                placeholder="세션명 또는 장소로 검색..."
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
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="2024-01">2024년 1월</option>
                  <option value="2024-02">2024년 2월</option>
                  <option value="2024-03">2024년 3월</option>
                </select>
              </div>
              
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">모든 유형</option>
                <option value="regular">정기모임</option>
                <option value="tournament">토너먼트</option>
                <option value="practice">연습모임</option>
              </select>
              
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">모든 상태</option>
                <option value="completed">완료</option>
                <option value="scheduled">예정</option>
                <option value="ongoing">진행 중</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.map(session => (
          <SessionCard key={session.id} session={session} />
        ))}
        
        {filteredSessions.length === 0 && (
          <Card>
            <CardBody>
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">세션을 찾을 수 없습니다</h3>
                <p className="text-gray-600">검색 조건을 변경하거나 새 세션을 추가해보세요.</p>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Add Session Modal Placeholder */}
      {showAddSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">새 게임 세션 추가</h2>
                <button 
                  onClick={() => setShowAddSession(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <Input label="세션명" placeholder="세션 이름을 입력하세요" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="날짜" type="date" />
                  <Input label="시작 시간" type="time" />
                </div>
                <Input label="장소" placeholder="라인볼링장" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="레인 번호" type="number" placeholder="1" />
                  <select className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                    <option value="regular">정기모임</option>
                    <option value="tournament">토너먼트</option>
                    <option value="practice">연습모임</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowAddSession(false)}>
                    취소
                  </Button>
                  <Button onClick={() => setShowAddSession(false)}>
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

export default SessionsPage