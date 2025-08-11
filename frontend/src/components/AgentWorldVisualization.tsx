'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { withExtensionResilience } from './ExtensionResilient';
import { getNeuralSocket, type AgentUpdate, type MetricsUpdate } from '@/lib/websocket';

interface AgentWorldVisualizationProps {
  className?: string;
  mode?: 'worldmap' | 'globe' | 'grid' | 'analytics';
}

interface AgentData {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'deploying' | 'error';
  location: { lat: number; lng: number; city: string; country: string };
  type: 'telepath' | 'psychic' | 'empath' | 'neural';
  tasks: number;
  efficiency: number;
  power: number;
  connections: number;
}

function AgentWorldVisualizationComponent({ 
  className = '', 
  mode = 'worldmap' 
}: AgentWorldVisualizationProps) {
  const [currentMode, setCurrentMode] = useState(mode);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [liveData, setLiveData] = useState<AgentData[]>([]);
  const [metrics, setMetrics] = useState({
    totalAgents: 47,
    activeConnections: 8247,
    neuralEfficiency: 94.7,
    powerConsumption: 622.17,
    telepathyRange: 2400000,
    syncRate: 99.99
  });

  // Connect to real-time WebSocket data
  useEffect(() => {
    const neuralSocket = getNeuralSocket();
    const agentMap = new Map<string, AgentData>();

    // Initialize with some base agents
    const baseAgents: AgentData[] = Array.from({ length: 12 }, (_, i) => ({
      id: `agent-${i + 1}`,
      name: `Neural-${String(i + 1).padStart(3, '0')}`,
      status: 'active',
      location: {
        lat: (Math.random() - 0.5) * 180,
        lng: (Math.random() - 0.5) * 360,
        city: ['New York', 'London', 'Tokyo', 'Sydney', 'Berlin', 'Moscow'][Math.floor(Math.random() * 6)],
        country: 'Global'
      },
      type: ['telepath', 'psychic', 'empath', 'neural'][Math.floor(Math.random() * 4)] as any,
      tasks: Math.floor(Math.random() * 2000) + 100,
      efficiency: Math.floor(Math.random() * 20) + 80,
      power: Math.random() * 100,
      connections: Math.floor(Math.random() * 50) + 10
    }));

    baseAgents.forEach(agent => agentMap.set(agent.id, agent));
    setLiveData(baseAgents);

    // Listen for agent updates
    const unsubscribeAgent = neuralSocket.on('agent_update', (update: AgentUpdate) => {
      agentMap.set(update.id, {
        id: update.id,
        name: `Neural-${update.id.split('-')[1]?.padStart(3, '0') || '000'}`,
        status: update.status,
        location: update.location,
        type: ['telepath', 'psychic', 'empath', 'neural'][Math.floor(Math.random() * 4)] as any,
        tasks: update.tasks,
        efficiency: update.efficiency,
        power: Math.random() * 100,
        connections: update.connections.length
      });
      setLiveData(Array.from(agentMap.values()));
    });

    // Listen for metrics updates
    const unsubscribeMetrics = neuralSocket.on('metrics_update', (update: MetricsUpdate) => {
      setMetrics(prev => ({
        ...prev,
        totalAgents: update.totalAgents,
        activeConnections: update.activeConnections,
        neuralEfficiency: Math.round(update.neuralEfficiency * 100) / 100,
        powerConsumption: Math.round(update.powerConsumption * 100) / 100,
        telepathyRange: update.telepathyRange,
        syncRate: Math.round(update.syncRate * 100) / 100
      }));
    });

    return () => {
      unsubscribeAgent();
      unsubscribeMetrics();
    };
  }, []);

  const switchMode = (newMode: string) => {
    if (newMode === currentMode) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentMode(newMode as any);
      setTimeout(() => setIsTransitioning(false), 300);
    }, 200);
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'telepath': return '🧠';
      case 'psychic': return '👁️';
      case 'empath': return '💝';
      case 'neural': return '⚡';
      default: return '🤖';
    }
  };

  return (
    <div className={`relative bg-card/60 backdrop-blur-sm rounded-xl kson-border kson-glow overflow-hidden ${className}`}>
      {/* Mode Selector */}
      <div className="absolute top-4 right-4 z-20 flex space-x-1 bg-background/80 backdrop-blur-sm rounded-lg p-1">
        {[
          { key: 'worldmap', label: '🗺️', title: 'Network Map' },
          { key: 'globe', label: '🌍', title: '3D Globe' },
          { key: 'grid', label: '⚡', title: 'Grid Monitor' },
          { key: 'analytics', label: '📊', title: 'Analytics' }
        ].map((modeOption) => (
          <button
            key={modeOption.key}
            onClick={() => switchMode(modeOption.key)}
            title={modeOption.title}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              currentMode === modeOption.key
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            {modeOption.label}
          </button>
        ))}
      </div>

      {/* Live Status Indicator */}
      <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 bg-background/80 backdrop-blur-sm rounded-lg px-3 py-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        <span className="text-xs text-primary font-medium">NEURAL LINK ACTIVE</span>
      </div>

      {/* Main Visualization Area */}
      <div className={`relative w-full h-full transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {currentMode === 'worldmap' && (
          <div className="relative w-full h-full">
            <Image
              src="/AGENT WORLDMAP.png"
              alt="Agent World Network Map"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
            
            {/* Live Data Overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3 kson-border">
                  <div className="text-lg font-bold text-primary">{metrics.totalAgents}</div>
                  <div className="text-xs text-muted-foreground">Neural Nodes</div>
                </div>
                <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3 kson-border">
                  <div className="text-lg font-bold text-primary">{metrics.activeConnections.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Active Links</div>
                </div>
                <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3 kson-border">
                  <div className="text-lg font-bold text-primary">{metrics.neuralEfficiency}%</div>
                  <div className="text-xs text-muted-foreground">Efficiency</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentMode === 'globe' && (
          <div className="relative w-full h-full">
            <Image
              src="/AGENT WORLD1.png"
              alt="3D Globe Visualization"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/40" />
            
            {/* Globe Controls */}
            <div className="absolute bottom-4 right-4">
              <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 kson-border">
                <h4 className="text-sm font-semibold text-foreground mb-2">Global Status</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Range:</span>
                    <span className="text-primary">{(metrics.telepathyRange / 1000).toFixed(0)}K km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sync Rate:</span>
                    <span className="text-primary">{metrics.syncRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentMode === 'grid' && (
          <div className="relative w-full h-full">
            <Image
              src="/AGENT WORLD 3.png"
              alt="Grid Monitoring System"
              fill
              className="object-cover"
            />
            
            {/* Grid Status Overlay */}
            <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
              <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4 kson-border max-w-xs">
                <h4 className="text-sm font-semibold text-foreground mb-3">Agent Grid Status</h4>
                <div className="space-y-2">
                  {liveData.slice(0, 6).map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span>{getTypeIcon(agent.type)}</span>
                        <span className="text-foreground">{agent.name}</span>
                      </div>
                      <div className={`font-medium ${getStatusColor(agent.status)}`}>
                        {agent.efficiency}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentMode === 'analytics' && (
          <div className="relative w-full h-full">
            <Image
              src="/AGENT WORLD 4.png"
              alt="Analytics Dashboard"
              fill
              className="object-cover"
            />
            
            {/* Analytics Overlay */}
            <div className="absolute top-4 left-4">
              <div className="bg-background/90 backdrop-blur-sm rounded-lg p-4 kson-border">
                <h4 className="text-sm font-semibold text-foreground mb-3">Neural Parameters</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-muted-foreground">Power Usage</div>
                    <div className="text-lg font-bold text-accent">{metrics.powerConsumption.toFixed(2)} kWh</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Efficiency</div>
                    <div className="text-lg font-bold text-primary">{metrics.neuralEfficiency}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <div className="text-xs text-muted-foreground">Switching Neural View...</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withExtensionResilience(AgentWorldVisualizationComponent);