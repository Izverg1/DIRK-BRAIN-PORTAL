'use client';

import React, { useState, useEffect } from 'react';
import { 
  Terminal, Globe, Grid3x3, Play, Sparkles, Code, 
  FileSearch, Rocket, ChevronRight, Activity, Users,
  Maximize2, Minimize2, Split
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import dynamic from 'next/dynamic';

// Lazy load heavy components
const ElegantAgentVisualization = dynamic(() => import('./ElegantAgentVisualization'), { ssr: false });
const TerminalViewer = dynamic(() => import('./TerminalViewer'), { ssr: false });
const ProjectPanel = dynamic(() => import('./ProjectPanel'), { ssr: false });
const EnhancedAIPromptBox = dynamic(() => import('./EnhancedAIPromptBox'), { ssr: false });

type ViewMode = 'command' | 'monitor' | 'hybrid';
type ExecutionMode = 'cli' | 'api' | 'auto';

interface Agent {
  id: string;
  name: string;
  type: 'cli' | 'api';
  status: 'ready' | 'busy' | 'error';
  provider: string;
}

export default function UnifiedCommandCenter() {
  const [viewMode, setViewMode] = useState<ViewMode>('command');
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('auto');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [isExpanded3D, setIsExpanded3D] = useState(false);
  const [generatedSwarms, setGeneratedSwarms] = useState<any[]>([]);
  const [agents, setAgents] = useState<Agent[]>([
    { id: '1', name: 'Claude CLI', type: 'cli', status: 'ready', provider: 'anthropic' },
    { id: '2', name: 'Gemini CLI', type: 'cli', status: 'ready', provider: 'google' },
    { id: '3', name: 'GPT-4 API', type: 'api', status: 'ready', provider: 'openai' },
    { id: '4', name: 'Local LLM', type: 'cli', status: 'ready', provider: 'local' }
  ]);
  const [activeWorkflows, setActiveWorkflows] = useState<any[]>([]);
  const [globalActivity, setGlobalActivity] = useState({
    totalTasks: 0,
    completedToday: 0,
    activeAgents: 0,
    successRate: 0
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Spacebar to toggle between command and monitor view
      if (e.code === 'Space' && e.ctrlKey) {
        e.preventDefault();
        setViewMode(prev => prev === 'command' ? 'monitor' : 'command');
      }
      // Ctrl+Shift+S for split view
      if (e.code === 'KeyS' && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        setViewMode('hybrid');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Smart command interpreter
  const interpretCommand = (command: string) => {
    const lower = command.toLowerCase();
    
    // Determine execution type
    if (lower.startsWith('claude') || lower.startsWith('gemini') || lower.startsWith('git')) {
      return { type: 'cli', tool: command.split(' ')[0] };
    }
    
    if (lower.includes('create pod') || lower.includes('deploy swarm')) {
      return { type: 'api', framework: 'orchestration' };
    }
    
    if (lower.includes('workflow') || lower.includes('pipeline')) {
      return { type: 'workflow', steps: analyzeWorkflow(command) };
    }
    
    return { type: 'auto', command };
  };

  const analyzeWorkflow = (command: string) => {
    // Parse workflow steps from natural language
    return [
      { tool: 'claude', action: 'analyze' },
      { tool: 'gemini', action: 'verify' },
      { tool: 'api', action: 'deploy' }
    ];
  };

  const executeCommand = async (command: string) => {
    const interpretation = interpretCommand(command);
    
    // Update UI to show execution
    const agentId = interpretation.type === 'cli' ? '1' : '3';
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { ...a, status: 'busy' } : a
    ));

    try {
      const response = await fetch('http://localhost:3001/api/unified/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          context: {
            project: selectedProject,
            mode: executionMode,
            interpretation
          }
        })
      });

      const result = await response.json();
      
      // Update global activity
      setGlobalActivity(prev => ({
        ...prev,
        totalTasks: prev.totalTasks + 1,
        completedToday: prev.completedToday + (result.success ? 1 : 0),
        successRate: ((prev.completedToday + (result.success ? 1 : 0)) / (prev.totalTasks + 1)) * 100
      }));

    } finally {
      // Reset agent status
      setTimeout(() => {
        setAgents(prev => prev.map(a => 
          a.id === agentId ? { ...a, status: 'ready' } : a
        ));
      }, 2000);
    }
  };

  // Quick action templates
  const quickActions = [
    { icon: Code, label: 'Generate', command: 'claude code', color: 'text-blue-500' },
    { icon: FileSearch, label: 'Review', command: 'claude review', color: 'text-green-500' },
    { icon: Sparkles, label: 'Improve', command: 'gemini analyze', color: 'text-purple-500' },
    { icon: Rocket, label: 'Deploy', command: 'deploy workflow', color: 'text-orange-500' }
  ];

  return (
    <div className="h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header Bar */}
      <div className="h-14 border-b border-gray-800 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            DIRK Command & Control
          </h1>
          {selectedProject && (
            <Badge variant="outline" className="border-blue-500/50 text-blue-400">
              {selectedProject}
            </Badge>
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === 'command' ? 'default' : 'ghost'}
              onClick={() => setViewMode('command')}
              className="text-xs"
            >
              <Terminal className="h-3 w-3 mr-1" />
              Command
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'monitor' ? 'default' : 'ghost'}
              onClick={() => setViewMode('monitor')}
              className="text-xs"
            >
              <Globe className="h-3 w-3 mr-1" />
              Monitor
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'hybrid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('hybrid')}
              className="text-xs"
            >
              <Split className="h-3 w-3 mr-1" />
              Hybrid
            </Button>
          </div>

          {/* Execution Mode */}
          <select
            value={executionMode}
            onChange={(e) => setExecutionMode(e.target.value as ExecutionMode)}
            className="bg-gray-800 text-xs px-2 py-1 rounded border border-gray-700"
          >
            <option value="auto">Auto</option>
            <option value="cli">CLI Only</option>
            <option value="api">API Only</option>
          </select>
        </div>

        {/* Global Stats */}
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <Activity className="h-3 w-3 text-green-400" />
            <span>{agents.filter(a => a.status === 'busy').length}/{agents.length} active</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-3 w-3 text-blue-400" />
            <span>{globalActivity.completedToday} tasks today</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-2 w-16 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                style={{ width: `${globalActivity.successRate}%` }}
              />
            </div>
            <span>{globalActivity.successRate.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Command View */}
        {viewMode === 'command' && (
          <div className="flex-1 flex">
            {/* Projects Sidebar */}
            <div className="w-64 border-r border-gray-800 bg-gray-900/50">
              <ProjectPanel onSelectProject={setSelectedProject} />
            </div>

            {/* Command Workspace */}
            <div className="flex-1 flex flex-col">
              {/* Quick Actions Bar */}
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center space-x-2">
                  {quickActions.map((action, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => executeCommand(action.command)}
                      className="border-gray-700 hover:border-gray-600"
                    >
                      <action.icon className={`h-4 w-4 mr-1 ${action.color}`} />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Terminal Area */}
              <div className="flex-1 p-4">
                <TerminalViewer onExecute={executeCommand} />
              </div>
            </div>

            {/* Agent Status Sidebar */}
            <div className="w-64 border-l border-gray-800 bg-gray-900/50 p-4">
              <h3 className="text-sm font-semibold mb-3">Agent Status</h3>
              <div className="space-y-2">
                {agents.map(agent => (
                  <div key={agent.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                    <div className="flex items-center space-x-2">
                      <div className={`h-2 w-2 rounded-full ${
                        agent.status === 'ready' ? 'bg-green-400' :
                        agent.status === 'busy' ? 'bg-yellow-400 animate-pulse' :
                        'bg-red-400'
                      }`} />
                      <span className="text-xs">{agent.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {agent.type}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Active Workflows */}
              {activeWorkflows.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-3">Active Workflows</h3>
                  <div className="space-y-2">
                    {activeWorkflows.map((workflow, idx) => (
                      <div key={idx} className="p-2 bg-gray-800 rounded">
                        <div className="text-xs font-medium">{workflow.name}</div>
                        <div className="mt-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500"
                            style={{ width: `${workflow.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Monitor View (3D) */}
        {viewMode === 'monitor' && (
          <div className="flex-1 relative">
            <ElegantAgentVisualization 
              agents={agents.map((a, idx) => ({
                id: a.id,
                name: a.name,
                position: [
                  Math.cos((idx / agents.length) * Math.PI * 2) * 3,
                  1,
                  Math.sin((idx / agents.length) * Math.PI * 2) * 3
                ] as [number, number, number],
                status: a.status === 'busy' ? 'working' : 'idle',
                type: a.type,
                color: a.provider === 'anthropic' ? '#8b5cf6' : 
                       a.provider === 'google' ? '#3b82f6' : 
                       a.provider === 'openai' ? '#10b981' : '#64748b'
              }))}
              projects={generatedSwarms.map((swarm, idx) => ({
                id: swarm.id || `swarm-${idx}`,
                name: swarm.project || swarm.name || `Swarm ${idx + 1}`,
                position: [
                  Math.cos((idx / Math.max(generatedSwarms.length, 1)) * Math.PI * 2) * 4,
                  0,
                  Math.sin((idx / Math.max(generatedSwarms.length, 1)) * Math.PI * 2) * 4
                ] as [number, number, number],
                agents: swarm.agents?.map((a: any) => a.id) || [],
                activity: Math.random() * 0.5 + 0.5
              }))}
              dataFlows={activeWorkflows.map(w => ({
                from: [0, 0.5, 0],
                to: [Math.random() * 6 - 3, 0.5, Math.random() * 6 - 3],
                progress: w.progress / 100
              }))}
            />
            {/* Overlay controls */}
            <div className="absolute top-4 left-4 space-y-2">
              <Card className="p-3 bg-gray-900/90 backdrop-blur">
                <div className="text-xs space-y-1">
                  <div>Projects: {selectedProject || 'All'}</div>
                  <div>Active Agents: {agents.filter(a => a.status === 'busy').length}</div>
                  <div>Global Activity: {globalActivity.totalTasks} tasks</div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Hybrid View */}
        {viewMode === 'hybrid' && (
          <div className="flex-1 flex">
            {/* Command Interface (70%) */}
            <div className="flex-1 flex">
              <div className="w-48 border-r border-gray-800 bg-gray-900/50">
                <ProjectPanel onSelectProject={setSelectedProject} />
              </div>
              <div className="flex-1 p-4">
                <TerminalViewer onExecute={executeCommand} />
              </div>
            </div>

            {/* Mini 3D View (30% - expandable) */}
            <div className={`${isExpanded3D ? 'w-[70%]' : 'w-96'} border-l border-gray-800 transition-all duration-300`}>
              <div className="h-full relative">
                <ElegantAgentVisualization 
                  agents={agents.map((a, idx) => ({
                    id: a.id,
                    name: a.name,
                    position: [
                      Math.cos((idx / agents.length) * Math.PI * 2) * 3,
                      1,
                      Math.sin((idx / agents.length) * Math.PI * 2) * 3
                    ] as [number, number, number],
                    status: a.status === 'busy' ? 'working' : 'idle',
                    type: a.type,
                    color: a.provider === 'anthropic' ? '#8b5cf6' : 
                           a.provider === 'google' ? '#3b82f6' : 
                           a.provider === 'openai' ? '#10b981' : '#64748b'
                  }))}
                  projects={generatedSwarms.map((swarm, idx) => ({
                    id: swarm.id || `swarm-${idx}`,
                    name: swarm.project || swarm.name || `Swarm ${idx + 1}`,
                    position: [
                      Math.cos((idx / Math.max(generatedSwarms.length, 1)) * Math.PI * 2) * 4,
                      0,
                      Math.sin((idx / Math.max(generatedSwarms.length, 1)) * Math.PI * 2) * 4
                    ] as [number, number, number],
                    agents: swarm.agents?.map((a: any) => a.id) || [],
                    activity: Math.random() * 0.5 + 0.5
                  }))}
                  dataFlows={activeWorkflows.map(w => ({
                    from: [0, 0.5, 0],
                    to: [Math.random() * 6 - 3, 0.5, Math.random() * 6 - 3],
                    progress: w.progress / 100
                  }))}
                />
                <div className="absolute bottom-2 right-2 flex space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsExpanded3D(!isExpanded3D)}
                    className="text-xs bg-gray-900/80 backdrop-blur"
                  >
                    {isExpanded3D ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setViewMode('monitor')}
                    className="text-xs bg-gray-900/80 backdrop-blur"
                  >
                    Full View
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Prompt Box - Always visible at bottom */}
      <div className="border-t border-gray-800">
        <EnhancedAIPromptBox 
          onGenerateSwarm={(swarmConfig) => {
            // Add generated swarm to the agents list
            const newAgents = swarmConfig.agents?.map((agent: any, idx: number) => ({
              id: `gen-${Date.now()}-${idx}`,
              name: agent.name || `Agent-${idx}`,
              type: agent.type === 'remote' ? 'api' : 'cli',
              status: 'ready' as const,
              provider: agent.provider || 'custom'
            })) || [];
            
            setAgents(prev => [...prev, ...newAgents]);
            setGeneratedSwarms(prev => [...prev, swarmConfig]);
            
            // If a project was specified, set it as selected
            if (swarmConfig.project) {
              setSelectedProject(swarmConfig.project);
            }
            
            // Update global activity
            setGlobalActivity(prev => ({
              ...prev,
              activeAgents: prev.activeAgents + newAgents.length
            }));
          }}
          selectedProject={selectedProject}
        />
      </div>

      {/* Status Bar */}
      <div className="h-6 border-t border-gray-800 px-4 flex items-center justify-between text-xs text-gray-500">
        <div>Ready</div>
        <div className="flex items-center space-x-4">
          <span>Ctrl+Space: Toggle View</span>
          <span>Ctrl+Shift+S: Split View</span>
          <span>Tab: Focus Command</span>
        </div>
      </div>
    </div>
  );
}