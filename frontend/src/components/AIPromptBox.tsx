'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, X, Maximize2, Minimize2, Settings, Wand2 } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface AIPromptBoxProps {
  onAgentGenerate?: (agents: any[]) => void;
  onCommandExecute?: (command: string, response: string) => void;
}

export default function AIPromptBox({ onAgentGenerate, onCommandExecute }: AIPromptBoxProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedModel, setSelectedModel] = useState('claude-sonnet-4');
  const [conversation, setConversation] = useState<Array<{ role: string; content: string }>>([]);
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  // Available models
  const models = [
    { value: 'claude-sonnet-4', name: 'Claude Sonnet', provider: 'Anthropic' },
    { value: 'claude-opus-4.1', name: 'Claude Opus', provider: 'Anthropic' },
    { value: 'gemini-1.5-pro', name: 'Gemini Pro', provider: 'Google' },
    { value: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
    { value: 'local-llama', name: 'Local Llama', provider: 'Local' }
  ];

  // Predefined prompts for quick actions
  const quickPrompts = [
    { icon: '🚀', text: 'Create a full-stack development pod', action: 'generate_fullstack' },
    { icon: '🔒', text: 'Add security review agents', action: 'generate_security' },
    { icon: '📊', text: 'Create data analysis pipeline', action: 'generate_analytics' },
    { icon: '🎨', text: 'Build creative content team', action: 'generate_creative' },
    { icon: '🧪', text: 'Setup testing & QA agents', action: 'generate_testing' }
  ];

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = prompt;
    setPrompt('');
    
    // Add to conversation
    setConversation(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Check if it's an agent generation request
      if (userMessage.toLowerCase().includes('create') || 
          userMessage.toLowerCase().includes('generate') || 
          userMessage.toLowerCase().includes('build') ||
          userMessage.toLowerCase().includes('agent') ||
          userMessage.toLowerCase().includes('pod')) {
        
        // Call agent generation endpoint
        const response = await fetch('http://localhost:3001/api/ai/generate-agents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userMessage,
            model: selectedModel,
            context: {
              currentAgents: [], // Could pass current agents on canvas
              project: null
            }
          })
        });

        const result = await response.json();
        
        if (result.agents && result.agents.length > 0) {
          setConversation(prev => [...prev, { 
            role: 'assistant', 
            content: `Generated ${result.agents.length} agents: ${result.agents.map((a: any) => a.name).join(', ')}. Drag them onto the canvas to use them!` 
          }]);
          
          // Pass generated agents to parent
          onAgentGenerate?.(result.agents);
        } else {
          setConversation(prev => [...prev, { 
            role: 'assistant', 
            content: result.message || 'I can help you create agents. Try asking me to "create a full-stack development pod" or "generate agents for e-commerce platform".' 
          }]);
        }
      } else {
        // General LLM chat
        const response = await fetch('http://localhost:3001/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userMessage,
            model: selectedModel,
            conversation: conversation.slice(-10) // Send last 10 messages for context
          })
        });

        const result = await response.json();
        setConversation(prev => [...prev, { 
          role: 'assistant', 
          content: result.response || 'How can I help you create AI agents?' 
        }]);
        
        // Execute any commands if present
        if (result.command) {
          onCommandExecute?.(result.command, result.response);
        }
      }
    } catch (error) {
      console.error('AI request failed:', error);
      setConversation(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (action: string) => {
    const quickPrompt = quickPrompts.find(p => p.action === action);
    if (quickPrompt) {
      setPrompt(quickPrompt.text);
      handleSubmit();
    }
  };

  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
      isExpanded ? 'w-[600px] h-[400px]' : 'w-[500px]'
    }`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-500" />
            <span className="font-semibold text-sm">AI Assistant</span>
            <Badge variant="outline" className="text-xs">
              {models.find(m => m.value === selectedModel)?.name}
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setConversation([])}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-3 border-b bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Model:</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-48 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {models.map(model => (
                    <SelectItem key={model.value} value={model.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{model.name}</span>
                        <Badge variant="outline" className="text-xs ml-2">{model.provider}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="p-2 border-b flex space-x-2 overflow-x-auto">
          {quickPrompts.map((quick, index) => (
            <Button
              key={index}
              size="sm"
              variant="outline"
              onClick={() => handleQuickPrompt(quick.action)}
              className="flex-shrink-0"
            >
              <span className="mr-1">{quick.icon}</span>
              <span className="text-xs">{quick.text}</span>
            </Button>
          ))}
        </div>

        {/* Conversation History (if expanded) */}
        {isExpanded && conversation.length > 0 && (
          <div className="h-48 overflow-y-auto p-3 space-y-2 bg-gray-50 dark:bg-gray-900">
            {conversation.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-2 rounded-lg text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
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
                    handleSubmit();
                  }
                }}
                placeholder="Ask me to create agents, pods, or help with your project..."
                className="resize-none pr-10 min-h-[40px] max-h-[120px]"
                disabled={isLoading}
              />
              <Sparkles className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isLoading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <p>💡 Try: &ldquo;Create a full-stack pod with Claude for coding and Gemini for testing&rdquo;</p>
          </div>
        </div>
      </div>
    </div>
  );
}