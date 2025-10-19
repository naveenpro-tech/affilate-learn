'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface EarningsData {
  date: string;
  earnings: number;
  level1: number;
  level2: number;
}

interface EarningsChartProps {
  data: EarningsData[];
  title?: string;
  className?: string;
}

export const EarningsChart: React.FC<EarningsChartProps> = ({
  data,
  title = 'Earnings Overview',
  className = '',
}) => {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>{title}</CardTitle>
          <div className="flex flex-wrap gap-2">
            {/* Time Range Selector */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setTimeRange('daily')}
                className={`px-3 py-1 text-sm font-medium transition-colors ${
                  timeRange === 'daily'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setTimeRange('weekly')}
                className={`px-3 py-1 text-sm font-medium transition-colors border-l border-gray-300 ${
                  timeRange === 'weekly'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setTimeRange('monthly')}
                className={`px-3 py-1 text-sm font-medium transition-colors border-l border-gray-300 ${
                  timeRange === 'monthly'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Monthly
              </button>
            </div>

            {/* Chart Type Selector */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1 text-sm font-medium transition-colors ${
                  chartType === 'line'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                📈 Line
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 text-sm font-medium transition-colors border-l border-gray-300 ${
                  chartType === 'bar'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                📊 Bar
              </button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium mb-2">No earnings data yet</p>
            <p className="text-sm">Start referring users to see your earnings grow!</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            {chartType === 'line' ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '14px' }}
                  iconType="line"
                />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="#6366f1"
                  strokeWidth={3}
                  name="Total Earnings"
                  dot={{ fill: '#6366f1', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="level1"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Level 1"
                  dot={{ fill: '#10b981', r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="level2"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Level 2"
                  dot={{ fill: '#f59e0b', r: 3 }}
                />
              </LineChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '14px' }}
                  iconType="square"
                />
                <Bar
                  dataKey="level1"
                  fill="#10b981"
                  name="Level 1"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="level2"
                  fill="#f59e0b"
                  name="Level 2"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}

        {/* Summary Stats */}
        {data.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
              <p className="text-2xl font-bold text-primary-600">
                {formatCurrency(data.reduce((sum, item) => sum + item.earnings, 0))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Level 1 Earnings</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(data.reduce((sum, item) => sum + item.level1, 0))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Level 2 Earnings</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(data.reduce((sum, item) => sum + item.level2, 0))}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

