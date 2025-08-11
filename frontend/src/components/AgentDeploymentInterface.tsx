'use client';

import { useState, useEffect } from 'react';
import { getNeuralSocket } from '@/lib/websocket';

interface DeploymentConfig {
  name: string;
  type: 'telepath' | 'psychic' | 'empath' | 'neural';
  location: { lat: number; lng: number; city: string; country: string };
  capabilities: string[];
  powerLevel: number;
  specialization: string;
}

interface AgentDeploymentInterfaceProps {
  className?: string;
  onAgentDeployed?: (agentId: string) => void;
}

export default function AgentDeploymentInterface({ 
  className = '', 
  onAgentDeployed 
}: AgentDeploymentInterfaceProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentLog, setDeploymentLog] = useState<string[]>([]);
  const [config, setConfig] = useState<DeploymentConfig>({
    name: '',
    type: 'telepath',
    location: { lat: 0, lng: 0, city: '', country: '' },
    capabilities: [],
    powerLevel: 75,
    specialization: ''
  });

  const agentTypes = [
    { id: 'telepath', name: 'Telepath', icon: '🧠', description: 'Mind reading and thought projection' },
    { id: 'psychic', name: 'Psychic', icon: '👁️', description: 'Future sight and precognition' },
    { id: 'empath', name: 'Empath', icon: '💝', description: 'Emotion sensing and manipulation' },
    { id: 'neural', name: 'Neural', icon: '⚡', description: 'Direct neural interface control' }
  ];

  const capabilities = [
    'Mind Reading', 'Thought Projection', 'Memory Manipulation', 'Emotion Control',
    'Precognition', 'Psychometry', 'Astral Projection', 'Telekinesis',
    'Neural Hacking', 'Dream Walking', 'Consciousness Transfer', 'Mental Shielding'
  ];

  const locations = [
    { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
    { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
    { city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
    { city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
    { city: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050 },
    { city: 'Moscow', country: 'Russia', lat: 55.7558, lng: 37.6173 }
  ];

  const addToLog = (message: string) => {
    setDeploymentLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const deployAgent = async () => {
    if (!config.name || !config.specialization) {
      addToLog('Error: Agent name and specialization required');
      return;
    }

    setIsDeploying(true);
    addToLog(`Initiating deployment of ${config.type} agent: ${config.name}`);
    addToLog(`Location: ${config.location.city}, ${config.location.country}`);
    addToLog(`Power Level: ${config.powerLevel}%`);
    addToLog('Establishing neural link...');

    try {
      const neuralSocket = getNeuralSocket();
      
      // Simulate deployment phases
      await new Promise(resolve => setTimeout(resolve, 1000));
      addToLog('Neural patterns synchronized');
      
      await new Promise(resolve => setTimeout(resolve, 800));
      addToLog('Consciousness matrix initialized');
      
      await new Promise(resolve => setTimeout(resolve, 1200));
      addToLog('Telepathic channels established');

      const agentId = neuralSocket.deployAgent({
        name: config.name,
        type: config.type,
        location: config.location,
        capabilities: config.capabilities,
        powerLevel: config.powerLevel,
        specialization: config.specialization
      });

      await new Promise(resolve => setTimeout(resolve, 500));
      addToLog(`Agent ${agentId} deployed successfully!`);
      addToLog('Neural network integration complete');

      onAgentDeployed?.(agentId);

      // Reset form
      setConfig({
        name: '',
        type: 'telepath',
        location: { lat: 0, lng: 0, city: '', country: '' },
        capabilities: [],
        powerLevel: 75,
        specialization: ''
      });

    } catch (error) {
      addToLog(`Deployment failed: ${error}`);
    } finally {
      setIsDeploying(false);
    }
  };

  const toggleCapability = (capability: string) => {
    setConfig(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(capability)
        ? prev.capabilities.filter(c => c !== capability)
        : [...prev.capabilities, capability]
    }));
  };

  return (
    <div className={`bg-card/60 backdrop-blur-sm rounded-xl kson-border kson-glow p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="kson-heading text-xl font-semibold">Agent Deployment Console</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-xs text-primary font-medium">CEREBRO ONLINE</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Agent Name</label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:border-primary focus:outline-none"
              placeholder="e.g., Xavier-Alpha-001"
              disabled={isDeploying}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Agent Type</label>
            <div className="grid grid-cols-2 gap-2">
              {agentTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setConfig(prev => ({ ...prev, type: type.id as any }))}
                  disabled={isDeploying}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    config.type === type.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background/30 border-border hover:bg-accent'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{type.icon}</span>
                    <span className="text-sm font-medium">{type.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Location</label>
            <select
              value={`${config.location.city},${config.location.country}`}
              onChange={(e) => {
                const location = locations.find(loc => `${loc.city},${loc.country}` === e.target.value);
                if (location) setConfig(prev => ({ ...prev, location }));
              }}
              disabled={isDeploying}
              className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:border-primary focus:outline-none"
            >
              <option value="">Select deployment location</option>
              {locations.map((loc) => (
                <option key={`${loc.city},${loc.country}`} value={`${loc.city},${loc.country}`}>
                  {loc.city}, {loc.country}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Power Level: {config.powerLevel}%
            </label>
            <input
              type="range"
              min="25"
              max="100"
              value={config.powerLevel}
              onChange={(e) => setConfig(prev => ({ ...prev, powerLevel: parseInt(e.target.value) }))}
              disabled={isDeploying}
              className="w-full accent-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Specialization</label>
            <input
              type="text"
              value={config.specialization}
              onChange={(e) => setConfig(prev => ({ ...prev, specialization: e.target.value }))}
              className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-foreground text-sm focus:border-primary focus:outline-none"
              placeholder="e.g., Corporate Espionage, Medical Telepathy"
              disabled={isDeploying}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Capabilities</label>
            <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
              {capabilities.map((capability) => (
                <button
                  key={capability}
                  onClick={() => toggleCapability(capability)}
                  disabled={isDeploying}
                  className={`text-xs p-2 rounded transition-colors ${
                    config.capabilities.includes(capability)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background/30 text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {capability}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={deployAgent}
            disabled={isDeploying || !config.name || !config.specialization}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground py-3 px-4 rounded-lg font-semibold transition-colors kson-glow"
          >
            {isDeploying ? 'Deploying Neural Agent...' : 'Deploy Agent'}
          </button>
        </div>

        {/* Deployment Log */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Deployment Log</h4>
          <div className="bg-secondary/20 rounded-lg p-4 h-96 overflow-y-auto font-mono text-xs">
            {deploymentLog.length === 0 ? (
              <div className="text-muted-foreground">Awaiting deployment commands...</div>
            ) : (
              deploymentLog.map((entry, index) => (
                <div key={index} className="mb-1 text-foreground">
                  {entry}
                </div>
              ))
            )}
          </div>
          
          {deploymentLog.length > 0 && (
            <button
              onClick={() => setDeploymentLog([])}
              className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear Log
            </button>
          )}
        </div>
      </div>
    </div>
  );
}