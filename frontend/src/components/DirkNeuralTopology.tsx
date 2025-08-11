'use client';

import { useState, useEffect } from 'react';
import { getNeuralSocket } from '@/lib/websocket';

interface NeuralNode {
  id: string;
  name: string;
  type: 'claude' | 'gpt' | 'gemini' | 'local' | 'hub' | 'processor';
  x: number;
  y: number;
  status: 'active' | 'idle' | 'processing' | 'error';
  connections: string[];
  load: number;
  latency: number;
  lastUpdate: number;
}

interface NeuralConnection {
  id: string;
  from: string;
  to: string;
  bandwidth: number;
  latency: number;
  status: 'active' | 'idle' | 'congested' | 'failed';
  dataFlow: number;
}

// Visual style inspired by AGENT WORLDMAP topology but showing DIRK neural network
export default function DirkNeuralTopology({ className = '' }: { className?: string }) {
  const [nodes, setNodes] = useState<NeuralNode[]>([]);
  const [connections, setConnections] = useState<NeuralConnection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [networkStats, setNetworkStats] = useState({
    totalNodes: 0,
    activeConnections: 0,
    totalBandwidth: 0,
    avgLatency: 0
  });

  useEffect(() => {
    // Initialize with DIRK Brain Portal neural network in AGENT WORLDMAP style
    const initializeDirkTopology = () => {
      const timestamp = Date.now();
      const dirkNodes: NeuralNode[] = [
        // Central hub nodes
        { id: `central-hub-${timestamp}`, name: 'Central Hub', type: 'hub', x: 50, y: 50, status: 'active', connections: [`claude-1-${timestamp}`, `gpt-1-${timestamp}`, `gemini-1-${timestamp}`, `local-1-${timestamp}`], load: 45, latency: 12, lastUpdate: Date.now() },
        { id: `processor-1-${timestamp}`, name: 'Task Processor', type: 'processor', x: 25, y: 25, status: 'processing', connections: [`central-hub-${timestamp}`, `claude-2-${timestamp}`], load: 78, latency: 8, lastUpdate: Date.now() },
        { id: `processor-2-${timestamp}`, name: 'Neural Router', type: 'processor', x: 75, y: 25, status: 'active', connections: [`central-hub-${timestamp}`, `gpt-2-${timestamp}`], load: 62, latency: 15, lastUpdate: Date.now() },
        
        // Claude agents - positioned in upper section
        { id: `claude-1-${timestamp}`, name: 'Claude-Primary', type: 'claude', x: 20, y: 60, status: 'active', connections: [`central-hub-${timestamp}`, `claude-2-${timestamp}`], load: 89, latency: 5, lastUpdate: Date.now() },
        { id: `claude-2-${timestamp}`, name: 'Claude-Secondary', type: 'claude', x: 35, y: 75, status: 'processing', connections: [`claude-1-${timestamp}`, `processor-1-${timestamp}`], load: 94, latency: 7, lastUpdate: Date.now() },
        { id: `claude-3-${timestamp}`, name: 'Claude-Tertiary', type: 'claude', x: 15, y: 80, status: 'idle', connections: [`claude-1-${timestamp}`], load: 23, latency: 6, lastUpdate: Date.now() },
        
        // GPT agents - positioned in right section  
        { id: 'gpt-1', name: 'GPT-Alpha', type: 'gpt', x: 80, y: 60, status: 'active', connections: ['central-hub', 'gpt-2'], load: 76, latency: 18, lastUpdate: Date.now() },
        { id: 'gpt-2', name: 'GPT-Beta', type: 'gpt', x: 85, y: 75, status: 'active', connections: ['gpt-1', 'processor-2'], load: 82, latency: 22, lastUpdate: Date.now() },
        { id: 'gpt-3', name: 'GPT-Gamma', type: 'gpt', x: 90, y: 45, status: 'processing', connections: ['gpt-1'], load: 67, latency: 19, lastUpdate: Date.now() },
        
        // Gemini agents - positioned in lower section
        { id: 'gemini-1', name: 'Gemini-One', type: 'gemini', x: 60, y: 85, status: 'active', connections: ['central-hub', 'gemini-2'], load: 71, latency: 14, lastUpdate: Date.now() },
        { id: 'gemini-2', name: 'Gemini-Two', type: 'gemini', x: 45, y: 90, status: 'active', connections: ['gemini-1'], load: 68, latency: 16, lastUpdate: Date.now() },
        
        // Local agents - positioned in left section
        { id: 'local-1', name: 'Local-Main', type: 'local', x: 10, y: 40, status: 'active', connections: ['central-hub', 'local-2'], load: 55, latency: 3, lastUpdate: Date.now() },
        { id: 'local-2', name: 'Local-Backup', type: 'local', x: 5, y: 55, status: 'idle', connections: ['local-1'], load: 12, latency: 2, lastUpdate: Date.now() }
      ];
      setNodes(dirkNodes);

      // Create connections based on node relationships
      const dirkConnections: NeuralConnection[] = [];
      dirkNodes.forEach(node => {
        node.connections.forEach(targetId => {
          const connectionId = `${node.id}-${targetId}`;
          if (!dirkConnections.find(c => c.id === connectionId || c.id === `${targetId}-${node.id}`)) {
            dirkConnections.push({
              id: connectionId,
              from: node.id,
              to: targetId,
              bandwidth: Math.floor(Math.random() * 100) + 50,
              latency: Math.floor(Math.random() * 20) + 5,
              status: Math.random() > 0.9 ? 'congested' : Math.random() > 0.8 ? 'idle' : 'active',
              dataFlow: Math.floor(Math.random() * 1000) + 100
            });
          }
        });
      });
      setConnections(dirkConnections);
    };

    initializeDirkTopology();

    // Real-time updates for DIRK neural network
    const neuralSocket = getNeuralSocket();
    const unsubscribe = neuralSocket.on('topology_update', (data) => {
      setNodes(prev => prev.map(node => {
        if (Math.random() < 0.2) { // 20% chance to update any node
          return {
            ...node,
            status: ['active', 'idle', 'processing'][Math.floor(Math.random() * 3)] as any,
            load: Math.max(0, Math.min(100, node.load + (Math.random() - 0.5) * 20)),
            latency: Math.max(1, node.latency + (Math.random() - 0.5) * 5),
            lastUpdate: Date.now()
          };
        }
        return node;
      }));

      setConnections(prev => prev.map(conn => {
        if (Math.random() < 0.15) { // 15% chance to update any connection
          return {
            ...conn,
            status: Math.random() > 0.95 ? 'failed' : Math.random() > 0.85 ? 'congested' : 'active' as any,
            bandwidth: Math.max(10, conn.bandwidth + (Math.random() - 0.5) * 20),
            dataFlow: Math.max(0, conn.dataFlow + (Math.random() - 0.5) * 200)
          };
        }
        return conn;
      }));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Update network statistics
    const stats = {
      totalNodes: nodes.length,
      activeConnections: connections.filter(c => c.status === 'active').length,
      totalBandwidth: connections.reduce((sum, c) => sum + c.bandwidth, 0),
      avgLatency: nodes.reduce((sum, n) => sum + n.latency, 0) / Math.max(nodes.length, 1)
    };
    setNetworkStats(stats);
  }, [nodes, connections]);

  const getNodeColor = (node: NeuralNode) => {
    const baseColors = {
      claude: 'blue',
      gpt: 'green', 
      gemini: 'purple',
      local: 'yellow',
      hub: 'red',
      processor: 'cyan'
    };
    const color = baseColors[node.type];
    
    switch (node.status) {
      case 'active': return `bg-${color}-500 border-${color}-400`;
      case 'processing': return `bg-${color}-600 border-${color}-300 animate-pulse`;
      case 'idle': return `bg-${color}-700 border-${color}-500`;
      case 'error': return 'bg-red-600 border-red-400 animate-pulse';
      default: return 'bg-gray-600 border-gray-400';
    }
  };

  const getConnectionColor = (connection: NeuralConnection) => {
    switch (connection.status) {
      case 'active': return 'stroke-primary';
      case 'congested': return 'stroke-yellow-400';
      case 'failed': return 'stroke-red-400';
      default: return 'stroke-muted-foreground';
    }
  };

  const getConnectionWidth = (bandwidth: number) => {
    return Math.max(1, Math.min(4, bandwidth / 25));
  };

  return (
    <div className={`bg-black border border-red-600 rounded-lg p-6 ${className}`}>
      {/* Header - DIRK Portal style */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white uppercase tracking-wide">DIRK NEURAL NETWORK TOPOLOGY</h3>
          <p className="text-white/70 text-sm uppercase tracking-wide">Real-time AI agent network connections</p>
        </div>
        <div className="flex space-x-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{networkStats.totalNodes}</div>
            <div className="text-xs text-muted-foreground">Nodes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{networkStats.activeConnections}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{networkStats.avgLatency.toFixed(1)}ms</div>
            <div className="text-xs text-muted-foreground">Latency</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Main Topology Map - AGENT WORLDMAP visual layout */}
        <div className="col-span-9">
          <div className="relative bg-background/20 rounded-lg border border-border h-96">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              {/* Connection lines */}
              {connections.map((connection) => {
                const fromNode = nodes.find(n => n.id === connection.from);
                const toNode = nodes.find(n => n.id === connection.to);
                if (!fromNode || !toNode) return null;

                return (
                  <line
                    key={connection.id}
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    className={`${getConnectionColor(connection)} opacity-60`}
                    strokeWidth={getConnectionWidth(connection.bandwidth)}
                    strokeDasharray={connection.status === 'idle' ? '2,2' : undefined}
                  />
                );
              })}

              {/* Nodes */}
              {nodes.map((node) => (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.type === 'hub' || node.type === 'processor' ? "2.5" : "2"}
                    className={`${getNodeColor(node)} cursor-pointer transition-all hover:scale-110`}
                    onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                  />
                  
                  {/* Node labels - like AGENT WORLDMAP */}
                  <text
                    x={node.x}
                    y={node.y - 3}
                    className="text-xs fill-foreground font-mono"
                    textAnchor="middle"
                    fontSize="1.5"
                  >
                    {node.type.toUpperCase()}
                  </text>
                  
                  {/* Load indicator */}
                  <text
                    x={node.x}
                    y={node.y + 4}
                    className="text-xs fill-muted-foreground"
                    textAnchor="middle"
                    fontSize="1.2"
                  >
                    {node.load}%
                  </text>
                </g>
              ))}
            </svg>

            {/* Legend - AGENT WORLDMAP style */}
            <div className="absolute bottom-4 left-4 bg-black/80 border border-red-600 rounded p-3">
              <div className="text-xs font-medium text-white mb-2 uppercase tracking-wide">NODE TYPES</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-white uppercase tracking-wide">CLAUDE</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>GPT</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Gemini</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Local</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Hub</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  <span>Processor</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Node details and network info */}
        <div className="col-span-3 space-y-4">
          {/* Selected Node Details */}
          {selectedNode && (
            <div className="bg-secondary/20 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-3">Node Details</h4>
              {(() => {
                const node = nodes.find(n => n.id === selectedNode);
                if (!node) return null;
                return (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="text-foreground font-mono">{node.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="text-foreground">{node.type.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`font-medium ${
                        node.status === 'active' ? 'text-green-400' :
                        node.status === 'processing' ? 'text-blue-400' :
                        node.status === 'idle' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {node.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Load:</span>
                      <span className="text-primary">{node.load}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Latency:</span>
                      <span className="text-foreground">{node.latency}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Connections:</span>
                      <span className="text-foreground">{node.connections.length}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Network Overview */}
          <div className="bg-secondary/20 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">Network Overview</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Nodes:</span>
                <span className="text-foreground font-bold">{networkStats.totalNodes}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Connections:</span>
                <span className="text-primary">{networkStats.activeConnections}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Bandwidth:</span>
                <span className="text-accent">{networkStats.totalBandwidth.toLocaleString()} Mbps</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg Latency:</span>
                <span className="text-foreground">{networkStats.avgLatency.toFixed(1)}ms</span>
              </div>
            </div>
          </div>

          {/* Connection Health */}
          <div className="bg-secondary/20 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">Connection Health</h4>
            <div className="space-y-2">
              {['active', 'idle', 'congested', 'failed'].map(status => {
                const count = connections.filter(c => c.status === status).length;
                const percentage = (count / connections.length * 100).toFixed(0);
                return (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        status === 'active' ? 'bg-primary' :
                        status === 'idle' ? 'bg-yellow-500' :
                        status === 'congested' ? 'bg-orange-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-foreground capitalize">{status}</span>
                    </div>
                    <span className="text-muted-foreground">{count} ({percentage}%)</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-secondary/20 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">Top Performers</h4>
            <div className="space-y-2">
              {nodes
                .filter(n => n.status === 'active' || n.status === 'processing')
                .sort((a, b) => b.load - a.load)
                .slice(0, 3)
                .map(node => (
                  <div key={node.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        node.type === 'claude' ? 'bg-blue-500' :
                        node.type === 'gpt' ? 'bg-green-500' :
                        node.type === 'gemini' ? 'bg-purple-500' : 'bg-yellow-500'
                      }`}></div>
                      <span className="text-foreground truncate">{node.name}</span>
                    </div>
                    <span className="text-primary">{node.load}%</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}