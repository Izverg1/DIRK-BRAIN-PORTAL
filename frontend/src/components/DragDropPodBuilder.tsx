'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { 
  Brain, Code, Image, Monitor, Shield, Sparkles, Zap, 
  GitBranch, Users, Workflow, Grid3x3, Plus, Settings,
  ChevronRight, Info, Trash2, Play, Save, Upload, Download,
  BarChart3, TrendingUp, AlertTriangle, Globe, User, Target,
  FolderTree, RefreshCw
} from 'lucide-react';
import ProjectPanel from './ProjectPanel';
import AIPromptBox from './AIPromptBox';
import SettingsPanel from './SettingsPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';

// Agent Provider Types
const AGENT_PROVIDERS = {
  anthropic_claude: {
    name: 'Anthropic Claude',
    icon: Brain,
    color: 'text-purple-500 bg-purple-500/10',
    models: ['claude-opus-4.1', 'claude-sonnet-4', 'claude-haiku-3.5'],
    strengths: 'Superior code generation, complex reasoning, analysis',
    specialty: 'coding'
  },
  google_gemini: {
    name: 'Google Gemini',
    icon: Sparkles,
    color: 'text-blue-500 bg-blue-500/10',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-ultra'],
    strengths: 'Business analysis, multi-modal processing, verification',
    specialty: 'business_analysis'
  },
  openai_gpt: {
    name: 'OpenAI GPT',
    icon: Zap,
    color: 'text-green-500 bg-green-500/10',
    models: ['gpt-4-turbo', 'gpt-4o', 'gpt-3.5-turbo'],
    strengths: 'General purpose, function calling, chat interfaces',
    specialty: 'general'
  },
  local_models: {
    name: 'Local Models',
    icon: Monitor,
    color: 'text-gray-500 bg-gray-500/10',
    models: ['llama-3', 'mistral', 'codellama'],
    strengths: 'Privacy-focused, offline, custom training',
    specialty: 'privacy'
  }
};

// Pod/Swarm Types
const POD_TYPES = {
  swarm: {
    name: 'Agent Swarm',
    description: 'Parallel processing with consensus voting',
    icon: '🐝',
    color: 'bg-yellow-500/10',
    layout: 'circular'
  },
  pipeline: {
    name: 'Processing Pipeline',
    description: 'Sequential task processing chain',
    icon: '⚡',
    color: 'bg-blue-500/10',
    layout: 'linear'
  },
  mesh: {
    name: 'Agent Mesh',
    description: 'Interconnected peer-to-peer network',
    icon: '🕸️',
    color: 'bg-purple-500/10',
    layout: 'mesh'
  },
  hierarchical: {
    name: 'Hierarchical Team',
    description: 'Manager-worker pattern with delegation',
    icon: '🏢',
    color: 'bg-green-500/10',
    layout: 'tree'
  }
};

interface Agent {
  id: string;
  provider: string;
  model: string;
  role: string;
  position: { x: number; y: number };
  connections: string[];
}

interface AgentPod {
  id: string;
  name: string;
  type: string;
  agents: Agent[];
  deployment: string;
  project?: string;
  performance?: {
    successRate: number;
    avgLatency: number;
    throughput: number;
    errorRate: number;
  };
}

interface AnalyticsData {
  globalStats: {
    totalPods: number;
    activePods: number;
    totalRequests: number;
    avgSuccessRate: number;
  };
  podPerformance: AgentPod[];
  customerInsights: any[];
  painPoints: any[];
}

