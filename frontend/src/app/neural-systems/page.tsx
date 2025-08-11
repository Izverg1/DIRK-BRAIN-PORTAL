'use client';

import { useState } from 'react';
import KSONLogo from '@/components/KSONLogo';
import GridMonitoringSystem from '@/components/GridMonitoringSystem';
import ElectricalParametersDashboard from '@/components/ElectricalParametersDashboard';
import NeuralNetworkTopologyMap from '@/components/NeuralNetworkTopologyMap';
import GlobeConnectionSystem from '@/components/GlobeConnectionSystem';
import { HydrationErrorBoundary } from '@/components/HydrationErrorBoundary';

export default function NeuralSystemsPage() {
  const [activeSystem, setActiveSystem] = useState<'grid' | 'electrical' | 'topology' | 'globe'>('grid');

  const systems = [
    { 
      id: 'grid', 
      name: 'Grid Monitoring', 
      icon: '⚡', 
      description: 'Neural agent cell matrix monitoring',
      source: 'AGENT WORLD 3'
    },
    { 
      id: 'electrical', 
      name: 'Electrical Parameters', 
      icon: '🔋', 
      description: 'Power and electrical system analysis',
      source: 'AGENT WORLD 4'
    },
    { 
      id: 'topology', 
      name: 'Network Topology', 
      icon: '🌐', 
      description: 'Neural network connection mapping',
      source: 'AGENT WORLDMAP'
    },
    { 
      id: 'globe', 
      name: 'Global Connections', 
      icon: '🌍', 
      description: '3D worldwide neural network',
      source: 'AGENT WORLD1'
    }
  ];

  return (
    <HydrationErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
        {/* Header */}
        <div className="bg-card/80 backdrop-blur-sm border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <KSONLogo size="md" className="flex-shrink-0" />
              <div>
                <h1 className="kson-heading text-2xl font-bold">Neural Systems Dashboard</h1>
                <p className="text-muted-foreground">Functional recreations of Agent World capabilities</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {systems.map((system) => (
                <button
                  key={system.id}
                  onClick={() => setActiveSystem(system.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSystem === system.id
                      ? 'bg-primary text-primary-foreground kson-glow'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <span className="text-base">{system.icon}</span>
                  <span>{system.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* System Info Bar */}
        <div className="bg-secondary/20 border-b border-border px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-foreground font-medium">
                {systems.find(s => s.id === activeSystem)?.description}
              </span>
              <span className="text-muted-foreground text-sm">
                • Based on {systems.find(s => s.id === activeSystem)?.source}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-xs text-primary font-medium">LIVE DATA</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="h-[calc(100vh-12rem)]">
            {activeSystem === 'grid' && (
              <GridMonitoringSystem className="h-full" />
            )}
            
            {activeSystem === 'electrical' && (
              <ElectricalParametersDashboard className="h-full" />
            )}
            
            {activeSystem === 'topology' && (
              <NeuralNetworkTopologyMap className="h-full" />
            )}
            
            {activeSystem === 'globe' && (
              <GlobeConnectionSystem className="h-full" />
            )}
          </div>
        </div>

        {/* System Overview Footer */}
        <div className="fixed bottom-4 left-6 right-6 bg-card/90 backdrop-blur-sm rounded-xl border border-border p-4 kson-glow">
          <div className="grid grid-cols-4 gap-4">
            {systems.map((system) => (
              <div
                key={system.id}
                className={`text-center p-3 rounded-lg transition-all cursor-pointer ${
                  activeSystem === system.id
                    ? 'bg-primary/20 border border-primary/30'
                    : 'bg-secondary/20 hover:bg-secondary/40'
                }`}
                onClick={() => setActiveSystem(system.id as any)}
              >
                <div className="text-2xl mb-2">{system.icon}</div>
                <div className="text-sm font-medium text-foreground">{system.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{system.source}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </HydrationErrorBoundary>
  );
}