'use client';

import React, { useState, useEffect } from 'react';
import { 
  Brain, Code, Image, Monitor, Shield, Sparkles, Zap, 
  GitBranch, Users, Workflow, Grid3x3, Plus, Settings,
  ChevronRight, Info, Trash2, Play, Save, Upload
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';

// Provider and Framework configurations
const PROVIDERS = {
  anthropic: {
    name: 'Anthropic Claude',
    icon: Brain,
    color: 'text-purple-500',
    models: ['claude-opus-4.1', 'claude-sonnet-4', 'claude-haiku-3.5'],
    strengths: 'Best for complex reasoning and code generation'
  },
  google: {
    name: 'Google Gemini',
    icon: Sparkles,
    color: 'text-blue-500',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-ultra'],
    strengths: 'Excellent for multi-modal tasks and verification'
  },
  openai: {
    name: 'OpenAI GPT',
    icon: Zap,
    color: 'text-green-500',
    models: ['gpt-4-turbo', 'gpt-4o', 'gpt-3.5-turbo'],
    strengths: 'General purpose with function calling'
  },
  local: {
    name: 'Local Models',
    icon: Monitor,
    color: 'text-gray-500',
    models: ['llama-3', 'mistral', 'codellama'],
    strengths: 'Privacy-focused, offline capable'
  }
};

const FRAMEWORKS = {
  langchain: {
    name: 'LangChain/LangGraph',
    icon: GitBranch,
    description: 'Best for complex stateful workflows',
    color: 'bg-green-500/10 text-green-500'
  },
  crewai: {
    name: 'CrewAI',
    icon: Users,
    description: 'Rapid prototyping with role-based agents',
    color: 'bg-blue-500/10 text-blue-500'
  },
  autogen: {
    name: 'Microsoft AutoGen',
    icon: Workflow,
    description: 'Enterprise multi-agent conversations',
    color: 'bg-purple-500/10 text-purple-500'
  },
  semantic_kernel: {
    name: 'Semantic Kernel',
    icon: Grid3x3,
    description: 'Integrate AI into existing apps',
    color: 'bg-orange-500/10 text-orange-500'
  },
  custom: {
    name: 'Custom',
    icon: Code,
    description: 'Direct implementation with full control',
    color: 'bg-gray-500/10 text-gray-500'
  }
};

const POD_TYPES = {
  swarm: {
    name: 'Swarm',
    description: 'Parallel processing with consensus',
    icon: '🐝'
  },
  pipeline: {
    name: 'Pipeline',
    description: 'Sequential task processing',
    icon: '⚡'
  },
  mesh: {
    name: 'Mesh',
    description: 'Interconnected peer-to-peer',
    icon: '🕸️'
  },
  hierarchical: {
    name: 'Hierarchical',
    description: 'Manager-worker pattern',
    icon: '🏢'
  }
};

interface Agent {
  id: string;
  provider: string;
  model: string;
  role: string;
  framework: string;
}

interface AgentPod {
  id: string;
  name: string;
  type: string;
  agents: Agent[];
  deployment: string;
  project?: string;
}

export default function AgentPodBuilder() {
  const [availableOptions, setAvailableOptions] = useState<any>(null);
  const [podType, setPodType] = useState('swarm');
  const [podName, setPodName] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedFramework, setSelectedFramework] = useState('langchain');
  const [deployment, setDeployment] = useState('local');
  const [project, setProject] = useState('');
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [showAutoGenerate, setShowAutoGenerate] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [newAgent, setNewAgent] = useState<Partial<Agent>>({
    provider: 'anthropic',
    model: 'claude-sonnet-4',
    role: 'developer',
    framework: 'langchain'
  });

  // Fetch available options from backend
  useEffect(() => {
    fetchAvailableOptions();
  }, []);

  const fetchAvailableOptions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/agents/options');
      const data = await response.json();
      setAvailableOptions(data);
    } catch (error) {
      console.error('Failed to fetch options:', error);
    }
  };

  // Add agent to pod
  const addAgent = () => {
    const agent: Agent = {
      id: `agent-${Date.now()}`,
      provider: newAgent.provider!,
      model: newAgent.model!,
      role: newAgent.role!,
      framework: selectedFramework
    };
    setAgents([...agents, agent]);
    setShowAddAgent(false);
  };

  // Remove agent from pod
  const removeAgent = (agentId: string) => {
    setAgents(agents.filter(a => a.id !== agentId));
  };

  // Auto-generate agents based on requirements
  const autoGenerateAgents = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/agents/generate-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: requirements,
          framework: selectedFramework,
          deployment
        })
      });
      const configs = await response.json();
      
      // Add generated agents to pod
      const generatedAgents = configs.agents.map((config: any) => ({
        id: `agent-${Date.now()}-${Math.random()}`,
        provider: config.provider,
        model: config.model,
        role: config.role,
        framework: config.framework
      }));
      
      setAgents([...agents, ...generatedAgents]);
      setShowAutoGenerate(false);
      setRequirements('');
    } catch (error) {
      console.error('Failed to generate agents:', error);
    }
  };

  // Deploy the pod
  const deployPod = async () => {
    const pod: AgentPod = {
      id: `pod-${Date.now()}`,
      name: podName || `${podType}-pod-${Date.now()}`,
      type: podType,
      agents,
      deployment,
      project
    };

    try {
      const response = await fetch('http://localhost:3001/api/pods/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pod)
      });
      const result = await response.json();
      console.log('Pod deployed:', result);
      
      // Reset form
      setAgents([]);
      setPodName('');
    } catch (error) {
      console.error('Failed to deploy pod:', error);
    }
  };

  return (
    <div className="w-full h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Left Panel - Configuration */}
      <div className="w-1/3 border-r bg-white dark:bg-gray-800 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Pod Configuration</h2>
        
        {/* Pod Name */}
        <div className="mb-6">
          <Label htmlFor="pod-name">Pod Name</Label>
          <Input
            id="pod-name"
            value={podName}
            onChange={(e) => setPodName(e.target.value)}
            placeholder="e.g., FullStack Development Pod"
            className="mt-1"
          />
        </div>

        {/* Pod Type Selection */}
        <div className="mb-6">
          <Label>Pod Type</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {Object.entries(POD_TYPES).map(([key, pod]) => (
              <Card
                key={key}
                className={`cursor-pointer transition-all ${
                  podType === key ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setPodType(key)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{pod.icon}</span>
                    <div>
                      <p className="font-semibold text-sm">{pod.name}</p>
                      <p className="text-xs text-gray-500">{pod.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Framework Selection */}
        <div className="mb-6">
          <Label>Framework</Label>
          <Select value={selectedFramework} onValueChange={setSelectedFramework}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(FRAMEWORKS).map(([key, framework]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center space-x-2">
                    <framework.icon className="h-4 w-4" />
                    <span>{framework.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedFramework && (
            <p className="text-xs text-gray-500 mt-1">
              {FRAMEWORKS[selectedFramework as keyof typeof FRAMEWORKS].description}
            </p>
          )}
        </div>

        {/* Deployment Target */}
        <div className="mb-6">
          <Label>Deployment Target</Label>
          <Select value={deployment} onValueChange={setDeployment}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="local">Local (Process)</SelectItem>
              <SelectItem value="remote">Remote Server</SelectItem>
              <SelectItem value="docker">Docker Container</SelectItem>
              <SelectItem value="kubernetes">Kubernetes</SelectItem>
              <SelectItem value="aws">AWS Lambda</SelectItem>
              <SelectItem value="gcp">Google Cloud Run</SelectItem>
              <SelectItem value="azure">Azure Functions</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Project Assignment */}
        <div className="mb-6">
          <Label htmlFor="project">Assign to Project</Label>
          <Input
            id="project"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            placeholder="e.g., NOT_TODAY"
            className="mt-1"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button className="w-full" onClick={() => setShowAutoGenerate(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Auto-Generate Agents
          </Button>
          <Button variant="outline" className="w-full" onClick={() => setShowAddAgent(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Agent Manually
          </Button>
        </div>
      </div>

      {/* Right Panel - Visual Builder */}
      <div className="flex-1 p-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Agent Pod Visualization</h2>
          <div className="space-x-2">
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Import Config
            </Button>
            <Button variant="outline" size="sm">
              <Save className="mr-2 h-4 w-4" />
              Save Template
            </Button>
            <Button 
              onClick={deployPod}
              disabled={agents.length === 0}
              className="bg-green-500 hover:bg-green-600"
            >
              <Play className="mr-2 h-4 w-4" />
              Deploy Pod
            </Button>
          </div>
        </div>

        {/* Pod Visualization */}
        <Card className="h-[calc(100%-100px)]">
          <CardContent className="p-6 h-full">
            {agents.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Brain className="h-16 w-16 mx-auto mb-4" />
                  <p className="text-lg font-medium">No agents in pod</p>
                  <p className="text-sm">Add agents manually or auto-generate based on requirements</p>
                </div>
              </div>
            ) : (
              <div className="h-full overflow-auto">
                {/* Pod Type Visualization */}
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold flex items-center">
                      <span className="text-2xl mr-2">{POD_TYPES[podType as keyof typeof POD_TYPES].icon}</span>
                      {POD_TYPES[podType as keyof typeof POD_TYPES].name} Configuration
                    </h3>
                    <Badge>{agents.length} agents</Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    {POD_TYPES[podType as keyof typeof POD_TYPES].description}
                  </p>
                </div>

                {/* Agent Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {agents.map((agent, index) => {
                    const provider = PROVIDERS[agent.provider as keyof typeof PROVIDERS];
                    const Icon = provider.icon;
                    
                    return (
                      <Card key={agent.id} className="relative">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <Icon className={`h-6 w-6 ${provider.color}`} />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={() => removeAgent(agent.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <CardTitle className="text-sm mt-2">Agent {index + 1}</CardTitle>
                          <CardDescription className="text-xs">{agent.role}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Provider:</span>
                              <span className="font-medium">{provider.name}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Model:</span>
                              <span className="font-medium">{agent.model}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Framework:</span>
                              <span className="font-medium">{agent.framework}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Pod Flow Visualization */}
                {podType === 'pipeline' && agents.length > 1 && (
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <h4 className="font-semibold mb-3">Pipeline Flow</h4>
                    <div className="flex items-center space-x-2 overflow-x-auto">
                      {agents.map((agent, index) => (
                        <React.Fragment key={agent.id}>
                          <div className="flex flex-col items-center min-w-[100px]">
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <span className="text-sm font-semibold">{index + 1}</span>
                            </div>
                            <span className="text-xs mt-1">{agent.role}</span>
                          </div>
                          {index < agents.length - 1 && (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Agent Dialog */}
      <Dialog open={showAddAgent} onOpenChange={setShowAddAgent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Agent to Pod</DialogTitle>
            <DialogDescription>Configure a new agent for your pod</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Provider</Label>
              <Select 
                value={newAgent.provider} 
                onValueChange={(v) => setNewAgent({...newAgent, provider: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROVIDERS).map(([key, provider]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center space-x-2">
                        <provider.icon className={`h-4 w-4 ${provider.color}`} />
                        <span>{provider.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Model</Label>
              <Select 
                value={newAgent.model} 
                onValueChange={(v) => setNewAgent({...newAgent, model: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {newAgent.provider && PROVIDERS[newAgent.provider as keyof typeof PROVIDERS].models.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select 
                value={newAgent.role} 
                onValueChange={(v) => setNewAgent({...newAgent, role: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="architect">Architect</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="reviewer">Reviewer</SelectItem>
                  <SelectItem value="tester">Tester</SelectItem>
                  <SelectItem value="documenter">Documenter</SelectItem>
                  <SelectItem value="security">Security Analyst</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={addAgent}>Add Agent</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auto-Generate Dialog */}
      <Dialog open={showAutoGenerate} onOpenChange={setShowAutoGenerate}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Auto-Generate Agents</DialogTitle>
            <DialogDescription>
              Describe your requirements and I&apos;ll generate the appropriate agents
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Requirements</Label>
              <Textarea
                placeholder="E.g., I need to build a full-stack web application with React frontend, Python backend API, PostgreSQL database, with code review and security validation..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                <Info className="inline h-4 w-4 mr-1" />
                Based on your requirements, I&apos;ll select the best providers, models, and frameworks to create an optimal agent pod configuration.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={autoGenerateAgents}>Generate Agents</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}