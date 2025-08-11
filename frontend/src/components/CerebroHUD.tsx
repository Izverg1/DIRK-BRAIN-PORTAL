'use client';

import React, { useState } from 'react';
import { Activity, Cpu, Database, Users, Zap, Shield, BarChart3, Terminal } from 'lucide-react';

interface CerebroHUDProps {
  agents: any;
  tasks: any;
  projects: any[];
  metrics: any;
  onCommandExecute: (command: string) => void;
}

export default function CerebroHUD({ agents, tasks, projects, metrics, onCommandExecute }: CerebroHUDProps) {
  const [selectedView, setSelectedView] = useState<'overview' | 'agents' | 'tasks' | 'metrics'>('overview');
  const [commandInput, setCommandInput] = useState('');
  
  const activeAgents = Object.values(agents).filter((a: any) => a.status === 'active').length;
  const totalAgents = Object.keys(agents).length;
  
  return (
    <>
      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-6 pointer-events-none">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-bold text-white mb-2 tracking-wider">
              CEREBRO
            </h1>
            <p className="text-xl text-blue-400">
              AI Agent Command Center
            </p>
          </div>
          
          <div className="flex gap-4 pointer-events-auto">
            <button
              onClick={() => setSelectedView('overview')}
              className={`px-4 py-2 rounded ${selectedView === 'overview' ? 'bg-blue-600' : 'bg-gray-800'} text-white transition-colors`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedView('agents')}
              className={`px-4 py-2 rounded ${selectedView === 'agents' ? 'bg-blue-600' : 'bg-gray-800'} text-white transition-colors`}
            >
              Agents
            </button>
            <button
              onClick={() => setSelectedView('tasks')}
              className={`px-4 py-2 rounded ${selectedView === 'tasks' ? 'bg-blue-600' : 'bg-gray-800'} text-white transition-colors`}
            >
              Tasks
            </button>
            <button
              onClick={() => setSelectedView('metrics')}
              className={`px-4 py-2 rounded ${selectedView === 'metrics' ? 'bg-blue-600' : 'bg-gray-800'} text-white transition-colors`}
            >
              Metrics
            </button>
          </div>
        </div>
      </div>
      
      {/* Left Side Panel */}
      <div className="absolute left-0 top-32 w-80 p-6 pointer-events-none">
        <div className="bg-gray-900/80 backdrop-blur-md rounded-lg p-4 border border-gray-700 pointer-events-auto">
          {selectedView === 'overview' && (
            <>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                System Overview
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Agents</span>
                  <span className="text-2xl font-bold text-blue-400">{activeAgents}/{totalAgents}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Running Tasks</span>
                  <span className="text-2xl font-bold text-green-400">{tasks.active.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Projects</span>
                  <span className="text-2xl font-bold text-purple-400">{projects.length}</span>
                </div>
              </div>
            </>
          )}
          
          {selectedView === 'agents' && (
            <>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Agent Status
              </h3>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Object.entries(agents).map(([id, agent]: any) => (
                  <div key={id} className="bg-gray-800 rounded p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white font-medium">{agent.id}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        agent.status === 'active' ? 'bg-green-600' : 'bg-gray-600'
                      }`}>
                        {agent.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      <div>Type: {agent.type}</div>
                      <div>Workload: {agent.workload}%</div>
                      <div>Performance: {agent.performance}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          
          {selectedView === 'tasks' && (
            <>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" />
                Active Tasks
              </h3>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tasks.active.map((task: any) => (
                  <div key={task.task_id} className="bg-gray-800 rounded p-3">
                    <div className="text-white font-medium mb-1">{task.title}</div>
                    <div className="text-xs text-gray-400">
                      <div>Assigned: {task.assignee}</div>
                      <div>Priority: <span className={`text-${
                        task.priority === 'HIGH' ? 'red' : 
                        task.priority === 'MEDIUM' ? 'yellow' : 'green'
                      }-400`}>{task.priority}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Right Side Metrics */}
      <div className="absolute right-0 top-32 w-80 p-6 pointer-events-none">
        <div className="bg-gray-900/80 backdrop-blur-md rounded-lg p-4 border border-gray-700 pointer-events-auto">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Performance Metrics
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">System Load</span>
                <span className="text-white">72%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Task Success Rate</span>
                <span className="text-white">95%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Agent Efficiency</span>
                <span className="text-white">88%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Command Terminal */}
      <div className="absolute bottom-0 left-0 w-full p-6 pointer-events-none">
        <div className="bg-gray-900/80 backdrop-blur-md rounded-lg p-4 border border-gray-700 pointer-events-auto">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Command Terminal</h3>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  onCommandExecute(commandInput);
                  setCommandInput('');
                }
              }}
              placeholder="Enter command..."
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded border border-gray-600 focus:border-blue-400 focus:outline-none"
            />
            <button
              onClick={() => {
                onCommandExecute(commandInput);
                setCommandInput('');
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Execute
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-400">
            Commands: deploy [agent], analyze [task], start godmode, status
          </div>
        </div>
      </div>
      
      {/* Status Indicators */}
      <div className="absolute top-32 right-6 flex flex-col gap-2 pointer-events-none">
        <div className="bg-green-600/20 border border-green-600 rounded-full px-4 py-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-sm">System Online</span>
        </div>
        <div className="bg-blue-600/20 border border-blue-600 rounded-full px-4 py-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400 text-sm">Security Active</span>
        </div>
        <div className="bg-purple-600/20 border border-purple-600 rounded-full px-4 py-2 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          <span className="text-purple-400 text-sm">AI Processing</span>
        </div>
      </div>
    </>
  );
}