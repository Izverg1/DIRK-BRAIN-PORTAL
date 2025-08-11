'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, Bot, X, Maximize2, Minimize2, Settings, 
  Wand2, Users, Zap, Shield, Palette, Database, GitBranch,
  ChevronUp, ChevronDown
} from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';

interface SwarmTemplate {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  prompt: string;
  agents: number;
  coordination: string;
}

interface GeneratedSwarm {
  id: string;
  name: string;
  agents: any[];
  coordination: string;
  project?: string;
  status: string;
}

interface EnhancedAIPromptBoxProps {
  selectedProject?: string;
  onSwarmGenerated?: (swarm: GeneratedSwarm) => void;
  onCommandExecute?: (command: string, response: string) => void;
}

export default function EnhancedAIPromptBox({ 
  selectedProject, 
  onSwarmGenerated, 
  onCommandExecute 
}: EnhancedAIPromptBoxProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedModel, setSelectedModel] = useState('claude-sonnet-4');
  const [deploymentTarget, setDeploymentTarget] = useState('local');
  const [showTemplates, setShowTemplates] = useState(true);
  const [generatedSwarms, setGeneratedSwarms] = useState<GeneratedSwarm[]>([]);
  const [conversation, setConversation] = useState<Array<{ role: string; content: string }>>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Swarm templates for quick generation
  const swarmTemplates: SwarmTemplate[] = [
    {
      id: 'fullstack',
      name: 'Full Stack Team',
      icon: Zap,
      description: '2 Frontend + 2 Backend + 1 QA + 1 Designer',
      prompt: 'Create a full-stack development team with React frontend, Node.js backend, testing, and UI design capabilities',
      agents: 6,
      coordination: 'pipeline'
    },
    {
      id: 'security',
      name: 'Security Audit',
      icon: Shield,
      description: '3 Security + 2 QA + 1 Analyst',
      prompt: 'Build a security audit team for comprehensive vulnerability assessment and penetration testing',
      agents: 6,
      coordination: 'swarm'
    },
    {
      id: 'data',
      name: 'Data Pipeline',
      icon: Database,
      description: '3 Data Engineers + 2 Backend + 1 Analyst',
      prompt: 'Create a data processing pipeline team for ETL, analytics, and machine learning',
      agents: 6,
      coordination: 'pipeline'
    },
    {
      id: 'creative',
      name: 'Creative Team',
      icon: Palette,
      description: '2 Designers + 2 Writers + 1 Marketer',
      prompt: 'Build a creative content team for branding, UI/UX design, and marketing materials',
      agents: 5,
      coordination: 'parallel'
    },
    {
      id: 'microservice',
      name: 'Microservices',
      icon: GitBranch,
      description: '4 Backend + 2 DevOps + 2 QA',
      prompt: 'Create a microservices architecture team with Docker, Kubernetes, and CI/CD expertise',
      agents: 8,
      coordination: 'mesh'
    }
  ];

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [prompt]);

  // Generate swarm from natural language
  const generateSwarm = async (inputPrompt?: string) => {
    const finalPrompt = inputPrompt || prompt;
    if (!finalPrompt.trim() || isLoading) return;

    setIsLoading(true);
    
    // Add to conversation
    setConversation(prev => [...prev, { 
      role: 'user', 
      content: finalPrompt 
    }]);

    try {
      const response = await fetch('http://localhost:3001/api/ai/generate-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          model: selectedModel,
          project: selectedProject,
          deployment: deploymentTarget,
          context: {
            existingSwarms: generatedSwarms.length,
            preferredCoordination: null
          }
        })
      });

      const result = await response.json();
      
      if (result.success && result.swarm) {
        const swarm: GeneratedSwarm = {
          id: result.swarm.id,
          name: result.swarm.name,
          agents: result.swarm.agents,
          coordination: result.swarm.coordination,
          project: selectedProject,
          status: 'deployed'
        };
        
        // Add to generated swarms list
        setGeneratedSwarms(prev => [...prev, swarm]);
        
        // Add success message to conversation
        setConversation(prev => [...prev, { 
          role: 'assistant', 
          content: `✅ Generated "${swarm.name}" with ${swarm.agents.length} agents in ${swarm.coordination} formation. Agents are now deployed and ready to work on ${selectedProject || 'your project'}.`
        }]);
        
        // Notify parent component
        onSwarmGenerated?.(swarm);
        
        // Clear prompt
        setPrompt('');
      } else {
        setConversation(prev => [...prev, { 
          role: 'assistant', 
          content: `❌ Failed to generate swarm: ${result.error || 'Unknown error'}`
        }]);
      }
    } catch (error) {
      console.error('Failed to generate swarm:', error);
      setConversation(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ Error generating swarm. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Use template to generate swarm
  const useTemplate = (template: SwarmTemplate) => {
    setPrompt(template.prompt);
    generateSwarm(template.prompt);
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${
      isExpanded ? 'h-96' : 'h-auto'
    }`}>
      <Card className="mx-4 mb-4 bg-gray-900/95 backdrop-blur border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-blue-400" />
              <span className="font-semibold text-sm text-gray-100">AI Swarm Generator</span>
            </div>
            
            {selectedProject && (
              <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                Target: {selectedProject}
              </Badge>
            )}
            
            {generatedSwarms.length > 0 && (
              <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">
                {generatedSwarms.length} swarms active
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Deployment Target */}
            <Select value={deploymentTarget} onValueChange={setDeploymentTarget}>
              <SelectTrigger className="w-28 h-7 text-xs bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="cloud">Cloud</SelectItem>
              </SelectContent>
            </Select>

            {/* Model Selection */}
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-32 h-7 text-xs bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude-sonnet-4">Claude Sonnet</SelectItem>
                <SelectItem value="claude-opus-4.1">Claude Opus</SelectItem>
                <SelectItem value="gemini-1.5-pro">Gemini Pro</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
              </SelectContent>
            </Select>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowTemplates(!showTemplates)}
              className="text-gray-400 hover:text-gray-100"
            >
              <Wand2 className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-100"
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Templates Bar */}
        {showTemplates && (
          <div className="p-2 border-b border-gray-700 flex space-x-2 overflow-x-auto">
            {swarmTemplates.map(template => (
              <Button
                key={template.id}
                size="sm"
                variant="outline"
                onClick={() => useTemplate(template)}
                disabled={isLoading}
                className="flex-shrink-0 border-gray-700 hover:border-gray-600 text-gray-300 hover:text-gray-100"
              >
                <template.icon className="h-3 w-3 mr-1" />
                <span className="text-xs">{template.name}</span>
                <Badge variant="secondary" className="ml-2 text-xs">
                  {template.agents}
                </Badge>
              </Button>
            ))}
          </div>
        )}

        {/* Conversation History (if expanded) */}
        {isExpanded && conversation.length > 0 && (
          <div className="h-48 overflow-y-auto p-3 space-y-2 bg-gray-950/50">
            {conversation.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] p-2 rounded-lg text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-100'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="p-3">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    generateSwarm();
                  }
                }}
                placeholder={`Describe the agent swarm you need... (e.g., "Create a team of 5 agents for building an e-commerce platform with React frontend and Node.js backend")`}
                className="resize-none bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 pr-10"
                disabled={isLoading}
                rows={1}
              />
              <Sparkles className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
            </div>
            <Button
              onClick={() => generateSwarm()}
              disabled={!prompt.trim() || isLoading || !selectedProject}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <>
                  <Users className="h-4 w-4 mr-1" />
                  Generate
                </>
              )}
            </Button>
          </div>
          
          {/* Status/Help Text */}
          <div className="mt-2 flex items-center justify-between text-xs">
            <div className="text-gray-500">
              {!selectedProject ? (
                <span className="text-yellow-400">⚠️ Select a project first</span>
              ) : (
                <span>💡 Natural language → Intelligent agent swarms</span>
              )}
            </div>
            {generatedSwarms.length > 0 && (
              <div className="text-gray-400">
                Recent: {generatedSwarms[generatedSwarms.length - 1].name}
              </div>
            )}
          </div>
        </div>

        {/* Active Swarms Mini List (always visible) */}
        {generatedSwarms.length > 0 && !isExpanded && (
          <div className="px-3 pb-2 flex items-center space-x-2 overflow-x-auto">
            <span className="text-xs text-gray-500">Active:</span>
            {generatedSwarms.slice(-3).map(swarm => (
              <Badge 
                key={swarm.id} 
                variant="outline" 
                className="text-xs border-green-500/30 text-green-400"
              >
                {swarm.name} ({swarm.agents.length})
              </Badge>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}