import { useState } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { 
  Plus,
  Minus,
  Save,
  Calendar,
  MapPin,
  Users,
  Target,
  Wand2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input' 
import { Combobox } from '@/components/ui/Combobox'
import { Card, CardHeader, CardBody } from '@/components/ui/Card'
import { WednesdayPicker } from '@/components/ui/WednesdayPicker'
import { useMemberNames, useCreateMember } from '@/hooks/queries/useMembers'
import { getMembers } from '@/services/members'
import { useCreateGameSession } from '@/hooks/queries/useGameSessions'
import { findSessionByDateAndLane } from '@/services/gameSessions'
import { useCreateBulkGameResults } from '@/hooks/queries/useGameResults'
import { getGameResultsBySession } from '@/services/gameResults'
import { toast } from 'react-hot-toast'
import type { GameResultInsert } from '@/types/database'
import GameInputWizard from '@/components/forms/GameInputWizard'
import { getLatestAllowedWednesday, isAllowedGameDate } from '@/utils/gameDate'

interface GameData {
  date: string
  laneNumber: number
  members: {
    name: string
    game1: number
    game2: number
    game3: number
  }[]
}

interface Participant {
  id: string
  name: string
  average: number
  lastSessionDate?: string
}

const ManualInputPage = () => {
  const [inputMode, setInputMode] = useState<'wizard' | 'manual'>('wizard')
  
  const { register, control, handleSubmit, watch, reset, formState: { errors } } = useForm<GameData>({
    defaultValues: {
      date: getLatestAllowedWednesday(),
      laneNumber: 12,
      members: [
        { name: '', game1: 0, game2: 0, game3: 0 }
      ]
    }
  })

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'members'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // 회원 이름 목록 가져오기
  const { data: memberNames = [], isLoading: isLoadingNames } = useMemberNames()
  const createMember = useCreateMember()
  const createSession = useCreateGameSession()
  const createGameResults = useCreateBulkGameResults()

  const handleParticipantsConfirmed = (participants: Participant[]) => {
    // 참여자 정보를 폼에 설정
    const membersData = participants.map(participant => ({
      name: participant.name,
      game1: 0,
      game2: 0,
      game3: 0
    }))
    
    replace(membersData)
    setInputMode('manual')
    toast.success(`${participants.length}명의 참여자가 설정되었습니다!`)
  }

  const handleGameResultsSubmit = async (gameData: {
    date: string
    startLaneNumber: number
    teams: Array<{
      teamId: string
      members: Array<{
        memberId: string
        name: string
        game1: number
        game2: number
        game3: number
        handicap: number
        useHandicap: boolean
      }>
    }>
  }) => {
    if (!isAllowedGameDate(gameData.date)) {
      toast.error('게임 날짜는 오늘까지의 수요일만 선택할 수 있습니다.')
      return
    }
    // 마지막 안전장치: 이미 제출 중이면 무시
    if (isSubmitting) {
      console.log('이미 제출 중입니다.')
      return
    }
    
    setIsSubmitting(true)
    
    // 안전장치: 최대 15초 후 강제로 로딩 해제
    const timeoutId = setTimeout(() => {
      setIsSubmitting(false)
      toast.error('요청 시간이 초과되었습니다. 다시 시도해주세요.')
    }, 15000)

    try {
      // 1. 새로운 회원들 먼저 생성
      const memberMap = new Map<string, string>() // name -> id
      
      for (const team of gameData.teams) {
        for (const member of team.members) {
          if (!member.name.trim()) continue
          
          // '동수'는 가상 회원이므로 특별 처리
          if (member.name === '동수') {
            // 동수용 임시 ID 생성 (팀별로 고유하게)
            const dongsuId = `dongsu-${team.teamId}-${Date.now()}`
            memberMap.set(`${member.name}-${team.teamId}`, dongsuId)
            
            // 동수는 실제 회원으로 생성하지 않고, 임시 회원으로 처리
            // 필요시 동수 전용 회원 레코드를 만들거나 별도 처리 가능
            continue
          }
          
          // 기존 회원인지 확인
          const isExistingMember = memberNames.includes(member.name)
          if (isExistingMember) {
            // 기존 회원의 ID를 찾기 위해 전체 회원 목록을 조회
            const allMembers = await getMembers()
            const existingMember = allMembers?.find(m => m.name === member.name)
            if (existingMember) {
              memberMap.set(member.name, existingMember.id)
            }
          } else {
            // 새 회원 생성
            const newMember = await createMember.mutateAsync({
              name: member.name.trim(),
              email: `${member.name.trim().toLowerCase()}@bowling.club`
            })
            memberMap.set(member.name, newMember.id)
          }
        }
      }

      // 2. 각 팀별로 게임 세션 생성
      const gameResults: GameResultInsert[] = []
      
      for (let teamIndex = 0; teamIndex < gameData.teams.length; teamIndex++) {
        const team = gameData.teams[teamIndex]
        const laneNumber = gameData.startLaneNumber + teamIndex
        
        // 세션 생성/확인
        let session
        try {
          const existingSession = await findSessionByDateAndLane(gameData.date, laneNumber)
          
          if (existingSession) {
            session = existingSession
          } else {
            session = await createSession.mutateAsync({
              session_name: `${gameData.date.replace(/-/g, '.')} 레인${laneNumber}번`,
              date: gameData.date,
              location: '라인볼링장',
              lane_number: laneNumber,
              total_participants: team.members.filter(m => m.name.trim()).length
            })
          }
        } catch (error) {
          console.error('세션 생성/확인 오류:', error)
          throw new Error(`팀 ${teamIndex + 1} 세션 처리 중 오류가 발생했습니다.`)
        }

        // 기존 게임 결과 확인
        const existingResults = await getGameResultsBySession(session.id)
        
        // 팀 멤버별 게임 결과 생성
        for (const member of team.members) {
          if (!member.name.trim()) continue
          
          let memberId: string | undefined
          
          // 동수 처리
          if (member.name === '동수') {
            memberId = memberMap.get(`${member.name}-${team.teamId}`)
            // 동수의 경우 실제 게임 결과는 저장하지 않거나 별도 처리
            // 현재는 스킵하도록 구현 (필요시 수정 가능)
            console.log(`동수 점수 기록 스킵: 팀 ${teamIndex + 1}`)
            continue
          } else {
            memberId = memberMap.get(member.name)
          }
          
          if (!memberId) continue
          
          // 각 게임별로 결과 생성 (중복 체크)
          [1, 2, 3].forEach(gameNumber => {
            const baseScore = member[`game${gameNumber}` as keyof typeof member] as number
            // 게임 결과 저장 시에는 핸디를 적용하지 않은 원본 점수를 저장
            if (baseScore > 0) {
              // 중복 확인: 같은 세션, 같은 멤버, 같은 게임 번호
              const isDuplicate = existingResults?.some(result => 
                result.member_id === memberId && result.game_number === gameNumber
              )
              
              if (!isDuplicate) {
                gameResults.push({
                  session_id: session.id,
                  member_id: memberId,
                  game_number: gameNumber as 1 | 2 | 3,
                  score: baseScore // 핸디를 적용하지 않은 원본 점수 저장
                })
              }
            }
          })
        }
      }
      
      if (gameResults.length > 0) {
        await createGameResults.mutateAsync(gameResults)
        toast.success(`게임 데이터가 성공적으로 저장되었습니다! (${gameResults.length}개 결과)`)
      } else {
        toast('저장할 새로운 게임 결과가 없습니다.', { icon: 'ℹ️' })
      }
      
      // 성공적으로 완료된 후 위저드를 다시 참여자 선택 단계로 초기화
      setInputMode('wizard')
      
    } catch (error) {
      console.error('저장 실패:', error)
      toast.error(error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.')
    } finally {
      clearTimeout(timeoutId)
      setIsSubmitting(false)
    }
  }

  const onSubmit = async (data: GameData) => {
    if (!isAllowedGameDate(data.date)) {
      toast.error('게임 날짜는 오늘까지의 수요일만 선택할 수 있습니다.')
      return
    }
    // 이미 제출 중이면 무시
    if (isSubmitting) {
      console.log('이미 제출 중입니다.')
      return
    }
    
    setIsSubmitting(true)
    
    // 안전장치: 최대 15초 후 강제로 로딩 해제 (30초는 너무 길어서 줄임)
    const timeoutId = setTimeout(() => {
      setIsSubmitting(false)
      toast.error('요청 시간이 초과되었습니다. 다시 시도해주세요.')
    }, 15000)
    
    try {
      // 1. 새로운 회원들 먼저 생성
      const memberMap = new Map<string, string>() // name -> id
      
      for (const member of data.members) {
        if (!member.name.trim()) continue
        
        // 기존 회원인지 확인
        const isExistingMember = memberNames.includes(member.name)
        if (isExistingMember) {
          // 기존 회원의 ID를 찾기 위해 전체 회원 목록을 조회
          const allMembers = await getMembers()
          const existingMember = allMembers?.find(m => m.name === member.name)
          if (existingMember) {
            memberMap.set(member.name, existingMember.id)
          }
        } else {
          // 새 회원 생성
          const newMember = await createMember.mutateAsync({
            name: member.name.trim(),
            email: `${member.name.trim().toLowerCase()}@bowling.club`
          })
          memberMap.set(member.name, newMember.id)
        }
      }
      
      // 2. 게임 세션 생성 (날짜+레인번호 중복 확인)
      let session
      try {
        // 날짜와 레인번호로 기존 세션 찾기
        const existingSession = await findSessionByDateAndLane(data.date, data.laneNumber)
        
        if (existingSession) {
          // 기존 세션이 있으면 해당 세션 사용
          session = existingSession
          toast(`기존 게임 세션(${data.date}, 레인 ${data.laneNumber})에 추가됩니다.`, { icon: 'ℹ️' })
        } else {
          // 새 세션 생성
          session = await createSession.mutateAsync({
            session_name: `${data.date.replace(/-/g, '.')} 레인${data.laneNumber}번`,
            date: data.date,
            location: '라인볼링장',
            lane_number: data.laneNumber,
            total_participants: data.members.filter(m => m.name.trim()).length
          })
        }
      } catch (error) {
        console.error('세션 생성/확인 오류:', error)
        throw new Error('게임 세션 처리 중 오류가 발생했습니다.')
      }
      
      // 3. 게임 결과 저장 (중복 확인)
      const gameResults: GameResultInsert[] = []
      
      // 기존 게임 결과 확인 (같은 세션의 기존 결과)
      const existingResults = await getGameResultsBySession(session.id)
      
      for (const member of data.members) {
        if (!member.name.trim()) continue
        
        const memberId = memberMap.get(member.name)
        if (!memberId) continue
        
        // 각 게임별로 결과 생성 (중복 체크)
        [1, 2, 3].forEach(gameNumber => {
          const score = member[`game${gameNumber}` as keyof typeof member] as number
          if (score > 0) {
            // 중복 확인: 같은 세션, 같은 멤버, 같은 게임 번호
            const isDuplicate = existingResults?.some(result => 
              result.member_id === memberId && result.game_number === gameNumber
            )
            
            if (!isDuplicate) {
              gameResults.push({
                session_id: session.id,
                member_id: memberId,
                game_number: gameNumber as 1 | 2 | 3,
                score: score
              })
            } else {
              console.log(`중복 결과 스킵: ${member.name} 게임${gameNumber}`)
            }
          }
        })
      }
      
      if (gameResults.length > 0) {
        await createGameResults.mutateAsync(gameResults)
        toast.success(`게임 데이터가 성공적으로 저장되었습니다! (${gameResults.length}개 결과)`)
      } else {
        toast('저장할 새로운 게임 결과가 없습니다.', { icon: 'ℹ️' })
      }
      
      // 성공적으로 완료된 후 회원 필드만 초기화 (날짜/레인은 유지)
      // reset() 대신 setValue 사용으로 defaultValues 충돌 방지
      replace([{ name: '', game1: 0, game2: 0, game3: 0 }])
      
    } catch (error) {
      console.error('저장 실패:', error)
      toast.error(error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.')
    } finally {
      // 타임아웃 정리
      clearTimeout(timeoutId)
      // 확실히 로딩 상태 해제
      setIsSubmitting(false)
    }
  }

  const addMember = () => {
    append({ name: '', game1: 0, game2: 0, game3: 0 })
  }

  const removeMember = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const calculateAverage = (game1: number, game2: number, game3: number) => {
    return Math.round((game1 + game2 + game3) / 3)
  }

  const watchedMembers = watch('members')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">게임 입력</h1>
          <p className="text-gray-600 mt-1">
            볼링 게임 점수를 직접 입력하여 기록을 남기세요
          </p>
        </div>
        
        {inputMode === 'manual' && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setInputMode('wizard')}
            className="flex items-center gap-2"
          >
            <Wand2 className="w-4 h-4" />
            게임 입력 도우미
          </Button>
        )}
      </div>

      {inputMode === 'wizard' ? (
        <GameInputWizard 
          onParticipantsConfirmed={handleParticipantsConfirmed}
          onGameResultsSubmit={handleGameResultsSubmit}
        />
      ) : (
        <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 게임 기본 정보 */}
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
                <Controller
                  name="date"
                  control={control}
                  rules={{ required: '날짜를 선택해주세요' }}
                  render={({ field }) => (
                    <WednesdayPicker
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.date?.message}
                      className={errors.date ? 'border-red-500' : ''}
                    />
                  )}
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
                  max="17"
                  {...register('laneNumber', { 
                    required: '시작 레인 번호를 입력해주세요',
                    min: { value: 1, message: '1 이상의 번호를 입력해주세요' },
                    max: { value: 17, message: '17 이하의 번호를 입력해주세요' }
                  })}
                  className={errors.laneNumber ? 'border-red-500' : ''}
                  placeholder="예: 13"
                />
                {errors.laneNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.laneNumber.message}</p>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 팀별 점수 입력 */}
        <Card allowOverflow>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center">
                <Users className="w-5 h-5 mr-2" />
                팀별 점수
              </h2>
              <Button 
                type="button"
                onClick={addMember}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                회원 추가
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">
                      회원 {index + 1}
                    </h3>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeMember(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* 이름 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        이름 {isLoadingNames && <span className="text-xs text-gray-500">(로딩중...)</span>}
                      </label>
                      <Controller
                        name={`members.${index}.name`}
                        control={control}
                        rules={{ required: '이름을 입력해주세요' }}
                        render={({ field }) => (
                          <Combobox
                            options={memberNames}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="기존 회원 선택 또는 새 이름 입력"
                            className={errors.members?.[index]?.name ? 'border-red-500' : ''}
                            disabled={isLoadingNames}
                          />
                        )}
                      />
                      {errors.members?.[index]?.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.members[index]?.name?.message}
                        </p>
                      )}
                    </div>
                    
                    {/* 1게임 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        1게임
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="300"
                        {...register(`members.${index}.game1`, { 
                          valueAsNumber: true,
                          min: { value: 0, message: '0 이상' },
                          max: { value: 300, message: '300 이하' }
                        })}
                        placeholder="0"
                        className={errors.members?.[index]?.game1 ? 'border-red-500' : ''}
                      />
                    </div>
                    
                    {/* 2게임 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        2게임
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="300"
                        {...register(`members.${index}.game2`, { 
                          valueAsNumber: true,
                          min: { value: 0, message: '0 이상' },
                          max: { value: 300, message: '300 이하' }
                        })}
                        placeholder="0"
                        className={errors.members?.[index]?.game2 ? 'border-red-500' : ''}
                      />
                    </div>
                    
                    {/* 3게임 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        3게임
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="300"
                        {...register(`members.${index}.game3`, { 
                          valueAsNumber: true,
                          min: { value: 0, message: '0 이상' },
                          max: { value: 300, message: '300 이하' }
                        })}
                        placeholder="0"
                        className={errors.members?.[index]?.game3 ? 'border-red-500' : ''}
                      />
                    </div>
                    
                    {/* 평균 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        평균
                      </label>
                      <div className="h-10 bg-gray-100 rounded-md flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {watchedMembers[index] ? 
                            calculateAverage(
                              watchedMembers[index].game1 || 0,
                              watchedMembers[index].game2 || 0,
                              watchedMembers[index].game3 || 0
                            ) : 0
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* 저장 버튼 */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => reset()}
          >
            초기화
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            <Save className="w-4 h-4 mr-2" />
            게임 결과 저장
          </Button>
        </div>
      </form>

      {/* 입력 가이드 */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">📝 입력 가이드</h2>
        </CardHeader>
        <CardBody>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">
                <Target className="w-4 h-4 inline mr-1" />
                점수 입력 팁
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 게임 날짜는 수요일만 선택 가능합니다</li>
                <li>• 각 게임의 점수는 0~300점 사이로 입력해주세요</li>
                <li>• 평균 점수는 자동으로 계산됩니다</li>
                <li>• 회원 추가 버튼으로 참여자를 늘릴 수 있습니다</li>
                <li>• 최소 1명의 회원은 입력해야 합니다</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-3">⚠️ 주의사항</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 모든 필수 항목을 입력해주세요</li>
                <li>• 같은 날짜와 레인의 기존 게임이 있으면 자동으로 합쳐집니다</li>
                <li>• 회원 이름은 정확히 입력해주세요</li>
                <li>• 저장 후에는 수정이 어려우니 확인 후 저장해주세요</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>
        </>
      )}
    </div>
  )
}

export default ManualInputPage