'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Play, Square, Trash2, Download, Copy, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

interface TerminalOutput {
  id: string;
  command: string;
  output: string;
  error?: string;
  exitCode?: number;
  timestamp: string;
  isRunning?: boolean;
}

interface TerminalViewerProps {
  onExecute?: (command: string) => void;
  className?: string;
}

export default function TerminalViewer({ onExecute, className = '' }: TerminalViewerProps) {
  const [outputs, setOutputs] = useState<TerminalOutput[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket for real-time output
    connectWebSocket();
    
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      // Only connect if not already connected
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        return;
      }
      
      ws.current = new WebSocket('ws://localhost:3001/ws/terminal');
      
      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };
      
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'output') {
          // Update existing command output
          setOutputs(prev => prev.map(item => 
            item.id === data.commandId 
              ? { ...item, output: item.output + data.data }
              : item
          ));
        } else if (data.type === 'command_start') {
          // Add new command to outputs
          setOutputs(prev => [...prev, {
            id: data.commandId,
            command: data.command,
            output: '',
            timestamp: new Date().toISOString(),
            isRunning: true
          }]);
        } else if (data.type === 'command_complete') {
          // Mark command as complete
          setOutputs(prev => prev.map(item => 
            item.id === data.commandId 
              ? { ...item, isRunning: false, exitCode: data.exitCode }
              : item
          ));
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket connection failed - this is normal if not using real-time features');
        setIsConnected(false);
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        // Don't auto-reconnect to avoid console spam
        // User can manually reconnect if needed
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    const commandId = `cmd-${Date.now()}`;
    
    // Add to outputs immediately
    setOutputs(prev => [...prev, {
      id: commandId,
      command,
      output: 'Executing command...\n',
      timestamp: new Date().toISOString(),
      isRunning: true
    }]);

    // Clear input
    setCurrentCommand('');

    // Execute via parent callback or API
    if (onExecute) {
      onExecute(command);
    } else {
      // Direct API call
      try {
        const response = await fetch('http://localhost:3001/api/cli/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command })
        });

        const result = await response.json();
        
        setOutputs(prev => prev.map(item => 
          item.id === commandId 
            ? { 
                ...item, 
                output: result.output || result.error || 'Command completed',
                error: result.error,
                exitCode: result.exitCode,
                isRunning: false 
              }
            : item
        ));
      } catch (error) {
        setOutputs(prev => prev.map(item => 
          item.id === commandId 
            ? { 
                ...item, 
                output: `Error: ${error}`,
                error: String(error),
                isRunning: false 
              }
            : item
        ));
      }
    }
    
    // Scroll to bottom
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  };

  const clearTerminal = () => {
    setOutputs([]);
  };

  const copyOutput = (output: string) => {
    navigator.clipboard.writeText(output);
  };

  const downloadHistory = () => {
    const content = outputs.map(item => 
      `$ ${item.command}\n${item.output}${item.error ? '\nError: ' + item.error : ''}\n---\n`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `terminal-history-${Date.now()}.txt`;
    a.click();
  };

  return (
    <Card className={`flex flex-col bg-gray-900 text-gray-100 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Terminal className="h-4 w-4" />
          <span className="font-mono text-sm">Terminal Output</span>
          {outputs.some(o => o.isRunning) && (
            <Badge variant="outline" className="text-green-400 border-green-400">
              Running
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={downloadHistory}
            className="text-gray-400 hover:text-gray-100"
          >
            <Download className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearTerminal}
            className="text-gray-400 hover:text-gray-100"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-gray-100"
          >
            {isMinimized ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* Terminal Output */}
      {!isMinimized && (
        <>
          <div 
            ref={terminalRef}
            className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-2 max-h-[400px]"
            style={{ backgroundColor: '#1a1a1a' }}
          >
            {outputs.length === 0 ? (
              <div className="text-gray-500">
                Ready to execute commands. Type a command below or use the command templates.
              </div>
            ) : (
              outputs.map((item) => (
                <div key={item.id} className="space-y-1">
                  {/* Command */}
                  <div className="flex items-start space-x-2">
                    <span className="text-green-400">$</span>
                    <div className="flex-1">
                      <span className="text-blue-400">{item.command}</span>
                      {item.isRunning && (
                        <span className="ml-2 animate-pulse text-yellow-400">●</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyOutput(item.output)}
                      className="opacity-0 hover:opacity-100 h-4 w-4 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {/* Output */}
                  {item.output && (
                    <div className="pl-6 whitespace-pre-wrap text-gray-300">
                      {item.output}
                    </div>
                  )}
                  
                  {/* Error */}
                  {item.error && (
                    <div className="pl-6 whitespace-pre-wrap text-red-400">
                      {item.error}
                    </div>
                  )}
                  
                  {/* Exit Code */}
                  {item.exitCode !== undefined && !item.isRunning && (
                    <div className="pl-6 text-gray-500">
                      Exit code: {item.exitCode}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Command Input */}
          <div className="border-t border-gray-700 p-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    executeCommand(currentCommand);
                  }
                }}
                placeholder="Enter command (e.g., claude code, gemini analyze, git status)"
                className="flex-1 bg-gray-800 text-gray-100 px-3 py-2 rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={() => executeCommand(currentCommand)}
                disabled={!currentCommand.trim()}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Command Hints */}
            <div className="mt-2 text-xs text-gray-500">
              Examples: 
              <span className="text-gray-400 ml-2">claude code</span>,
              <span className="text-gray-400 ml-2">gemini analyze main.py</span>,
              <span className="text-gray-400 ml-2">git status</span>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}