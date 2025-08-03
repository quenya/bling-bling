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

interface WeeklyPatternData {
  dayOfWeek: string;
  averageScore: number;
  gameCount: number;
  bestScore: number;
}

interface WeeklyPatternChartProps {
  data: WeeklyPatternData[];
  className?: string;
}

export const WeeklyPatternChart: React.FC<WeeklyPatternChartProps> = ({
  data,
  className,
}) => {
  const chartData = {
    labels: data.map(item => item.dayOfWeek),
    datasets: [
      {
        label: '평균 점수',
        data: data.map(item => item.averageScore),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        pointRadius: 8,
        pointHoverRadius: 10,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: '최고 점수',
        data: data.map(item => item.bestScore),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
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
        text: '요일별 점수 패턴',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          afterLabel: function(context) {
            const dataPoint = data[context.dataIndex];
            return `게임 수: ${dataPoint.gameCount}회`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: '요일',
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

  const getBestDayInfo = () => {
    if (data.length === 0) return null;
    
    const bestDay = data.reduce((best, current) => 
      current.averageScore > best.averageScore ? current : best
    );
    
    const worstDay = data.reduce((worst, current) => 
      current.averageScore < worst.averageScore ? current : worst
    );

    return { bestDay, worstDay };
  };

  const dayInfo = getBestDayInfo();

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-semibold">요일별 볼링 패턴</h3>
        <p className="text-sm text-gray-600 mt-1">
          어떤 요일에 점수가 가장 좋을까요?
        </p>
      </CardHeader>
      <CardBody>
        <div className="h-80">
          <Line data={chartData} options={options} />
        </div>
        {dayInfo && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">🎯 최고의 요일</h4>
              <p className="text-green-700">
                <span className="font-bold">{dayInfo.bestDay.dayOfWeek}</span>
              </p>
              <p className="text-sm text-green-600">
                평균 {dayInfo.bestDay.averageScore.toFixed(1)}점 
                ({dayInfo.bestDay.gameCount}게임)
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">🎳 개선이 필요한 요일</h4>
              <p className="text-red-700">
                <span className="font-bold">{dayInfo.worstDay.dayOfWeek}</span>
              </p>
              <p className="text-sm text-red-600">
                평균 {dayInfo.worstDay.averageScore.toFixed(1)}점 
                ({dayInfo.worstDay.gameCount}게임)
              </p>
            </div>
          </div>
        )}
        <div className="mt-4">
          <h4 className="font-medium mb-2">요일별 상세 정보</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 text-sm">
            {data.map((day) => (
              <div key={day.dayOfWeek} className="text-center p-2 bg-gray-50 rounded">
                <div className="font-medium">{day.dayOfWeek}</div>
                <div className="text-blue-600">{day.averageScore.toFixed(1)}</div>
                <div className="text-gray-500 text-xs">{day.gameCount}회</div>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};