'use client';

import { useState, useEffect, useRef } from 'react';
import { getNeuralSocket } from '@/lib/websocket';

interface NetworkNode {
  id: string;
  x: number;
  y: number;
  type: 'hub' | 'relay' | 'endpoint';
  status: 'active' | 'warning' | 'error';
  connections: string[];
  load: number;
  latency: number;
  throughput: number;
}

interface Connection {
  from: string;
  to: string;
  strength: number;
  dataFlow: number;
  status: 'active' | 'congested' | 'failed';
}

interface WeatherData {
  location: string;
  condition: string;
  temperature: number;
  humidity: number;
  pressure: number;
}

interface ProductionMetrics {
  totalOutput: number;
  efficiency: number;
  energyUsed: number;
  windSpeed: number;
}

export default function NeuralNetworkTopologyMap({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([
    { location: 'North Hub', condition: 'Rain', temperature: 18, humidity: 85, pressure: 1013 },
    { location: 'East Relay', condition: 'Snow', temperature: -2, humidity: 78, pressure: 1025 },
    { location: 'South Node', condition: 'Clear', temperature: 24, humidity: 45, pressure: 1018 }
  ]);
  const [production, setProduction] = useState<ProductionMetrics>({
    totalOutput: 89.5,
    efficiency: 94.7,
    energyUsed: 120.32,
    windSpeed: 12.5
  });

  useEffect(() => {
    // Initialize network nodes
    const initializeNetwork = () => {
      const networkNodes: NetworkNode[] = [
        // Main hubs
        { id: 'hub-central', x: 400, y: 200, type: 'hub', status: 'active', connections: [], load: 75, latency: 12, throughput: 1250 },
        { id: 'hub-north', x: 300, y: 100, type: 'hub', status: 'active', connections: [], load: 68, latency: 15, throughput: 980 },
        { id: 'hub-south', x: 500, y: 300, type: 'hub', status: 'warning', connections: [], load: 92, latency: 25, throughput: 750 },
        
        // Relay nodes
        { id: 'relay-1', x: 200, y: 150, type: 'relay', status: 'active', connections: [], load: 45, latency: 8, throughput: 680 },
        { id: 'relay-2', x: 600, y: 180, type: 'relay', status: 'active', connections: [], load: 58, latency: 18, throughput: 540 },
        { id: 'relay-3', x: 350, y: 350, type: 'relay', status: 'error', connections: [], load: 15, latency: 120, throughput: 50 },
        
        // Endpoints
        { id: 'end-1', x: 100, y: 100, type: 'endpoint', status: 'active', connections: [], load: 35, latency: 5, throughput: 320 },
        { id: 'end-2', x: 700, y: 120, type: 'endpoint', status: 'active', connections: [], load: 42, latency: 12, throughput: 280 },
        { id: 'end-3', x: 150, y: 280, type: 'endpoint', status: 'active', connections: [], load: 28, latency: 8, throughput: 450 },
        { id: 'end-4', x: 650, y: 320, type: 'endpoint', status: 'warning', connections: [], load: 78, latency: 32, throughput: 180 },
        { id: 'end-5', x: 450, y: 400, type: 'endpoint', status: 'active', connections: [], load: 52, latency: 15, throughput: 390 },
      ];

      // Define connections
      const networkConnections: Connection[] = [
        { from: 'hub-central', to: 'hub-north', strength: 85, dataFlow: 1200, status: 'active' },
        { from: 'hub-central', to: 'hub-south', strength: 72, dataFlow: 800, status: 'congested' },
        { from: 'hub-central', to: 'relay-2', strength: 90, dataFlow: 950, status: 'active' },
        { from: 'hub-north', to: 'relay-1', strength: 78, dataFlow: 650, status: 'active' },
        { from: 'hub-south', to: 'relay-3', strength: 25, dataFlow: 100, status: 'failed' },
        { from: 'relay-1', to: 'end-1', strength: 95, dataFlow: 320, status: 'active' },
        { from: 'relay-1', to: 'end-3', strength: 82, dataFlow: 450, status: 'active' },
        { from: 'relay-2', to: 'end-2', strength: 88, dataFlow: 280, status: 'active' },
        { from: 'relay-2', to: 'end-4', strength: 45, dataFlow: 180, status: 'congested' },
        { from: 'hub-south', to: 'end-5', strength: 67, dataFlow: 390, status: 'active' },
      ];

      setNodes(networkNodes);
      setConnections(networkConnections);
    };

    initializeNetwork();

    // Real-time updates
    const neuralSocket = getNeuralSocket();
    const unsubscribe = neuralSocket.on('neural_activity', (data) => {
      // Update node metrics
      setNodes(prev => prev.map(node => ({
        ...node,
        load: Math.max(0, Math.min(100, node.load + (Math.random() - 0.5) * 10)),
        latency: Math.max(1, node.latency + (Math.random() - 0.5) * 5),
        throughput: Math.max(50, node.throughput + (Math.random() - 0.5) * 100),
        status: Math.random() < 0.95 ? node.status : 
               ['active', 'warning', 'error'][Math.floor(Math.random() * 3)] as any
      })));

      // Update production metrics
      setProduction(prev => ({
        totalOutput: Math.max(70, Math.min(100, prev.totalOutput + (Math.random() - 0.5) * 5)),
        efficiency: Math.max(85, Math.min(100, prev.efficiency + (Math.random() - 0.5) * 2)),
        energyUsed: prev.energyUsed + (Math.random() - 0.5) * 10,
        windSpeed: Math.max(0, Math.min(25, prev.windSpeed + (Math.random() - 0.5) * 3))
      }));
    });

    return () => unsubscribe();
  }, []);

  // Draw network on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      
      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        
        // Connection color based on status
        ctx.strokeStyle = conn.status === 'active' ? '#10b981' :
                         conn.status === 'congested' ? '#f59e0b' : '#ef4444';
        ctx.lineWidth = Math.max(1, conn.strength / 30);
        ctx.globalAlpha = 0.7;
        ctx.stroke();
        
        // Data flow animation
        const midX = (fromNode.x + toNode.x) / 2;
        const midY = (fromNode.y + toNode.y) / 2;
        ctx.beginPath();
        ctx.arc(midX, midY, 3, 0, 2 * Math.PI);
        ctx.fillStyle = '#3b82f6';
        ctx.globalAlpha = 0.8;
        ctx.fill();
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      ctx.globalAlpha = 1;
      
      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.type === 'hub' ? 12 : node.type === 'relay' ? 8 : 6, 0, 2 * Math.PI);
      
      // Node color based on status and type
      const baseColor = node.type === 'hub' ? '#3b82f6' : 
                       node.type === 'relay' ? '#8b5cf6' : '#06b6d4';
      
      ctx.fillStyle = node.status === 'active' ? baseColor :
                     node.status === 'warning' ? '#f59e0b' : '#ef4444';
      ctx.fill();
      
      // Node border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Load indicator
      if (node.load > 80) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, (node.type === 'hub' ? 12 : node.type === 'relay' ? 8 : 6) + 3, 0, 2 * Math.PI);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
      }
    });
  }, [nodes, connections]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked node
    const clickedNode = nodes.find(node => {
      const radius = node.type === 'hub' ? 12 : node.type === 'relay' ? 8 : 6;
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= radius;
    });

    setSelectedNode(clickedNode ? clickedNode.id : null);
  };

  const getStatusIcon = (condition: string) => {
    switch (condition) {
      case 'Rain': return '🌧️';
      case 'Snow': return '❄️';
      case 'Clear': return '☀️';
      default: return '🌤️';
    }
  };

  return (
    <div className={`bg-card/60 backdrop-blur-sm rounded-xl kson-border kson-glow p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="kson-heading text-xl font-semibold">Neural Network Topology</h3>
          <p className="text-muted-foreground text-sm">Live network connection mapping</p>
        </div>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-foreground">Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-foreground">Warning</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-foreground">Error</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Network Canvas */}
        <div className="col-span-8">
          <div className="bg-secondary/10 rounded-lg p-4 relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              onClick={handleCanvasClick}
              className="w-full h-full cursor-pointer bg-gradient-to-br from-secondary/5 to-background/50 rounded"
            />
            
            {/* Network Legend */}
            <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-foreground">Hub</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-foreground">Relay</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                  <span className="text-foreground">Endpoint</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panels */}
        <div className="col-span-4 space-y-4">
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
                      <span className="text-muted-foreground">ID:</span>
                      <span className="text-foreground font-mono">{node.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="text-foreground capitalize">{node.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`font-medium ${
                        node.status === 'active' ? 'text-green-400' :
                        node.status === 'warning' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {node.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Load:</span>
                      <span className="text-foreground">{node.load.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Latency:</span>
                      <span className="text-foreground">{node.latency.toFixed(1)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Throughput:</span>
                      <span className="text-foreground">{node.throughput.toFixed(0)} MB/s</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Production Metrics */}
          <div className="bg-secondary/20 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">Production by Fast Source</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Output:</span>
                <span className="text-primary font-bold">{production.totalOutput.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Efficiency:</span>
                <span className="text-foreground">{production.efficiency.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Energy Used:</span>
                <span className="text-accent font-mono">{production.energyUsed.toFixed(2)} kWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Wind Speed:</span>
                <span className="text-foreground">{production.windSpeed.toFixed(1)} m/s</span>
              </div>
            </div>
          </div>

          {/* Weather Conditions */}
          <div className="bg-secondary/20 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">Weather Conditions</h4>
            <div className="space-y-3">
              {weatherData.map((weather, index) => (
                <div key={index} className="bg-background/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-foreground font-medium text-sm">{weather.location}</span>
                    <span className="text-xl">{getStatusIcon(weather.condition)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Temp:</span>
                      <span className="text-foreground">{weather.temperature}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Humidity:</span>
                      <span className="text-foreground">{weather.humidity}%</span>
                    </div>
                    <div className="flex justify-between col-span-2">
                      <span className="text-muted-foreground">Pressure:</span>
                      <span className="text-foreground">{weather.pressure} hPa</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}