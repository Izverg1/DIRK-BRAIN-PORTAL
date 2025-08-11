'use client';

import React from 'react';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface DashboardChartProps {
  title: string;
  subtitle?: string;
  data?: ChartDataPoint[];
  type?: 'line' | 'bar' | 'donut';
}

const DashboardChart: React.FC<DashboardChartProps> = ({ 
  title, 
  subtitle,
  data = [],
  type = 'line' 
}) => {
  // Simple line chart representation
  const renderLineChart = () => {
    const maxValue = Math.max(...data.map(d => d.value), 100);
    const points = data.map((point, idx) => {
      const x = (idx / (data.length - 1)) * 100;
      const y = 100 - (point.value / maxValue) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="mt-4">
        <svg viewBox="0 0 100 100" className="w-full h-32">
          <polyline
            points={points}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="2"
            className="drop-shadow-sm"
          />
          {data.map((point, idx) => {
            const x = (idx / (data.length - 1)) * 100;
            const y = 100 - (point.value / maxValue) * 100;
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r="3"
                fill="#0284c7"
                className="drop-shadow-sm"
              />
            );
          })}
        </svg>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          {data.map((point, idx) => (
            <span key={idx}>{point.label}</span>
          ))}
        </div>
      </div>
    );
  };

  // Simple bar chart representation
  const renderBarChart = () => {
    const maxValue = Math.max(...data.map(d => d.value), 100);
    
    return (
      <div className="mt-4 space-y-3">
        {data.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{item.label}</span>
              <span className="text-gray-800 font-medium">{item.value}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Simple donut chart representation
  const renderDonutChart = () => {
    if (data.length < 2) return null;
    
    const value1 = data[0]?.value || 65;
    const value2 = data[1]?.value || 75;
    
    return (
      <div className="mt-4 flex justify-around items-center">
        {[value1, value2].map((value, idx) => (
          <div key={idx} className="relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="36"
                stroke="#e5e7eb"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r="36"
                stroke={idx === 0 ? "#0ea5e9" : "#0284c7"}
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(value / 100) * 226} 226`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{value}%</span>
            </div>
            <p className="text-center mt-2 text-sm text-gray-600">
              {data[idx]?.label || (idx === 0 ? '2019' : '2020')}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      
      {type === 'line' && renderLineChart()}
      {type === 'bar' && renderBarChart()}
      {type === 'donut' && renderDonutChart()}
    </div>
  );
};

export default DashboardChart;