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

interface ComparisonData {
  category: string;
  member1Value: number;
  member2Value: number;
  member1Label?: string;
  member2Label?: string;
}

interface ComparisonChartProps {
  data: ComparisonData[];
  member1Name: string;
  member2Name: string;
  title?: string;
  className?: string;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  data,
  member1Name,
  member2Name,
  title,
  className,
}) => {
  const chartData = {
    labels: data.map(item => item.category),
    datasets: [
      {
        label: member1Name,
        data: data.map(item => item.member1Value),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: member2Name,
        data: data.map(item => item.member2Value),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
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
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title || `${member1Name} vs ${member2Name}`,
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
            const dataPoint = data[context.dataIndex];
            const isFirst = context.datasetIndex === 0;
            const label = isFirst ? dataPoint.member1Label : dataPoint.member2Label;
            return `${context.dataset.label}: ${context.parsed.y}${label ? ` ${label}` : ''}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const getWinner = (category: string) => {
    const item = data.find(d => d.category === category);
    if (!item) return null;
    
    if (item.member1Value > item.member2Value) {
      return { winner: member1Name, difference: item.member1Value - item.member2Value };
    } else if (item.member2Value > item.member1Value) {
      return { winner: member2Name, difference: item.member2Value - item.member1Value };
    }
    return { winner: '동점', difference: 0 };
  };

  const overallWinner = () => {
    let member1Wins = 0;
    let member2Wins = 0;
    
    data.forEach(item => {
      if (item.member1Value > item.member2Value) member1Wins++;
      else if (item.member2Value > item.member1Value) member2Wins++;
    });
    
    if (member1Wins > member2Wins) return member1Name;
    if (member2Wins > member1Wins) return member2Name;
    return '동점';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="text-lg font-semibold">대결 분석</h3>
        <p className="text-sm text-gray-600 mt-1">
          {member1Name} vs {member2Name} 상세 비교
        </p>
      </CardHeader>
      <CardBody>
        <div className="h-80">
          <Bar data={chartData} options={options} />
        </div>
        
        <div className="mt-4 space-y-3">
          {data.map((item) => {
            const result = getWinner(item.category);
            return (
              <div key={item.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">{item.category}</div>
                <div className="text-right">
                  {result && (
                    <div className={`font-semibold ${
                      result.winner === member1Name ? 'text-blue-600' :
                      result.winner === member2Name ? 'text-green-600' :
                      'text-gray-600'
                    }`}>
                      {result.winner}
                      {result.difference > 0 && (
                        <span className="text-sm font-normal ml-1">
                          (+{result.difference.toFixed(1)})
                        </span>
                      )}
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    {item.member1Value.toFixed(1)} vs {item.member2Value.toFixed(1)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
          <h4 className="font-semibold text-center mb-2">🏆 전체 승부 결과</h4>
          <div className="text-center">
            <span className={`text-lg font-bold ${
              overallWinner() === member1Name ? 'text-blue-600' :
              overallWinner() === member2Name ? 'text-green-600' :
              'text-gray-600'
            }`}>
              {overallWinner()}
            </span>
            {overallWinner() !== '동점' && (
              <span className="text-sm text-gray-600 ml-2">우세</span>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};