'use client';

import { useState, useEffect } from 'react';
import KSONLogo from '@/components/KSONLogo';
import AgentWorldVisualization from '@/components/AgentWorldVisualization';
import AgentDeploymentInterface from '@/components/AgentDeploymentInterface';
import GridMonitoringSystem from '@/components/GridMonitoringSystem';
import NeuralNetworkTopologyMap from '@/components/NeuralNetworkTopologyMap';
import { getNeuralSocket } from '@/lib/websocket';
import { HydrationErrorBoundary } from '@/components/HydrationErrorBoundary';

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: number;
}

interface ActiveAgent {
  id: string;
  name: string;
  type: 'telepath' | 'psychic' | 'empath' | 'neural';
  status: 'active' | 'idle' | 'deploying' | 'error';
  location: { city: string; country: string };
  tasks: number;
  efficiency: number;
  lastUpdate: number;
}

export default function NeuralOrchestratorPage() {
  const [activeView, setActiveView] = useState<'overview' | 'deployment' | 'monitoring'>('overview');
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [activeAgents, setActiveAgents] = useState<ActiveAgent[]>([]);
  const [neuralMetrics, setNeuralMetrics] = useState({
    totalAgents: 47,
    activeConnections: 8247,
    systemLoad: 67,
    powerEfficiency: 94.7
  });

  useEffect(() => {
    const neuralSocket = getNeuralSocket();

    // Listen for system status updates
    const unsubscribeStatus = neuralSocket.on('system_status', (data) => {
      if (data.alert) {
        const alert: SystemAlert = {
          id: Date.now().toString(),
          type: data.level || 'info',
          message: data.alert,
          timestamp: data.timestamp || Date.now()
        };
        
        setSystemAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
      }

      if (data.cerebro_power !== undefined) {
        setNeuralMetrics(prev => ({
          ...prev,
          systemLoad: data.memory_usage || prev.systemLoad,
          powerEfficiency: data.cerebro_power || prev.powerEfficiency
        }));
      }
    });

    // Listen for agent updates
    const unsubscribeAgent = neuralSocket.on('agent_update', (data) => {
      setActiveAgents(prev => {
        const existingIndex = prev.findIndex(agent => agent.id === data.id);
        const updatedAgent: ActiveAgent = {
          id: data.id,
          name: `Neural-${data.id.split('-')[1]?.padStart(3, '0') || '000'}`,
          type: ['telepath', 'psychic', 'empath', 'neural'][Math.floor(Math.random() * 4)] as any,
          status: data.status,
          location: { city: data.location?.city || 'Unknown', country: data.location?.country || 'Global' },
          tasks: data.tasks || 0,
          efficiency: data.efficiency || 0,
          lastUpdate: Date.now()
        };

        if (existingIndex >= 0) {
          const newAgents = [...prev];
          newAgents[existingIndex] = updatedAgent;
          return newAgents;
        } else {
          return [...prev, updatedAgent].slice(0, 20); // Keep max 20 agents in view
        }
      });
    });

    // Listen for metrics updates
    const unsubscribeMetrics = neuralSocket.on('metrics_update', (data) => {
      setNeuralMetrics(prev => ({
        ...prev,
        totalAgents: data.totalAgents || prev.totalAgents,
        activeConnections: data.activeConnections || prev.activeConnections
      }));
    });

    return () => {
      unsubscribeStatus();
      unsubscribeAgent();
      unsubscribeMetrics();
    };
  }, []);

  const handleAgentDeployed = (agentId: string) => {
    const alert: SystemAlert = {
      id: Date.now().toString(),
      type: 'success',
      message: `Neural agent ${agentId} successfully deployed and integrated`,
      timestamp: Date.now()
    };
    setSystemAlerts(prev => [alert, ...prev.slice(0, 9)]);
  };

  const executeNeuralCommand = (command: string) => {
    const neuralSocket = getNeuralSocket();
    
    // Send command to random active agent
    if (activeAgents.length > 0) {
      const randomAgent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
      neuralSocket.sendCommand(randomAgent.id, command);
      
      const alert: SystemAlert = {
        id: Date.now().toString(),
        type: 'info',
        message: `Command "${command}" sent to ${randomAgent.name}`,
        timestamp: Date.now()
      };
      setSystemAlerts(prev => [alert, ...prev.slice(0, 9)]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-primary';
      case 'idle': return 'text-yellow-400';
      case 'deploying': return 'text-accent';
      case 'error': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-destructive/20 border-destructive text-destructive';
      case 'warning': return 'bg-yellow-500/20 border-yellow-500 text-yellow-300';
      case 'success': return 'bg-primary/20 border-primary text-primary';
      default: return 'bg-accent/20 border-accent text-accent-foreground';
    }
  };

  return (
    <HydrationErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
        {/* Header */}
        <div className="bg-card/80 backdrop-blur-sm border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <KSONLogo size="md" className="flex-shrink-0" />
              <div>
                <h1 className="kson-heading text-2xl font-bold">Neural Orchestrator</h1>
                <p className="text-muted-foreground">Advanced Telepathic Agent Command Center</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {['overview', 'deployment', 'monitoring'].map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    activeView === view
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 h-[calc(100vh-5rem)] overflow-hidden">
          {activeView === 'overview' && (
            <div className="grid grid-cols-4 gap-6 h-full">
              {/* Neural Network Visualization */}
              <div className="col-span-3 grid grid-rows-3 gap-4">
                <div className="row-span-2">
                  <AgentWorldVisualization className="w-full h-full" mode="worldmap" />
                </div>
                
                {/* System Metrics */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-card/60 backdrop-blur-sm rounded-xl kson-border p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{neuralMetrics.totalAgents}</div>
                    <div className="text-xs text-muted-foreground">Neural Agents</div>
                  </div>
                  <div className="bg-card/60 backdrop-blur-sm rounded-xl kson-border p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{neuralMetrics.activeConnections.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Active Links</div>
                  </div>
                  <div className="bg-card/60 backdrop-blur-sm rounded-xl kson-border p-4 text-center">
                    <div className="text-2xl font-bold text-accent">{neuralMetrics.systemLoad}%</div>
                    <div className="text-xs text-muted-foreground">System Load</div>
                  </div>
                  <div className="bg-card/60 backdrop-blur-sm rounded-xl kson-border p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{neuralMetrics.powerEfficiency}%</div>
                    <div className="text-xs text-muted-foreground">Efficiency</div>
                  </div>
                </div>
              </div>

              {/* Control Panel */}
              <div className="space-y-4">
                {/* Quick Commands */}
                <div className="bg-card/60 backdrop-blur-sm rounded-xl kson-border kson-glow p-4">
                  <h3 className="kson-heading font-semibold mb-3">Neural Commands</h3>
                  <div className="space-y-2">
                    {[
                      'Scan for mutants',
                      'Establish mind link',
                      'Memory probe',
                      'Thought projection',
                      'Neural shield'
                    ].map((command) => (
                      <button
                        key={command}
                        onClick={() => executeNeuralCommand(command)}
                        className="w-full text-left px-3 py-2 text-xs bg-background/50 hover:bg-accent rounded-lg transition-colors"
                      >
                        {command}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Agents */}
                <div className="bg-card/60 backdrop-blur-sm rounded-xl kson-border kson-glow p-4 flex-1">
                  <h3 className="kson-heading font-semibold mb-3">Active Agents</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {activeAgents.slice(0, 10).map((agent) => (
                      <div key={agent.id} className="flex items-center justify-between p-2 bg-background/30 rounded-lg">
                        <div>
                          <div className="text-xs font-medium text-foreground">{agent.name}</div>
                          <div className="text-xs text-muted-foreground">{agent.location.city}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs font-medium ${getStatusColor(agent.status)}`}>
                            {agent.status}
                          </div>
                          <div className="text-xs text-muted-foreground">{agent.efficiency}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Alerts */}
                <div className="bg-card/60 backdrop-blur-sm rounded-xl kson-border kson-glow p-4">
                  <h3 className="kson-heading font-semibold mb-3">System Alerts</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {systemAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-2 rounded-lg border text-xs ${getAlertColor(alert.type)}`}
                      >
                        <div className="font-medium">{alert.message}</div>
                        <div className="text-xs opacity-70">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === 'deployment' && (
            <div className="h-full">
              <AgentDeploymentInterface 
                className="h-full" 
                onAgentDeployed={handleAgentDeployed}
              />
            </div>
          )}

          {activeView === 'monitoring' && (
            <div className="grid grid-cols-2 gap-6 h-full">
              <GridMonitoringSystem className="h-full" />
              <NeuralNetworkTopologyMap className="h-full" />
            </div>
          )}
        </div>
      </div>
    </HydrationErrorBoundary>
  );
}