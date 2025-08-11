'use client';

import { useState } from 'react';
import DirkSidebar from '@/components/DirkSidebar';
import ClientOnlyLink from '@/components/ClientOnlyLink';

// Fix for unused import warning
const Link = ClientOnlyLink;

interface Hook {
  id: string;
  name: string;
  type: 'git' | 'webhook' | 'automation';
  trigger: string;
  action: string;
  status: 'active' | 'inactive';
  description: string;
  lastTriggered?: string;
  triggerCount: number;
  createdAt: string;
}

export default function HooksPage() {
  const [hooks, setHooks] = useState<Hook[]>([
    {
      id: '1',
      name: 'Pre-commit Code Quality',
      type: 'git',
      trigger: 'pre-commit',
      action: 'run linting and tests',
      status: 'active',
      description: 'Automatically run code quality checks before commits',
      lastTriggered: '2 minutes ago',
      triggerCount: 45,
      createdAt: '2024-01-10'
    },
    {
      id: '2',
      name: 'Deploy on Push to Main',
      type: 'git',
      trigger: 'post-receive',
      action: 'deploy to production',
      status: 'active',
      description: 'Automatically deploy when pushing to main branch',
      lastTriggered: '1 hour ago',
      triggerCount: 12,
      createdAt: '2024-01-08'
    },
    {
      id: '3',
      name: 'GitHub Issue Webhook',
      type: 'webhook',
      trigger: 'HTTP POST /webhooks/github',
      action: 'create task in project board',
      status: 'active',
      description: 'Create project tasks from GitHub issues',
      lastTriggered: '30 minutes ago',
      triggerCount: 78,
      createdAt: '2024-01-05'
    },
    {
      id: '4',
      name: 'Daily Backup Automation',
      type: 'automation',
      trigger: 'schedule: 0 2 * * *',
      action: 'backup database',
      status: 'active',
      description: 'Automated daily database backup at 2 AM',
      lastTriggered: '6 hours ago',
      triggerCount: 30,
      createdAt: '2024-01-01'
    },
    {
      id: '5',
      name: 'Slack Deployment Notifications',
      type: 'webhook',
      trigger: 'deployment complete',
      action: 'send slack message',
      status: 'inactive',
      description: 'Notify team about deployment status',
      lastTriggered: '2 days ago',
      triggerCount: 5,
      createdAt: '2023-12-28'
    }
  ]);

  const [selectedType, setSelectedType] = useState<string>('all');

  const hookTypes = [
    { id: 'all', name: 'All Hooks', count: hooks.length },
    { id: 'git', name: 'Git Hooks', count: hooks.filter(h => h.type === 'git').length },
    { id: 'webhook', name: 'Webhooks', count: hooks.filter(h => h.type === 'webhook').length },
    { id: 'automation', name: 'Automation', count: hooks.filter(h => h.type === 'automation').length }
  ];

  const filteredHooks = selectedType === 'all' 
    ? hooks 
    : hooks.filter(h => h.type === selectedType);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'git':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'webhook':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'automation':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'git':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.300 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
        );
      case 'webhook':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
      case 'automation':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      default:
        return null;
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
              <h1 className="text-2xl font-bold text-gray-900">Hooks & Automation</h1>
              <p className="text-gray-500 mt-1">Automate your workflows with git hooks, webhooks, and scheduled tasks</p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                href="/hooks/git"
                className="px-4 py-2 text-gray-600 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Configure Git Hooks
              </Link>
              <Link
                href="/hooks/automation"
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Create Hook</span>
              </Link>
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
                  <p className="text-gray-500 text-sm font-medium">Total Hooks</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{hooks.length}</p>
                </div>
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Active</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{hooks.filter(h => h.status === 'active').length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Triggers</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{hooks.reduce((sum, h) => sum + h.triggerCount, 0)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Last 24h</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">23</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Hook Types Filter */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hook Types</h3>
            <div className="flex flex-wrap gap-3">
              {hookTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                    selectedType === type.id
                      ? 'bg-violet-100 text-violet-700 border-2 border-violet-500'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  <span>{type.name}</span>
                  <span className="bg-white bg-opacity-60 px-2 py-0.5 rounded-full text-xs">
                    {type.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Hooks List */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedType === 'all' ? 'All Hooks' : `${hookTypes.find(t => t.id === selectedType)?.name}`}
              </h3>
              <div className="text-sm text-gray-500">
                {filteredHooks.length} hook{filteredHooks.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredHooks.map((hook) => (
                <div key={hook.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">{hook.name}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(hook.type)}`}>
                          <span className="mr-1">{getTypeIcon(hook.type)}</span>
                          {hook.type}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          hook.status === 'active' 
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            hook.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                          {hook.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{hook.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-400">
                        <div>
                          <span className="font-medium text-gray-600">Trigger:</span> <code className="font-mono bg-gray-100 px-1 rounded">{hook.trigger}</code>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Action:</span> {hook.action}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-400 mt-2">
                        <span>Triggered {hook.triggerCount} times</span>
                        {hook.lastTriggered && (
                          <>
                            <span>•</span>
                            <span>Last triggered {hook.lastTriggered}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>Created {hook.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button 
                        onClick={() => {
                          setHooks(hooks.map(h => 
                            h.id === hook.id 
                              ? { ...h, status: h.status === 'active' ? 'inactive' : 'active' } 
                              : h
                          ));
                        }}
                        className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                          hook.status === 'active'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {hook.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
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

            {filteredHooks.length === 0 && (
              <div className="px-6 py-12 text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hooks found</h3>
                <p className="text-gray-500 mb-6">There are no hooks of the selected type.</p>
                <Link
                  href="/hooks/automation"
                  className="inline-flex items-center px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700"
                >
                  Create your first hook
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}