'use client';

import React, { useState, useEffect } from 'react';
import { 
  Code, Sparkles, FileText, GitBranch, Terminal, Play, Save, 
  ChevronRight, Folder, Settings, Plus, Clock, Star
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import TerminalViewer from './TerminalViewer';
import ProjectPanel from './ProjectPanel';
import SettingsPanel from './SettingsPanel';

// Command Templates
const COMMAND_TEMPLATES = {
  claude: [
    {
      id: 'claude-generate',
      name: 'Generate Code',
      icon: Code,
      command: 'claude code',
      description: 'Generate new code with Claude',
      requiresInput: true,
      inputPlaceholder: 'Describe what you want to build...'
    },
    {
      id: 'claude-review',
      name: 'Review Code',
      icon: FileText,
      command: 'claude review {{file}}',
      description: 'Review code in a specific file',
      requiresFile: true
    },
    {
      id: 'claude-refactor',
      name: 'Refactor Code',
      icon: Sparkles,
      command: 'claude refactor',
      description: 'Refactor and improve existing code',
      requiresInput: true,
      inputPlaceholder: 'Describe refactoring goals...'
    }
  ],
  gemini: [
    {
      id: 'gemini-analyze',
      name: 'Analyze Project',
      icon: FileText,
      command: 'gemini analyze',
      description: 'Analyze project structure and suggest improvements',
      requiresPath: true
    },
    {
      id: 'gemini-test',
      name: 'Generate Tests',
      icon: Code,
      command: 'gemini test {{file}}',
      description: 'Generate test cases for code',
      requiresFile: true
    }
  ],
  git: [
    {
      id: 'git-status',
      name: 'Git Status',
      icon: GitBranch,
      command: 'git status',
      description: 'Check repository status'
    },
    {
      id: 'git-diff',
      name: 'Git Diff',
      icon: GitBranch,
      command: 'git diff',
      description: 'View uncommitted changes'
    },
    {
      id: 'git-log',
      name: 'Git Log',
      icon: GitBranch,
      command: 'git log --oneline -10',
      description: 'View recent commits'
    }
  ],
  workflows: [
    {
      id: 'full-feature',
      name: 'Full Stack Feature',
      icon: Sparkles,
      description: 'Generate complete feature with Claude & Gemini',
      steps: [
        { command: 'claude code', input: 'Create backend API: {{description}}' },
        { command: 'claude code', input: 'Create frontend: {{description}}' },
        { command: 'gemini test', input: 'Generate tests for the feature' }
      ],
      requiresInput: true,
      inputPlaceholder: 'Describe the feature to build...'
    },
    {
      id: 'code-review',
      name: 'AI Code Review',
      icon: FileText,
      description: 'Comprehensive review with multiple AI tools',
      steps: [
        { command: 'git diff' },
        { command: 'claude review' },
        { command: 'gemini analyze' }
      ]
    }
  ]
};

export default function CommandComposer() {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [commandInput, setCommandInput] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const [customCommand, setCustomCommand] = useState('');
  const [recentCommands, setRecentCommands] = useState<any[]>([]);
  const [favoriteCommands, setFavoriteCommands] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showProjectPanel, setShowProjectPanel] = useState(true);
  const [terminalOutput, setTerminalOutput] = useState<any[]>([]);

  // Load recent commands from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentCommands');
    if (saved) {
      setRecentCommands(JSON.parse(saved));
    }
    
    const savedFavorites = localStorage.getItem('favoriteCommands');
    if (savedFavorites) {
      setFavoriteCommands(JSON.parse(savedFavorites));
    }
  }, []);

  const executeCommand = async (command: string, input?: string) => {
    // Replace variables in command
    let finalCommand = command;
    if (selectedFile && command.includes('{{file}}')) {
      finalCommand = command.replace('{{file}}', selectedFile);
    }
    if (input && command.includes('{{input}}')) {
      finalCommand = command.replace('{{input}}', input);
    }

    // Add to recent commands
    const newCommand = {
      command: finalCommand,
      timestamp: new Date().toISOString(),
      project: selectedProject
    };
    
    const updatedRecent = [newCommand, ...recentCommands].slice(0, 10);
    setRecentCommands(updatedRecent);
    localStorage.setItem('recentCommands', JSON.stringify(updatedRecent));

    // Execute via API
    try {
      const response = await fetch('http://localhost:3001/api/cli/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: finalCommand,
          projectPath: selectedProject,
          input: input
        })
      });

      const result = await response.json();
      console.log('Command executed:', result);
    } catch (error) {
      console.error('Failed to execute command:', error);
    }
  };

  const executeWorkflow = async (workflow: any) => {
    for (const step of workflow.steps) {
      await executeCommand(step.command, step.input);
      // Add delay between steps
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const toggleFavorite = (commandId: string) => {
    const updated = favoriteCommands.includes(commandId)
      ? favoriteCommands.filter(id => id !== commandId)
      : [...favoriteCommands, commandId];
    
    setFavoriteCommands(updated);
    localStorage.setItem('favoriteCommands', JSON.stringify(updated));
  };

  return (
    <div className="w-full h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Left Sidebar - Project Panel */}
      {showProjectPanel && (
        <div className="w-80 border-r bg-white dark:bg-gray-800">
          <ProjectPanel onSelectProject={setSelectedProject} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-white dark:bg-gray-800 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">CLI Command Center</h1>
              {selectedProject && (
                <Badge variant="outline">
                  <Folder className="h-3 w-3 mr-1" />
                  {selectedProject}
                </Badge>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProjectPanel(!showProjectPanel)}
              >
                <Folder className="h-4 w-4 mr-1" />
                Projects
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Command Templates */}
          <div className="flex-1 p-4 overflow-y-auto">
            <Tabs defaultValue="claude" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="claude">Claude</TabsTrigger>
                <TabsTrigger value="gemini">Gemini</TabsTrigger>
                <TabsTrigger value="git">Git</TabsTrigger>
                <TabsTrigger value="workflows">Workflows</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>

              {/* Claude Commands */}
              <TabsContent value="claude" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {COMMAND_TEMPLATES.claude.map(template => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <template.icon className="h-5 w-5" />
                            <span>{template.name}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleFavorite(template.id)}
                          >
                            <Star 
                              className={`h-4 w-4 ${
                                favoriteCommands.includes(template.id) 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : ''
                              }`} 
                            />
                          </Button>
                        </CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                            {template.command}
                          </div>
                          
                          {template.requiresInput && (
                            <Textarea
                              placeholder={template.inputPlaceholder}
                              value={commandInput}
                              onChange={(e) => setCommandInput(e.target.value)}
                              className="min-h-[80px]"
                            />
                          )}
                          
                          {template.requiresFile && (
                            <Input
                              placeholder="Enter file path..."
                              value={selectedFile}
                              onChange={(e) => setSelectedFile(e.target.value)}
                            />
                          )}
                          
                          <Button 
                            className="w-full"
                            onClick={() => executeCommand(template.command, commandInput)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Execute
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Gemini Commands */}
              <TabsContent value="gemini" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {COMMAND_TEMPLATES.gemini.map(template => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <template.icon className="h-5 w-5" />
                          <span>{template.name}</span>
                        </CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                            {template.command}
                          </div>
                          
                          {template.requiresFile && (
                            <Input
                              placeholder="Enter file path..."
                              value={selectedFile}
                              onChange={(e) => setSelectedFile(e.target.value)}
                            />
                          )}
                          
                          <Button 
                            className="w-full"
                            onClick={() => executeCommand(template.command)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Execute
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Git Commands */}
              <TabsContent value="git" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {COMMAND_TEMPLATES.git.map(template => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-sm">
                          <template.icon className="h-4 w-4" />
                          <span>{template.name}</span>
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          className="w-full"
                          size="sm"
                          onClick={() => executeCommand(template.command)}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Run
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Workflows */}
              <TabsContent value="workflows" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {COMMAND_TEMPLATES.workflows.map(workflow => (
                    <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <workflow.icon className="h-5 w-5" />
                          <span>{workflow.name}</span>
                        </CardTitle>
                        <CardDescription>{workflow.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            {workflow.steps.map((step, index) => (
                              <div key={index} className="flex items-center space-x-2 text-sm">
                                <Badge variant="outline">{index + 1}</Badge>
                                <span className="font-mono text-xs">{step.command}</span>
                              </div>
                            ))}
                          </div>
                          
                          {workflow.requiresInput && (
                            <Textarea
                              placeholder={workflow.inputPlaceholder}
                              value={commandInput}
                              onChange={(e) => setCommandInput(e.target.value)}
                              className="min-h-[80px]"
                            />
                          )}
                          
                          <Button 
                            className="w-full"
                            onClick={() => executeWorkflow(workflow)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Run Workflow
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Custom Command */}
              <TabsContent value="custom" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Custom Command</CardTitle>
                    <CardDescription>Run any CLI command directly</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Command</Label>
                      <Input
                        placeholder="Enter any command (e.g., npm install, python script.py)"
                        value={customCommand}
                        onChange={(e) => setCustomCommand(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            executeCommand(customCommand);
                          }
                        }}
                      />
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => executeCommand(customCommand)}
                      disabled={!customCommand}
                    >
                      <Terminal className="h-4 w-4 mr-2" />
                      Execute Command
                    </Button>

                    {/* Recent Commands */}
                    {recentCommands.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-semibold mb-2 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Recent Commands
                        </h3>
                        <div className="space-y-1">
                          {recentCommands.slice(0, 5).map((cmd, index) => (
                            <div 
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                              onClick={() => setCustomCommand(cmd.command)}
                            >
                              <span className="font-mono text-xs">{cmd.command}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  executeCommand(cmd.command);
                                }}
                              >
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Terminal Output */}
          <div className="w-[500px] border-l p-4">
            <TerminalViewer 
              onExecute={executeCommand}
              className="h-full"
            />
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel 
          onClose={() => setShowSettings(false)}
          onSave={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}