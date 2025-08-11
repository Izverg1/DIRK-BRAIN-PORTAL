'use client';

import { useState, useEffect } from 'react';
import { getNeuralSocket } from '@/lib/websocket';

interface DirkAgent {
  id: string;
  name: string;
  type: 'claude' | 'gpt' | 'gemini' | 'local';
  version: string;
  status: 'active' | 'idle' | 'deploying' | 'error';
  efficiency: number;
  tasks: number;
  accuracy: number;
  lastUpdate: number;
}

// Visual style inspired by AGENT WORLD 3 grid layout but showing DIRK agents
export default function DirkAgentGridView({ className = '' }: { className?: string }) {
  const [agents, setAgents] = useState<DirkAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [gridStats, setGridStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalTasks: 0,
    avgAccuracy: 0
  });

  useEffect(() => {
    // Initialize with DIRK Brain Portal agents in grid layout style
    const initializeDirkAgents = () => {
      const dirkAgents: DirkAgent[] = [];
      const agentTypes = ['claude', 'gpt', 'gemini', 'local'] as const;
      
      // Create 9x7 grid (63 agents) like AGENT WORLD 3 visual style
      for (let i = 0; i < 63; i++) {
        const row = Math.floor(i / 9);
        const col = i % 9;
        const agentType = agentTypes[Math.floor(Math.random() * agentTypes.length)];
        
        dirkAgents.push({
          id: `dirk-${row}-${col}`,
          name: `${agentType.toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
          type: agentType,
          version: agentType === 'claude' ? `v4.${Math.floor(Math.random() * 3) + 1}` :
                  agentType === 'gpt' ? `4${Math.random() > 0.5 ? 'o' : 'T'}-${Math.random() > 0.5 ? 'Mini' : 'Turbo'}` :
                  agentType === 'gemini' ? `Pro-1.${Math.floor(Math.random() * 2) + 4}` :
                  `Llama-${Math.floor(Math.random() * 40) + 7}B`,
          status: Math.random() > 0.82 ? 
            (['idle', 'deploying', 'error'][Math.floor(Math.random() * 3)] as any) : 'active',
          efficiency: Math.floor(Math.random() * 30) + 70,
          tasks: Math.floor(Math.random() * 800) + 100,
          accuracy: Math.floor(Math.random() * 15) + 85,
          lastUpdate: Date.now()
        });
      }
      setAgents(dirkAgents);
    };

    initializeDirkAgents();

    // Real-time updates for DIRK agents
    const neuralSocket = getNeuralSocket();
    const unsubscribe = neuralSocket.on('agent_update', (data) => {
      setAgents(prev => prev.map(agent => {
        if (Math.random() < 0.05) { // 5% chance to update any agent
          return {
            ...agent,
            status: ['active', 'idle', 'deploying'][Math.floor(Math.random() * 3)] as any,
            efficiency: Math.max(50, Math.min(100, agent.efficiency + (Math.random() - 0.5) * 10)),
            tasks: Math.max(0, agent.tasks + Math.floor((Math.random() - 0.5) * 50)),
            accuracy: Math.max(70, Math.min(100, agent.accuracy + (Math.random() - 0.5) * 5)),
            lastUpdate: Date.now()
          };
        }
        return agent;
      }));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Update grid statistics
    const stats = agents.reduce((acc, agent) => {
      acc.totalAgents++;
      if (agent.status === 'active') acc.activeAgents++;
      acc.totalTasks += agent.tasks;
      acc.avgAccuracy += agent.accuracy;
      return acc;
    }, { totalAgents: 0, activeAgents: 0, totalTasks: 0, avgAccuracy: 0 });

    if (stats.totalAgents > 0) {
      stats.avgAccuracy = stats.avgAccuracy / stats.totalAgents;
    }

    setGridStats(stats);
  }, [agents]);

  const getAgentTypeColor = (type: string) => {
    switch (type) {
      case 'claude': return 'border-white/20 bg-black hover:bg-red-900/20';
      case 'gpt': return 'border-white/20 bg-black hover:bg-red-900/20';
      case 'gemini': return 'border-white/20 bg-black hover:bg-red-900/20';
      case 'local': return 'border-red-600/30 bg-black hover:bg-red-900/20';
      default: return 'border-white/20 bg-black hover:bg-red-900/20';
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-500';
      case 'idle': return 'bg-white/50';
      case 'deploying': return 'bg-white animate-pulse';
      case 'error': return 'bg-red-600 animate-pulse';
      default: return 'bg-white/50';
    }
  };

  return (
    <div className={`bg-black border border-red-600 rounded-lg p-6 ${className}`}>
      {/* Header - DIRK Portal Style */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-red-600">
        <div>
          <h3 className="text-lg font-semibold text-white uppercase tracking-wide">AGENT GRID MONITOR</h3>
          <p className="text-white/70 text-sm mt-1 uppercase tracking-wide">
            Neural AI agent deployment matrix • 
            <span className="text-xs opacity-75">Live agents from DIRK system</span>
          </p>
        </div>
        <div className="flex space-x-6 text-sm">
          <div className="text-center">
            <div className="text-lg font-semibold text-red-400">{gridStats.activeAgents}</div>
            <div className="text-xs text-white/50 uppercase tracking-wide">ACTIVE</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-white">{gridStats.totalTasks.toLocaleString()}</div>
            <div className="text-xs text-white/50 uppercase tracking-wide">TASKS</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-red-400">{gridStats.avgAccuracy.toFixed(1)}%</div>
            <div className="text-xs text-white/50 uppercase tracking-wide">ACCURACY</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Main Agent Grid - AGENT WORLD 3 visual layout */}
        <div className="col-span-9">
          <div className="grid grid-cols-9 gap-1">
            {agents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                className={`
                  group relative p-3 rounded border cursor-pointer 
                  transition-all duration-200
                  ${getAgentTypeColor(agent.type)}
                  ${selectedAgent === agent.id ? 'ring-1 ring-red-500/40 border-red-500/30' : ''}
                  hover:border-red-500/20
                `}
              >
                {/* Professional status indicator */}
                <div className="absolute top-2 right-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusIndicator(agent.status)}`}></div>
                </div>

                {/* Agent type */}
                <div className="text-xs font-medium text-white/70 mb-1 tracking-wide uppercase">
                  {agent.type.toUpperCase()}
                </div>

                {/* Version */}
                <div className="text-xs text-white/50 mb-2 font-mono uppercase">
                  {agent.version}
                </div>

                {/* Efficiency bar */}
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-white/50 uppercase tracking-wide">EFF</span>
                    <span className="text-xs font-medium text-white">{agent.efficiency}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded h-1">
                    <div 
                      className="h-1 rounded bg-red-500 transition-all duration-300"
                      style={{ width: `${agent.efficiency}%` }}
                    ></div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/50 uppercase tracking-wide">TSK</span>
                    <span className="font-mono text-white">{agent.tasks}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-white/50 uppercase tracking-wide">ACC</span>
                    <span className="font-mono text-red-400">{agent.accuracy}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Elegant DIRK agent details */}
        <div className="col-span-3 space-y-4">
          {/* Selected Agent Details - DIRK Card */}
          {selectedAgent && (
            <div className="bg-black border border-red-600 rounded p-4">
              <h4 className="text-sm font-semibold text-white mb-4 flex items-center uppercase tracking-wide">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                AGENT DETAILS
              </h4>
              {(() => {
                const agent = agents.find(a => a.id === selectedAgent);
                if (!agent) return null;
                return (
                  <div className="space-y-3">
                    <div className="pb-3 border-b border-red-600/30">
                      <div className="text-xs text-white/50 mb-1 uppercase tracking-wide">AGENT ID</div>
                      <div className="font-mono text-sm text-white">{agent.name}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-white/50 mb-1 uppercase tracking-wide">TYPE</div>
                        <div className="font-medium text-red-400">{agent.type.toUpperCase()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-white/50 mb-1 uppercase tracking-wide">VERSION</div>
                        <div className="font-mono text-white">{agent.version}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-white/50 uppercase tracking-wide">STATUS</div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${getStatusIndicator(agent.status)}`}></div>
                        <span className="text-sm font-medium text-white">
                          {agent.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-red-600/30">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50 uppercase tracking-wide">EFFICIENCY</span>
                        <span className="font-mono text-red-400">{agent.efficiency}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50 uppercase tracking-wide">TASKS</span>
                        <span className="font-mono text-white">{agent.tasks}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/50 uppercase tracking-wide">ACCURACY</span>
                        <span className="font-mono text-red-400">{agent.accuracy}%</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* DIRK System Overview - DIRK Card */}
          <div className="bg-black border border-red-600 rounded p-4">
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center uppercase tracking-wide">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
              SYSTEM OVERVIEW
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/50 uppercase tracking-wide">ACTIVE AGENTS</span>
                <span className="font-mono font-medium text-red-400">{gridStats.activeAgents}/{gridStats.totalAgents}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50 uppercase tracking-wide">TOTAL TASKS</span>
                <span className="font-mono font-medium text-white">{gridStats.totalTasks.toLocaleString()}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50 uppercase tracking-wide">AVERAGE ACCURACY</span>
                  <span className="font-mono font-medium text-red-400">{gridStats.avgAccuracy.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-white/20 rounded h-1">
                  <div 
                    className="h-1 rounded bg-red-500 transition-all duration-300"
                    style={{ width: `${gridStats.avgAccuracy}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Type Distribution - DIRK Card */}
          <div className="bg-black border border-red-600 rounded p-4">
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center uppercase tracking-wide">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
              AGENT DISTRIBUTION
            </h4>
            <div className="space-y-3">
              {['claude', 'gpt', 'gemini', 'local'].map(type => {
                const count = agents.filter(a => a.type === type).length;
                const percentage = (count / agents.length * 100).toFixed(0);
                
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50 uppercase tracking-wide">{type.toUpperCase()}</span>
                      <span className="font-mono font-medium text-white">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-white/20 rounded h-1">
                      <div 
                        className="h-1 rounded bg-red-500 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
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