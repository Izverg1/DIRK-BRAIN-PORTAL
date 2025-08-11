'use client';

import { useState, useEffect } from 'react';
import { getNeuralSocket } from '@/lib/websocket';

interface GlobalAgent {
  id: string;
  name: string;
  type: 'claude' | 'gpt' | 'gemini' | 'local';
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'idle' | 'deploying' | 'error';
  tasks: number;
  efficiency: number;
  connections: string[];
  lastUpdate: number;
}

interface GlobalConnection {
  id: string;
  from: string;
  to: string;
  bandwidth: number;
  latency: number;
  dataFlow: number;
  status: 'active' | 'idle' | 'congested';
}

interface RegionStats {
  region: string;
  totalAgents: number;
  activeAgents: number;
  totalTasks: number;
  avgEfficiency: number;
}

// Visual style inspired by AGENT WORLD1 3D globe but showing DIRK global distribution
export default function DirkGlobalDistribution({ className = '' }: { className?: string }) {
  const [globalAgents, setGlobalAgents] = useState<GlobalAgent[]>([]);
  const [globalConnections, setGlobalConnections] = useState<GlobalConnection[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [regionStats, setRegionStats] = useState<RegionStats[]>([]);
  const [globalMetrics, setGlobalMetrics] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalConnections: 0,
    globalEfficiency: 0
  });

  useEffect(() => {
    // Initialize with DIRK Brain Portal global agents in AGENT WORLD1 style
    const initializeDirkGlobalAgents = () => {
      const locations = [
        // North America
        { country: 'USA', city: 'San Francisco', lat: 37.7749, lng: -122.4194, region: 'North America' },
        { country: 'USA', city: 'New York', lat: 40.7128, lng: -74.0060, region: 'North America' },
        { country: 'USA', city: 'Austin', lat: 30.2672, lng: -97.7431, region: 'North America' },
        { country: 'Canada', city: 'Toronto', lat: 43.6532, lng: -79.3832, region: 'North America' },
        
        // Europe
        { country: 'UK', city: 'London', lat: 51.5074, lng: -0.1278, region: 'Europe' },
        { country: 'Germany', city: 'Berlin', lat: 52.5200, lng: 13.4050, region: 'Europe' },
        { country: 'France', city: 'Paris', lat: 48.8566, lng: 2.3522, region: 'Europe' },
        { country: 'Netherlands', city: 'Amsterdam', lat: 52.3676, lng: 4.9041, region: 'Europe' },
        
        // Asia Pacific
        { country: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503, region: 'Asia Pacific' },
        { country: 'Singapore', city: 'Singapore', lat: 1.3521, lng: 103.8198, region: 'Asia Pacific' },
        { country: 'Australia', city: 'Sydney', lat: -33.8688, lng: 151.2093, region: 'Asia Pacific' },
        { country: 'South Korea', city: 'Seoul', lat: 37.5665, lng: 126.9780, region: 'Asia Pacific' },
        
        // Other regions
        { country: 'Brazil', city: 'São Paulo', lat: -23.5505, lng: -46.6333, region: 'South America' },
        { country: 'India', city: 'Mumbai', lat: 19.0760, lng: 72.8777, region: 'Asia' },
        { country: 'South Africa', city: 'Cape Town', lat: -33.9249, lng: 18.4241, region: 'Africa' }
      ];

      const agentTypes = ['claude', 'gpt', 'gemini', 'local'] as const;
      const dirkAgents: GlobalAgent[] = [];
      
      locations.forEach((location, index) => {
        // Create 2-4 agents per location
        const agentCount = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < agentCount; i++) {
          const agentType = agentTypes[Math.floor(Math.random() * agentTypes.length)];
          dirkAgents.push({
            id: `${location.country.toLowerCase()}-${agentType}-${i + 1}`,
            name: `${agentType.toUpperCase()}-${location.city}-${String(i + 1).padStart(2, '0')}`,
            type: agentType,
            country: location.country,
            city: location.city,
            latitude: location.lat + (Math.random() - 0.5) * 0.5, // Small variation
            longitude: location.lng + (Math.random() - 0.5) * 0.5,
            status: Math.random() > 0.85 ? 
              (['idle', 'deploying', 'error'][Math.floor(Math.random() * 3)] as any) : 'active',
            tasks: Math.floor(Math.random() * 500) + 50,
            efficiency: Math.floor(Math.random() * 30) + 70,
            connections: [], // Will be populated below
            lastUpdate: Date.now()
          });
        }
      });

      // Create connections between agents (like AGENT WORLD1 global network lines)
      const dirkConnections: GlobalConnection[] = [];
      dirkAgents.forEach((agent, index) => {
        // Connect to 1-3 random other agents
        const connectionCount = Math.floor(Math.random() * 3) + 1;
        const otherAgents = dirkAgents.filter(a => a.id !== agent.id);
        
        for (let i = 0; i < connectionCount; i++) {
          const targetAgent = otherAgents[Math.floor(Math.random() * otherAgents.length)];
          const connectionId = `${agent.id}-${targetAgent.id}`;
          
          if (!dirkConnections.find(c => c.id === connectionId || c.id === `${targetAgent.id}-${agent.id}`)) {
            // Calculate distance for latency simulation
            const distance = Math.sqrt(
              Math.pow(agent.latitude - targetAgent.latitude, 2) + 
              Math.pow(agent.longitude - targetAgent.longitude, 2)
            );
            
            dirkConnections.push({
              id: connectionId,
              from: agent.id,
              to: targetAgent.id,
              bandwidth: Math.floor(Math.random() * 100) + 50,
              latency: Math.floor(distance * 10) + 10, // Distance-based latency
              dataFlow: Math.floor(Math.random() * 1000) + 100,
              status: Math.random() > 0.9 ? 'congested' : Math.random() > 0.8 ? 'idle' : 'active'
            });
            
            agent.connections.push(targetAgent.id);
          }
        }
      });

      setGlobalAgents(dirkAgents);
      setGlobalConnections(dirkConnections);
    };

    initializeDirkGlobalAgents();

    // Real-time updates for DIRK global network
    const neuralSocket = getNeuralSocket();
    const unsubscribe = neuralSocket.on('global_update', (data) => {
      setGlobalAgents(prev => prev.map(agent => {
        if (Math.random() < 0.1) { // 10% chance to update any agent
          return {
            ...agent,
            status: ['active', 'idle', 'deploying'][Math.floor(Math.random() * 3)] as any,
            tasks: Math.max(0, agent.tasks + Math.floor((Math.random() - 0.5) * 50)),
            efficiency: Math.max(50, Math.min(100, agent.efficiency + (Math.random() - 0.5) * 10)),
            lastUpdate: Date.now()
          };
        }
        return agent;
      }));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Calculate region statistics
    const regions = Array.from(new Set(globalAgents.map(a => {
      if (a.country === 'USA' || a.country === 'Canada') return 'North America';
      if (a.country === 'UK' || a.country === 'Germany' || a.country === 'France' || a.country === 'Netherlands') return 'Europe';
      if (a.country === 'Japan' || a.country === 'Singapore' || a.country === 'Australia' || a.country === 'South Korea') return 'Asia Pacific';
      if (a.country === 'Brazil') return 'South America';
      if (a.country === 'India') return 'Asia';
      return 'Africa';
    })));

    const stats = regions.map(region => {
      const regionAgents = globalAgents.filter(a => {
        const agentRegion = 
          (a.country === 'USA' || a.country === 'Canada') ? 'North America' :
          (a.country === 'UK' || a.country === 'Germany' || a.country === 'France' || a.country === 'Netherlands') ? 'Europe' :
          (a.country === 'Japan' || a.country === 'Singapore' || a.country === 'Australia' || a.country === 'South Korea') ? 'Asia Pacific' :
          (a.country === 'Brazil') ? 'South America' :
          (a.country === 'India') ? 'Asia' : 'Africa';
        return agentRegion === region;
      });

      return {
        region,
        totalAgents: regionAgents.length,
        activeAgents: regionAgents.filter(a => a.status === 'active').length,
        totalTasks: regionAgents.reduce((sum, a) => sum + a.tasks, 0),
        avgEfficiency: regionAgents.reduce((sum, a) => sum + a.efficiency, 0) / Math.max(regionAgents.length, 1)
      };
    });

    setRegionStats(stats);

    // Calculate global metrics
    setGlobalMetrics({
      totalAgents: globalAgents.length,
      activeAgents: globalAgents.filter(a => a.status === 'active').length,
      totalConnections: globalConnections.length,
      globalEfficiency: globalAgents.reduce((sum, a) => sum + a.efficiency, 0) / Math.max(globalAgents.length, 1)
    });
  }, [globalAgents, globalConnections]);

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'deploying': return 'bg-blue-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAgentTypeColor = (type: string) => {
    switch (type) {
      case 'claude': return 'border-blue-400';
      case 'gpt': return 'border-green-400';
      case 'gemini': return 'border-purple-400';
      case 'local': return 'border-yellow-400';
      default: return 'border-gray-400';
    }
  };

  return (
    <div className={`bg-black border border-red-600 rounded-lg p-6 ${className}`}>
      {/* Header - DIRK Portal style */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white uppercase tracking-wide">DIRK GLOBAL AGENT DISTRIBUTION</h3>
          <p className="text-white/70 text-sm uppercase tracking-wide">Worldwide neural AI agent network topology</p>
        </div>
        <div className="flex space-x-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{globalMetrics.totalAgents}</div>
            <div className="text-xs text-white/50 uppercase tracking-wide">GLOBAL AGENTS</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{globalMetrics.activeAgents}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{globalMetrics.globalEfficiency.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Efficiency</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Main Globe Visualization - AGENT WORLD1 visual layout */}
        <div className="col-span-8">
          <div className="relative bg-background/20 rounded-lg border border-border h-96">
            {/* Simplified world map representation */}
            <div className="absolute inset-4">
              <svg className="w-full h-full" viewBox="0 0 360 180" preserveAspectRatio="xMidYMid meet">
                {/* World map outline (simplified) */}
                <rect x="0" y="0" width="360" height="180" fill="none" stroke="rgb(100, 116, 139)" strokeWidth="0.5" opacity="0.3" />
                <line x1="0" y1="90" x2="360" y2="90" stroke="rgb(100, 116, 139)" strokeWidth="0.5" opacity="0.3" />
                <line x1="180" y1="0" x2="180" y2="180" stroke="rgb(100, 116, 139)" strokeWidth="0.5" opacity="0.3" />
                
                {/* Continental outlines (very simplified) */}
                <path d="M60,60 L120,50 L140,70 L100,80 Z" fill="none" stroke="rgb(100, 116, 139)" strokeWidth="0.3" opacity="0.2" />
                <path d="M200,40 L280,35 L300,55 L240,65 Z" fill="none" stroke="rgb(100, 116, 139)" strokeWidth="0.3" opacity="0.2" />
                <path d="M280,100 L320,95 L330,120 L290,125 Z" fill="none" stroke="rgb(100, 116, 139)" strokeWidth="0.3" opacity="0.2" />
                
                {/* Global connections */}
                {globalConnections.map(connection => {
                  const fromAgent = globalAgents.find(a => a.id === connection.from);
                  const toAgent = globalAgents.find(a => a.id === connection.to);
                  if (!fromAgent || !toAgent) return null;

                  const fromX = ((fromAgent.longitude + 180) / 360) * 360;
                  const fromY = ((90 - fromAgent.latitude) / 180) * 180;
                  const toX = ((toAgent.longitude + 180) / 360) * 360;
                  const toY = ((90 - toAgent.latitude) / 180) * 180;

                  return (
                    <line
                      key={connection.id}
                      x1={fromX}
                      y1={fromY}
                      x2={toX}
                      y2={toY}
                      stroke={
                        connection.status === 'active' ? 'rgb(var(--primary))' :
                        connection.status === 'congested' ? 'rgb(234, 179, 8)' : 'rgb(156, 163, 175)'
                      }
                      strokeWidth={Math.max(0.5, connection.bandwidth / 100)}
                      opacity={connection.status === 'active' ? 0.6 : 0.3}
                      strokeDasharray={connection.status === 'idle' ? '2,2' : undefined}
                    />
                  );
                })}

                {/* Agent locations */}
                {globalAgents.map(agent => {
                  const x = ((agent.longitude + 180) / 360) * 360;
                  const y = ((90 - agent.latitude) / 180) * 180;

                  return (
                    <g key={agent.id}>
                      <circle
                        cx={x}
                        cy={y}
                        r="3"
                        className={`${getAgentStatusColor(agent.status)} ${getAgentTypeColor(agent.type)} stroke-2 cursor-pointer transition-all hover:scale-150`}
                        onClick={() => setSelectedRegion(agent.country)}
                      />
                      
                      {/* Agent efficiency indicator */}
                      <text
                        x={x}
                        y={y - 6}
                        className="text-xs fill-foreground font-mono"
                        textAnchor="middle"
                        fontSize="3"
                      >
                        {agent.efficiency}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Status legend - AGENT WORLD1 style */}
            <div className="absolute bottom-4 left-4 bg-black/80 border border-red-600 rounded p-3">
              <div className="text-xs font-medium text-white mb-2 uppercase tracking-wide">AGENT STATUS</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-white uppercase tracking-wide">ACTIVE</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                  <span className="text-white uppercase tracking-wide">IDLE</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Deploying</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Error</span>
                </div>
              </div>
            </div>

            {/* Type legend */}
            <div className="absolute bottom-4 right-4 bg-black/80 border border-red-600 rounded p-3">
              <div className="text-xs font-medium text-white mb-2 uppercase tracking-wide">AGENT TYPES</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 border border-white rounded-full"></div>
                  <span className="text-white uppercase tracking-wide">CLAUDE</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 border border-red-400 rounded-full"></div>
                  <span className="text-white uppercase tracking-wide">GPT</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 border border-purple-400 rounded-full"></div>
                  <span>Gemini</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 border border-yellow-400 rounded-full"></div>
                  <span>Local</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Regional statistics and details */}
        <div className="col-span-4 space-y-4">
          {/* Regional Statistics */}
          <div className="bg-secondary/20 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">Regional Distribution</h4>
            <div className="space-y-3">
              {regionStats.map(region => (
                <div 
                  key={region.region}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedRegion === region.region ? 'bg-primary/20 border border-primary/30' : 'bg-background/30 hover:bg-background/50'
                  }`}
                  onClick={() => setSelectedRegion(selectedRegion === region.region ? null : region.region)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{region.region}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {region.activeAgents}/{region.totalAgents} active
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-primary font-bold">{region.avgEfficiency.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">{region.totalTasks} tasks</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Metrics */}
          <div className="bg-secondary/20 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">Global Metrics</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Agents:</span>
                <span className="text-foreground font-bold">{globalMetrics.totalAgents}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Agents:</span>
                <span className="text-primary">{globalMetrics.activeAgents}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Network Links:</span>
                <span className="text-accent">{globalMetrics.totalConnections}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Global Efficiency:</span>
                <span className="text-foreground">{globalMetrics.globalEfficiency.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Top Performing Cities */}
          <div className="bg-secondary/20 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">Top Cities</h4>
            <div className="space-y-2">
              {Array.from(new Set(globalAgents.map(a => a.city)))
                .map(city => ({
                  city,
                  agents: globalAgents.filter(a => a.city === city),
                }))
                .sort((a, b) => {
                  const avgEffA = a.agents.reduce((sum, agent) => sum + agent.efficiency, 0) / a.agents.length;
                  const avgEffB = b.agents.reduce((sum, agent) => sum + agent.efficiency, 0) / b.agents.length;
                  return avgEffB - avgEffA;
                })
                .slice(0, 5)
                .map(cityData => {
                  const avgEff = cityData.agents.reduce((sum, agent) => sum + agent.efficiency, 0) / cityData.agents.length;
                  const activeCount = cityData.agents.filter(a => a.status === 'active').length;
                  
                  return (
                    <div key={cityData.city} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-foreground">{cityData.city}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-primary">{avgEff.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">{activeCount} active</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Connection Health */}
          <div className="bg-secondary/20 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">Network Health</h4>
            <div className="space-y-2">
              {['active', 'idle', 'congested'].map(status => {
                const count = globalConnections.filter(c => c.status === status).length;
                const percentage = (count / globalConnections.length * 100).toFixed(0);
                return (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        status === 'active' ? 'bg-primary' :
                        status === 'idle' ? 'bg-yellow-500' : 'bg-orange-500'
                      }`}></div>
                      <span className="text-foreground capitalize">{status}</span>
                    </div>
                    <span className="text-muted-foreground">{count} ({percentage}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}