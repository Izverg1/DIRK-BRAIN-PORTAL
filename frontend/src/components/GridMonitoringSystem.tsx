'use client';

import { useState, useEffect } from 'react';
import { getNeuralSocket } from '@/lib/websocket';

interface AgentCell {
  id: string;
  version: string;
  status: 'active' | 'warning' | 'error' | 'idle';
  efficiency: number;
  lastUpdate: number;
  powerUsage: number;
  tasks: number;
  connections: number;
}

interface GridMonitoringSystemProps {
  className?: string;
}

export default function GridMonitoringSystem({ className = '' }: GridMonitoringSystemProps) {
  const [agentGrid, setAgentGrid] = useState<AgentCell[]>([]);
  const [powerMetrics, setPowerMetrics] = useState({
    totalPower: 0,
    efficiency: 94.7,
    dailyUsage: 622.17
  });
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [systemStats, setSystemStats] = useState({
    totalCells: 63,
    activeCells: 58,
    warningCells: 3,
    errorCells: 2
  });

  useEffect(() => {
    // Initialize grid with 9x7 cells (63 total) like in the image
    const initializeGrid = () => {
      const cells: AgentCell[] = [];
      for (let i = 0; i < 63; i++) {
        const row = Math.floor(i / 9);
        const col = i % 9;
        cells.push({
          id: `cell-${row}-${col}`,
          version: `1.2.${Math.floor(Math.random() * 9) + 1}`,
          status: Math.random() > 0.9 ? 
            (Math.random() > 0.5 ? 'warning' : 'error') : 
            (Math.random() > 0.1 ? 'active' : 'idle'),
          efficiency: Math.floor(Math.random() * 40) + 60,
          lastUpdate: Date.now(),
          powerUsage: Math.random() * 10 + 5,
          tasks: Math.floor(Math.random() * 100),
          connections: Math.floor(Math.random() * 20) + 1
        });
      }
      setAgentGrid(cells);
    };

    initializeGrid();

    // Real-time updates
    const neuralSocket = getNeuralSocket();
    const unsubscribe = neuralSocket.on('agent_update', (data) => {
      setAgentGrid(prev => prev.map(cell => {
        if (Math.random() < 0.1) { // 10% chance to update any cell
          return {
            ...cell,
            status: ['active', 'warning', 'error', 'idle'][Math.floor(Math.random() * 4)] as any,
            efficiency: Math.floor(Math.random() * 40) + 60,
            powerUsage: Math.random() * 10 + 5,
            tasks: Math.floor(Math.random() * 100),
            lastUpdate: Date.now()
          };
        }
        return cell;
      }));

      // Update power metrics
      setPowerMetrics(prev => ({
        totalPower: prev.totalPower + (Math.random() - 0.5) * 10,
        efficiency: Math.max(80, Math.min(100, prev.efficiency + (Math.random() - 0.5) * 2)),
        dailyUsage: prev.dailyUsage + (Math.random() - 0.5) * 5
      }));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Update system stats based on current grid
    const stats = agentGrid.reduce((acc, cell) => {
      switch (cell.status) {
        case 'active': acc.activeCells++; break;
        case 'warning': acc.warningCells++; break;
        case 'error': acc.errorCells++; break;
      }
      return acc;
    }, { totalCells: 63, activeCells: 0, warningCells: 0, errorCells: 0 });

    setSystemStats(stats);
  }, [agentGrid]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'idle': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'ACTIVE';
      case 'warning': return 'WARNING';
      case 'error': return 'ERROR';
      case 'idle': return 'IDLE';
      default: return 'UNKNOWN';
    }
  };

  return (
    <div className={`bg-card/60 backdrop-blur-sm rounded-xl kson-border kson-glow p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="kson-heading text-xl font-semibold">Neural Grid Monitoring</h3>
          <p className="text-muted-foreground text-sm">Live agent cell status matrix</p>
        </div>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-foreground">Active: {systemStats.activeCells}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-foreground">Warning: {systemStats.warningCells}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-foreground">Error: {systemStats.errorCells}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Main Grid - 9 columns */}
        <div className="col-span-9">
          <div className="grid grid-cols-9 gap-2">
            {agentGrid.map((cell) => (
              <div
                key={cell.id}
                onClick={() => setSelectedCell(selectedCell === cell.id ? null : cell.id)}
                className={`
                  bg-secondary/20 rounded-lg p-3 cursor-pointer transition-all hover:bg-secondary/40
                  ${selectedCell === cell.id ? 'ring-2 ring-primary' : ''}
                `}
              >
                {/* Status indicator */}
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(cell.status)} animate-pulse`}></div>
                  <span className="text-xs text-muted-foreground">{cell.version}</span>
                </div>
                
                {/* Efficiency bar */}
                <div className="w-full bg-background/50 rounded-full h-1 mb-2">
                  <div 
                    className={`h-1 rounded-full transition-all duration-500 ${
                      cell.efficiency > 80 ? 'bg-green-500' : 
                      cell.efficiency > 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${cell.efficiency}%` }}
                  ></div>
                </div>
                
                {/* Metrics */}
                <div className="text-xs text-foreground font-mono">
                  <div>{cell.efficiency}%</div>
                  <div className="text-muted-foreground">{cell.tasks}T</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Details */}
        <div className="col-span-3 space-y-4">
          {/* Selected Cell Details */}
          {selectedCell && (
            <div className="bg-secondary/20 rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-3">Cell Details</h4>
              {(() => {
                const cell = agentGrid.find(c => c.id === selectedCell);
                if (!cell) return null;
                return (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID:</span>
                      <span className="text-foreground font-mono">{cell.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`font-medium ${
                        cell.status === 'active' ? 'text-green-400' :
                        cell.status === 'warning' ? 'text-yellow-400' :
                        cell.status === 'error' ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {getStatusText(cell.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version:</span>
                      <span className="text-foreground">{cell.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Efficiency:</span>
                      <span className="text-foreground">{cell.efficiency}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Power:</span>
                      <span className="text-foreground">{cell.powerUsage.toFixed(1)}W</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tasks:</span>
                      <span className="text-foreground">{cell.tasks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Connections:</span>
                      <span className="text-foreground">{cell.connections}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* System Overview */}
          <div className="bg-secondary/20 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">System Overview</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Grid Efficiency</span>
                  <span className="text-foreground">{powerMetrics.efficiency.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-background/50 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${powerMetrics.efficiency}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily Usage:</span>
                  <span className="text-foreground">{powerMetrics.dailyUsage.toFixed(2)} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Cells:</span>
                  <span className="text-primary font-medium">{systemStats.activeCells}/{systemStats.totalCells}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-secondary/20 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-3">Grid Actions</h4>
            <div className="space-y-2">
              <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-3 rounded-lg text-sm font-medium transition-colors">
                Restart Failed Cells
              </button>
              <button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-2 px-3 rounded-lg text-sm font-medium transition-colors">
                Optimize Grid
              </button>
              <button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground py-2 px-3 rounded-lg text-sm font-medium transition-colors">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}