'use client';

import { useState, useEffect } from 'react';
import { agentAPI, agentWebSocket } from '@/lib/apiClient';

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  history: number[];
}

interface AgentActivity {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  timestamp: number;
  status: 'success' | 'error' | 'info';
  details: string;
}

// Real-time system monitoring component for DIRK Portal
export default function DirkSystemMonitor({ className = '' }: { className?: string }) {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  useEffect(() => {
    // Initialize system metrics
    const initializeMetrics = () => {
      const metrics: SystemMetric[] = [
        {
          id: 'cpu_usage',
          name: 'CPU Usage',
          value: 34,
          unit: '%',
          status: 'healthy',
          trend: 'stable',
          history: [32, 35, 34, 36, 34, 33, 34]
        },
        {
          id: 'memory_usage',
          name: 'Memory Usage',
          value: 67,
          unit: '%',
          status: 'warning',
          trend: 'up',
          history: [62, 64, 65, 66, 67, 68, 67]
        },
        {
          id: 'network_io',
          name: 'Network I/O',
          value: 23,
          unit: 'MB/s',
          status: 'healthy',
          trend: 'down',
          history: [28, 26, 25, 24, 23, 22, 23]
        },
        {
          id: 'active_agents',
          name: 'Active Agents',
          value: 18,
          unit: '',
          status: 'healthy',
          trend: 'up',
          history: [15, 16, 17, 17, 18, 18, 18]
        },
        {
          id: 'task_queue',
          name: 'Task Queue',
          value: 5,
          unit: 'tasks',
          status: 'healthy',
          trend: 'stable',
          history: [7, 6, 5, 6, 5, 4, 5]
        },
        {
          id: 'response_time',
          name: 'Avg Response',
          value: 245,
          unit: 'ms',
          status: 'healthy',
          trend: 'stable',
          history: [250, 248, 245, 243, 245, 246, 245]
        }
      ];
      setSystemMetrics(metrics);
    };

    // Initialize recent activities
    const initializeActivities = () => {
      const now = Date.now();
      const activities: AgentActivity[] = [
        {
          id: '1',
          agentId: 'claude-01',
          agentName: 'Claude Archmagus',
          action: 'Task completed successfully',
          timestamp: now - 30000,
          status: 'success',
          details: 'Code analysis completed with 98.5% accuracy'
        },
        {
          id: '2',
          agentId: 'gpt-02',
          agentName: 'GPT Centurion',
          action: 'Processing request',
          timestamp: now - 60000,
          status: 'info',
          details: 'Analyzing large dataset for insights'
        },
        {
          id: '3',
          agentId: 'gemini-01',
          agentName: 'Gemini Seer',
          action: 'Warning: High memory usage',
          timestamp: now - 120000,
          status: 'error',
          details: 'Memory usage at 89%, optimization recommended'
        },
        {
          id: '4',
          agentId: 'local-01',
          agentName: 'Llama Shadow',
          action: 'Deployed successfully',
          timestamp: now - 180000,
          status: 'success',
          details: 'Local model deployment completed'
        }
      ];
      setActivities(activities);
    };

    initializeMetrics();
    initializeActivities();

    // Set up real-time updates
    const updateInterval = setInterval(() => {
      setSystemMetrics(prev => prev.map(metric => {
        const variance = Math.random() * 6 - 3; // -3 to +3
        const newValue = Math.max(0, Math.min(100, metric.value + variance));
        const newHistory = [...metric.history.slice(-6), newValue];
        
        return {
          ...metric,
          value: Math.round(newValue),
          history: newHistory,
          trend: newValue > metric.value ? 'up' : newValue < metric.value ? 'down' : 'stable',
          status: 
            metric.id === 'memory_usage' && newValue > 80 ? 'critical' :
            metric.id === 'memory_usage' && newValue > 70 ? 'warning' :
            metric.id === 'cpu_usage' && newValue > 90 ? 'critical' :
            metric.id === 'cpu_usage' && newValue > 75 ? 'warning' :
            'healthy'
        };
      }));
    }, 2000);

    // WebSocket updates for activities
    const handleAgentUpdate = (data: any) => {
      const newActivity: AgentActivity = {
        id: Date.now().toString(),
        agentId: data.agentId || 'unknown',
        agentName: data.agentName || 'Unknown Agent',
        action: data.action || 'Status update',
        timestamp: Date.now(),
        status: data.status || 'info',
        details: data.details || 'Real-time update received'
      };
      
      setActivities(prev => [newActivity, ...prev.slice(0, 19)]); // Keep latest 20
    };

    agentWebSocket.subscribeToAgentUpdates(handleAgentUpdate);

    return () => {
      clearInterval(updateInterval);
      agentWebSocket.unsubscribe('agent_update', handleAgentUpdate);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-white';
      case 'warning': return 'text-red-400';
      case 'critical': return 'text-red-500';
      default: return 'text-white';
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-white';
      case 'warning': return 'bg-red-400';
      case 'critical': return 'bg-red-500 animate-pulse';
      default: return 'bg-white/50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'success': return '✓';
      case 'error': return '⚠';
      default: return 'ℹ';
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  return (
    <div className={`bg-black border border-red-600 rounded-lg ${isCollapsed ? 'p-2' : 'p-6'} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {!isCollapsed && (
          <div>
            <h3 className="text-lg font-semibold text-white uppercase tracking-wide">
              SYSTEM MONITOR
            </h3>
            <p className="text-white/70 text-sm uppercase tracking-wide">
              Real-time DIRK system metrics
            </p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded hover:bg-red-900/30 transition-colors text-white"
        >
          {isCollapsed ? '▼' : '▲'}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {systemMetrics.map((metric) => (
              <div
                key={metric.id}
                onClick={() => setSelectedMetric(selectedMetric === metric.id ? null : metric.id)}
                className={`p-4 rounded border cursor-pointer transition-all ${
                  selectedMetric === metric.id 
                    ? 'border-red-500 bg-red-900/20' 
                    : 'border-white/20 hover:border-red-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white/70 text-sm uppercase tracking-wide">
                    {metric.name}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${getStatusIndicator(metric.status)}`}></div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <span className={`text-xl font-bold ${getStatusColor(metric.status)}`}>
                      {metric.value}
                    </span>
                    <span className="text-white/50 text-sm ml-1">{metric.unit}</span>
                  </div>
                  <div className="text-white/70 text-sm">
                    {getTrendIcon(metric.trend)}
                  </div>
                </div>
                
                {/* Mini chart */}
                <div className="mt-2 flex items-end space-x-1">
                  {metric.history.map((value, index) => (
                    <div
                      key={index}
                      className="bg-red-500/50 rounded-sm"
                      style={{
                        width: '8px',
                        height: `${Math.max(2, (value / Math.max(...metric.history)) * 20)}px`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Activity Feed */}
          <div className="border-t border-red-600 pt-4">
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wide">
              RECENT ACTIVITY
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 rounded border border-white/20 hover:bg-red-900/10"
                >
                  <div className={`text-sm ${
                    activity.status === 'success' ? 'text-white' :
                    activity.status === 'error' ? 'text-red-500' :
                    'text-white/70'
                  }`}>
                    {getActivityIcon(activity.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white uppercase tracking-wide">
                        {activity.agentName}
                      </span>
                      <span className="text-xs text-white/50 uppercase tracking-wide">
                        {formatTime(activity.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm text-red-400 mb-1">{activity.action}</div>
                    <div className="text-xs text-white/70">{activity.details}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}