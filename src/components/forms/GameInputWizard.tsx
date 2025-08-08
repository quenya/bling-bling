import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { Trophy, Users, ArrowLeft, ArrowRight } from 'lucide-react'
import { getRecentGamesAverages } from '@/services/gameHistory'
import type { RecentGamesAverage } from '@/types/bowling'

interface Participant {
  id: string
  name: string
  average: number
  lastSessionDate?: string
}

interface GameInputWizardProps {
  onParticipantsConfirmed: (participants: Participant[]) => void
}

const GameInputWizard = ({ onParticipantsConfirmed }: GameInputWizardProps) => {
  const [step, setStep] = useState<'select' | 'confirm'>('select')
  const [availableMembers, setAvailableMembers] = useState<RecentGamesAverage[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)

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

  const handleConfirm = () => {
    // 평균점수 순으로 정렬
    const sortedParticipants = [...participants].sort((a, b) => b.average - a.average)
    onParticipantsConfirmed(sortedParticipants)
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

  const renderTiers = (participants: Participant[]) => {
    const tiers = getTierDivisions(participants)
    let currentIndex = 0

    return tiers.map((tierCount, tierIndex) => {
      const tierParticipants = participants.slice(currentIndex, currentIndex + tierCount)
      currentIndex += tierCount

      return (
        <div key={tierIndex} className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${
              tierIndex === 0 ? 'bg-yellow-400' : 
              tierIndex === 1 ? 'bg-gray-400' : 'bg-amber-600'
            }`} />
            <span className="font-medium text-gray-700">
              {tierIndex === 0 ? 'Tier 1 (상위)' : 
               tierIndex === 1 ? 'Tier 2 (중위)' : 'Tier 3 (하위)'}
            </span>
          </div>
          <div className="space-y-2">
            {tierParticipants.map((participant, index) => (
              <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">#{currentIndex - tierCount + index + 1}</span>
                  <span className="font-medium">{participant.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-medium text-blue-600">{participant.average.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">20게임 평균</div>
                </div>
              </div>
            ))}
          </div>
          {tierIndex < tiers.length - 1 && (
            <div className="border-b-2 border-dashed border-gray-300 my-4" />
          )}
        </div>
      )
    })
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
                    onClick={() => setStep('confirm')}
                    className="flex items-center gap-2"
                  >
                    <span>참여자 확정</span>
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

  // 확정 단계
  const sortedParticipants = [...participants].sort((a, b) => b.average - a.average)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <h3 className="text-lg font-semibold">참여자 확정 ({sortedParticipants.length}명)</h3>
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
          <p className="text-gray-600">평균점수 순으로 정렬되어 3티어로 나누어집니다</p>
        </CardHeader>
        <CardBody>
          {renderTiers(sortedParticipants)}
          
          <div className="mt-6 pt-4 border-t">
            <Button
              onClick={handleConfirm}
              className="w-full"
              size="lg"
            >
              참여자 확정하고 팀 구성하기
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

export default GameInputWizard
