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

interface ScoreDistributionData {
  scoreRange: string;
  count: number;
  percentage: number;
}

interface ScoreDistributionChartProps {
  data: ScoreDistributionData[];
  title?: string;
  className?: string;
}

export const ScoreDistributionChart: React.FC<ScoreDistributionChartProps> = ({
  data,
  title = '점수 분포',
  className,
}) => {
  const chartData = {
    labels: data.map(item => item.scoreRange),
    datasets: [
      {
        label: '게임 수',
        data: data.map(item => item.count),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // 0-99: 빨간색
          'rgba(245, 158, 11, 0.8)',  // 100-149: 주황색
          'rgba(234, 179, 8, 0.8)',   // 150-199: 노란색
          'rgba(16, 185, 129, 0.8)',  // 200-249: 초록색
          'rgba(59, 130, 246, 0.8)',  // 250-299: 파란색
          'rgba(147, 51, 234, 0.8)',  // 300: 보라색
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(147, 51, 234, 1)',
        ],
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
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
            const dataPoint = data[context.dataIndex];
            return [
              `게임 수: ${dataPoint.count}회`,
              `비율: ${dataPoint.percentage.toFixed(1)}%`
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
          text: '점수 구간',
        },
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: '게임 수',
        },
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-semibold">점수 분포 분석</h3>
        <p className="text-sm text-gray-600 mt-1">
          각 점수 구간별 게임 수와 비율을 보여줍니다
        </p>
      </CardHeader>
      <CardBody>
        <div className="h-80">
          <Bar data={chartData} options={options} />
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {data.map((item, index) => (
            <div key={item.scoreRange} className="flex items-center">
              <div 
                className="w-4 h-4 rounded mr-2"
                style={{ 
                  backgroundColor: chartData.datasets[0].backgroundColor[index] 
                }}
              />
              <span>{item.scoreRange}: {item.count}회 ({item.percentage.toFixed(1)}%)</span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};