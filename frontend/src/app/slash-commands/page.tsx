'use client';

import { useState } from 'react';
import DirkSidebar from '@/components/DirkSidebar';
import ClientOnlyLink from '@/components/ClientOnlyLink';

interface SlashCommand {
  id: string;
  name: string;
  command: string;
  description: string;
  category: 'git' | 'build' | 'test' | 'deploy' | 'custom';
  usage: string;
  isBuiltIn: boolean;
  createdAt: string;
  usageCount: number;
}

export default function SlashCommandsPage() {
  const [commands, setCommands] = useState<SlashCommand[]>([
    {
      id: '1',
      name: 'Quick Commit',
      command: '/commit',
      description: 'Commit changes with AI-generated message',
      category: 'git',
      usage: '/commit [message]',
      isBuiltIn: true,
      createdAt: '2024-01-10',
      usageCount: 156
    },
    {
      id: '2',
      name: 'Deploy to Staging',
      command: '/deploy-staging',
      description: 'Deploy current branch to staging environment',
      category: 'deploy',
      usage: '/deploy-staging [branch]',
      isBuiltIn: true,
      createdAt: '2024-01-08',
      usageCount: 89
    },
    {
      id: '3',
      name: 'Run Tests',
      command: '/test',
      description: 'Execute test suite with coverage',
      category: 'test',
      usage: '/test [pattern]',
      isBuiltIn: true,
      createdAt: '2024-01-05',
      usageCount: 234
    },
    {
      id: '4',
      name: 'Build Project',
      command: '/build',
      description: 'Build the project for production',
      category: 'build',
      usage: '/build [environment]',
      isBuiltIn: true,
      createdAt: '2024-01-03',
      usageCount: 78
    },
    {
      id: '5',
      name: 'Custom Backup',
      command: '/backup-db',
      description: 'Create database backup with timestamp',
      category: 'custom',
      usage: '/backup-db [database_name]',
      isBuiltIn: false,
      createdAt: '2024-01-15',
      usageCount: 12
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Commands', count: commands.length },
    { id: 'git', name: 'Git', count: commands.filter(c => c.category === 'git').length },
    { id: 'build', name: 'Build', count: commands.filter(c => c.category === 'build').length },
    { id: 'test', name: 'Test', count: commands.filter(c => c.category === 'test').length },
    { id: 'deploy', name: 'Deploy', count: commands.filter(c => c.category === 'deploy').length },
    { id: 'custom', name: 'Custom', count: commands.filter(c => c.category === 'custom').length }
  ];

  const filteredCommands = selectedCategory === 'all' 
    ? commands 
    : commands.filter(c => c.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'git':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'build':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'test':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'deploy':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'custom':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'git':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.300 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
        );
      case 'build':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'test':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'deploy':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DirkSidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Slash Commands</h1>
              <p className="text-gray-500 mt-1">Create and manage custom commands for Claude Code</p>
            </div>
            <div className="flex items-center space-x-3">
              <ClientOnlyLink
                href="/slash-commands/builder"
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Create Command</span>
              </ClientOnlyLink>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Commands</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{commands.length}</p>
                </div>
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Built-in</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{commands.filter(c => c.isBuiltIn).length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Custom</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{commands.filter(c => !c.isBuiltIn).length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Usage</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{commands.reduce((sum, c) => sum + c.usageCount, 0)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Categories Filter */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Command Categories</h3>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                    selectedCategory === category.id
                      ? 'bg-violet-100 text-violet-700 border-2 border-violet-500'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  <span>{category.name}</span>
                  <span className="bg-white bg-opacity-60 px-2 py-0.5 rounded-full text-xs">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Commands List */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedCategory === 'all' ? 'All Commands' : `${categories.find(c => c.id === selectedCategory)?.name} Commands`}
              </h3>
              <div className="text-sm text-gray-500">
                {filteredCommands.length} command{filteredCommands.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredCommands.map((command) => (
                <div key={command.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <code className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-mono rounded-lg">
                          {command.command}
                        </code>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(command.category)}`}>
                          <span className="mr-1">{getCategoryIcon(command.category)}</span>
                          {command.category}
                        </span>
                        {command.isBuiltIn && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            Built-in
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900">{command.name}</h4>
                      <p className="text-sm text-gray-500 mb-2">{command.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>Usage: <code className="font-mono">{command.usage}</code></span>
                        <span>•</span>
                        <span>Used {command.usageCount} times</span>
                        <span>•</span>
                        <span>Created {command.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredCommands.length === 0 && (
              <div className="px-6 py-12 text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No commands found</h3>
                <p className="text-gray-500 mb-6">There are no commands in the selected category.</p>
                <ClientOnlyLink
                  href="/slash-commands/builder"
                  className="inline-flex items-center px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700"
                >
                  Create your first command
                </ClientOnlyLink>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}