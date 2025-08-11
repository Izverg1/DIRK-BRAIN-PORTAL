'use client';

import { useState, useEffect, useRef } from 'react';
import { getNeuralSocket } from '@/lib/websocket';

interface GlobeNode {
  id: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  type: 'primary' | 'secondary' | 'relay';
  status: 'active' | 'dormant' | 'critical';
  connections: string[];
  strength: number;
  dataFlow: number;
}

interface GlobalConnection {
  from: string;
  to: string;
  strength: number;
  latency: number;
  bandwidth: number;
  status: 'stable' | 'unstable' | 'critical';
}

export default function GlobeConnectionSystem({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [globeNodes, setGlobeNodes] = useState<GlobeNode[]>([]);
  const [globalConnections, setGlobalConnections] = useState<GlobalConnection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [globalStats, setGlobalStats] = useState({
    totalNodes: 12,
    activeConnections: 23,
    globalLatency: 45,
    dataTransfer: 2847,
    networkHealth: 94.2
  });

  useEffect(() => {
    // Initialize globe nodes with real-world coordinates
    const initializeGlobeNetwork = () => {
      const nodes: GlobeNode[] = [
        // Primary nodes
        { id: 'node-ny', lat: 40.7128, lng: -74.0060, city: 'New York', country: 'USA', type: 'primary', status: 'active', connections: [], strength: 95, dataFlow: 1250 },
        { id: 'node-london', lat: 51.5074, lng: -0.1278, city: 'London', country: 'UK', type: 'primary', status: 'active', connections: [], strength: 92, dataFlow: 1180 },
        { id: 'node-tokyo', lat: 35.6762, lng: 139.6503, city: 'Tokyo', country: 'Japan', type: 'primary', status: 'active', connections: [], strength: 88, dataFlow: 1020 },
        { id: 'node-sydney', lat: -33.8688, lng: 151.2093, city: 'Sydney', country: 'Australia', type: 'primary', status: 'critical', connections: [], strength: 65, dataFlow: 780 },
        
        // Secondary nodes
        { id: 'node-moscow', lat: 55.7558, lng: 37.6173, city: 'Moscow', country: 'Russia', type: 'secondary', status: 'active', connections: [], strength: 78, dataFlow: 850 },
        { id: 'node-berlin', lat: 52.5200, lng: 13.4050, city: 'Berlin', country: 'Germany', type: 'secondary', status: 'active', connections: [], strength: 84, dataFlow: 920 },
        { id: 'node-singapore', lat: 1.3521, lng: 103.8198, city: 'Singapore', country: 'Singapore', type: 'secondary', status: 'active', connections: [], strength: 90, dataFlow: 1100 },
        { id: 'node-sao-paulo', lat: -23.5505, lng: -46.6333, city: 'São Paulo', country: 'Brazil', type: 'secondary', status: 'dormant', connections: [], strength: 45, dataFlow: 380 },
        
        // Relay nodes
        { id: 'node-mumbai', lat: 19.0760, lng: 72.8777, city: 'Mumbai', country: 'India', type: 'relay', status: 'active', connections: [], strength: 72, dataFlow: 650 },
        { id: 'node-cape-town', lat: -33.9249, lng: 18.4241, city: 'Cape Town', country: 'South Africa', type: 'relay', status: 'active', connections: [], strength: 58, dataFlow: 420 },
        { id: 'node-toronto', lat: 43.6532, lng: -79.3832, city: 'Toronto', country: 'Canada', type: 'relay', status: 'active', connections: [], strength: 81, dataFlow: 720 },
        { id: 'node-dubai', lat: 25.2048, lng: 55.2708, city: 'Dubai', country: 'UAE', type: 'relay', status: 'dormant', connections: [], strength: 42, dataFlow: 290 },
      ];

      const connections: GlobalConnection[] = [
        { from: 'node-ny', to: 'node-london', strength: 95, latency: 76, bandwidth: 10000, status: 'stable' },
        { from: 'node-london', to: 'node-berlin', strength: 88, latency: 25, bandwidth: 8500, status: 'stable' },
        { from: 'node-tokyo', to: 'node-singapore', strength: 92, latency: 45, bandwidth: 9200, status: 'stable' },
        { from: 'node-sydney', to: 'node-singapore', strength: 70, latency: 120, bandwidth: 5500, status: 'critical' },
        { from: 'node-ny', to: 'node-toronto', strength: 85, latency: 18, bandwidth: 7800, status: 'stable' },
        { from: 'node-london', to: 'node-moscow', strength: 74, latency: 95, bandwidth: 6200, status: 'unstable' },
        { from: 'node-mumbai', to: 'node-dubai', strength: 65, latency: 85, bandwidth: 4800, status: 'stable' },
        { from: 'node-sao-paulo', to: 'node-ny', strength: 45, latency: 180, bandwidth: 3200, status: 'critical' },
        { from: 'node-cape-town', to: 'node-london', strength: 58, latency: 195, bandwidth: 3800, status: 'unstable' },
        { from: 'node-berlin', to: 'node-moscow', strength: 82, latency: 55, bandwidth: 7100, status: 'stable' },
        { from: 'node-tokyo', to: 'node-sydney', strength: 68, latency: 140, bandwidth: 5200, status: 'unstable' },
        { from: 'node-singapore', to: 'node-mumbai', strength: 79, latency: 88, bandwidth: 6600, status: 'stable' },
      ];

      setGlobeNodes(nodes);
      setGlobalConnections(connections);
    };

    initializeGlobeNetwork();

    // Start globe rotation animation
    const animate = () => {
      setRotationAngle(prev => prev + 0.5);
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Real-time updates
    const neuralSocket = getNeuralSocket();
    const unsubscribe = neuralSocket.on('neural_activity', (data) => {
      // Update node metrics
      setGlobeNodes(prev => prev.map(node => ({
        ...node,
        strength: Math.max(30, Math.min(100, node.strength + (Math.random() - 0.5) * 8)),
        dataFlow: Math.max(100, node.dataFlow + (Math.random() - 0.5) * 200),
        status: Math.random() < 0.98 ? node.status : 
               ['active', 'dormant', 'critical'][Math.floor(Math.random() * 3)] as any
      })));

      // Update global stats
      setGlobalStats(prev => ({
        totalNodes: prev.totalNodes,
        activeConnections: Math.max(15, Math.min(30, prev.activeConnections + Math.floor((Math.random() - 0.5) * 4))),
        globalLatency: Math.max(20, Math.min(80, prev.globalLatency + (Math.random() - 0.5) * 10)),
        dataTransfer: prev.dataTransfer + Math.floor((Math.random() - 0.5) * 500),
        networkHealth: Math.max(85, Math.min(100, prev.networkHealth + (Math.random() - 0.5) * 3))
      }));
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      unsubscribe();
    };
  }, []);

  // Convert lat/lng to canvas coordinates
  const projectCoordinates = (lat: number, lng: number, radius: number, angle: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + angle) * (Math.PI / 180);
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    
    return { x: x + 200, y: y + 200, z, visible: z > -radius * 0.3 };
  };

  // Draw globe and connections
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const radius = 150;
    const centerX = 200;
    const centerY = 200;

    // Draw globe outline
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw latitude lines
    for (let lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath();
      const y = centerY - (lat / 90) * radius;
      const r = Math.cos(lat * Math.PI / 180) * radius;
      ctx.ellipse(centerX, y, r, r * 0.3, 0, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw longitude lines
    for (let lng = 0; lng < 360; lng += 30) {
      ctx.beginPath();
      const startAngle = (lng + rotationAngle) * Math.PI / 180;
      const x1 = centerX + radius * Math.cos(startAngle);
      const x2 = centerX - radius * Math.cos(startAngle);
      ctx.moveTo(x1, centerY - radius);
      ctx.quadraticCurveTo(centerX, centerY, x2, centerY + radius);
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Project all nodes
    const projectedNodes = globeNodes.map(node => ({
      ...node,
      projected: projectCoordinates(node.lat, node.lng, radius, rotationAngle)
    })).filter(node => node.projected.visible);

    // Draw connections between visible nodes
    globalConnections.forEach(conn => {
      const fromNode = projectedNodes.find(n => n.id === conn.from);
      const toNode = projectedNodes.find(n => n.id === conn.to);
      
      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.projected.x, fromNode.projected.y);
        ctx.lineTo(toNode.projected.x, toNode.projected.y);
        
        ctx.strokeStyle = conn.status === 'stable' ? 'rgba(16, 185, 129, 0.6)' :
                         conn.status === 'unstable' ? 'rgba(245, 158, 11, 0.6)' :
                         'rgba(239, 68, 68, 0.6)';
        ctx.lineWidth = Math.max(1, conn.strength / 25);
        ctx.stroke();
        
        // Connection pulse animation
        const midX = (fromNode.projected.x + toNode.projected.x) / 2;
        const midY = (fromNode.projected.y + toNode.projected.y) / 2;
        const pulseRadius = 2 + Math.sin(Date.now() * 0.01 + conn.latency) * 1;
        
        ctx.beginPath();
        ctx.arc(midX, midY, pulseRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
        ctx.fill();
      }
    });

    // Draw nodes
    projectedNodes.sort((a, b) => b.projected.z - a.projected.z).forEach(node => {
      const size = node.type === 'primary' ? 8 : node.type === 'secondary' ? 6 : 4;
      
      ctx.beginPath();
      ctx.arc(node.projected.x, node.projected.y, size, 0, 2 * Math.PI);
      
      ctx.fillStyle = node.status === 'active' ? '#10b981' :
                     node.status === 'dormant' ? '#6b7280' : '#ef4444';
      ctx.fill();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Node glow for primary nodes
      if (node.type === 'primary') {
        ctx.beginPath();
        ctx.arc(node.projected.x, node.projected.y, size + 3, 0, 2 * Math.PI);
        ctx.strokeStyle = node.status === 'active' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  }, [globeNodes, globalConnections, rotationAngle]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked node
    const clickedNode = globeNodes.find(node => {
      const projected = projectCoordinates(node.lat, node.lng, 150, rotationAngle);
      if (!projected.visible) return false;
      
      const size = node.type === 'primary' ? 8 : node.type === 'secondary' ? 6 : 4;
      const distance = Math.sqrt((x - projected.x) ** 2 + (y - projected.y) ** 2);
      return distance <= size;
    });

    setSelectedNode(clickedNode ? clickedNode.id : null);
  };

  return (
    <div className={`bg-card/60 backdrop-blur-sm rounded-xl kson-border kson-glow p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="kson-heading text-xl font-semibold">Global Neural Network</h3>
          <p className="text-muted-foreground text-sm">3D worldwide neural connection map</p>
        </div>
        <div className="text-sm space-y-1">
          <div className="flex items-center space-x-4">
            <span className="text-muted-foreground">Health:</span>
            <span className="text-primary font-bold">{globalStats.networkHealth.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 3D Globe Canvas */}
        <div className="col-span-8">
          <div className="bg-gradient-to-br from-secondary/5 via-background/50 to-secondary/10 rounded-lg p-4 relative">
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              onClick={handleCanvasClick}
              className="w-full cursor-pointer"
            />
            
            {/* Globe Controls */}
            <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-3">
              <div className="flex space-x-2">
                <button 
                  onClick={() => setRotationAngle(0)}
                  className="px-2 py-1 text-xs bg-primary/20 hover:bg-primary/40 text-primary rounded transition-colors"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setRotationAngle(prev => prev + 45)}
                  className="px-2 py-1 text-xs bg-accent/20 hover:bg-accent/40 text-accent-foreground rounded transition-colors"
                >
                  Rotate
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="col-span-4 space-y-4">
          {/* Global Statistics */}
          <div className="bg-secondary/20 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">Network Statistics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Nodes:</span>
                <span className="text-foreground font-mono">{globalStats.totalNodes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Connections:</span>
                <span className="text-primary font-mono">{globalStats.activeConnections}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Global Latency:</span>
                <span className="text-foreground font-mono">{globalStats.globalLatency.toFixed(0)}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data Transfer:</span>
                <span className="text-accent font-mono">{globalStats.dataTransfer.toLocaleString()} MB</span>
              </div>
            </div>
          </div>

          {/* Selected Node Details */}
          {selectedNode && (
            <div className="bg-secondary/20 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-3">Node Details</h4>
              {(() => {
                const node = globeNodes.find(n => n.id === selectedNode);
                if (!node) return null;
                return (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="text-foreground">{node.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Country:</span>
                      <span className="text-foreground">{node.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="text-foreground capitalize">{node.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`font-medium ${
                        node.status === 'active' ? 'text-green-400' :
                        node.status === 'dormant' ? 'text-gray-400' : 'text-red-400'
                      }`}>
                        {node.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Strength:</span>
                      <span className="text-primary">{node.strength.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data Flow:</span>
                      <span className="text-foreground">{node.dataFlow.toFixed(0)} MB/s</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Regional Status */}
          <div className="bg-secondary/20 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">Regional Status</h4>
            <div className="space-y-3">
              {[
                { region: 'North America', status: 'active', nodes: 3 },
                { region: 'Europe', status: 'active', nodes: 3 },
                { region: 'Asia Pacific', status: 'warning', nodes: 4 },
                { region: 'Others', status: 'critical', nodes: 2 }
              ].map((region) => (
                <div key={region.region} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      region.status === 'active' ? 'bg-green-500' :
                      region.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-foreground text-sm">{region.region}</span>
                  </div>
                  <span className="text-muted-foreground text-sm">{region.nodes} nodes</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}