export default function DragDropPodBuilder() {
  const [pods, setPods] = useState<AgentPod[]>([]);
  const [selectedPod, setSelectedPod] = useState<string | null>(null);
  const [draggedAgent, setDraggedAgent] = useState<any>(null);
  const [showRequirements, setShowRequirements] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [podLibrary, setPodLibrary] = useState<AgentPod[]>([]);
  const [showProjectPanel, setShowProjectPanel] = useState(false);
  const [project, setProject] = useState<string>('');
  const [deployment, setDeployment] = useState<string>('local');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    globalStats: {
      totalPods: 0,
      activePods: 0,
      totalRequests: 0,
      avgSuccessRate: 0
    },
    podPerformance: [],
    customerInsights: [],
    painPoints: []
  });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [availableProjects, setAvailableProjects] = useState<any[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Load analytics data and projects
  useEffect(() => {
    fetchAnalyticsData();
    fetchProjects();
    const interval = setInterval(fetchAnalyticsData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/projects');
      const data = await response.json();
      setAvailableProjects(data.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      // Use default projects as fallback
      setAvailableProjects([
        { id: 'NOT_TODAY', name: 'NOT_TODAY' },
        { id: 'DIRK_Brain', name: 'DIRK Brain Portal' },
        { id: 'CrawlZilla', name: 'CrawlZilla' },
        { id: 'E-Commerce', name: 'E-Commerce Platform' }
      ]);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/analytics/global');
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Mock data for demo
      setAnalyticsData({
        globalStats: {
          totalPods: 47,
          activePods: 23,
          totalRequests: 12847,
          avgSuccessRate: 94.2
        },
        podPerformance: [],
        customerInsights: [],
        painPoints: []
      });
    }
  };

  // Generate agent pod from requirements
  const generateFromRequirements = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/pods/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements })
      });
      const generatedPod = await response.json();
      
      // Add to canvas
      setPods([...pods, {
        ...generatedPod,
        id: `pod-${Date.now()}`,
        agents: generatedPod.agents.map((agent: any, index: number) => ({
          ...agent,
          id: `agent-${Date.now()}-${index}`,
          position: { x: 100 + index * 150, y: 100 },
          connections: []
        }))
      }]);
      
      setShowRequirements(false);
      setRequirements('');
    } catch (error) {
      console.error('Failed to generate pod:', error);
    }
  };

  // Handle drag start from agent palette
  const handleDragStart = (e: React.DragEvent, agentType: any) => {
    setDraggedAgent(agentType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Handle drop on canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedAgent || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create new agent with unique timestamp
    const newAgent: Agent = {
      id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      provider: draggedAgent.key,
      model: draggedAgent.models[0],
      role: draggedAgent.specialty || 'agent',
      position: { x, y },
      connections: []
    };

    // If we have a selected pod, add to it; otherwise create new pod
    if (selectedPod) {
      setPods(pods.map(pod => 
        pod.id === selectedPod 
          ? { ...pod, agents: [...pod.agents, newAgent] }
          : pod
      ));
    } else if (pods.length === 0) {
      // Create first pod
      const newPod: AgentPod = {
        id: `pod-${Date.now()}`,
        name: `Pod 1`,
        type: 'swarm',
        agents: [newAgent],
        deployment: 'local'
      };
      setPods([newPod]);
      setSelectedPod(newPod.id);
    } else {
      // Add to the first available pod
      const targetPod = pods[0];
      setPods(pods.map(pod => 
        pod.id === targetPod.id 
          ? { ...pod, agents: [...pod.agents, newAgent] }
          : pod
      ));
      setSelectedPod(targetPod.id);
    }

    setDraggedAgent(null);
  };

  // Save pod to library
  const savePodToLibrary = (pod: AgentPod) => {
    const template = {
      ...pod,
      id: `template-${Date.now()}`,
      name: `${pod.name} Template`,
      isTemplate: true
    };
    setPodLibrary([...podLibrary, template]);
  };

  // Handle AI-generated agents
  const handleAIGeneratedAgents = (generatedAgents: any[]) => {
    // Add generated agents to the canvas
    const newAgents = generatedAgents.map((agent, index) => ({
      id: agent.id || `agent-${Date.now()}-${index}`,
      provider: agent.provider,
      model: agent.model,
      role: agent.role || 'agent',
      position: {
        x: 100 + (index % 4) * 180,
        y: 100 + Math.floor(index / 4) * 150
      },
      connections: []
    }));

    // Add to existing pod or create new one
    if (pods.length > 0 && pods[0].agents) {
      setPods([{
        ...pods[0],
        agents: [...pods[0].agents, ...newAgents]
      }]);
    } else {
      setPods([{
        id: `pod-${Date.now()}`,
        name: 'AI Generated Pod',
        type: 'swarm',
        agents: newAgents,
        deployment: 'local'
      }]);
    }
  };

  // Deploy pod
  const deployPod = async (pod: AgentPod) => {
    if (!pod.project) {
      alert('Please select a project before deploying');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3001/api/pods/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...pod,
          name: `${pod.project}-Pod-${Date.now()}`,
          metadata: {
            createdAt: new Date().toISOString(),
            createdBy: 'user',
            framework: 'multi-provider',
            description: `Pod with ${pod.agents.length} agents for ${pod.project}`
          }
        })
      });
      const result = await response.json();
      
      if (result.success) {
        console.log('Pod deployed successfully:', result);
        alert(`✅ Pod deployed to ${pod.project}!\n\nPod ID: ${result.pod_id}\nAgents: ${pod.agents.length}\nStatus: Active`);
        
        // Clear canvas after successful deployment
        setPods([]);
        setSelectedPod(null);
      } else {
        alert(`❌ Deployment failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to deploy pod:', error);
      alert('Failed to deploy pod. Check console for details.');
    }
  };

  return (
    <div className="w-full h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Left Sidebar - Agent Palette */}
      <div className="w-80 border-r bg-white dark:bg-gray-800 flex flex-col">
        {/* Agent Palette */}
        <div className="flex-1 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Agent Providers</h2>
            <Button size="sm" onClick={() => setShowRequirements(true)}>
              <Sparkles className="h-4 w-4 mr-1" />
              Generate
            </Button>
          </div>
          
          <div className="space-y-3">
            {Object.entries(AGENT_PROVIDERS).map(([key, provider]) => (
              <div
                key={key}
                draggable
                onDragStart={(e) => handleDragStart(e, { key, ...provider })}
                className="cursor-grab hover:shadow-md transition-shadow bg-white dark:bg-gray-800 rounded-lg border"
              >
                <div className="p-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${provider.color}`}>
                      <provider.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{provider.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{provider.strengths}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {provider.specialty}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pod Library */}
        <div className="border-t p-4">
          <h3 className="font-semibold mb-3">Pod Templates</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {podLibrary.map(template => (
              <div key={template.id} className="cursor-pointer hover:bg-gray-50 bg-white dark:bg-gray-800 rounded-lg border p-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{template.name}</p>
                    <p className="text-xs text-gray-500">{template.agents.length} agents</p>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="border-b bg-white dark:bg-gray-800 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">Agent Pod Builder</h1>
              <Badge variant="outline">
                {pods.reduce((sum, pod) => sum + pod.agents.length, 0)} agents on canvas
              </Badge>
              
              {/* Project Assignment */}
              {pods.length > 0 && pods[0].agents.length > 0 && (
                <>
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm">Project:</Label>
                    <Select value={project} onValueChange={(value) => {
                      if (value === '_refresh') {
                        fetchProjects();
                      } else {
                        setProject(value);
                      }
                    }}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProjects.map(proj => (
                          <SelectItem key={proj.id} value={proj.id}>
                            {proj.name}
                            {proj.source && (
                              <span className="text-xs text-gray-500 ml-2">({proj.source})</span>
                            )}
                          </SelectItem>
                        ))}
                        <SelectItem value="_refresh">
                          <div className="flex items-center">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Refresh Projects
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Deployment Target */}
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm">Deploy to:</Label>
                    <Select value={deployment} onValueChange={setDeployment}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Local</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="cloud">Cloud</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => {
                      // Group all agents into a deployable pod with project assignment
                      if (pods.length > 0 && pods[0].agents.length > 0) {
                        const podWithProject = {
                          ...pods[0],
                          project: project,
                          deployment: deployment
                        };
                        deployPod(podWithProject);
                      }
                    }}
                    className="bg-green-500 hover:bg-green-600"
                    disabled={!project}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Deploy to {project || 'Project'} ({pods[0]?.agents.length} agents)
                  </Button>
                </>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProjectPanel(!showProjectPanel)}
              >
                <FolderTree className="h-4 w-4 mr-1" />
                Projects
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Analytics
              </Button>
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-1" />
                Save All
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-1" />
                Import
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Project Panel */}
          {showProjectPanel && (
            <div className="w-80 border-r bg-white dark:bg-gray-800">
              <ProjectPanel onSelectProject={(projectId) => setProject(projectId)} />
            </div>
          )}
          
          {/* Canvas */}
          <div
            id="agent-canvas"
            ref={canvasRef}
            className="flex-1 relative bg-gray-100 dark:bg-gray-700"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Drop Zone Instructions */}
            {pods.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <p className="text-xl font-medium mb-2">Drag agents here to start building</p>
                  <p className="text-sm mb-2">Each drop creates an individual agent card</p>
                  <div className="bg-gray-200/50 dark:bg-gray-700/50 rounded-lg p-4 text-sm space-y-2">
                    <p className="font-semibold">✨ How it works:</p>
                    <ul className="space-y-1 text-left">
                      <li>1️⃣ Drag agents from the left panel (you can drag multiple!)</li>
                      <li>2️⃣ Each agent becomes a card you can move around</li>
                      <li>3️⃣ Mix providers: Claude (coding) + Gemini (analysis)</li>
                      <li>4️⃣ Click "Deploy Pod" when ready to activate</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Render Individual Agents */}
            {pods.map((pod, podIndex) => 
              pod.agents.map((agent, agentIndex) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  position={agent.position || { 
                    x: 100 + (agentIndex % 4) * 180, 
                    y: 100 + Math.floor(agentIndex / 4) * 150 
                  }}
                  onMove={(newPos) => {
                    setPods(pods.map(p => 
                      p.id === pod.id 
                        ? {
                            ...p,
                            agents: p.agents.map(a => 
                              a.id === agent.id 
                                ? { ...a, position: newPos }
                                : a
                            )
                          }
                        : p
                    ));
                  }}
                  onDelete={() => {
                    setPods(pods.map(p => 
                      p.id === pod.id 
                        ? { ...p, agents: p.agents.filter(a => a.id !== agent.id) }
                        : p
                    ));
                  }}
                  isSelected={selectedPod === pod.id}
                />
              ))
            )}
          </div>

          {/* Right Analytics Panel */}
          {showAnalytics && (
            <div className="w-80 border-l bg-white dark:bg-gray-800 p-4 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Real-time Analytics
              </h3>

              {/* Global Stats */}
              <div className="mb-4 bg-white dark:bg-gray-900 rounded-lg border p-4">
                <div className="pb-2">
                  <h4 className="text-sm font-semibold flex items-center">
                    <Globe className="h-4 w-4 mr-1" />
                    Global Performance
                  </h4>
                </div>
                <div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Total Pods</p>
                      <p className="text-xl font-bold text-blue-500">{analyticsData.globalStats.totalPods}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Active</p>
                      <p className="text-xl font-bold text-green-500">{analyticsData.globalStats.activePods}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Requests</p>
                      <p className="text-lg font-bold">{analyticsData.globalStats.totalRequests.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Success Rate</p>
                      <p className="text-lg font-bold text-green-500">{analyticsData.globalStats.avgSuccessRate}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Performing Pods */}
              <div className="mb-4 bg-white dark:bg-gray-900 rounded-lg border p-4">
                <div className="pb-2">
                  <h4 className="text-sm font-semibold">Top Performers</h4>
                </div>
                <div>
                  <div className="space-y-2">
                    {[
                      { name: 'FullStack-Dev-Pod', success: 98.5, latency: '120ms' },
                      { name: 'Security-Analysis', success: 96.2, latency: '89ms' },
                      { name: 'Content-Generator', success: 94.8, latency: '156ms' }
                    ].map(pod => (
                      <div key={pod.name} className="flex justify-between items-center text-xs">
                        <span className="font-medium">{pod.name}</span>
                        <div className="text-right">
                          <div className="text-green-500">{pod.success}%</div>
                          <div className="text-gray-500">{pod.latency}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pain Points */}
              <div className="bg-white dark:bg-gray-900 rounded-lg border p-4">
                <div className="pb-2">
                  <h4 className="text-sm font-semibold flex items-center text-red-500">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Pain Points
                  </h4>
                </div>
                <div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded">
                      <p className="font-medium">High Latency in EU West</p>
                      <p className="text-gray-500">Avg: 2.4s (+150% from baseline)</p>
                    </div>
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                      <p className="font-medium">Token Limit Exceeded</p>
                      <p className="text-gray-500">23 incidents in last hour</p>
                    </div>
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                      <p className="font-medium">API Rate Limiting</p>
                      <p className="text-gray-500">OpenAI provider throttling</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Requirements Generation Dialog */}
      <Dialog open={showRequirements} onOpenChange={setShowRequirements}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generate Agent Pod from Requirements</DialogTitle>
            <DialogDescription>
              Describe what you need and I&apos;ll create the optimal agent configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Project Requirements</Label>
              <Textarea
                placeholder="Example: I need to build a full-stack e-commerce platform with React frontend, Node.js backend, secure payment processing, automated testing, and comprehensive documentation. The system should handle user authentication, product catalog, shopping cart, and order management."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="min-h-[150px] mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Deployment Target</Label>
                <Select defaultValue="local">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local Development</SelectItem>
                    <SelectItem value="remote">Remote Server</SelectItem>
                    <SelectItem value="cloud">Cloud (AWS/GCP/Azure)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Project Assignment</Label>
                <Input placeholder="e.g., E-commerce Project" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequirements(false)}>
              Cancel
            </Button>
            <Button onClick={generateFromRequirements}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Pod
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel 
          onClose={() => setShowSettings(false)}
          onSave={() => {
            // Refresh projects after settings save
            fetchProjects();
            setShowSettings(false);
          }}
        />
      )}

      {/* AI Prompt Box */}
      <AIPromptBox 
        onAgentGenerate={handleAIGeneratedAgents}
        onCommandExecute={(command, response) => {
          console.log('Command executed:', command, response);
          // Handle specific commands if needed
          if (command === 'get_status') {
            fetchAnalyticsData();
          }
        }}
      />
    </div>
  );
}

