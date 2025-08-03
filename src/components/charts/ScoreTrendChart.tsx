import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardHeader, CardBody } from '../ui/Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ScoreTrendData {
  date: string;
  averageScore: number;
  game1Score?: number;
  game2Score?: number;
  game3Score?: number;
}

interface ScoreTrendChartProps {
  data: ScoreTrendData[];
  memberName?: string;
  className?: string;
}

export const ScoreTrendChart: React.FC<ScoreTrendChartProps> = ({
  data,
  memberName,
  className,
}) => {
  const chartData = {
    labels: data.map(item => new Date(item.date).toLocaleDateString('ko-KR')),
    datasets: [
      {
        label: '평균 점수',
        data: data.map(item => item.averageScore),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
      },
      {
        label: '1게임',
        data: data.map(item => item.game1Score || null),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        borderDash: [5, 5],
      },
      {
        label: '2게임',
        data: data.map(item => item.game2Score || null),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        borderDash: [5, 5],
      },
      {
        label: '3게임',
        data: data.map(item => item.game3Score || null),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        borderDash: [5, 5],
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: memberName ? `${memberName}님의 점수 추이` : '점수 추이',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}점`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: '날짜',
        },
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: '점수',
        },
        min: 0,
        max: 300,
        ticks: {
          stepSize: 50,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-semibold">점수 추이 분석</h3>
      </CardHeader>
      <CardBody>
        <div className="h-80">
          <Line data={chartData} options={options} />
        </div>
      </CardBody>
    </Card>
  );
};