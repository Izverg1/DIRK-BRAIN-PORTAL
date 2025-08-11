'use client';

'use client';

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import DynamicAgentEntity from '../components/DynamicAgentEntity';
import AgentCommunicationLines from '../components/AgentCommunicationLines';
import WorkflowExecutionStream from '../components/WorkflowExecutionStream';
import TaskDataTunnels from '../components/TaskDataTunnels';
import RealTimeMetricsSphere from '../components/RealTimeMetricsSphere';
import InteractiveNetworkTopology from '../components/InteractiveNetworkTopology';
import TaskFlowVisualization from '../components/TaskFlowVisualization';
import DataTunnels from '../components/DataTunnels';
import ProjectWorkspace from '../components/ProjectWorkspace';
import AmbientNotification from '../components/AmbientNotification';
import HolographicDashboard from '../components/HolographicDashboard';
import ParticleDataStreams from '../components/ParticleDataStreams';

interface AgentData {
  id: string;
  status: string;
  tasks_assigned: number;
  role: string;
  responsibilities: string[];
  type: 'DIRK.c' | 'DIRK.g' | 'DIRK.desktop';
  workload: number;
  performance: number;
  communicationVolume: number;
  taskProgress: Array<{ taskId: string; progress: number; status: string; }>;
  position: [number, number, number];
}

