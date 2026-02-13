import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Combobox } from '@/components/ui/Combobox'
import { Trophy, Users, ArrowLeft, ArrowRight, Target, Plus, Minus, Calendar, MapPin, Save, Search, UserPlus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getRecentGamesAverages } from '@/services/gameHistory'
import type { RecentGamesAverage } from '@/types/bowling'
import { WednesdayPicker } from '@/components/ui/WednesdayPicker'

interface Participant {
  id: string
  name: string
  average: number
  lastSessionDate?: string
}

interface Team {
  id: string
  name: string
  members: Participant[]
  laneNumber?: number
}

interface TeamGameResult {
  teamId: string
  members: {
    memberId: string
    name: string
    game1: number
    game2: number
    game3: number
    handicap: number
    useHandicap: boolean
  }[]
}

interface GameInputWizardProps {
  onParticipantsConfirmed?: (participants: Participant[]) => void
  onGameResultsSubmit?: (gameData: {
    date: string
    startLaneNumber: number
    teams: TeamGameResult[]
  }) => void
}

// 인원별 팀 수 계산 함수 (엑셀 파일 기반)
const getTeamCount = (participantCount: number): number => {
  if (participantCount <= 3) return 1
  if (participantCount <= 6) return 2
  if (participantCount <= 9) return 3
  if (participantCount <= 12) return 4
  if (participantCount <= 15) return 5
  if (participantCount <= 18) return 6
  if (participantCount <= 21) return 7
  if (participantCount <= 24) return 8
  if (participantCount <= 27) return 9
  return Math.ceil(participantCount / 3) // 27명 이상은 3명당 1팀
}

// 가장 가까운 수요일 찾기 함수
const getNextWednesday = () => {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=일요일, 3=수요일
  
  if (dayOfWeek === 3) {
    return today.toISOString().split('T')[0]
  } else {
    const daysUntilWednesday = (3 - dayOfWeek + 7) % 7
    const nextWednesday = new Date(today)
    nextWednesday.setDate(today.getDate() + daysUntilWednesday)
    return nextWednesday.toISOString().split('T')[0]
  }
}

