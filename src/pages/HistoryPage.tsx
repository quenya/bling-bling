import React from 'react'
import { Calendar } from 'lucide-react'
import { GameHistoryGrid } from '../components/history'
import { useGameHistory, useGameHistoryHighlights } from '../hooks/queries/useGameHistory'

const HistoryPage: React.FC = () => {
  const { 
    data: sessions = [], 
    isLoading: sessionsLoading, 
    error: sessionsError 
  } = useGameHistory({ limit: 50 })
  
  const { 
    data: highlights, 
    isLoading: highlightsLoading 
  } = useGameHistoryHighlights()

  const loading = sessionsLoading || highlightsLoading

  const handleLoadMore = () => {
    // TODO: 무한 스크롤 구현 시 사용
    console.log('Loading more sessions...')
  }

  // 에러 처리
  if (sessionsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            데이터를 불러올 수 없습니다
          </h2>
          <p className="text-gray-600">
            {sessionsError.message || '알 수 없는 오류가 발생했습니다.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">게임 히스토리</h1>
                <p className="text-gray-600">과거 게임 기록과 통계를 확인하세요</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GameHistoryGrid
          sessions={sessions}
          loading={loading}
          onLoadMore={handleLoadMore}
          hasMore={false}
          highlights={highlights}
          showHighlights={true}
        />
      </div>
    </div>
  )
}

export default HistoryPage