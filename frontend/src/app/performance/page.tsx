'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import NoSSR from '@/components/NoSSR';
import KSONLogo from '@/components/KSONLogo';
import { getNeuralSocket } from '@/lib/websocket';
import DirkPerformanceMetrics from '@/components/DirkPerformanceMetrics';

// Dynamic imports for charts
const AreaChart = dynamic(() => import('@/components/AreaChart'), {
  ssr: false,
  loading: () => <div className="w-full h-48 bg-secondary/20 animate-pulse rounded-lg" />
});

const DonutChart = dynamic(() => import('@/components/DonutChart'), {
  ssr: false,
  loading: () => <div className="w-full h-48 bg-secondary/20 animate-pulse rounded-lg" />
});

export default function PerformanceAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [metrics, setMetrics] = useState([
    { label: 'Neural Throughput', value: '847K/s', trend: '+12.3%', color: 'text-primary' },
    { label: 'Memory Efficiency', value: '94.7%', trend: '+2.1%', color: 'text-primary' },
    { label: 'Telepathic Range', value: '2.4M km', trend: '+8.9%', color: 'text-primary' },
    { label: 'Mind Sync Rate', value: '99.99%', trend: '+0.02%', color: 'text-primary' },
  ]);

  // Connect to real-time WebSocket data
  useEffect(() => {
    const neuralSocket = getNeuralSocket();

    const unsubscribeMetrics = neuralSocket.on('metrics_update', (data) => {
      setMetrics([
        { 
          label: 'Neural Throughput', 
          value: `${Math.round(data.activeConnections / 10)}K/s`, 
          trend: `${data.activeConnections > 8200 ? '+' : ''}${((data.activeConnections - 8247) / 8247 * 100).toFixed(1)}%`, 
          color: 'text-primary' 
        },
        { 
          label: 'Memory Efficiency', 
          value: `${data.neuralEfficiency.toFixed(1)}%`, 
          trend: `${data.neuralEfficiency > 94.7 ? '+' : ''}${(data.neuralEfficiency - 94.7).toFixed(1)}%`, 
          color: 'text-primary' 
        },
        { 
          label: 'Telepathic Range', 
          value: `${(data.telepathyRange / 1000000).toFixed(1)}M km`, 
          trend: `${data.telepathyRange > 2400000 ? '+' : ''}${((data.telepathyRange - 2400000) / 2400000 * 100).toFixed(1)}%`, 
          color: 'text-primary' 
        },
        { 
          label: 'Mind Sync Rate', 
          value: `${data.syncRate.toFixed(2)}%`, 
          trend: `${data.syncRate > 99.99 ? '+' : ''}${(data.syncRate - 99.99).toFixed(2)}%`, 
          color: 'text-primary' 
        },
      ]);
    });

    return () => {
      unsubscribeMetrics();
    };
  }, []);

  const cognitiveMetrics = [
    { name: 'Pattern Recognition', current: 98, max: 100, color: 'bg-primary' },
    { name: 'Memory Recall', current: 94, max: 100, color: 'bg-accent' },
    { name: 'Predictive Analysis', current: 89, max: 100, color: 'bg-primary' },
    { name: 'Emotional Intelligence', current: 76, max: 100, color: 'bg-accent' },
    { name: 'Parallel Processing', current: 92, max: 100, color: 'bg-primary' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <KSONLogo size="md" className="flex-shrink-0" />
            <div>
              <h1 className="kson-heading text-2xl font-bold">Performance Analytics</h1>
              <p className="text-muted-foreground">Neural Network Optimization Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              {['1h', '1d', '7d', '30d'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors kson-glow ${
                    selectedPeriod === period
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content - AGENT WORLD 4 Style Performance Metrics */}
      <div className="p-6 h-[calc(100vh-5rem)] overflow-hidden">
        <NoSSR fallback={
          <div className="h-full bg-secondary/10 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-muted-foreground text-sm">Loading AGENT WORLD 4 Performance Analytics...</p>
            </div>
          </div>
        }>
          <DirkPerformanceMetrics className="h-full" />
        </NoSSR>
      </div>
    </div>
  );
}