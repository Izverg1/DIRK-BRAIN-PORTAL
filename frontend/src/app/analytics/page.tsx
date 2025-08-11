'use client';

import { useState } from 'react';
import DirkSidebar from '@/components/DirkSidebar';
import ClientOnlyLink from '@/components/ClientOnlyLink';

export default function AnalyticsPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  const performanceMetrics = [
    { label: 'Task Completion Rate', value: '97.6%', change: '+2.1%', trend: 'up' },
    { label: 'Average Response Time', value: '1.2s', change: '-5.4%', trend: 'up' },
    { label: 'Agent Utilization', value: '84.3%', change: '+7.8%', trend: 'up' },
    { label: 'Error Rate', value: '0.4%', change: '-12.3%', trend: 'up' }
  ];

  const usageStats = [
    { metric: 'API Calls', today: 12840, yesterday: 11250, change: 14.1 },
    { metric: 'Active Agents', today: 24, yesterday: 22, change: 9.1 },
    { metric: 'Projects Completed', today: 8, yesterday: 6, change: 33.3 },
    { metric: 'Data Processed', today: 2.4, yesterday: 2.1, change: 14.3, unit: 'GB' }
  ];

  const costData = [
    { provider: 'Claude (Anthropic)', cost: '$245.80', usage: '1.2M tokens', percentage: 45 },
    { provider: 'GPT-4 (OpenAI)', cost: '$187.90', usage: '890K tokens', percentage: 34 },
    { provider: 'Gemini (Google)', cost: '$89.50', usage: '650K tokens', percentage: 16 },
    { provider: 'Local Models', cost: '$15.20', usage: 'Compute hours', percentage: 5 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DirkSidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-500 mt-1">Monitor performance, usage, and costs across your AI infrastructure</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {['1d', '7d', '30d', '90d'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedTimeframe(period)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      selectedTimeframe === period
                        ? 'bg-violet-100 text-violet-700 font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors">
                Export Report
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Performance Metrics */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm font-medium">{metric.label}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <span className={`text-sm font-medium ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {metric.trend === 'up' ? '↑' : '↓'} {metric.change}
                        </span>
                        <span className="text-gray-400 text-sm">vs last period</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Sections</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ClientOnlyLink
                href="/analytics/performance"
                className="p-4 border-2 border-dashed border-violet-300 rounded-xl hover:border-violet-500 hover:bg-violet-50 transition-colors group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-violet-200">
                    <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">Performance Metrics</h4>
                  <p className="text-sm text-gray-500 mt-1">Detailed performance analysis</p>
                </div>
              </ClientOnlyLink>

              <ClientOnlyLink
                href="/analytics/usage"
                className="p-4 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">Usage Statistics</h4>
                  <p className="text-sm text-gray-500 mt-1">Usage trends and insights</p>
                </div>
              </ClientOnlyLink>

              <ClientOnlyLink
                href="/analytics/costs"
                className="p-4 border-2 border-dashed border-green-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">Cost Tracking</h4>
                  <p className="text-sm text-gray-500 mt-1">Cost optimization insights</p>
                </div>
              </ClientOnlyLink>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Usage Statistics</h3>
              <div className="space-y-4">
                {usageStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{stat.metric}</p>
                      <p className="text-xs text-gray-500">Today vs Yesterday</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {stat.today}{stat.unit || ''}
                      </p>
                      <p className={`text-xs font-medium ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change > 0 ? '+' : ''}{stat.change}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Cost Breakdown</h3>
              <div className="space-y-4">
                {costData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.provider}</p>
                        <p className="text-xs text-gray-500">{item.usage}</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{item.cost}</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-violet-600 to-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">Total Monthly Cost</p>
                  <p className="text-xl font-bold text-gray-900">$538.40</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Usage Trends Over Time</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Last 30 days</span>
              </div>
            </div>
            <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Interactive Analytics Charts</h4>
                <p className="text-gray-500">Detailed visualization components coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}