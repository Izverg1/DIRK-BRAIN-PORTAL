'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Bot, Settings, Play, Pause, Trash2, ChevronRight, Brain, Code, Image, Monitor, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface Agent {
  id: string;
  name: string;
  type: 'DIRK.c' | 'DIRK.g' | 'DIRK.desktop' | 'Mr.Wolf';
  status: 'active' | 'idle' | 'stopped';
  project: string;
  capabilities: string[];
  performance: number;
  tasksCompleted: number;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'planning' | 'completed';
  agents: string[];
}

const agentTypeInfo = {
  'DIRK.c': { 
    icon: Code, 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-500/10',
    description: 'Computational agent for code implementation, testing, and deployment'
  },
  'DIRK.g': { 
    icon: Image, 
    color: 'text-green-500', 
    bgColor: 'bg-green-500/10',
    description: 'Generative agent for creative tasks, design, and content generation'
  },
  'DIRK.desktop': { 
    icon: Monitor, 
    color: 'text-purple-500', 
    bgColor: 'bg-purple-500/10',
    description: 'Desktop automation agent for UI interactions and system tasks'
  },
  'Mr.Wolf': { 
    icon: Shield, 
    color: 'text-red-500', 
    bgColor: 'bg-red-500/10',
    description: 'Security and code review agent for validation and compliance'
  }
};

