import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Trophy, Users, ArrowLeft, ArrowRight, Target, Plus, Minus } from 'lucide-react'
import { getRecentGamesAverages } from '@/services/gameHistory'
import type { RecentGamesAverage } from '@/types/bowling'

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
}

interface GameInputWizardProps {
  onParticipantsConfirmed: (participants: Participant[]) => void
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

const GameInputWizard = ({ onParticipantsConfirmed }: GameInputWizardProps) => {
  const [step, setStep] = useState<'select' | 'team'>('select')
  const [availableMembers, setAvailableMembers] = useState<RecentGamesAverage[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedParticipant, setDraggedParticipant] = useState<Participant | null>(null)
  const [isDragging, setIsDragging] = useState(false)

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

  const handleTeamConfirm = () => {
    // 모든 참여자가 팀에 배정되었는지 확인
    const allAssignedMembers = teams.flatMap(team => team.members)
    const sortedParticipants = allAssignedMembers.sort((a, b) => b.average - a.average)
    onParticipantsConfirmed(sortedParticipants)
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
    return availableMembers.filter(member => 
      !participants.some(p => p.id === member.member.id)
    )
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
    const newTeamId = `team-${teams.length + 1}`
    const newTeam: Team = {
      id: newTeamId,
      name: `팀 ${teams.length + 1}`,
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
  const handleRemoveMemberFromTeam = (memberId: string) => {
    // 해당 멤버를 팀에서 찾아서 제거하고 참여자 목록으로 이동
    const memberToRemove = teams.flatMap(team => team.members).find(member => member.id === memberId)
    if (!memberToRemove) return

    setTeams(prev => prev.map(team => ({
      ...team,
      members: team.members.filter(member => member.id !== memberId)
    })))
    
    setParticipants(prev => [...prev, memberToRemove])
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
                                handleRemoveMemberFromTeam(member.id)
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

  return null // 이 부분은 도달하지 않음
}

export default GameInputWizard
