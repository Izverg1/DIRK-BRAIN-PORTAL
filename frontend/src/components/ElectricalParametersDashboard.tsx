'use client';

import { useState, useEffect } from 'react';
import { getNeuralSocket } from '@/lib/websocket';

interface RSeries {
  id: string;
  value: number;
  quality: number;
}

interface ElectricalMetrics {
  rSeries: RSeries[];
  rShunt: number;
  cellQuality: number;
  powerConsumption: number;
  efficiency: number;
  voltage: number;
  current: number;
  temperature: number;
}

interface PowerDataPoint {
  time: string;
  value: number;
  category: 'normal' | 'spike' | 'dip';
}

export default function ElectricalParametersDashboard({ className = '' }: { className?: string }) {
  const [metrics, setMetrics] = useState<ElectricalMetrics>({
    rSeries: [
      { id: 'R1', value: 0.016672, quality: 98.5 },
      { id: 'R2', value: 0.016715, quality: 97.8 },
      { id: 'R3', value: 0.016671, quality: 99.1 },
      { id: 'R4', value: 0.016715, quality: 98.3 }
    ],
    rShunt: 999,
    cellQuality: 0.8,
    powerConsumption: 622.17,
    efficiency: 94.7,
    voltage: 12.1,
    current: 51.5,
    temperature: 23.4
  });

  const [powerHistory, setPowerHistory] = useState<PowerDataPoint[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'hourly' | 'daily'>('daily');
  const [cellMatrix, setCellMatrix] = useState<Array<Array<{ active: boolean; quality: number }>>>([]);

  useEffect(() => {
    // Initialize cell matrix (4x6 grid like in image)
    const initMatrix = () => {
      const matrix = [];
      for (let row = 0; row < 4; row++) {
        const rowData = [];
        for (let col = 0; col < 6; col++) {
          rowData.push({
            active: Math.random() > 0.1,
            quality: Math.random() * 100
          });
        }
        matrix.push(rowData);
      }
      setCellMatrix(matrix);
    };

    // Initialize power history data
    const initPowerHistory = () => {
      const history: PowerDataPoint[] = [];
      const now = new Date();
      
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const baseValue = 50 + Math.sin(i * 0.5) * 20;
        let category: 'normal' | 'spike' | 'dip' = 'normal';
        
        if (Math.random() < 0.1) {
          category = 'spike';
        } else if (Math.random() < 0.05) {
          category = 'dip';
        }
        
        const value = category === 'spike' ? baseValue * 1.5 : 
                     category === 'dip' ? baseValue * 0.3 : baseValue;
        
        history.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          value,
          category
        });
      }
      setPowerHistory(history);
    };

    initMatrix();
    initPowerHistory();

    // Real-time updates
    const neuralSocket = getNeuralSocket();
    const unsubscribe = neuralSocket.on('metrics_update', (data) => {
      setMetrics(prev => ({
        ...prev,
        powerConsumption: prev.powerConsumption + (Math.random() - 0.5) * 10,
        efficiency: Math.max(85, Math.min(100, prev.efficiency + (Math.random() - 0.5) * 2)),
        voltage: Math.max(11, Math.min(13, prev.voltage + (Math.random() - 0.5) * 0.5)),
        current: Math.max(45, Math.min(60, prev.current + (Math.random() - 0.5) * 3)),
        temperature: Math.max(20, Math.min(30, prev.temperature + (Math.random() - 0.5) * 1)),
        rSeries: prev.rSeries.map(r => ({
          ...r,
          value: Math.max(0.015, Math.min(0.018, r.value + (Math.random() - 0.5) * 0.0001)),
          quality: Math.max(95, Math.min(100, r.quality + (Math.random() - 0.5) * 1))
        }))
      }));

      // Update cell matrix occasionally
      if (Math.random() < 0.1) {
        setCellMatrix(prev => prev.map(row => 
          row.map(cell => ({
            ...cell,
            quality: Math.max(0, Math.min(100, cell.quality + (Math.random() - 0.5) * 5))
          }))
        ));
      }
    });

    return () => unsubscribe();
  }, []);

  const getQualityColor = (quality: number) => {
    if (quality > 95) return 'bg-green-500';
    if (quality > 85) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`bg-card/60 backdrop-blur-sm rounded-xl kson-border kson-glow p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="kson-heading text-xl font-semibold">Electrical Parameters</h3>
          <p className="text-muted-foreground text-sm">Neural cell electrical monitoring</p>
        </div>
        <div className="flex space-x-2">
          {['hourly', 'daily'].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range as any)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors capitalize ${
                selectedTimeRange === range
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel - R-Series Parameters */}
        <div className="col-span-4 space-y-4">
          <div className="bg-secondary/20 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-4">R-SERIES</h4>
            <div className="space-y-3">
              {metrics.rSeries.map((r) => (
                <div key={r.id} className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">{r.id}</span>
                  <div className="text-right">
                    <div className="text-primary font-mono text-sm">{r.value.toFixed(6)}</div>
                    <div className="text-xs text-muted-foreground">{r.quality.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-secondary/20 rounded-lg p-4">
            <h4 className="font-semibold text-foreground mb-4">System Metrics</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">R-SHUNT</span>
                <span className="text-foreground font-mono">{metrics.rShunt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Cell Quality</span>
                <span className="text-primary font-mono">{metrics.cellQuality.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Voltage</span>
                <span className="text-foreground font-mono">{metrics.voltage.toFixed(1)}V</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Current</span>
                <span className="text-foreground font-mono">{metrics.current.toFixed(1)}A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Temperature</span>
                <span className="text-foreground font-mono">{metrics.temperature.toFixed(1)}°C</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Cell Matrix */}
        <div className="col-span-4">
          <div className="bg-secondary/20 rounded-lg p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-foreground">Cell Matrix</h4>
              <div className="text-primary font-bold text-lg">
                {metrics.powerConsumption.toFixed(2)} <span className="text-sm text-accent">kWh</span>
              </div>
            </div>
            
            <div className="grid grid-cols-6 gap-2 mb-4">
              {cellMatrix.map((row, rowIdx) => 
                row.map((cell, colIdx) => (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className={`
                      aspect-square rounded-lg border-2 transition-all
                      ${cell.active 
                        ? cell.quality > 90 
                          ? 'bg-green-500/80 border-green-400' 
                          : cell.quality > 70 
                            ? 'bg-yellow-500/80 border-yellow-400'
                            : 'bg-red-500/80 border-red-400'
                        : 'bg-gray-700 border-gray-600'
                      }
                    `}
                  >
                    {cell.active && (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                        {Math.round(cell.quality)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">1.2.1</div>
              <div className="text-sm text-muted-foreground">System Version</div>
            </div>
          </div>
        </div>

        {/* Right Panel - Power Chart */}
        <div className="col-span-4">
          <div className="bg-secondary/20 rounded-lg p-4 h-full">
            <h4 className="font-semibold text-foreground mb-4">Power & Energy Issues</h4>
            
            {/* Chart area */}
            <div className="relative h-48 mb-4">
              <svg className="w-full h-full" viewBox="0 0 400 200">
                {/* Grid lines */}
                {[0, 50, 100, 150, 200].map((y) => (
                  <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="hsl(var(--muted))" strokeOpacity="0.2" />
                ))}
                {Array.from({length: 9}).map((_, i) => (
                  <line key={i} x1={i * 50} y1="0" x2={i * 50} y2="200" stroke="hsl(var(--muted))" strokeOpacity="0.2" />
                ))}
                
                {/* Power curve */}
                <path
                  d={`M ${powerHistory.map((point, i) => 
                    `${i * (400 / (powerHistory.length - 1))},${200 - (point.value * 2)}`
                  ).join(' L ')}`}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                />
                
                {/* Highlight critical points */}
                {powerHistory.map((point, i) => {
                  if (point.category !== 'normal') {
                    return (
                      <circle
                        key={i}
                        cx={i * (400 / (powerHistory.length - 1))}
                        cy={200 - (point.value * 2)}
                        r="4"
                        fill={point.category === 'spike' ? '#ef4444' : '#eab308'}
                      />
                    );
                  }
                  return null;
                })}
              </svg>
            </div>

            {/* Time scale */}
            <div className="flex justify-between text-xs text-muted-foreground mb-4">
              <span>02:00</span>
              <span>08:00</span>
              <span>14:00</span>
              <span>20:00</span>
            </div>

            {/* Efficiency Metrics */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">System Efficiency</span>
                <span className="text-primary font-bold">{metrics.efficiency.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-background/50 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.efficiency}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}