export default function AgentManager() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'agent-1',
      name: 'CodeBuilder-01',
      type: 'DIRK.c',
      status: 'active',
      project: 'DIRK Brain Portal',
      capabilities: ['TypeScript', 'React', 'API Integration'],
      performance: 92,
      tasksCompleted: 47,
      createdAt: '2024-01-15'
    },
    {
      id: 'agent-2',
      name: 'Designer-01',
      type: 'DIRK.g',
      status: 'idle',
      project: 'NOT_TODAY',
      capabilities: ['UI Design', 'Content Generation', 'Image Processing'],
      performance: 88,
      tasksCompleted: 23,
      createdAt: '2024-01-14'
    }
  ]);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'proj-1',
      name: 'DIRK Brain Portal',
      description: 'AI Agent Orchestration Platform',
      status: 'active',
      agents: ['agent-1']
    },
    {
      id: 'proj-2',
      name: 'NOT_TODAY',
      description: 'Task management and automation',
      status: 'planning',
      agents: ['agent-2']
    },
    {
      id: 'proj-3',
      name: 'CrawlZilla',
      description: 'Web scraping and data extraction',
      status: 'active',
      agents: []
    }
  ]);

  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [showGenerateAgent, setShowGenerateAgent] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    type: 'DIRK.c',
    project: '',
    capabilities: ''
  });
  const [requirements, setRequirements] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('all');

  // Create new agent
  const handleCreateAgent = async () => {
    const agent: Agent = {
      id: `agent-${Date.now()}`,
      name: newAgent.name,
      type: newAgent.type as Agent['type'],
      status: 'idle',
      project: newAgent.project,
      capabilities: newAgent.capabilities.split(',').map(c => c.trim()),
      performance: 100,
      tasksCompleted: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    try {
      const response = await fetch('http://localhost:3001/api/agents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agent)
      });
      
      if (response.ok) {
        setAgents([...agents, agent]);
        setShowCreateAgent(false);
        setNewAgent({ name: '', type: 'DIRK.c', project: '', capabilities: '' });
      }
    } catch (error) {
      console.error('Failed to create agent:', error);
      // Still add locally for demo
      setAgents([...agents, agent]);
      setShowCreateAgent(false);
      setNewAgent({ name: '', type: 'DIRK.c', project: '', capabilities: '' });
    }
  };

  // Generate agents based on requirements
  const handleGenerateAgents = async () => {
    // Analyze requirements and generate appropriate agents
    const generatedAgents: Agent[] = [];
    
    // Simple keyword-based generation (in real implementation, this would use NLP)
    if (requirements.toLowerCase().includes('frontend') || requirements.toLowerCase().includes('ui')) {
      generatedAgents.push({
        id: `agent-${Date.now()}-1`,
        name: `Frontend-${Date.now()}`,
        type: 'DIRK.c',
        status: 'idle',
        project: selectedProject === 'all' ? '' : selectedProject,
        capabilities: ['React', 'TypeScript', 'CSS', 'UI Components'],
        performance: 100,
        tasksCompleted: 0,
        createdAt: new Date().toISOString().split('T')[0]
      });
    }
    
    if (requirements.toLowerCase().includes('backend') || requirements.toLowerCase().includes('api')) {
      generatedAgents.push({
        id: `agent-${Date.now()}-2`,
        name: `Backend-${Date.now()}`,
        type: 'DIRK.c',
        status: 'idle',
        project: selectedProject === 'all' ? '' : selectedProject,
        capabilities: ['Python', 'FastAPI', 'Database', 'REST APIs'],
        performance: 100,
        tasksCompleted: 0,
        createdAt: new Date().toISOString().split('T')[0]
      });
    }
    
    if (requirements.toLowerCase().includes('design') || requirements.toLowerCase().includes('creative')) {
      generatedAgents.push({
        id: `agent-${Date.now()}-3`,
        name: `Designer-${Date.now()}`,
        type: 'DIRK.g',
        status: 'idle',
        project: selectedProject === 'all' ? '' : selectedProject,
        capabilities: ['UI/UX Design', 'Graphics', 'Content Creation'],
        performance: 100,
        tasksCompleted: 0,
        createdAt: new Date().toISOString().split('T')[0]
      });
    }
    
    if (requirements.toLowerCase().includes('security') || requirements.toLowerCase().includes('review')) {
      generatedAgents.push({
        id: `agent-${Date.now()}-4`,
        name: `SecurityWolf-${Date.now()}`,
        type: 'Mr.Wolf',
        status: 'idle',
        project: selectedProject === 'all' ? '' : selectedProject,
        capabilities: ['Security Analysis', 'Code Review', 'Compliance'],
        performance: 100,
        tasksCompleted: 0,
        createdAt: new Date().toISOString().split('T')[0]
      });
    }

    if (generatedAgents.length > 0) {
      setAgents([...agents, ...generatedAgents]);
      setShowGenerateAgent(false);
      setRequirements('');
    }
  };

  // Toggle agent status
  const toggleAgentStatus = (agentId: string) => {
    setAgents(agents.map(agent => 
      agent.id === agentId 
        ? { ...agent, status: agent.status === 'active' ? 'idle' : 'active' }
        : agent
    ));
  };

  // Assign agent to project
  const assignAgentToProject = (agentId: string, projectId: string) => {
    setAgents(agents.map(agent =>
      agent.id === agentId ? { ...agent, project: projectId } : agent
    ));
  };

  // Delete agent
  const deleteAgent = (agentId: string) => {
    setAgents(agents.filter(agent => agent.id !== agentId));
  };

  const filteredAgents = selectedProject === 'all' 
    ? agents 
    : agents.filter(a => a.project === selectedProject);

  return (
    <div className="w-full h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Brain className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold">DIRK Brain - Agent Manager</h1>
              <p className="text-sm text-gray-500">Create, generate, and manage AI agents across projects</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Dialog open={showGenerateAgent} onOpenChange={setShowGenerateAgent}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Brain className="mr-2 h-4 w-4" />
                  Generate Agents
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Generate Agents from Requirements</DialogTitle>
                  <DialogDescription>
                    Describe your project requirements and I&apos;ll generate the appropriate agents
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="requirements">Project Requirements</Label>
                    <Textarea
                      id="requirements"
                      placeholder="E.g., I need a full-stack web application with frontend in React, backend API, and security validation..."
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      className="min-h-[150px]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="target-project">Target Project</Label>
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Unassigned</SelectItem>
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.name}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleGenerateAgents}>Generate Agents</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showCreateAgent} onOpenChange={setShowCreateAgent}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Agent
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Agent</DialogTitle>
                  <DialogDescription>
                    Configure a new AI agent for your projects
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Agent Name</Label>
                    <Input
                      id="name"
                      value={newAgent.name}
                      onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                      placeholder="e.g., CodeBuilder-03"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Agent Type</Label>
                    <Select value={newAgent.type} onValueChange={(value) => setNewAgent({...newAgent, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(agentTypeInfo).map(([type, info]) => (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center">
                              <info.icon className={`mr-2 h-4 w-4 ${info.color}`} />
                              {type} - {info.description}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="project">Assign to Project</Label>
                    <Select value={newAgent.project} onValueChange={(value) => setNewAgent({...newAgent, project: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {projects.map(project => (
                          <SelectItem key={project.id} value={project.name}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="capabilities">Capabilities (comma-separated)</Label>
                    <Input
                      id="capabilities"
                      value={newAgent.capabilities}
                      onChange={(e) => setNewAgent({...newAgent, capabilities: e.target.value})}
                      placeholder="e.g., TypeScript, React, Testing"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateAgent}>Create Agent</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - Projects */}
        <div className="w-64 border-r bg-white dark:bg-gray-800 p-4">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">PROJECTS</h2>
          <div className="space-y-1">
            <Button
              variant={selectedProject === 'all' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setSelectedProject('all')}
            >
              All Projects
              <Badge variant="secondary" className="ml-auto">
                {agents.length}
              </Badge>
            </Button>
            {projects.map(project => (
              <Button
                key={project.id}
                variant={selectedProject === project.name ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedProject(project.name)}
              >
                <div className="flex items-center w-full">
                  <span className="truncate">{project.name}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {agents.filter(a => a.project === project.name).length}
                  </Badge>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Agent Grid */}
        <div className="flex-1 p-6 overflow-auto">
          <Tabs defaultValue="grid" className="w-full">
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
            </TabsList>

            <TabsContent value="grid" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAgents.map(agent => {
                  const typeInfo = agentTypeInfo[agent.type];
                  const Icon = typeInfo.icon;
                  
                  return (
                    <Card key={agent.id} className="relative">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className={`p-2 rounded-lg ${typeInfo.bgColor}`}>
                            <Icon className={`h-6 w-6 ${typeInfo.color}`} />
                          </div>
                          <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                            {agent.status}
                          </Badge>
                        </div>
                        <CardTitle className="mt-3">{agent.name}</CardTitle>
                        <CardDescription>{agent.type}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">Project</p>
                            <p className="font-medium">{agent.project || 'Unassigned'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Performance</p>
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${agent.performance}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{agent.performance}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Capabilities</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {agent.capabilities.map((cap, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {cap}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t">
                            <span className="text-sm text-gray-500">
                              {agent.tasksCompleted} tasks completed
                            </span>
                            <div className="flex space-x-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => toggleAgentStatus(agent.id)}
                              >
                                {agent.status === 'active' ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => deleteAgent(agent.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="table" className="mt-6">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agent</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>Tasks</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAgents.map(agent => {
                        const typeInfo = agentTypeInfo[agent.type];
                        const Icon = typeInfo.icon;
                        
                        return (
                          <TableRow key={agent.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-2">
                                <Icon className={`h-4 w-4 ${typeInfo.color}`} />
                                <span>{agent.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{agent.type}</TableCell>
                            <TableCell>
                              <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                                {agent.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{agent.project || 'Unassigned'}</TableCell>
                            <TableCell>{agent.performance}%</TableCell>
                            <TableCell>{agent.tasksCompleted}</TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleAgentStatus(agent.id)}
                                >
                                  {agent.status === 'active' ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => deleteAgent(agent.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}