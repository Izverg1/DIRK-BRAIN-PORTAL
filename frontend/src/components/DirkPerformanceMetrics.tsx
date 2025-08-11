'use client';

import { useState, useEffect } from 'react';
import { getNeuralSocket } from '@/lib/websocket';

interface DirkMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  category: 'efficiency' | 'performance' | 'network' | 'power';
  maxValue: number;
  threshold: { warning: number; critical: number };
  lastUpdate: number;
}

interface SystemParameter {
  name: string;
  current: number;
  target: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
}

// Visual style inspired by AGENT WORLD 4 data visualization but showing DIRK metrics
export default function DirkPerformanceMetrics({ className = '' }: { className?: string }) {
  const [metrics, setMetrics] = useState<DirkMetric[]>([]);
  const [systemParameters, setSystemParameters] = useState<SystemParameter[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    // Initialize with DIRK Brain Portal performance metrics in AGENT WORLD 4 style
    const initializeDirkMetrics = () => {
      const dirkMetrics: DirkMetric[] = [
        // Efficiency Metrics
        { id: 'claude_efficiency', name: 'Claude Efficiency', value: 94.7, unit: '%', trend: 'up', category: 'efficiency', maxValue: 100, threshold: { warning: 80, critical: 70 }, lastUpdate: Date.now() },
        { id: 'gpt_efficiency', name: 'GPT Efficiency', value: 89.2, unit: '%', trend: 'stable', category: 'efficiency', maxValue: 100, threshold: { warning: 80, critical: 70 }, lastUpdate: Date.now() },
        { id: 'gemini_efficiency', name: 'Gemini Efficiency', value: 91.5, unit: '%', trend: 'up', category: 'efficiency', maxValue: 100, threshold: { warning: 80, critical: 70 }, lastUpdate: Date.now() },
        { id: 'local_efficiency', name: 'Local Models', value: 76.8, unit: '%', trend: 'down', category: 'efficiency', maxValue: 100, threshold: { warning: 80, critical: 70 }, lastUpdate: Date.now() },
        
        // Performance Metrics
        { id: 'response_time', name: 'Response Time', value: 2.3, unit: 's', trend: 'stable', category: 'performance', maxValue: 10, threshold: { warning: 5, critical: 8 }, lastUpdate: Date.now() },
        { id: 'throughput', name: 'Throughput', value: 847, unit: 'req/min', trend: 'up', category: 'performance', maxValue: 1000, threshold: { warning: 200, critical: 100 }, lastUpdate: Date.now() },
        { id: 'task_completion', name: 'Task Success Rate', value: 96.1, unit: '%', trend: 'up', category: 'performance', maxValue: 100, threshold: { warning: 90, critical: 80 }, lastUpdate: Date.now() },
        { id: 'accuracy_score', name: 'AI Accuracy', value: 93.8, unit: '%', trend: 'stable', category: 'performance', maxValue: 100, threshold: { warning: 85, critical: 75 }, lastUpdate: Date.now() },
        
        // Network Metrics
        { id: 'network_latency', name: 'Network Latency', value: 45, unit: 'ms', trend: 'stable', category: 'network', maxValue: 200, threshold: { warning: 100, critical: 150 }, lastUpdate: Date.now() },
        { id: 'bandwidth_usage', name: 'Bandwidth Usage', value: 78.2, unit: '%', trend: 'up', category: 'network', maxValue: 100, threshold: { warning: 80, critical: 90 }, lastUpdate: Date.now() },
        { id: 'active_connections', name: 'Active Connections', value: 342, unit: 'conn', trend: 'up', category: 'network', maxValue: 500, threshold: { warning: 400, critical: 450 }, lastUpdate: Date.now() },
        
        // Power Metrics
        { id: 'total_power', name: 'Total Power Draw', value: 2.4, unit: 'kW', trend: 'stable', category: 'power', maxValue: 5, threshold: { warning: 3.5, critical: 4.2 }, lastUpdate: Date.now() },
        { id: 'power_efficiency', name: 'Power Efficiency', value: 87.3, unit: '%', trend: 'up', category: 'power', maxValue: 100, threshold: { warning: 70, critical: 60 }, lastUpdate: Date.now() },
        { id: 'cooling_temp', name: 'System Temperature', value: 42, unit: '°C', trend: 'stable', category: 'power', maxValue: 85, threshold: { warning: 65, critical: 75 }, lastUpdate: Date.now() }
      ];
      setMetrics(dirkMetrics);

      // System Parameters like AGENT WORLD 4
      setSystemParameters([
        { name: 'Neural Load', current: 67.3, target: 70.0, unit: '%', status: 'normal' },
        { name: 'Memory Usage', current: 84.1, target: 80.0, unit: '%', status: 'warning' },
        { name: 'Agent Allocation', current: 89.7, target: 85.0, unit: '%', status: 'normal' },
        { name: 'Task Queue', current: 23, target: 30, unit: 'tasks', status: 'normal' },
        { name: 'API Rate Limit', current: 78.2, target: 90.0, unit: '%', status: 'normal' },
        { name: 'Error Rate', current: 0.8, target: 1.0, unit: '%', status: 'normal' }
      ]);
    };

    initializeDirkMetrics();

    // Real-time updates for DIRK metrics
    const neuralSocket = getNeuralSocket();
    const unsubscribe = neuralSocket.on('metrics_update', (data) => {
      setMetrics(prev => prev.map(metric => {
        if (Math.random() < 0.3) { // 30% chance to update any metric
          return {
            ...metric,
            value: Math.max(0, Math.min(metric.maxValue, metric.value + (Math.random() - 0.5) * (metric.maxValue * 0.1))),
            trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down' as any,
            lastUpdate: Date.now()
          };
        }
        return metric;
      }));

      // Update system parameters
      setSystemParameters(prev => prev.map(param => ({
        ...param,
        current: Math.max(0, param.current + (Math.random() - 0.5) * 5),
        status: Math.random() > 0.8 ? 'warning' : 'normal' as any
      })));
    });

    return () => unsubscribe();
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'efficiency': return 'border-red-500 bg-red-500/10';
      case 'performance': return 'border-white bg-white/10';
      case 'network': return 'border-red-600 bg-red-600/10';
      case 'power': return 'border-white/50 bg-white/5';
      default: return 'border-white/20 bg-white/5';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '➡️';
    }
  };

  const getStatusColor = (metric: DirkMetric) => {
    if (metric.value <= metric.threshold.critical) return 'text-red-500';
    if (metric.value <= metric.threshold.warning) return 'text-red-300';
    return 'text-white';
  };

  const getParameterStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-500 bg-red-500/20';
      case 'warning': return 'text-red-300 bg-red-500/10';
      default: return 'text-white bg-white/10';
    }
  };

  const filteredMetrics = selectedCategory 
    ? metrics.filter(m => m.category === selectedCategory)
    : metrics;

  return (
    <div className={`bg-black border border-red-600 rounded-lg p-6 ${className}`}>
      {/* Header - DIRK Portal style */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white uppercase tracking-wide">DIRK PERFORMANCE ANALYTICS</h3>
          <p className="text-white/70 text-sm uppercase tracking-wide">Real-time AI agent system metrics</p>
        </div>
        <div className="flex space-x-2">
          {['efficiency', 'performance', 'network', 'power'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              className={`px-3 py-1 text-xs rounded border transition-all uppercase tracking-wide ${
                selectedCategory === category ? getCategoryColor(category) : 'border-white/20 hover:bg-red-900/20 text-white/70 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Metrics Grid - AGENT WORLD 4 visual layout */}
        <div className="col-span-8">
          <div className="grid grid-cols-4 gap-3">
            {filteredMetrics.map((metric) => (
              <div
                key={metric.id}
                className={`relative p-4 rounded-lg border transition-all hover:scale-105 ${getCategoryColor(metric.category)}`}
              >
                {/* Status indicator - top right like AGENT WORLD 4 */}
                <div className="absolute top-2 right-2 flex items-center space-x-1">
                  <div className="text-xs">{getTrendIcon(metric.trend)}</div>
                </div>

                {/* Metric name */}
                <div className="text-xs font-medium text-foreground mb-2 truncate">
                  {metric.name}
                </div>

                {/* Main value - like AGENT WORLD 4 large displays */}
                <div className={`text-2xl font-bold mb-1 ${getStatusColor(metric)}`}>
                  {metric.value.toFixed(1)}
                </div>

                {/* Unit */}
                <div className="text-xs text-muted-foreground mb-2">
                  {metric.unit}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-background/50 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full transition-all ${
                      metric.value <= metric.threshold.critical ? 'bg-red-500' :
                      metric.value <= metric.threshold.warning ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, (metric.value / metric.maxValue) * 100)}%` }}
                  ></div>
                </div>

                {/* Threshold indicators */}
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0</span>
                  <span>{metric.maxValue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - DIRK system parameters */}
        <div className="col-span-4 space-y-4">
          {/* System Parameters */}
          <div className="bg-secondary/20 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">System Parameters</h4>
            <div className="space-y-3">
              {systemParameters.map((param, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-foreground truncate">{param.name}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="text-xs text-muted-foreground">
                        Current: {param.current.toFixed(1)}{param.unit}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Target: {param.target}{param.unit}
                      </div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getParameterStatusColor(param.status)}`}>
                    {param.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DIRK System Status */}
          <div className="bg-secondary/20 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">System Status</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Agents:</span>
                <span className="text-primary font-bold">
                  {metrics.filter(m => m.category === 'efficiency').length * 15}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tasks Processed:</span>
                <span className="text-foreground">
                  {Math.floor(metrics.find(m => m.id === 'throughput')?.value || 0 * 60).toLocaleString()}/hr
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">System Health:</span>
                <span className="text-accent">
                  {metrics.filter(m => getStatusColor(m).includes('green')).length > metrics.length / 2 ? 'Optimal' : 'Monitoring'}
                </span>
              </div>
            </div>
          </div>

          {/* Alerts - AGENT WORLD 4 style */}
          <div className="bg-secondary/20 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">System Alerts</h4>
            <div className="space-y-2">
              {metrics
                .filter(m => m.value <= m.threshold.warning)
                .slice(0, 3)
                .map(metric => (
                  <div key={metric.id} className="flex items-center space-x-2 p-2 bg-yellow-500/10 rounded border border-yellow-500/30">
                    <div className="text-yellow-400 text-xs">⚠️</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-yellow-300 font-medium truncate">
                        {metric.name} below threshold
                      </div>
                      <div className="text-xs text-yellow-400/70">
                        {metric.value.toFixed(1)}{metric.unit}
                      </div>
                    </div>
                  </div>
                ))}
              {metrics.filter(m => m.value <= m.threshold.warning).length === 0 && (
                <div className="text-xs text-muted-foreground text-center py-2">
                  All systems operating normally
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}