const GameInputWizard = ({ onParticipantsConfirmed, onGameResultsSubmit }: GameInputWizardProps) => {
  const [step, setStep] = useState<'select' | 'team' | 'score'>('select')
  const [availableMembers, setAvailableMembers] = useState<RecentGamesAverage[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedParticipant, setDraggedParticipant] = useState<Participant | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // 게임 정보 상태
  const [gameDate, setGameDate] = useState(getNextWednesday())
  const [startLaneNumber, setStartLaneNumber] = useState(12)
  
  // 팀별 점수 상태
  const [teamScores, setTeamScores] = useState<TeamGameResult[]>([])

  useEffect(() => {
    loadAvailableMembers()
  }, [])

  const loadAvailableMembers = async () => {
    try {
      setLoading(true)
      const members = await getRecentGamesAverages(20)
      
      // 마지막 게임일이 현재에 가까운 순서로 정렬
      const sortedMembers = members.sort((a, b) => {
        if (!a.lastSessionDate) return 1
        if (!b.lastSessionDate) return -1
        return new Date(b.lastSessionDate).getTime() - new Date(a.lastSessionDate).getTime()
      })
      
      setAvailableMembers(sortedMembers)
    } catch (error) {
      console.error('Failed to load members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMemberSelect = (member: RecentGamesAverage) => {
    const participant: Participant = {
      id: member.member.id,
      name: member.member.name,
      average: member.recentAverage,
      lastSessionDate: member.lastSessionDate
    }

    setParticipants(prev => [...prev, participant])
  }

  const handleParticipantRemove = (participantId: string) => {
    setParticipants(prev => prev.filter(p => p.id !== participantId))
  }

  const handleAddNewMember = (name: string) => {
    if (!name.trim()) return

    // 이미 참여 중인지 확인
    if (participants.some(p => p.name.trim() === name.trim())) {
      toast.error('이미 참여 중인 회원입니다.')
      return
    }

    // 기존 회원 목록에서 찾기
    const existingMember = availableMembers.find(
      m => m.member.name.trim() === name.trim()
    )

    if (existingMember) {
      handleMemberSelect(existingMember)
    } else {
      const newParticipant: Participant = {
        id: `new-${Date.now()}`,
        name: name.trim(),
        average: 0
      }
      setParticipants(prev => [...prev, newParticipant])
      toast.success(`${name} 회원이 추가되었습니다.`)
    }
    
    setSearchTerm('')
  }

  const handleTeamConfirm = () => {
    // 팀 수를 고려하여 시작 레인 번호 검증
    const maxStartLane = Math.max(1, 17 - teams.length + 1)
    const validStartLane = Math.min(startLaneNumber, maxStartLane)
    
    // 시작 레인 번호가 조정되었다면 업데이트
    if (validStartLane !== startLaneNumber) {
      setStartLaneNumber(validStartLane)
    }
    
    // 팀별 레인 번호 설정 (시작 레인 번호부터 순차적으로)
    const teamsWithLanes = teams.map((team, index) => ({
      ...team,
      laneNumber: validStartLane + index
    }))
    setTeams(teamsWithLanes)
    
    // 팀별 점수 초기화
    const initialScores = teamsWithLanes.map(team => ({
      teamId: team.id,
      members: team.members.map(member => ({
        memberId: member.id,
        name: member.name,
        game1: 0,
        game2: 0,
        game3: 0,
        handicap: 10,
        useHandicap: false
      }))
    }))
    setTeamScores(initialScores)
    
    // 점수 입력 단계로 이동
    setStep('score')
  }

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (participant: Participant) => {
    setDraggedParticipant(participant)
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDropToTeam = (teamId: string) => {
    if (!draggedParticipant) return

    // 참여자 목록에서 팀으로 이동
    if (participants.find(p => p.id === draggedParticipant.id)) {
      setParticipants(prev => prev.filter(p => p.id !== draggedParticipant.id))
      setTeams(prev => prev.map(team => 
        team.id === teamId 
          ? { ...team, members: [...team.members, draggedParticipant] }
          : team
      ))
    } else {
      // 다른 팀에서 현재 팀으로 이동
      setTeams(prev => prev.map(team => {
        if (team.id === teamId) {
          return { ...team, members: [...team.members, draggedParticipant] }
        } else {
          return { ...team, members: team.members.filter(m => m.id !== draggedParticipant.id) }
        }
      }))
    }

    setDraggedParticipant(null)
  }

  const handleDropToParticipants = () => {
    if (!draggedParticipant) return

    // 팀에서 참여자 목록으로 이동
    setTeams(prev => prev.map(team => ({
      ...team,
      members: team.members.filter(m => m.id !== draggedParticipant.id)
    })))
    setParticipants(prev => [...prev, draggedParticipant])
    setDraggedParticipant(null)
  }

  // 자동 팀 구성 함수
  const handleAutoAssign = () => {
    // 모든 참여자 수집 (참여자 목록 + 팀에 배정된 멤버들)
    const allParticipants = [
      ...participants,
      ...teams.flatMap(team => team.members)
    ]
    
    const sortedParticipants = allParticipants.sort((a, b) => b.average - a.average)
    const teamCount = teams.length
    
    // 팀 초기화
    const newTeams: Team[] = teams.map(team => ({ ...team, members: [] }))
    
    // 티어별로 참여자 분류 (3개 그룹으로 나누기)
    const participantCount = sortedParticipants.length
    const tier1Count = Math.ceil(participantCount / 3)
    const tier2Count = Math.ceil((participantCount - tier1Count) / 2)
    
    const tier1 = sortedParticipants.slice(0, tier1Count)
    const tier2 = sortedParticipants.slice(tier1Count, tier1Count + tier2Count)
    const tier3 = sortedParticipants.slice(tier1Count + tier2Count)
    
    // 각 티어를 랜덤하게 섞기
    const shuffleTier = (tier: Participant[]) => {
      const shuffled = [...tier]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    }
    
    const shuffledTier1 = shuffleTier(tier1)
    const shuffledTier2 = shuffleTier(tier2)
    const shuffledTier3 = shuffleTier(tier3)
    
    // 팀 배정 시작 인덱스를 랜덤하게 설정
    let teamIndex = Math.floor(Math.random() * teamCount)
    
    // 각 티어를 순서대로 배정하되, 티어별로 다른 시작점 사용
    const tiers = [
      { members: shuffledTier1, name: 'tier1' },
      { members: shuffledTier2, name: 'tier2' },
      { members: shuffledTier3, name: 'tier3' }
    ]
    
    // 티어 순서도 가끔 바꿔서 더 다양한 조합 생성
    if (Math.random() > 0.5) {
      tiers.reverse()
    }
    
    tiers.forEach((tier, tierIdx) => {
      // 각 티어마다 다른 시작 팀 인덱스 사용
      const tierStartIndex = (teamIndex + tierIdx) % teamCount
      
      tier.members.forEach((participant, idx) => {
        const targetTeamIndex = (tierStartIndex + idx) % teamCount
        newTeams[targetTeamIndex].members.push(participant)
      })
    })
    
    setTeams(newTeams)
    setParticipants([])
  }

  const getAvailableMembersForSelection = () => {
    return availableMembers.filter(member => {
      const isAlreadyParticipant = participants.some(p => p.id === member.member.id)
      if (isAlreadyParticipant) return false
      
      if (searchTerm.trim()) {
        return member.member.name.toLowerCase().includes(searchTerm.toLowerCase())
      }
      return true
    })
  }

  const getTierDivisions = (participants: Participant[]) => {
    const count = participants.length
    if (count <= 3) return [count]
    if (count <= 6) return [Math.ceil(count / 2), Math.floor(count / 2)]
    if (count <= 9) return [Math.ceil(count / 3), Math.ceil(count / 3), Math.floor(count / 3)]
    
    // 9명 이상인 경우 가능한 균등하게 3티어로 분할
    const tierSize = Math.ceil(count / 3)
    return [tierSize, tierSize, count - (tierSize * 2)]
  }

  // 참여자의 티어 정보를 가져오는 함수
  const getParticipantTier = (participant: Participant) => {
    // 모든 참여자 (배정된 + 미배정) 수집
    const allParticipants = [
      ...participants,
      ...teams.flatMap(team => team.members)
    ]
    
    const sortedParticipants = allParticipants.sort((a, b) => b.average - a.average)
    const tiers = getTierDivisions(sortedParticipants)
    
    let currentIndex = 0
    for (let tierIndex = 0; tierIndex < tiers.length; tierIndex++) {
      const tierCount = tiers[tierIndex]
      const tierParticipants = sortedParticipants.slice(currentIndex, currentIndex + tierCount)
      
      if (tierParticipants.some(p => p.id === participant.id)) {
        return {
          tier: tierIndex + 1,
          color: tierIndex === 0 ? 'bg-yellow-400' : tierIndex === 1 ? 'bg-gray-400' : 'bg-amber-600',
          name: tierIndex === 0 ? 'Tier 1' : tierIndex === 1 ? 'Tier 2' : 'Tier 3'
        }
      }
      currentIndex += tierCount
    }
    
    return { tier: 3, color: 'bg-amber-600', name: 'Tier 3' } // 기본값
  }

  // 팀 추가 함수
  const handleAddTeam = () => {
    const newTeamCount = teams.length + 1
    
    // 17번 레인을 넘지 않도록 체크
    if (startLaneNumber + newTeamCount - 1 > 17) {
      const newStartLane = Math.max(1, 17 - newTeamCount + 1)
      setStartLaneNumber(newStartLane)
    }
    
    const newTeamId = `team-${newTeamCount}`
    const newTeam: Team = {
      id: newTeamId,
      name: `팀 ${newTeamCount}`,
      members: []
    }
    setTeams(prev => [...prev, newTeam])
  }

  // 팀 감소 함수
  const handleRemoveTeam = () => {
    if (teams.length <= 1) return // 최소 1팀은 유지
    
    const lastTeam = teams[teams.length - 1]
    // 마지막 팀의 멤버들을 참여자 목록으로 이동
    if (lastTeam.members.length > 0) {
      setParticipants(prev => [...prev, ...lastTeam.members])
    }
    
    setTeams(prev => prev.slice(0, -1))
  }

  // 팀에서 멤버 제거 함수
  // 팀에 회원 추가
  const handleAddMemberToTeam = (teamId: string) => {
    // 새 멤버 ID 생성
    const newMemberId = `new-member-${Date.now()}`
    const newMember: Participant = {
      id: newMemberId,
      name: '',
      average: 0
    }
    
    // 팀에 멤버 추가
    setTeams(prev => prev.map(team => 
      team.id === teamId 
        ? { ...team, members: [...team.members, newMember] }
        : team
    ))
    
    // 점수 배열에도 추가
    setTeamScores(prev => prev.map(teamScore => 
      teamScore.teamId === teamId
        ? {
            ...teamScore,
            members: [...teamScore.members, {
              memberId: newMemberId,
              name: '',
              game1: 0,
              game2: 0,
              game3: 0,
              handicap: 10,
              useHandicap: false
            }]
          }
        : teamScore
    ))
  }
  
  // 팀에서 회원 삭제
  const handleRemoveMemberFromTeamScore = (teamId: string, memberId: string) => {
    // 팀에서 멤버 제거
    setTeams(prev => prev.map(team => 
      team.id === teamId 
        ? { ...team, members: team.members.filter(m => m.id !== memberId) }
        : team
    ))
    
    // 점수 배열에서도 제거
    setTeamScores(prev => prev.map(teamScore => 
      teamScore.teamId === teamId
        ? {
            ...teamScore,
            members: teamScore.members.filter(m => m.memberId !== memberId)
          }
        : teamScore
    ))
  }
  
  // 회원 이름 변경
  const handleMemberNameChange = (teamId: string, memberId: string, newName: string) => {
    // 팀에서 회원 이름 변경
    setTeams(prev => prev.map(team => 
      team.id === teamId 
        ? { 
            ...team, 
            members: team.members.map(m => 
              m.id === memberId ? { ...m, name: newName } : m
            )
          }
        : team
    ))
    
    // 점수 배열에서도 이름 변경
    setTeamScores(prev => prev.map(teamScore => 
      teamScore.teamId === teamId
        ? {
            ...teamScore,
            members: teamScore.members.map(m => 
              m.memberId === memberId ? { ...m, name: newName } : m
            )
          }
        : teamScore
    ))
  }
  
  // 핸디 적용 여부 변경
  const handleUseHandicapChange = (teamId: string, memberId: string, useHandicap: boolean) => {
    setTeamScores(prev => prev.map(teamScore => 
      teamScore.teamId === teamId
        ? {
            ...teamScore,
            members: teamScore.members.map(m => 
              m.memberId === memberId ? { ...m, useHandicap } : m
            )
          }
        : teamScore
    ))
  }
  
  // 핸디 변경
  const handleHandicapChange = (teamId: string, memberId: string, handicap: number) => {
    setTeamScores(prev => prev.map(teamScore => 
      teamScore.teamId === teamId
        ? {
            ...teamScore,
            members: teamScore.members.map(m => 
              m.memberId === memberId ? { ...m, handicap } : m
            )
          }
        : teamScore
    ))
  }
  
  // 점수 변경
  const handleScoreChange = (teamId: string, memberId: string, gameType: 'game1' | 'game2' | 'game3', score: number) => {
    setTeamScores(prev => prev.map(teamScore => 
      teamScore.teamId === teamId
        ? {
            ...teamScore,
            members: teamScore.members.map(m => {
              if (m.memberId === memberId) {
                // 동수의 경우 모든 게임 점수를 동일하게 설정
                if (m.name === '동수') {
                  return {
                    ...m,
                    game1: score,
                    game2: score,
                    game3: score
                  }
                } else {
                  // 일반 회원의 경우 해당 게임만 변경
                  return { ...m, [gameType]: score }
                }
              }
              return m
            })
          }
        : teamScore
    ))
  }
  
  // 사용 가능한 회원 목록 가져오기 (현재 팀 구성에 없는 회원들, 최근 참여 순으로 정렬)
  const getAvailableMembersForTeam = (currentMemberName?: string) => {
    // 현재 모든 팀에 이미 배정된 회원들의 이름 (현재 편집 중인 회원 제외)
    // 단, '동수'는 여러 팀에 소속될 수 있으므로 제외 대상에서 제외
    const assignedMemberNames = new Set(
      teamScores.flatMap(team => 
        team.members
          .map(m => m.name.trim())
          .filter(name => name && name !== currentMemberName && name !== '동수')
      )
    )
    
    // 배정되지 않은 회원들 필터링
    const filteredMembers = availableMembers.filter(member => 
      !assignedMemberNames.has(member.member.name)
    )
    
    // 최근 참여 순으로 정렬 (lastSessionDate 기준)
    const sortedMembers = filteredMembers.sort((a, b) => {
      const dateA = a.lastSessionDate ? new Date(a.lastSessionDate).getTime() : 0
      const dateB = b.lastSessionDate ? new Date(b.lastSessionDate).getTime() : 0
      return dateB - dateA // 최근 날짜가 먼저 오도록
    })
    
    // 회원 이름 목록 생성
    const memberNames = sortedMembers.map(member => member.member.name)
    
    // '동수'를 항상 맨 앞에 추가 (가상 회원이므로 여러 팀에 소속 가능)
    memberNames.unshift('동수')
    
    // 현재 편집 중인 회원 이름이 있고 목록에 없다면 추가
    if (currentMemberName && currentMemberName.trim() && !memberNames.includes(currentMemberName)) {
      memberNames.push(currentMemberName)
    }
    
    return memberNames
  }
  
  // 시작 레인 번호 변경 시 모든 팀 레인 번호 업데이트
  const handleStartLaneNumberChange = (newStartLane: number) => {
    // 팀 수를 고려하여 최대 시작 레인 번호 계산 (마지막 팀이 17번을 넘지 않도록)
    const maxStartLane = Math.max(1, 17 - teams.length + 1)
    const validStartLane = Math.min(newStartLane, maxStartLane)
    
    setStartLaneNumber(validStartLane)
    
    // 모든 팀의 레인 번호를 시작 레인 번호부터 순차적으로 업데이트
    setTeams(prev => prev.map((team, index) => ({
      ...team,
      laneNumber: validStartLane + index
    })))
  }

  // 개별 팀 레인 번호 변경 (17번 제한)
  const handleLaneNumberChange = (teamId: string, newLaneNumber: number) => {
    // 17번을 넘지 않도록 제한
    const validLaneNumber = Math.min(Math.max(1, newLaneNumber), 17)
    
    setTeams(prev => prev.map(team => 
      team.id === teamId 
        ? { ...team, laneNumber: validLaneNumber }
        : team
    ))
  }
  
  // 게임 결과 저장
  const handleSaveResults = () => {
    if (onGameResultsSubmit) {
      onGameResultsSubmit({
        date: gameDate,
        startLaneNumber,
        teams: teamScores
      })
    }
  }
  
  // 이전 단계로 돌아가기
  const handleBackToTeam = () => {
    setStep('team')
  }

  if (loading) {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">회원 정보를 불러오는 중...</span>
          </div>
        </CardBody>
      </Card>
    )
  }

  if (step === 'select') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="min-h-[100px]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <h3 className="text-lg font-semibold">참여자 선택</h3>
              </div>
              <p className="text-gray-600">오늘 게임에 참여할 회원들을 선택해주세요</p>
            </CardHeader>
            <CardBody>
              <div className="mb-6 space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="회원 검색 또는 신규 이름 입력"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchTerm.trim()) {
                          handleAddNewMember(searchTerm)
                        }
                      }}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    onClick={() => handleAddNewMember(searchTerm)}
                    disabled={!searchTerm.trim()}
                    className="flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    추가
                  </Button>
                </div>
                
                {searchTerm.trim() && getAvailableMembersForSelection().length === 0 && (
                  <div className="text-sm text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-gray-500">"{searchTerm}" 회원을 찾을 수 없습니다.</p>
                    <p className="font-medium text-blue-600 mt-1 cursor-pointer hover:underline" onClick={() => handleAddNewMember(searchTerm)}>
                      이 이름으로 신규 참여자 추가하기
                    </p>
                  </div>
                )}
              </div>

              <div className="grid gap-3">
                {getAvailableMembersForSelection().map((member) => (
                  <Button
                    key={member.member.id}
                    variant="outline"
                    onClick={() => handleMemberSelect(member)}
                    className="w-full justify-between text-left h-auto py-3"
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{member.member.name}</span>
                      <span className="text-sm text-gray-500">
                        최근 게임: {member.lastSessionDate ? 
                          new Date(member.lastSessionDate).toLocaleDateString() : '데이터 없음'}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-blue-600">{member.recentAverage.toFixed(1)}</div>
                      <div className="text-xs text-gray-500">20게임 평균</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardBody>
          </Card>

          {participants.length > 0 && (
            <Card>
              <CardHeader className="min-h-[100px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">오늘의 참여자 ({participants.length}명)</h3>
                  </div>
                  <Button
                    onClick={() => {
                      const teamCount = getTeamCount(participants.length)
                      const initialTeams: Team[] = Array.from({ length: teamCount }, (_, index) => ({
                        id: `team-${index + 1}`,
                        name: `팀 ${index + 1}`,
                        members: []
                      }))
                      setTeams(initialTeams)
                      setStep('team')
                    }}
                    className="flex items-center gap-2"
                  >
                    <span>팀 구성하기</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {[...participants].sort((a, b) => b.average - a.average).map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{participant.name}</span>
                        <span className="text-sm text-gray-600">
                          평균: {participant.average.toFixed(1)}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleParticipantRemove(participant.id)}
                      >
                        제거
                      </Button>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // 팀 구성 단계
  if (step === 'team') {
    const teamCount = teams.length // 동적으로 현재 팀 수 사용
    const unassignedParticipants = participants.filter(p => 
      !teams.some(team => team.members.some(m => m.id === p.id))
    )

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 참여자 확정 */}
          <Card>
            <CardHeader className="min-h-[100px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">참여자 확정 ({participants.length}명)</h3>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setStep('select')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>뒤로가기</span>
                </Button>
              </div>
              <p className="text-gray-600">드래그하여 팀으로 배정해주세요</p>
            </CardHeader>
            <CardBody
              onDragOver={handleDragOver}
              onDrop={handleDropToParticipants}
              className="min-h-[200px]"
            >
              {unassignedParticipants.length > 0 ? (
                <div className="space-y-4">
                  {(() => {
                    const sortedParticipants = unassignedParticipants.sort((a, b) => b.average - a.average)
                    const tiers = getTierDivisions(sortedParticipants)
                    let currentIndex = 0

                    return tiers.map((tierCount, tierIndex) => {
                      const tierParticipants = sortedParticipants.slice(currentIndex, currentIndex + tierCount)
                      currentIndex += tierCount

                      return (
                        <div key={tierIndex}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded-full ${
                              tierIndex === 0 ? 'bg-yellow-400' : 
                              tierIndex === 1 ? 'bg-gray-400' : 'bg-amber-600'
                            }`} />
                            <span className="text-sm font-medium text-gray-700">
                              {tierIndex === 0 ? 'Tier 1 (상위)' : 
                               tierIndex === 1 ? 'Tier 2 (중위)' : 'Tier 3 (하위)'}
                            </span>
                          </div>
                          <div className="space-y-2 mb-4">
                            {tierParticipants.map((participant) => (
                              <div
                                key={participant.id}
                                draggable
                                onDragStart={() => handleDragStart(participant)}
                                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg cursor-move hover:bg-blue-100 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-medium">{participant.name}</span>
                                  <span className="text-sm text-gray-600">
                                    평균: {participant.average.toFixed(1)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          {tierIndex < tiers.length - 1 && (
                            <div className="border-b border-dashed border-gray-300 mb-2" />
                          )}
                        </div>
                      )
                    })
                  })()}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  모든 참여자가 팀에 배정되었습니다
                </div>
              )}
            </CardBody>
          </Card>

          {/* 팀 구성 */}
          <Card>
            <CardHeader className="min-h-[100px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">팀 구성 ({teamCount}팀)</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveTeam}
                    disabled={teams.length <= 1}
                    className="w-8 h-8 p-0"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddTeam}
                    className="w-8 h-8 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-gray-600">
                {(() => {
                  const totalParticipants = participants.length + teams.reduce((sum, team) => sum + team.members.length, 0)
                  return `${totalParticipants}명 → ${teamCount}팀으로 구성됩니다`
                })()}
              </p>
            </CardHeader>
            <CardBody className="max-h-[400px] overflow-y-auto">
              <div className="space-y-3">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDropToTeam(team.id)}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors min-h-[80px]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-700">{team.name}</h4>
                      <span className="text-sm text-gray-500">
                        {team.members.length}명
                      </span>
                    </div>
                    <div className="space-y-1">
                      {team.members
                        .sort((a, b) => {
                          // 티어 순으로 정렬 (Tier 1 -> Tier 2 -> Tier 3)
                          const tierA = getParticipantTier(a).tier
                          const tierB = getParticipantTier(b).tier
                          if (tierA !== tierB) {
                            return tierA - tierB
                          }
                          // 같은 티어 내에서는 평균 점수 순으로 정렬 (높은 점수부터)
                          return b.average - a.average
                        })
                        .map((member) => {
                        const tierInfo = getParticipantTier(member)
                        return (
                          <div
                            key={member.id}
                            draggable
                            onDragStart={() => handleDragStart(member)}
                            onDragEnd={handleDragEnd}
                            onMouseDown={() => {
                              // 마우스 다운 시 드래깅 상태 초기화
                              setTimeout(() => setIsDragging(false), 100)
                            }}
                            onClick={() => {
                              // 드래그가 아닌 경우에만 클릭 처리
                              if (!isDragging) {
                                handleRemoveMemberFromTeamScore(team.id, member.id)
                              }
                            }}
                            className="flex items-center justify-between p-2 bg-green-50 rounded cursor-pointer hover:bg-red-100 transition-colors group"
                            title="클릭하여 팀에서 제거 | 드래그하여 이동"
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${tierInfo.color}`} />
                              <span className="font-medium text-sm group-hover:text-red-600">{member.name}</span>
                              <span className="text-xs text-gray-500 group-hover:text-red-500">({tierInfo.name})</span>
                            </div>
                            <span className="text-xs text-gray-600 group-hover:text-red-600">
                              {member.average.toFixed(1)}
                            </span>
                          </div>
                        )
                      })}
                      {team.members.length === 0 && (
                        <div className="text-center text-gray-400 py-2 text-sm">
                          팀원을 여기로 드래그해주세요
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            onClick={handleAutoAssign}
            variant="outline"
            className="px-8"
            size="lg"
            disabled={participants.length === 0 && teams.every(team => team.members.length === 0)}
          >
            자동구성
          </Button>
          <Button
            onClick={handleTeamConfirm}
            className="px-8"
            size="lg"
            disabled={unassignedParticipants.length > 0}
          >
            팀 확정하기
          </Button>
        </div>
      </div>
    )
  }

  // 점수 입력 단계
  if (step === 'score') {
    return (
      <div className="space-y-6">
        {/* 게임 정보 폼 */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              게임 정보
            </h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  게임 날짜 (수요일만 선택 가능)
                </label>
                <WednesdayPicker
                  value={gameDate}
                  onChange={setGameDate}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  시작 레인 번호
                </label>
                <Input
                  type="number"
                  min="1"
                  max={Math.max(1, 17 - teams.length + 1)}
                  value={startLaneNumber}
                  onChange={(e) => handleStartLaneNumberChange(Number(e.target.value))}
                  placeholder="예: 13"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {teams.length}팀 기준 최대 {Math.max(1, 17 - teams.length + 1)}번까지 (마지막 팀: {startLaneNumber + teams.length - 1}번)
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 팀별 점수 */}
        <Card allowOverflow>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center">
                <Users className="w-5 h-5 mr-2" />
                팀별 점수
              </h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              {teams.map((team, teamIndex) => (
                <div key={team.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <h3 className="font-medium text-gray-900">
                        {team.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700">
                          레인:
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="17"
                          value={team.laneNumber || startLaneNumber + teamIndex}
                          onChange={(e) => handleLaneNumberChange(team.id, Number(e.target.value))}
                          className="w-20"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => handleAddMemberToTeam(team.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      회원 추가
                    </Button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">회원명</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-700">핸디 적용</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-700">핸디</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-700">1게임</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-700">2게임</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-700">3게임</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-700">평균</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-700">총점</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-700">작업</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamScores.find(ts => ts.teamId === team.id)?.members.map((member) => {
                          // 원본 점수 계산
                          const originalTotal = member.game1 + member.game2 + member.game3
                          const originalAverage = originalTotal > 0 ? (originalTotal / 3).toFixed(1) : '0.0'
                          
                          // 핸디가 적용된 점수 계산 (핸디 적용 체크박스가 활성화된 경우에만)
                          const game1WithHandicap = member.useHandicap ? member.game1 + member.handicap : member.game1
                          const game2WithHandicap = member.useHandicap ? member.game2 + member.handicap : member.game2
                          const game3WithHandicap = member.useHandicap ? member.game3 + member.handicap : member.game3
                          const totalWithHandicap = game1WithHandicap + game2WithHandicap + game3WithHandicap
                          const averageWithHandicap = totalWithHandicap > 0 ? (totalWithHandicap / 3).toFixed(1) : '0.0'
                          
                          return (
                            <tr key={member.memberId} className={`border-b border-gray-100 ${member.name === '동수' ? 'bg-yellow-50' : ''}`}>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Combobox
                                    options={getAvailableMembersForTeam(member.name)}
                                    value={member.name}
                                    onChange={(value) => handleMemberNameChange(team.id, member.memberId, value)}
                                    placeholder="회원 선택 또는 이름 입력"
                                    className="w-full"
                                  />
                                  {member.name === '동수' && (
                                    <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                                      가상
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={member.useHandicap}
                                  onChange={(e) => handleUseHandicapChange(team.id, member.memberId, e.target.checked)}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                              </td>
                              <td className="py-3 px-4">
                                <Input
                                  type="number"
                                  min="0"
                                  max="50"
                                  value={member.handicap}
                                  onChange={(e) => handleHandicapChange(team.id, member.memberId, Number(e.target.value))}
                                  className="w-20 text-center"
                                  disabled={!member.useHandicap}
                                />
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-col items-center">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="300"
                                    value={member.game1}
                                    onChange={(e) => handleScoreChange(team.id, member.memberId, 'game1', Number(e.target.value))}
                                    className="w-20 text-center"
                                    placeholder={member.name === '동수' ? '모든 게임 동일' : ''}
                                  />
                                  {member.useHandicap && member.game1 > 0 && (
                                    <span className="text-xs text-gray-500 mt-1">
                                      ({member.game1 + member.handicap})
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-col items-center">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="300"
                                    value={member.game2}
                                    onChange={(e) => handleScoreChange(team.id, member.memberId, 'game2', Number(e.target.value))}
                                    className="w-20 text-center"
                                    placeholder={member.name === '동수' ? '자동 동기화' : ''}
                                  />
                                  {member.useHandicap && member.game2 > 0 && (
                                    <span className="text-xs text-gray-500 mt-1">
                                      ({member.game2 + member.handicap})
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex flex-col items-center">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="300"
                                    value={member.game3}
                                    onChange={(e) => handleScoreChange(team.id, member.memberId, 'game3', Number(e.target.value))}
                                    className="w-20 text-center"
                                    placeholder={member.name === '동수' ? '자동 동기화' : ''}
                                  />
                                  {member.useHandicap && member.game3 > 0 && (
                                    <span className="text-xs text-gray-500 mt-1">
                                      ({member.game3 + member.handicap})
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center font-medium">
                                <div className="flex flex-col">
                                  <span>{originalAverage}</span>
                                  {member.useHandicap && originalTotal > 0 && (
                                    <span className="text-xs text-gray-500">
                                      ({averageWithHandicap})
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center font-medium text-blue-600">
                                <div className="flex flex-col">
                                  <span>{originalTotal}</span>
                                  {member.useHandicap && originalTotal > 0 && (
                                    <span className="text-xs text-gray-500">
                                      ({totalWithHandicap})
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                {team.members.length > 1 && (
                                  <Button
                                    type="button"
                                    onClick={() => handleRemoveMemberFromTeamScore(team.id, member.memberId)}
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* 버튼들 */}
        <div className="flex justify-between">
          <Button
            onClick={handleBackToTeam}
            variant="outline"
            className="px-8"
            size="lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            팀 구성으로 돌아가기
          </Button>
          <Button
            onClick={handleSaveResults}
            className="px-8"
            size="lg"
          >
            <Save className="w-4 h-4 mr-2" />
            게임 결과 저장
          </Button>
        </div>
      </div>
    )
  }

  return null // 이 부분은 도달하지 않음
}

export default GameInputWizard
