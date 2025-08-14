import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { statisticsService } from '../../services/statistics'
import { getMembers } from '../../services/members'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface MemberSynergyRecord {
  partnerId: string
  partnerName: string
  synergyScore: number
  partnerScore: number
  gamesPlayed: number
}

export const SynergyBestStats: React.FC = () => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('')

  // 회원 목록 쿼리
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ['members'],
    queryFn: () => getMembers(),
    staleTime: 1000 * 60 * 10,
  })

  // 선택된 회원의 시너지 통계 쿼리
  const { data: synergyData, isLoading: synergyLoading, error } = useQuery({
    queryKey: ['member-synergy-statistics', selectedMemberId],
    queryFn: () => statisticsService.getMemberSynergyStatistics(selectedMemberId),
    enabled: !!selectedMemberId,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  })

  // 회원 목록을 이름순으로 정렬
  const sortedMembers = members ? [...members].sort((a, b) => a.name.localeCompare(b.name)) : []

  const handleMemberSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMemberId(event.target.value)
  }

  return (
    <Card>
      <div className="p-4 sm:p-6">
        <h3 className="text-lg font-bold mb-4">🤝 나와 시너지 좋은 회원</h3>
        
        {/* 회원 선택 콤보박스 */}
        <div className="mb-4 sm:mb-6">
          <label htmlFor="member-select" className="block text-sm font-medium text-gray-700 mb-2">
            회원 선택
          </label>
          {membersLoading ? (
            <div className="flex items-center justify-center h-10 border rounded-md bg-gray-50">
              <LoadingSpinner />
            </div>
          ) : (
            <select
              id="member-select"
              value={selectedMemberId}
              onChange={handleMemberSelect}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">회원을 선택하세요</option>
              {sortedMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 시너지 통계 결과 */}
        {!selectedMemberId ? (
          <div className="text-center py-6 sm:py-8 text-gray-500">
            <div className="text-3xl sm:text-4xl mb-2">👆</div>
            <p className="text-xs sm:text-sm">회원을 선택하면 시너지 통계를 확인할 수 있습니다.</p>
          </div>
        ) : synergyLoading ? (
          <div className="flex items-center justify-center h-24 sm:h-32">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-red-500 text-xs sm:text-sm text-center py-6 sm:py-8">
            시너지 통계를 불러오는데 실패했습니다.
            <br />
            <span className="text-gray-500">잠시 후 다시 시도해주세요.</span>
          </div>
        ) : !synergyData || synergyData.length === 0 ? (
          <div className="text-gray-500 text-xs sm:text-sm text-center py-6 sm:py-8">
            <div className="text-3xl sm:text-4xl mb-2">😔</div>
            <p>해당 회원의 시너지 통계 데이터가 없습니다.</p>
            <p className="text-xs mt-1">최소 2회 이상 함께 플레이한 다른 회원이 있어야 합니다.</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {(synergyData as MemberSynergyRecord[]).slice(0, 5).map((partner, idx) => (
              <div key={partner.partnerId} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border gap-2 sm:gap-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 text-purple-600 rounded-full text-xs sm:text-sm font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                      {partner.partnerName}
                    </div>
                    <div className="text-xs text-gray-500">
                      함께할 때 내 평균: <span className="font-medium">{partner.synergyScore}점</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-9 sm:ml-0">
                  <Badge color="purple" className="text-xs">
                    시너지 {partner.synergyScore}점
                  </Badge>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {partner.gamesPlayed}회 함께
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedMemberId && synergyData && synergyData.length > 0 && (
          <div className="mt-3 sm:mt-4 text-xs text-gray-500 border-t pt-3">
            💡 선택한 회원이 다른 회원과 함께 플레이했을 때의 평균 점수를 보여줍니다.
          </div>
        )}
      </div>
    </Card>
  )
}