export default function AgentUniverse() {
  const [agentsData, setAgentsData] = useState<AgentData[]>([]);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [hoveredAgentId, setHoveredAgentId] = useState<string | null>(null);
  const [tasksData, setTasksData] = useState<any[]>([]); // State for tasks to visualize
  const [systemMetrics, setSystemMetrics] = useState({ cpu: 0, memory: 0, network: 0 });
  const [dashboardPanels, setDashboardPanels] = useState<any[]>([]);
  const [dataStreams, setDataStreams] = useState<any[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  const triggerNotification = (message: string) => {
    setNotificationMessage(message);
    setTimeout(() => setNotificationMessage(null), 3000);
  };

  useEffect(() => {
    const fetchAgentsAndTasks = async () => {
      try {
        // Fetch agents data
        const agentsResponse = await fetch('http://localhost:3001/api/agents');
        const agents: { [key: string]: AgentData } = await agentsResponse.json();
        const transformedAgents = Object.keys(agents).map((key, index) => {
          const agent = agents[key];
          // Assign arbitrary positions for now, will be dynamic later
          const position: [number, number, number] = [
            (index % 3) * 2 - 2,
            Math.floor(index / 3) * 2 - 1,
            0
          ];
          // Simulate workload, performance, communicationVolume, taskProgress
          const simulatedWorkload = Math.floor(Math.random() * 100);
          const simulatedPerformance = Math.floor(Math.random() * 100);
          const simulatedCommunicationVolume = Math.floor(Math.random() * 10);
          const simulatedTaskProgress = [{ taskId: `task-${index}`, progress: Math.floor(Math.random() * 100), status: 'in-progress' }];

          return {
            ...agent,
            position,
            workload: simulatedWorkload,
            performance: simulatedPerformance,
            communicationVolume: simulatedCommunicationVolume,
            taskProgress: simulatedTaskProgress,
            type: agent.type || 'DIRK.desktop' // Ensure type is set
          };
        });
        setAgentsData(transformedAgents);

        // Simulate fetching tasks for visualization
        const simulatedTasks = [
          { id: 'task-1', fromAgentId: transformedAgents[0]?.id, toAgentId: transformedAgents[1]?.id, progress: 70, status: 'in-progress' },
          { id: 'task-2', fromAgentId: transformedAgents[1]?.id, toAgentId: transformedAgents[2]?.id, progress: 30, status: 'pending' },
        ].filter(task => task.fromAgentId && task.toAgentId); // Filter out tasks with undefined agents
        setTasksData(simulatedTasks);

        // Simulate fetching system metrics
        const newMetrics = { cpu: Math.random() * 100, memory: Math.random() * 100, network: Math.random() * 100 };
        setSystemMetrics(newMetrics);

        // Generate historical data for time-series visualization
        const newHistoricalPoint = {
          timestamp: Date.now(),
          value: newMetrics.cpu,
          type: 'cpu' as const
        };
        setHistoricalData(prev => [...prev.slice(-50), newHistoricalPoint]);

        // Create dashboard panels
        setDashboardPanels([
          {
            id: 'metrics-panel',
            title: 'System Metrics',
            type: 'metrics',
            data: newMetrics,
            position: [-3, 2, 0] as [number, number, number],
            size: [2, 1.5] as [number, number]
          },
          {
            id: 'performance-chart',
            title: 'Performance Trend',
            type: 'chart',
            data: { values: historicalData.slice(-10).map(d => d.value) },
            position: [3, 2, 0] as [number, number, number],
            size: [2, 1.5] as [number, number]
          },
          {
            id: 'agent-status',
            title: 'Agent Status',
            type: 'status',
            data: { 
              items: transformedAgents.map(agent => ({
                name: agent.id,
                status: agent.status === 'active' ? 'active' : 'warning'
              }))
            },
            position: [0, 3, 0] as [number, number, number],
            size: [2.5, 1.5] as [number, number]
          }
        ]);

        // Create data streams between agents
        const streams = transformedAgents.slice(0, -1).map((agent, index) => ({
          id: `stream-${index}`,
          source: agent.position,
          destination: transformedAgents[index + 1]?.position || [0, 0, 0],
          dataType: ['task', 'metric', 'log', 'command'][index % 4] as any,
          intensity: Math.random() * 0.8 + 0.2,
          speed: 0.02 + Math.random() * 0.03
        }));
        setDataStreams(streams);

      } catch (error) {
        console.error('Error fetching agents or tasks data:', error);
      }
    };

    fetchAgentsAndTasks();
    const interval = setInterval(fetchAgentsAndTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  const agentPositions = agentsData.reduce((acc, agent) => {
    acc[agent.id] = agent.position;
    return acc;
  }, {} as { [key: string]: [number, number, number] });

  const networkNodes = agentsData.map(agent => ({
    id: agent.id,
    position: agent.position,
    status: agent.status,
  }));

  const networkConnections = tasksData.map(task => ({
    from: task.fromAgentId,
    to: task.toAgentId,
    strength: task.communicationVolume || 0.5, // Assuming communicationVolume exists on task or default
  }));

  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />

      {agentsData.map(agent => (
        <DynamicAgentEntity
          key={agent.id}
          agent={agent}
          onHover={setHoveredAgentId}
        />
      ))}

      {hoveredAgentId && (
        <Html position={agentsData.find(a => a.id === hoveredAgentId)?.position || [0, 0, 0]}>
          <div style={{ background: 'rgba(0,0,0,0.7)', padding: '5px', borderRadius: '3px', color: 'white', fontSize: '12px' }}>
            {hoveredAgentId}
          </div>
        </Html>
      )}

      {/* Agent Communication Lines */}
      <AgentCommunicationLines agents={agentsData.map(a => ({ id: a.id, position: a.position }))} />

      {/* Workflow Execution Stream */}
      <WorkflowExecutionStream tasks={tasksData} agentPositions={agentPositions} />

      {/* Enhanced Data Tunnels with historical data */}
      {tasksData.length > 0 && agentsData.length >= 2 && (
        <DataTunnels
          startPosition={agentsData[0].position}
          endPosition={agentsData[1].position}
          historicalData={historicalData}
          color="#00ffff"
          speed={0.03}
          particleCount={80}
          tunnelRadius={0.15}
        />
      )}

      {/* Enhanced Real-time Metrics Spheres for each agent */}
      {agentsData.map((agent, index) => (
        <RealTimeMetricsSphere 
          key={`metrics-${agent.id}`}
          position={[agent.position[0] + 1, agent.position[1] + 1, agent.position[2]]}
          metrics={systemMetrics}
          agentId={agent.id}
          performance={agent.performance}
        />
      ))}

      {/* Interactive Network Topology */}
      <InteractiveNetworkTopology nodes={networkNodes} connections={networkConnections} />

      {/* Holographic Dashboard Panels */}
      <HolographicDashboard 
        panels={dashboardPanels}
        centerPosition={[0, 0, 0]}
      />

      {/* Particle Data Streams */}
      <ParticleDataStreams 
        streams={dataStreams}
        globalIntensity={1.0}
      />

      <ProjectWorkspace position={[0, 0, -2]} />
      {notificationMessage && <AmbientNotification message={notificationMessage} />}
      
      {/* Enhanced control panel */}
      <Html position={[0, 4, 0]}>
        <div className="flex space-x-2">
          <button 
            onClick={() => triggerNotification('System Status: All agents operational!')} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            System Status
          </button>
          <button 
            onClick={() => triggerNotification('Performance metrics updated!')} 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Refresh Metrics
          </button>
          <button 
            onClick={() => triggerNotification('Data streams synchronized!')} 
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Sync Data
          </button>
        </div>
      </Html>
      
      <OrbitControls enableDamping dampingFactor={0.05} />
    </Canvas>
  );
}

