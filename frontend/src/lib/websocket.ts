interface WebSocketMessage {
  type: 'agent_update' | 'metrics_update' | 'neural_activity' | 'system_status';
  data: any;
  timestamp: number;
}

interface AgentUpdate {
  id: string;
  status: 'active' | 'idle' | 'deploying' | 'error';
  tasks: number;
  efficiency: number;
  location: { lat: number; lng: number; city: string; country: string };
  connections: string[];
}

interface MetricsUpdate {
  totalAgents: number;
  activeConnections: number;
  neuralEfficiency: number;
  powerConsumption: number;
  telepathyRange: number;
  syncRate: number;
  responseTime: number;
}

class NeuralNetworkWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor(private url: string = 'ws://localhost:8080/neural') {
    this.connect();
  }

  private connect() {
    try {
      // For development, simulate WebSocket with mock data
      this.simulateConnection();
    } catch (error) {
      console.warn('WebSocket connection failed, using mock data:', error);
      this.simulateConnection();
    }
  }

  private simulateConnection() {
    // Simulate real-time data updates
    const generateMockData = () => {
      // Agent updates
      this.emit('agent_update', {
        id: `agent-${Math.floor(Math.random() * 47) + 1}`,
        status: ['active', 'idle', 'deploying'][Math.floor(Math.random() * 3)],
        tasks: Math.floor(Math.random() * 2000) + 100,
        efficiency: Math.floor(Math.random() * 20) + 80,
        location: {
          lat: (Math.random() - 0.5) * 180,
          lng: (Math.random() - 0.5) * 360,
          city: ['New York', 'London', 'Tokyo', 'Sydney', 'Berlin', 'Moscow'][Math.floor(Math.random() * 6)],
          country: 'Global'
        },
        connections: Array.from({ length: Math.floor(Math.random() * 10) + 1 }, 
          () => `agent-${Math.floor(Math.random() * 47) + 1}`)
      });

      // Metrics updates
      this.emit('metrics_update', {
        totalAgents: 47 + Math.floor(Math.random() * 6) - 3,
        activeConnections: 8247 + Math.floor(Math.random() * 200) - 100,
        neuralEfficiency: 94.7 + (Math.random() - 0.5) * 4,
        powerConsumption: 622.17 + (Math.random() - 0.5) * 50,
        telepathyRange: 2400000 + Math.floor(Math.random() * 100000) - 50000,
        syncRate: 99.99 + (Math.random() - 0.5) * 0.1,
        responseTime: Math.random() * 0.01
      });

      // Neural activity bursts
      if (Math.random() < 0.3) {
        this.emit('neural_activity', {
          type: 'thought_burst',
          intensity: Math.random() * 100,
          location: {
            lat: (Math.random() - 0.5) * 180,
            lng: (Math.random() - 0.5) * 360
          },
          duration: Math.floor(Math.random() * 5000) + 1000
        });
      }

      // System status
      this.emit('system_status', {
        cerebro_power: 94 + Math.floor(Math.random() * 6),
        neural_stability: 99 + Math.random(),
        memory_usage: 67 + Math.floor(Math.random() * 20),
        quantum_coherence: 89 + Math.floor(Math.random() * 10)
      });
    };

    // Generate initial burst of data
    setTimeout(() => {
      for (let i = 0; i < 10; i++) {
        setTimeout(generateMockData, i * 200);
      }
    }, 1000);

    // Continue generating data
    setInterval(generateMockData, 2000 + Math.random() * 3000);

    // Simulate occasional system events
    setInterval(() => {
      if (Math.random() < 0.1) {
        this.emit('system_status', {
          alert: 'Neural spike detected in sector 7',
          level: 'warning',
          timestamp: Date.now()
        });
      }
    }, 10000);
  }

  private emit(type: string, data: any) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket listener:', error);
        }
      });
    }
  }

  public on(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(event);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  public off(event: string, callback: (data: any) => void) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  public disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.listeners.clear();
  }

  public isConnected(): boolean {
    return true; // Always return true for mock connection
  }

  // Method to send commands to agents
  public sendCommand(agentId: string, command: string, params: any = {}) {
    console.log(`Sending command to ${agentId}:`, command, params);
    
    // Simulate command execution
    setTimeout(() => {
      this.emit('agent_update', {
        id: agentId,
        status: 'deploying',
        command_result: {
          command,
          params,
          status: 'executing',
          started_at: Date.now()
        }
      });

      // Simulate completion
      setTimeout(() => {
        this.emit('agent_update', {
          id: agentId,
          status: 'active',
          command_result: {
            command,
            params,
            status: 'completed',
            completed_at: Date.now()
          }
        });
      }, Math.random() * 3000 + 1000);
    }, 500);
  }

  // Method to deploy new agents
  public deployAgent(config: any) {
    const agentId = `agent-${Date.now()}`;
    console.log(`Deploying new agent ${agentId}:`, config);

    this.emit('agent_update', {
      id: agentId,
      status: 'deploying',
      ...config
    });

    setTimeout(() => {
      this.emit('agent_update', {
        id: agentId,
        status: 'active',
        tasks: 0,
        efficiency: Math.floor(Math.random() * 20) + 80,
        ...config
      });
    }, Math.random() * 5000 + 2000);

    return agentId;
  }
}

// Global instance
let neuralSocket: NeuralNetworkWebSocket | null = null;

export const getNeuralSocket = (): NeuralNetworkWebSocket => {
  if (!neuralSocket) {
    neuralSocket = new NeuralNetworkWebSocket();
  }
  return neuralSocket;
};

export const disconnectNeuralSocket = () => {
  if (neuralSocket) {
    neuralSocket.disconnect();
    neuralSocket = null;
  }
};

export type { WebSocketMessage, AgentUpdate, MetricsUpdate };