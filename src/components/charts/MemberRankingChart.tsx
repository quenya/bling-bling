import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Card, CardHeader, CardBody } from '../ui/Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MemberRankingData {
  memberName: string;
  averageScore: number;
  totalGames: number;
  bestScore: number;
  rank: number;
}

interface MemberRankingChartProps {
  data: MemberRankingData[];
  title?: string;
  className?: string;
  limit?: number;
}

export const MemberRankingChart: React.FC<MemberRankingChartProps> = ({
  data,
  title = '회원 랭킹',
  className,
  limit = 10,
}) => {
  const displayData = data.slice(0, limit);

  const chartData = {
    labels: displayData.map(item => item.memberName),
    datasets: [
      {
        label: '평균 점수',
        data: displayData.map(item => item.averageScore),
        backgroundColor: displayData.map((_, index) => {
          if (index === 0) return 'rgba(255, 215, 0, 0.8)'; // 1위: 금색
          if (index === 1) return 'rgba(192, 192, 192, 0.8)'; // 2위: 은색
          if (index === 2) return 'rgba(205, 127, 50, 0.8)'; // 3위: 동색
          return 'rgba(59, 130, 246, 0.8)'; // 나머지: 파란색
        }),
        borderColor: displayData.map((_, index) => {
          if (index === 0) return 'rgba(255, 215, 0, 1)';
          if (index === 1) return 'rgba(192, 192, 192, 1)';
          if (index === 2) return 'rgba(205, 127, 50, 1)';
          return 'rgba(59, 130, 246, 1)';
        }),
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const dataPoint = displayData[context.dataIndex];
            return [
              `평균: ${dataPoint.averageScore.toFixed(1)}점`,
              `최고: ${dataPoint.bestScore}점`,
              `총 게임: ${dataPoint.totalGames}회`
            ];
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: '평균 점수',
        },
        min: 0,
        max: 300,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        display: true,
        grid: {
          display: false,
        },
      },
    },
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}위`;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-semibold">회원 랭킹</h3>
        <p className="text-sm text-gray-600 mt-1">
          평균 점수 기준 상위 {limit}명
        </p>
      </CardHeader>
      <CardBody>
        <div className="h-80">
          <Bar data={chartData} options={options} />
        </div>
        <div className="mt-4 space-y-2">
          {displayData.map((member, index) => (
            <div 
              key={member.memberName}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                <span className="text-lg mr-3">
                  {getRankIcon(member.rank)}
                </span>
                <div>
                  <span className="font-medium">{member.memberName}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    ({member.totalGames}게임)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-lg">
                  {member.averageScore.toFixed(1)}점
                </div>
                <div className="text-sm text-gray-600">
                  최고: {member.bestScore}점
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};