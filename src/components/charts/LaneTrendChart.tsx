import React from 'react'

interface LaneTrendData {
  laneNumber: number
  overallAverage?: number
  data: Array<{
    date: string
    averageScore: number
    formattedDate: string
    gameCount: number
  }>
}

interface LaneTrendChartProps {
  data: LaneTrendData[]
  loading?: boolean
}

const LaneTrendChart: React.FC<LaneTrendChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-lg font-medium mb-2">데이터가 없습니다</div>
          <div className="text-sm">레인별 점수 데이터가 충분하지 않습니다</div>
        </div>
      </div>
    )
  }

  // 색상 팔레트 정의
  const colors = [
    'rgb(59, 130, 246)', // blue-500
    'rgb(16, 185, 129)', // emerald-500
    'rgb(245, 101, 101)', // red-400
    'rgb(139, 92, 246)', // violet-500
    'rgb(245, 158, 11)', // amber-500
    'rgb(236, 72, 153)', // pink-500
  ]

  // 모든 날짜 추출 및 정렬
  const allDates = Array.from(
    new Set(data.flatMap(lane => lane.data.map(d => d.date)))
  ).sort()

  // Y축 범위 계산
  const allScores = data.flatMap(lane => lane.data.map(d => d.averageScore))
  const minScore = Math.min(...allScores)
  const maxScore = Math.max(...allScores)
  const scoreRange = maxScore - minScore
  const chartMin = Math.max(0, minScore - scoreRange * 0.1)
  const chartMax = maxScore + scoreRange * 0.1

  // 차트 영역 크기
  const chartWidth = 600
  const chartHeight = 200
  const padding = { top: 20, right: 20, bottom: 40, left: 60 }

  const getX = (dateIndex: number) => 
    padding.left + (dateIndex / Math.max(allDates.length - 1, 1)) * (chartWidth - padding.left - padding.right)
  
  const getY = (score: number) => 
    padding.top + ((chartMax - score) / (chartMax - chartMin)) * (chartHeight - padding.top - padding.bottom)

  return (
    <div className="bg-white p-4 rounded-lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">레인별 평균 점수 추이</h3>
        <div className="flex flex-wrap gap-4">
          {data.map((lane, index) => (
            <div key={lane.laneNumber} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="text-sm text-gray-600">
                레인 {lane.laneNumber}
                {lane.overallAverage && (
                  <span className="text-xs text-gray-500 ml-1">
                    (평균 {lane.overallAverage}점)
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg width={chartWidth} height={chartHeight + 20} className="border border-gray-200 rounded">
          {/* 격자선 */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Y축 라벨 */}
          {[0, 1, 2, 3, 4].map(i => {
            const score = chartMin + (i / 4) * (chartMax - chartMin)
            const y = getY(score)
            return (
              <g key={i}>
                <line 
                  x1={padding.left - 5} 
                  y1={y} 
                  x2={padding.left} 
                  y2={y} 
                  stroke="#9ca3af" 
                  strokeWidth="1"
                />
                <text 
                  x={padding.left - 10} 
                  y={y + 4} 
                  textAnchor="end" 
                  className="text-xs fill-gray-600"
                >
                  {Math.round(score)}
                </text>
              </g>
            )
          })}

          {/* X축 라벨 */}
          {allDates.map((date, index) => {
            if (index % Math.max(1, Math.floor(allDates.length / 8)) === 0) {
              const x = getX(index)
              const formattedDate = new Date(date).toLocaleDateString('ko-KR', { 
                month: 'short', 
                day: 'numeric' 
              })
              return (
                <g key={date}>
                  <line 
                    x1={x} 
                    y1={chartHeight - padding.bottom} 
                    x2={x} 
                    y2={chartHeight - padding.bottom + 5} 
                    stroke="#9ca3af" 
                    strokeWidth="1"
                  />
                  <text 
                    x={x} 
                    y={chartHeight - padding.bottom + 18} 
                    textAnchor="middle" 
                    className="text-xs fill-gray-600"
                  >
                    {formattedDate}
                  </text>
                </g>
              )
            }
            return null
          })}

          {/* 데이터 라인 */}
          {data.map((lane, laneIndex) => {
            const color = colors[laneIndex % colors.length]
            let pathData = ''

            lane.data.forEach((point, pointIndex) => {
              const dateIndex = allDates.indexOf(point.date)
              const x = getX(dateIndex)
              const y = getY(point.averageScore)
              
              if (pointIndex === 0) {
                pathData += `M ${x} ${y}`
              } else {
                pathData += ` L ${x} ${y}`
              }
            })

            return (
              <g key={lane.laneNumber}>
                {/* 라인 */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* 데이터 포인트 */}
                {lane.data.map((point, pointIndex) => {
                  const dateIndex = allDates.indexOf(point.date)
                  const x = getX(dateIndex)
                  const y = getY(point.averageScore)
                  
                  return (
                    <circle
                      key={pointIndex}
                      cx={x}
                      cy={y}
                      r="4"
                      fill={color}
                      stroke="white"
                      strokeWidth="2"
                      className="hover:r-6 transition-all cursor-pointer"
                    >
                      <title>
                        레인 {lane.laneNumber} - {point.formattedDate}: {point.averageScore}점 ({point.gameCount}게임)
                      </title>
                    </circle>
                  )
                })}
              </g>
            )
          })}

          {/* 축 */}
          <line 
            x1={padding.left} 
            y1={padding.top} 
            x2={padding.left} 
            y2={chartHeight - padding.bottom} 
            stroke="#374151" 
            strokeWidth="2"
          />
          <line 
            x1={padding.left} 
            y1={chartHeight - padding.bottom} 
            x2={chartWidth - padding.right} 
            y2={chartHeight - padding.bottom} 
            stroke="#374151" 
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* 요약 통계 */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {data.map((lane, index) => {
          const avgScore = lane.data.length > 0 
            ? lane.data.reduce((sum, d) => sum + d.averageScore, 0) / lane.data.length 
            : 0
          const totalGames = lane.data.reduce((sum, d) => sum + d.gameCount, 0)
          
          return (
            <div key={lane.laneNumber} className="text-center p-2 bg-gray-50 rounded">
              <div className="font-medium text-gray-900">레인 {lane.laneNumber}</div>
              <div className="text-gray-600">평균 {avgScore.toFixed(1)}점</div>
              <div className="text-gray-500 text-xs">{totalGames}게임</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LaneTrendChart