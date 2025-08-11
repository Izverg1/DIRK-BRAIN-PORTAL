'use client';

import { useState, useEffect, useRef } from 'react';
import { withExtensionResilience } from './ExtensionResilient';

interface Agent {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    city: string;
    country: string;
  };
  status: 'active' | 'idle' | 'deploying' | 'error';
  type: 'claude' | 'gpt' | 'gemini' | 'local';
  tasks: number;
  load: number;
  capabilities: string[];
  lastSeen: string;
}

interface Connection {
  from: string;
  to: string;
  strength: number;
  type: 'data' | 'task' | 'sync';
}

interface GlobalAgentMapProps {
  className?: string;
}

function GlobalAgentMapComponent({ className = '' }: GlobalAgentMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'globe' | 'flat'>('globe');
  const [animationFrame, setAnimationFrame] = useState(0);

  // Sample agent data positioned around the globe
  const [agents] = useState<Agent[]>([
    {
      id: 'claude-us-east',
      name: 'Claude-3.5-Sonnet-East',
      location: { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'USA' },
      status: 'active',
      type: 'claude',
      tasks: 1247,
      load: 78,
      capabilities: ['coding', 'analysis', 'writing'],
      lastSeen: '2s ago'
    },
    {
      id: 'gpt-us-west',
      name: 'GPT-4-Turbo-West',
      location: { lat: 37.7749, lng: -122.4194, city: 'San Francisco', country: 'USA' },
      status: 'active',
      type: 'gpt',
      tasks: 982,
      load: 65,
      capabilities: ['reasoning', 'multimodal', 'code'],
      lastSeen: '5s ago'
    },
    {
      id: 'gemini-london',
      name: 'Gemini-Pro-London',
      location: { lat: 51.5074, lng: -0.1278, city: 'London', country: 'UK' },
      status: 'active',
      type: 'gemini',
      tasks: 756,
      load: 52,
      capabilities: ['business', 'analysis', 'research'],
      lastSeen: '1s ago'
    },
    {
      id: 'claude-tokyo',
      name: 'Claude-3-Haiku-Tokyo',
      location: { lat: 35.6762, lng: 139.6503, city: 'Tokyo', country: 'Japan' },
      status: 'active',
      type: 'claude',
      tasks: 1456,
      load: 89,
      capabilities: ['fast-response', 'multilingual'],
      lastSeen: '3s ago'
    },
    {
      id: 'local-singapore',
      name: 'Llama-70B-Singapore',
      location: { lat: 1.3521, lng: 103.8198, city: 'Singapore', country: 'Singapore' },
      status: 'idle',
      type: 'local',
      tasks: 234,
      load: 23,
      capabilities: ['privacy', 'local-compute'],
      lastSeen: '12s ago'
    },
    {
      id: 'gpt-sydney',
      name: 'GPT-4o-Mini-Sydney',
      location: { lat: -33.8688, lng: 151.2093, city: 'Sydney', country: 'Australia' },
      status: 'deploying',
      type: 'gpt',
      tasks: 567,
      load: 41,
      capabilities: ['efficient', 'multimodal'],
      lastSeen: '8s ago'
    }
  ]);

  const [connections] = useState<Connection[]>([
    { from: 'claude-us-east', to: 'gpt-us-west', strength: 85, type: 'sync' },
    { from: 'claude-us-east', to: 'gemini-london', strength: 72, type: 'data' },
    { from: 'gemini-london', to: 'claude-tokyo', strength: 91, type: 'task' },
    { from: 'claude-tokyo', to: 'local-singapore', strength: 63, type: 'data' },
    { from: 'gpt-sydney', to: 'gpt-us-west', strength: 78, type: 'sync' }
  ]);

  // Convert lat/lng to screen coordinates for flat map
  const latLngToScreen = (lat: number, lng: number, width: number, height: number) => {
    const x = ((lng + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return { x, y };
  };

  // Animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => prev + 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas with dark space background
    ctx.fillStyle = '#0a0e1a';
    ctx.fillRect(0, 0, width, height);

    // Draw stars background
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const opacity = Math.random() * 0.7 + 0.3;
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 1 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Draw world map outline (simplified)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    
    // Draw simplified continents
    drawContinents(ctx, width, height);

    // Draw connections between agents
    connections.forEach(connection => {
      const fromAgent = agents.find(a => a.id === connection.from);
      const toAgent = agents.find(a => a.id === connection.to);
      
      if (fromAgent && toAgent) {
        const from = latLngToScreen(fromAgent.location.lat, fromAgent.location.lng, width, height);
        const to = latLngToScreen(toAgent.location.lat, toAgent.location.lng, width, height);
        
        drawConnection(ctx, from, to, connection, animationFrame);
      }
    });

    // Draw agents
    agents.forEach(agent => {
      const pos = latLngToScreen(agent.location.lat, agent.location.lng, width, height);
      drawAgent(ctx, pos, agent, hoveredAgent === agent.id, animationFrame);
    });

  }, [agents, connections, hoveredAgent, animationFrame]);

  const drawContinents = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // North America outline
    ctx.beginPath();
    ctx.moveTo(width * 0.15, height * 0.25);
    ctx.lineTo(width * 0.35, height * 0.35);
    ctx.lineTo(width * 0.3, height * 0.5);
    ctx.lineTo(width * 0.15, height * 0.45);
    ctx.stroke();

    // Europe outline
    ctx.beginPath();
    ctx.moveTo(width * 0.45, height * 0.3);
    ctx.lineTo(width * 0.55, height * 0.28);
    ctx.lineTo(width * 0.52, height * 0.4);
    ctx.lineTo(width * 0.45, height * 0.42);
    ctx.stroke();

    // Asia outline
    ctx.beginPath();
    ctx.moveTo(width * 0.55, height * 0.25);
    ctx.lineTo(width * 0.8, height * 0.3);
    ctx.lineTo(width * 0.85, height * 0.5);
    ctx.lineTo(width * 0.6, height * 0.45);
    ctx.stroke();
  };

  const drawConnection = (
    ctx: CanvasRenderingContext2D,
    from: { x: number; y: number },
    to: { x: number; y: number },
    connection: Connection,
    frame: number
  ) => {
    const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
    
    switch (connection.type) {
      case 'data':
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(1, '#1d4ed8');
        break;
      case 'task':
        gradient.addColorStop(0, '#10b981');
        gradient.addColorStop(1, '#059669');
        break;
      case 'sync':
        gradient.addColorStop(0, '#8b5cf6');
        gradient.addColorStop(1, '#7c3aed');
        break;
    }

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.7;
    
    // Animated dashed line
    const dashOffset = (frame * 2) % 20;
    ctx.setLineDash([5, 5]);
    ctx.lineDashOffset = -dashOffset;
    
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  };

  const drawAgent = (
    ctx: CanvasRenderingContext2D,
    pos: { x: number; y: number },
    agent: Agent,
    isHovered: boolean,
    frame: number
  ) => {
    const baseRadius = isHovered ? 8 : 6;
    const pulseRadius = baseRadius + Math.sin(frame * 0.1) * 2;

    // Outer glow
    const glowGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, pulseRadius * 2);
    
    switch (agent.status) {
      case 'active':
        glowGradient.addColorStop(0, '#10b98133');
        glowGradient.addColorStop(1, '#10b98100');
        break;
      case 'idle':
        glowGradient.addColorStop(0, '#f59e0b33');
        glowGradient.addColorStop(1, '#f59e0b00');
        break;
      case 'deploying':
        glowGradient.addColorStop(0, '#3b82f633');
        glowGradient.addColorStop(1, '#3b82f600');
        break;
      case 'error':
        glowGradient.addColorStop(0, '#ef444433');
        glowGradient.addColorStop(1, '#ef444400');
        break;
    }

    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, pulseRadius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Main agent circle
    let agentColor = '#10b981'; // default green
    switch (agent.status) {
      case 'active':
        agentColor = '#10b981';
        break;
      case 'idle':
        agentColor = '#f59e0b';
        break;
      case 'deploying':
        agentColor = '#3b82f6';
        break;
      case 'error':
        agentColor = '#ef4444';
        break;
    }

    ctx.fillStyle = agentColor;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, baseRadius, 0, Math.PI * 2);
    ctx.fill();

    // Agent type indicator
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(agent.type.charAt(0).toUpperCase(), pos.x, pos.y + 3);

    // Load indicator ring
    if (agent.load > 0) {
      ctx.strokeStyle = agentColor;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.8;
      
      const ringRadius = baseRadius + 4;
      const loadAngle = (agent.load / 100) * Math.PI * 2;
      
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, ringRadius, -Math.PI / 2, -Math.PI / 2 + loadAngle);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if click is near any agent
    for (const agent of agents) {
      const pos = latLngToScreen(agent.location.lat, agent.location.lng, canvas.width, canvas.height);
      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      
      if (distance <= 12) {
        setSelectedAgent(agent);
        break;
      }
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let foundHover = null;
    for (const agent of agents) {
      const pos = latLngToScreen(agent.location.lat, agent.location.lng, canvas.width, canvas.height);
      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      
      if (distance <= 12) {
        foundHover = agent.id;
        break;
      }
    }
    setHoveredAgent(foundHover);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'idle': return 'text-yellow-400';
      case 'deploying': return 'text-primary';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'claude':
        return '🤖';
      case 'gpt':
        return '⚡';
      case 'gemini':
        return '💎';
      case 'local':
        return '🏠';
      default:
        return '🤖';
    }
  };

  return (
    <div className={`bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 ${className}`}>
      {/* Header */}
      <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <h2 className="text-lg font-bold text-white">Global Agent Network</h2>
            <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded-full">
              {agents.filter(a => a.status === 'active').length} Active
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('flat')}
              className={`px-3 py-1 text-xs rounded ${viewMode === 'flat' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
            >
              2D Map
            </button>
            <button
              onClick={() => setViewMode('globe')}
              className={`px-3 py-1 text-xs rounded ${viewMode === 'globe' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
            >
              3D Globe
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-96">
        {/* Map Canvas */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={384}
            className="w-full h-full cursor-pointer"
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
          />
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-slate-800 bg-opacity-90 rounded-lg p-3 text-xs">
            <div className="text-white font-semibold mb-2">Connection Types</div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-primary"></div>
                <span className="text-slate-300">Data Flow</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-green-400"></div>
                <span className="text-slate-300">Task Queue</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-0.5 bg-accent"></div>
                <span className="text-slate-300">Sync</span>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Info Panel */}
        <div className="w-80 bg-slate-800 border-l border-slate-700 overflow-y-auto">
          {selectedAgent ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getTypeIcon(selectedAgent.type)}</div>
                  <div>
                    <h3 className="text-white font-semibold">{selectedAgent.name}</h3>
                    <p className={`text-sm ${getStatusColor(selectedAgent.status)}`}>
                      {selectedAgent.status.toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-700 rounded-lg p-3">
                  <h4 className="text-white text-sm font-semibold mb-2">Location</h4>
                  <p className="text-slate-300 text-sm">
                    {selectedAgent.location.city}, {selectedAgent.location.country}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {selectedAgent.location.lat.toFixed(4)}, {selectedAgent.location.lng.toFixed(4)}
                  </p>
                </div>

                <div className="bg-slate-700 rounded-lg p-3">
                  <h4 className="text-white text-sm font-semibold mb-2">Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-300 text-sm">Tasks Completed</span>
                      <span className="text-green-400 text-sm font-mono">{selectedAgent.tasks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300 text-sm">Current Load</span>
                      <span className="text-yellow-400 text-sm font-mono">{selectedAgent.load}%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${selectedAgent.load}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700 rounded-lg p-3">
                  <h4 className="text-white text-sm font-semibold mb-2">Capabilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.capabilities.map((cap, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors">
                    Assign Task
                  </button>
                  <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded-lg text-sm font-semibold transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <h3 className="text-white font-semibold mb-4">Network Overview</h3>
              <div className="space-y-3">
                {agents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className="w-full text-left p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-lg">{getTypeIcon(agent.type)}</div>
                        <div>
                          <div className="text-white text-sm font-semibold">{agent.name}</div>
                          <div className="text-slate-400 text-xs">{agent.location.city}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-semibold ${getStatusColor(agent.status)}`}>
                          {agent.status.toUpperCase()}
                        </div>
                        <div className="text-slate-400 text-xs">{agent.tasks} tasks</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withExtensionResilience(GlobalAgentMapComponent);