// Individual Agent Card Component
function AgentCard({ agent, position, onMove, onDelete, isSelected }: {
  agent: Agent;
  position: { x: number; y: number };
  onMove: (pos: { x: number; y: number }) => void;
  onDelete: () => void;
  isSelected: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  
  const provider = AGENT_PROVIDERS[agent.provider as keyof typeof AGENT_PROVIDERS];
  const Icon = provider?.icon || Brain;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = document.getElementById('agent-canvas');
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      onMove({
        x: Math.max(0, Math.min(rect.width - 160, e.clientX - rect.left - dragOffset.x)),
        y: Math.max(0, Math.min(rect.height - 120, e.clientY - rect.top - dragOffset.y))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, onMove]);

  return (
    <div
      ref={cardRef}
      className={`absolute bg-white dark:bg-gray-800 rounded-lg border-2 shadow-lg transition-all ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
      } ${isDragging ? 'cursor-grabbing opacity-90' : 'cursor-grab hover:border-blue-400'} w-40`}
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
    >
      {/* Agent Header */}
      <div className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div className={`p-2 rounded-lg ${provider?.color || 'bg-gray-100'}`}>
            <Icon className="h-5 w-5" />
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        {/* Agent Info */}
        <div>
          <h4 className="font-semibold text-sm">{provider?.name}</h4>
          <p className="text-xs text-gray-500">{agent.model}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{agent.role}</p>
          <Badge variant="outline" className="mt-2 text-xs">
            {provider?.specialty}
          </Badge>
        </div>
      </div>
    </div>
  );
}