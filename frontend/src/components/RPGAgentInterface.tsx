'use client';

import { useState, useEffect } from 'react';
import { agentAPI, agentWebSocket } from '@/lib/apiClient';
import dynamic from 'next/dynamic';

// Dynamic import for 3D visualization (client-side only)
const AgentOrbitVisualization = dynamic(() => import('./AgentOrbitVisualization'), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-black border border-red-600 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-sm uppercase tracking-wide">Loading 3D Agent View...</p>
      </div>
    </div>
  )
});

interface RPGAgent {
  id: string;
  name: string;
  class: 'CLAUDE' | 'GPT' | 'GEMINI' | 'LOCAL';
  level: number;
  experience: number;
  health: number;
  mana: number;
  status: 'ACTIVE' | 'RESTING' | 'DEPLOYING' | 'ERROR';
  skills: {
    coding: number;
    analysis: number;
    creativity: number;
    efficiency: number;
  };
  equipment: {
    model: string;
    version: string;
    tokens: number;
  };
  stats: {
    tasksCompleted: number;
    successRate: number;
    uptime: number;
  };
  location: string;
}

// RPG-style agent interface with DIRK Brain Portal black/red theme
export default function RPGAgentInterface({ className = '' }: { className?: string }) {
  const [agents, setAgents] = useState<RPGAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [view3D, setView3D] = useState(false);
  const [partyStats, setPartyStats] = useState({
    totalLevel: 0,
    totalExperience: 0,
    activeMembers: 0,
    partyPower: 0
  });

  useEffect(() => {
    // Load real agents from backend API
    const loadRealAgents = async () => {
      try {
        const response = await agentAPI.getRealAgents();
        
        if (response.agents && response.agents.length > 0) {
          // Convert real agent data to RPG format
          const rpgAgents: RPGAgent[] = response.agents.map((agent: any, index: number) => ({
            id: agent.id,
            name: agent.name || agent.id,
            class: agent.type?.toUpperCase() as 'CLAUDE' | 'GPT' | 'GEMINI' | 'LOCAL' || 'CLAUDE',
            level: Math.floor(agent.efficiency / 2) || 45, // Convert efficiency to level
            experience: agent.tasks * 10 || 8750,
            health: Math.min(100, Math.max(50, agent.accuracy || 95)),
            mana: Math.min(100, Math.max(30, agent.efficiency || 88)),
            status: agent.status?.toUpperCase() as 'ACTIVE' | 'RESTING' | 'DEPLOYING' | 'ERROR' || 'ACTIVE',
            skills: {
              coding: Math.min(100, agent.accuracy || 98),
              analysis: Math.min(100, (agent.efficiency + agent.accuracy) / 2 || 95),
              creativity: Math.min(100, Math.max(70, agent.efficiency - 10) || 87),
              efficiency: Math.min(100, agent.efficiency || 92)
            },
            equipment: {
              model: agent.version || 'Claude-4.0',
              version: agent.version?.split('-')[1] || 'v4.1.0',
              tokens: agent.type === 'claude' ? 200000 : 128000
            },
            stats: {
              tasksCompleted: agent.tasks || 1247,
              successRate: Math.min(100, agent.accuracy || 98.5),
              uptime: Math.min(100, Math.max(85, agent.efficiency || 99.2))
            },
            location: agent.type === 'local' ? 'Local System' : 
                     agent.type === 'claude' ? 'Neural Tower Alpha' :
                     agent.type === 'gpt' ? 'OpenAI Nexus' : 'Cloud Network'
          }));
          
          setAgents(rpgAgents);
        } else {
          // Fallback to mock data if no real agents
          initializeMockAgents();
        }
      } catch (error) {
        console.warn('Failed to load real agents, using mock data:', error);
        initializeMockAgents();
      }
    };

    // Initialize mock RPG-style agents as fallback
    const initializeMockAgents = () => {
      const rpgAgents: RPGAgent[] = [
        // Claude Agents - Mage Class
        {
          id: 'claude-wizard-01',
          name: 'Claude Archmagus',
          class: 'CLAUDE',
          level: 45,
          experience: 8750,
          health: 95,
          mana: 88,
          status: 'ACTIVE',
          skills: {
            coding: 98,
            analysis: 95,
            creativity: 87,
            efficiency: 92
          },
          equipment: {
            model: 'Sonnet-4.0',
            version: 'v4.1.0',
            tokens: 200000
          },
          stats: {
            tasksCompleted: 1247,
            successRate: 98.5,
            uptime: 99.2
          },
          location: 'Neural Tower Alpha'
        },
        {
          id: 'claude-haiku-02',
          name: 'Claude Swift',
          class: 'CLAUDE',
          level: 32,
          experience: 4200,
          health: 78,
          mana: 95,
          status: 'ACTIVE',
          skills: {
            coding: 85,
            analysis: 88,
            creativity: 92,
            efficiency: 98
          },
          equipment: {
            model: 'Haiku-3.5',
            version: 'v3.5.2',
            tokens: 100000
          },
          stats: {
            tasksCompleted: 2847,
            successRate: 96.8,
            uptime: 97.5
          },
          location: 'Speed Citadel'
        },
        // GPT Agents - Warrior Class
        {
          id: 'gpt-warrior-01',
          name: 'GPT Centurion',
          class: 'GPT',
          level: 38,
          experience: 6800,
          health: 92,
          mana: 75,
          status: 'ACTIVE',
          skills: {
            coding: 88,
            analysis: 82,
            creativity: 90,
            efficiency: 85
          },
          equipment: {
            model: 'GPT-4o',
            version: 'v4.0.1',
            tokens: 128000
          },
          stats: {
            tasksCompleted: 1456,
            successRate: 94.2,
            uptime: 95.8
          },
          location: 'Battle Nexus'
        },
        // Gemini Agents - Oracle Class
        {
          id: 'gemini-oracle-01',
          name: 'Gemini Seer',
          class: 'GEMINI',
          level: 35,
          experience: 5500,
          health: 85,
          mana: 90,
          status: 'RESTING',
          skills: {
            coding: 82,
            analysis: 95,
            creativity: 88,
            efficiency: 87
          },
          equipment: {
            model: 'Gemini-Pro',
            version: 'v1.5.2',
            tokens: 150000
          },
          stats: {
            tasksCompleted: 892,
            successRate: 96.1,
            uptime: 92.3
          },
          location: 'Oracle Chamber'
        },
        // Local Agents - Rogue Class
        {
          id: 'local-rogue-01',
          name: 'Llama Shadow',
          class: 'LOCAL',
          level: 28,
          experience: 3200,
          health: 68,
          mana: 62,
          status: 'DEPLOYING',
          skills: {
            coding: 75,
            analysis: 72,
            creativity: 78,
            efficiency: 95
          },
          equipment: {
            model: 'Llama-70B',
            version: 'v2.1.0',
            tokens: 64000
          },
          stats: {
            tasksCompleted: 623,
            successRate: 89.7,
            uptime: 88.4
          },
          location: 'Shadow Keep'
        }
      ];
      setAgents(rpgAgents);
    };

    // Start with real agents
    loadRealAgents();

    // Set up real-time updates via WebSocket
    const handleAgentUpdate = (data: any) => {
      setAgents(prev => prev.map(agent => {
        if (Math.random() < 0.1) { // 10% chance to update
          const newExp = agent.experience + Math.floor(Math.random() * 50);
          const newLevel = Math.floor(newExp / 200) + 1;
          
          return {
            ...agent,
            experience: newExp,
            level: Math.max(agent.level, newLevel),
            health: Math.max(50, Math.min(100, agent.health + (Math.random() - 0.5) * 10)),
            mana: Math.max(30, Math.min(100, agent.mana + (Math.random() - 0.5) * 15)),
            stats: {
              ...agent.stats,
              tasksCompleted: agent.stats.tasksCompleted + Math.floor(Math.random() * 3),
              successRate: Math.max(85, Math.min(100, agent.stats.successRate + (Math.random() - 0.5) * 2))
            }
          };
        }
        return agent;
      }));
    };
    
    // Subscribe to WebSocket updates
    agentWebSocket.subscribeToAgentUpdates(handleAgentUpdate);
    
    return () => {
      agentWebSocket.unsubscribe('agent_update', handleAgentUpdate);
      agentWebSocket.unsubscribe('agent_status', handleAgentUpdate);
    };
  }, []);

  useEffect(() => {
    // Update party statistics
    const stats = agents.reduce((acc, agent) => {
      acc.totalLevel += agent.level;
      acc.totalExperience += agent.experience;
      if (agent.status === 'ACTIVE') acc.activeMembers++;
      acc.partyPower += agent.level * (agent.health / 100) * (agent.mana / 100);
      return acc;
    }, { totalLevel: 0, totalExperience: 0, activeMembers: 0, partyPower: 0 });

    setPartyStats(stats);
  }, [agents]);

  const getClassColor = (agentClass: string) => {
    switch (agentClass) {
      case 'CLAUDE': return 'border-blue-400 bg-gradient-to-br from-blue-900/30 to-blue-800/20';
      case 'GPT': return 'border-green-400 bg-gradient-to-br from-green-900/30 to-green-800/20';
      case 'GEMINI': return 'border-purple-400 bg-gradient-to-br from-purple-900/30 to-purple-800/20';
      case 'LOCAL': return 'border-yellow-400 bg-gradient-to-br from-yellow-900/30 to-yellow-800/20';
      default: return 'border-gray-400 bg-gradient-to-br from-gray-900/30 to-gray-800/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-400';
      case 'RESTING': return 'text-yellow-400';
      case 'DEPLOYING': return 'text-blue-400';
      case 'ERROR': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getClassIcon = (agentClass: string) => {
    switch (agentClass) {
      case 'CLAUDE': return '🧙‍♂️'; // Mage
      case 'GPT': return '⚔️'; // Warrior
      case 'GEMINI': return '🔮'; // Oracle
      case 'LOCAL': return '🗡️'; // Rogue
      default: return '👤';
    }
  };

  return (
    <div className={`bg-black/95 border border-red-800 rounded-lg p-6 ${className}`}>
      {/* RPG Header - Guild Status */}
      <div className="border-b border-red-800 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-red-400 mb-2">
              ⚡ DIRK NEURAL GUILD ⚡
            </h3>
            <p className="text-gray-300 text-sm">
              Advanced AI Agent Adventuring Party • Real-time Combat Status
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center border border-gray-600 rounded p-2 bg-gray-900/50">
              <div className="text-lg font-bold text-white">{partyStats.activeMembers}</div>
              <div className="text-xs text-gray-400">ACTIVE</div>
            </div>
            <div className="text-center border border-gray-600 rounded p-2 bg-gray-900/50">
              <div className="text-lg font-bold text-red-400">{Math.floor(partyStats.partyPower)}</div>
              <div className="text-xs text-gray-400">POWER</div>
            </div>
            <div className="text-center border border-gray-600 rounded p-2 bg-gray-900/50">
              <button
                onClick={() => setView3D(!view3D)}
                className={`text-lg font-bold ${view3D ? 'text-red-400' : 'text-white'}`}
              >
                {view3D ? '🎮' : '🌐'}
              </button>
              <div className="text-xs text-gray-400">{view3D ? 'GRID' : '3D VIEW'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Agent Party Display - Left Side */}
        <div className="col-span-8">
          {view3D ? (
            <div className="h-[500px] w-full">
              <AgentOrbitVisualization
                agents={agents.map(agent => ({
                  id: agent.id,
                  name: agent.name,
                  type: agent.location.includes('LOCAL') || agent.location.includes('Keep') ? 'local' : 'remote',
                  class: agent.class,
                  position: [0, 0, 0] as [number, number, number],
                  level: agent.level,
                  status: agent.status,
                  health: agent.health,
                  mana: agent.mana
                }))}
                onAgentSelect={(agent) => setSelectedAgent(agent?.id || null)}
                selectedAgentId={selectedAgent}
                className="h-full"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                  className={`
                    relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                    ${getClassColor(agent.class)}
                    ${selectedAgent === agent.id ? 'ring-2 ring-red-400 shadow-lg shadow-red-400/20' : ''}
                    hover:border-red-500 bg-black/40
                  `}
                >
                  {/* Agent Portrait and Class */}
                  <div className="flex items-center mb-3">
                    <div className="text-3xl mr-3">{getClassIcon(agent.class)}</div>
                    <div className="flex-1">
                      <div className="font-bold text-white text-sm">{agent.name}</div>
                      <div className="text-xs text-gray-400">{agent.class} - Level {agent.level}</div>
                    </div>
                    <div className={`text-xs font-medium ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </div>
                  </div>

                  {/* Health and Mana Bars */}
                  <div className="space-y-2 mb-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-red-300">HP</span>
                        <span className="text-white">{agent.health}/100</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded h-2">
                        <div 
                          className="h-2 rounded bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                          style={{ width: `${agent.health}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-blue-300">MANA</span>
                        <span className="text-white">{agent.mana}/100</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded h-2">
                        <div 
                          className="h-2 rounded bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
                          style={{ width: `${agent.mana}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Experience Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-yellow-300">XP</span>
                      <span className="text-white">{agent.experience}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded h-1">
                      <div 
                        className="h-1 rounded bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-300"
                        style={{ width: `${(agent.experience % 200) / 2}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Equipment */}
                  <div className="text-xs text-gray-300">
                    <div className="flex justify-between">
                      <span>Model:</span>
                      <span className="text-white font-mono">{agent.equipment.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tasks:</span>
                      <span className="text-green-400">{agent.stats.tasksCompleted}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Character Sheet - Right Side */}
        <div className="col-span-4 space-y-4">
          {selectedAgent && (
            <div className="border border-red-800 rounded-lg p-4 bg-black/60">
              <h4 className="text-red-400 font-bold mb-4 text-center">
                📜 CHARACTER SHEET 📜
              </h4>
              {(() => {
                const agent = agents.find(a => a.id === selectedAgent);
                if (!agent) return null;
                return (
                  <div className="space-y-4">
                    {/* Character Info */}
                    <div className="border-b border-gray-700 pb-3">
                      <div className="text-center mb-2">
                        <div className="text-2xl mb-1">{getClassIcon(agent.class)}</div>
                        <div className="text-white font-bold">{agent.name}</div>
                        <div className="text-gray-400 text-sm">{agent.class} Level {agent.level}</div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <div className="text-red-400 text-sm font-bold mb-2">⚔️ SKILLS</div>
                      <div className="space-y-2">
                        {Object.entries(agent.skills).map(([skill, value]) => (
                          <div key={skill} className="flex justify-between text-xs">
                            <span className="text-gray-300 capitalize">{skill}:</span>
                            <div className="flex items-center">
                              <div className="w-12 bg-gray-800 rounded h-1 mr-2">
                                <div 
                                  className="h-1 rounded bg-gradient-to-r from-green-600 to-green-400"
                                  style={{ width: `${value}%` }}
                                ></div>
                              </div>
                              <span className="text-white w-6">{value}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Equipment */}
                    <div>
                      <div className="text-red-400 text-sm font-bold mb-2">🛡️ EQUIPMENT</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Model:</span>
                          <span className="text-yellow-300">{agent.equipment.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Version:</span>
                          <span className="text-white">{agent.equipment.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Max Tokens:</span>
                          <span className="text-blue-300">{agent.equipment.tokens.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div>
                      <div className="text-red-400 text-sm font-bold mb-2">📊 STATS</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Quests Complete:</span>
                          <span className="text-green-400">{agent.stats.tasksCompleted}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Success Rate:</span>
                          <span className="text-green-400">{agent.stats.successRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Uptime:</span>
                          <span className="text-blue-400">{agent.stats.uptime}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="border-t border-gray-700 pt-3">
                      <div className="text-red-400 text-sm font-bold mb-1">🗺️ LOCATION</div>
                      <div className="text-yellow-300 text-xs text-center">{agent.location}</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Guild Statistics */}
          <div className="border border-red-800 rounded-lg p-4 bg-black/60">
            <h4 className="text-red-400 font-bold mb-3 text-center">
              🏰 GUILD STATUS 🏰
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-300">Total Levels:</span>
                <span className="text-white font-bold">{partyStats.totalLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Total XP:</span>
                <span className="text-yellow-400">{partyStats.totalExperience.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Active Members:</span>
                <span className="text-green-400">{partyStats.activeMembers}/{agents.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Guild Power:</span>
                <span className="text-red-400 font-bold">{Math.floor(partyStats.partyPower)}</span>
              </div>
            </div>
          </div>

          {/* Quest Log */}
          <div className="border border-red-800 rounded-lg p-4 bg-black/60">
            <h4 className="text-red-400 font-bold mb-3 text-center">
              📜 ACTIVE QUESTS 📜
            </h4>
            <div className="space-y-2 text-xs">
              <div className="border border-gray-700 rounded p-2 bg-gray-900/50">
                <div className="text-green-400 font-medium">Project Analysis</div>
                <div className="text-gray-400">Discovering new projects...</div>
              </div>
              <div className="border border-gray-700 rounded p-2 bg-gray-900/50">
                <div className="text-yellow-400 font-medium">Code Generation</div>
                <div className="text-gray-400">Neural optimization task</div>
              </div>
              <div className="border border-gray-700 rounded p-2 bg-gray-900/50">
                <div className="text-blue-400 font-medium">System Monitoring</div>
                <div className="text-gray-400">Real-time performance</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}