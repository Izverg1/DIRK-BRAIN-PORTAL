'use client';

import { useState, useEffect, useRef } from 'react';
import { agentAPI, agentWebSocket } from '@/lib/apiClient';

interface TerminalLine {
  id: string;
  text: string;
  timestamp: number;
  type: 'command' | 'output' | 'error' | 'info' | 'success';
}

interface AgentDeployment {
  id: string;
  name: string;
  type: 'claude' | 'gpt' | 'gemini' | 'local';
  status: 'deploying' | 'active' | 'failed' | 'stopped';
  startTime: number;
  pid?: number;
}

// Agent deployment terminal interface for DIRK Portal
export default function DirkTerminalInterface({ className = '' }: { className?: string }) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [activeDeployments, setActiveDeployments] = useState<AgentDeployment[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize with welcome message
    const welcomeLines: TerminalLine[] = [
      {
        id: '1',
        text: 'DIRK BRAIN PORTAL - NEURAL TERMINAL v4.1.0',
        timestamp: Date.now(),
        type: 'info'
      },
      {
        id: '2',
        text: 'AI Agent Orchestration System Ready',
        timestamp: Date.now() + 100,
        type: 'success'
      },
      {
        id: '3',
        text: 'Type "help" for available commands',
        timestamp: Date.now() + 200,
        type: 'info'
      },
      {
        id: '4',
        text: '> ',
        timestamp: Date.now() + 300,
        type: 'command'
      }
    ];
    setLines(welcomeLines);

    // WebSocket for real-time updates
    const handleAgentUpdate = (data: any) => {
      addLine(`Agent ${data.agentName || 'Unknown'}: ${data.action || 'Status update'}`, 'info');
    };

    agentWebSocket.subscribeToAgentUpdates(handleAgentUpdate);

    return () => {
      agentWebSocket.unsubscribe('agent_update', handleAgentUpdate);
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const addLine = (text: string, type: TerminalLine['type'] = 'output') => {
    const newLine: TerminalLine = {
      id: Date.now().toString() + Math.random(),
      text,
      timestamp: Date.now(),
      type
    };
    setLines(prev => [...prev, newLine]);
  };

  const deployAgent = async (type: string, name?: string) => {
    const agentName = name || `${type}-agent-${Date.now()}`;
    const deploymentId = `deploy-${Date.now()}`;
    
    addLine(`Deploying ${type.toUpperCase()} agent: ${agentName}`, 'info');
    addLine('Initializing neural pathways...', 'output');
    
    const deployment: AgentDeployment = {
      id: deploymentId,
      name: agentName,
      type: type as any,
      status: 'deploying',
      startTime: Date.now()
    };
    
    setActiveDeployments(prev => [...prev, deployment]);

    // Simulate deployment process
    setTimeout(() => {
      addLine('Loading model weights...', 'output');
    }, 1000);
    
    setTimeout(() => {
      addLine('Establishing API connections...', 'output');
    }, 2000);
    
    setTimeout(() => {
      addLine('Running health checks...', 'output');
    }, 3000);
    
    setTimeout(() => {
      addLine(`✓ Agent ${agentName} deployed successfully (PID: ${Math.floor(Math.random() * 9999)})`, 'success');
      setActiveDeployments(prev => 
        prev.map(d => d.id === deploymentId 
          ? { ...d, status: 'active', pid: Math.floor(Math.random() * 9999) }
          : d
        )
      );
    }, 4000);
  };

  const executeCommand = async (command: string) => {
    const cmd = command.trim().toLowerCase();
    addLine(`> ${command}`, 'command');
    
    if (cmd === 'help') {
      addLine('Available commands:', 'info');
      addLine('  deploy claude [name]  - Deploy Claude agent', 'output');
      addLine('  deploy gpt [name]     - Deploy GPT agent', 'output');
      addLine('  deploy gemini [name]  - Deploy Gemini agent', 'output');
      addLine('  deploy local [name]   - Deploy local model', 'output');
      addLine('  list                  - List active agents', 'output');
      addLine('  status [name]         - Check agent status', 'output');
      addLine('  stop [name]           - Stop agent', 'output');
      addLine('  clear                 - Clear terminal', 'output');
      addLine('  help                  - Show this help', 'output');
    } else if (cmd === 'list') {
      if (activeDeployments.length === 0) {
        addLine('No active deployments', 'info');
      } else {
        addLine('Active deployments:', 'info');
        activeDeployments.forEach(deployment => {
          const status = deployment.status === 'active' ? '✓' : '⧗';
          addLine(`  ${status} ${deployment.name} (${deployment.type}) - ${deployment.status}`, 'output');
        });
      }
    } else if (cmd === 'clear') {
      setLines([{
        id: Date.now().toString(),
        text: '> ',
        timestamp: Date.now(),
        type: 'command'
      }]);
    } else if (cmd.startsWith('deploy ')) {
      const parts = cmd.split(' ');
      const agentType = parts[1];
      const agentName = parts[2];
      
      if (['claude', 'gpt', 'gemini', 'local'].includes(agentType)) {
        await deployAgent(agentType, agentName);
      } else {
        addLine(`Error: Unknown agent type '${agentType}'`, 'error');
        addLine('Supported types: claude, gpt, gemini, local', 'info');
      }
    } else if (cmd.startsWith('stop ')) {
      const agentName = cmd.split(' ')[1];
      const deployment = activeDeployments.find(d => d.name === agentName);
      
      if (deployment) {
        addLine(`Stopping agent: ${agentName}`, 'info');
        setActiveDeployments(prev => prev.filter(d => d.name !== agentName));
        addLine(`✓ Agent ${agentName} stopped`, 'success');
      } else {
        addLine(`Error: Agent '${agentName}' not found`, 'error');
      }
    } else if (cmd.startsWith('status ')) {
      const agentName = cmd.split(' ')[1];
      const deployment = activeDeployments.find(d => d.name === agentName);
      
      if (deployment) {
        const uptime = Math.floor((Date.now() - deployment.startTime) / 1000);
        addLine(`Agent: ${deployment.name}`, 'info');
        addLine(`  Type: ${deployment.type.toUpperCase()}`, 'output');
        addLine(`  Status: ${deployment.status.toUpperCase()}`, 'output');
        addLine(`  PID: ${deployment.pid || 'N/A'}`, 'output');
        addLine(`  Uptime: ${uptime}s`, 'output');
      } else {
        addLine(`Error: Agent '${agentName}' not found`, 'error');
      }
    } else if (cmd === '') {
      // Empty command, just add prompt
    } else {
      addLine(`Command not found: ${command}`, 'error');
      addLine('Type "help" for available commands', 'info');
    }
    
    // Add new prompt
    setTimeout(() => {
      addLine('> ', 'command');
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(currentInput);
      setCurrentInput('');
    }
  };

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'command': return 'text-red-400';
      case 'error': return 'text-red-500';
      case 'success': return 'text-white';
      case 'info': return 'text-white/80';
      default: return 'text-white/70';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors uppercase tracking-wide z-50"
      >
        TERMINAL
      </button>
    );
  }

  return (
    <div className={`bg-black border border-red-600 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-red-600">
        <div>
          <h3 className="text-lg font-semibold text-white uppercase tracking-wide">
            NEURAL TERMINAL
          </h3>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-white/70 uppercase tracking-wide">
              Agents: {activeDeployments.filter(d => d.status === 'active').length}
            </span>
            <span className="text-white/70 uppercase tracking-wide">
              Deploying: {activeDeployments.filter(d => d.status === 'deploying').length}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="p-2 rounded hover:bg-red-900/30 transition-colors text-white"
        >
          ✕
        </button>
      </div>

      {/* Terminal Display */}
      <div
        ref={terminalRef}
        className="bg-black border border-white/20 rounded p-4 h-96 overflow-y-auto font-mono text-sm scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-black"
      >
        {lines.map((line, index) => (
          <div key={line.id} className="flex">
            <span className={getLineColor(line.type)}>
              {line.text}
            </span>
            {line.type === 'command' && index === lines.length - 1 && (
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 bg-transparent text-red-400 outline-none font-mono ml-1"
                placeholder=""
                autoFocus
              />
            )}
          </div>
        ))}
      </div>

      {/* Quick Commands */}
      <div className="mt-4 pt-4 border-t border-red-600">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => executeCommand('deploy claude')}
            className="px-3 py-1 bg-red-900/30 border border-red-600 rounded text-xs text-white hover:bg-red-900/50 transition-colors uppercase tracking-wide"
          >
            DEPLOY CLAUDE
          </button>
          <button
            onClick={() => executeCommand('deploy gpt')}
            className="px-3 py-1 bg-red-900/30 border border-red-600 rounded text-xs text-white hover:bg-red-900/50 transition-colors uppercase tracking-wide"
          >
            DEPLOY GPT
          </button>
          <button
            onClick={() => executeCommand('list')}
            className="px-3 py-1 bg-red-900/30 border border-red-600 rounded text-xs text-white hover:bg-red-900/50 transition-colors uppercase tracking-wide"
          >
            LIST AGENTS
          </button>
          <button
            onClick={() => executeCommand('clear')}
            className="px-3 py-1 bg-red-900/30 border border-red-600 rounded text-xs text-white hover:bg-red-900/50 transition-colors uppercase tracking-wide"
          >
            CLEAR
          </button>
        </div>
      </div>
    </div>
  );
}