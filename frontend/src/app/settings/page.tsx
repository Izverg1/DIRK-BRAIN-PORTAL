'use client';

import { useState } from 'react';
import DirkSidebar from '@/components/DirkSidebar';
import ClientOnlyLink from '@/components/ClientOnlyLink';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoSave: true,
    debugMode: false,
    maxAgents: 10,
    defaultModel: 'claude-3-sonnet'
  });

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'integrations', name: 'Integrations', icon: '🔗' },
    { id: 'api-keys', name: 'API Keys', icon: '🔑' },
    { id: 'performance', name: 'Performance', icon: '⚡' },
    { id: 'security', name: 'Security', icon: '🛡️' }
  ];

  const integrations = [
    { name: 'GitHub', status: 'connected', description: 'Repository management and code analysis' },
    { name: 'Slack', status: 'disconnected', description: 'Team notifications and updates' },
    { name: 'Discord', status: 'connected', description: 'Community and support channels' },
    { name: 'Supabase', status: 'connected', description: 'Database and authentication' }
  ];

  const apiKeys = [
    { name: 'Anthropic Claude', status: 'active', lastUsed: '2 hours ago', usage: '89%' },
    { name: 'OpenAI GPT-4', status: 'active', lastUsed: '5 minutes ago', usage: '67%' },
    { name: 'Google Gemini', status: 'inactive', lastUsed: '1 day ago', usage: '23%' },
    { name: 'Local Model API', status: 'active', lastUsed: '30 minutes ago', usage: '45%' }
  ];

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Enable Notifications</p>
              <p className="text-sm text-gray-500">Receive updates about agent activities</p>
            </div>
            <button
              onClick={() => handleSettingChange('notifications', !settings.notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.notifications ? 'bg-violet-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Dark Mode</p>
              <p className="text-sm text-gray-500">Use dark theme for the interface</p>
            </div>
            <button
              onClick={() => handleSettingChange('darkMode', !settings.darkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.darkMode ? 'bg-violet-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Auto Save</p>
              <p className="text-sm text-gray-500">Automatically save project changes</p>
            </div>
            <button
              onClick={() => handleSettingChange('autoSave', !settings.autoSave)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoSave ? 'bg-violet-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoSave ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Maximum Concurrent Agents
            </label>
            <select
              value={settings.maxAgents}
              onChange={(e) => handleSettingChange('maxAgents', parseInt(e.target.value))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
            >
              <option value={5}>5 agents</option>
              <option value={10}>10 agents</option>
              <option value={15}>15 agents</option>
              <option value={20}>20 agents</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Default AI Model
            </label>
            <select
              value={settings.defaultModel}
              onChange={(e) => handleSettingChange('defaultModel', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="claude-3-sonnet">Claude 3 Sonnet</option>
              <option value="claude-3-opus">Claude 3 Opus</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gemini-pro">Gemini Pro</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Integrations</h3>
        <div className="space-y-4">
          {integrations.map((integration, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  integration.status === 'connected' ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{integration.name}</p>
                  <p className="text-sm text-gray-500">{integration.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  integration.status === 'connected'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {integration.status}
                </span>
                <button className="px-3 py-1 text-sm text-violet-600 hover:text-violet-800">
                  {integration.status === 'connected' ? 'Configure' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderApiKeys = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">API Key Management</h3>
          <button className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700">
            Add API Key
          </button>
        </div>
        <div className="space-y-4">
          {apiKeys.map((key, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  key.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{key.name}</p>
                  <p className="text-sm text-gray-500">Last used: {key.lastUsed}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Usage: {key.usage}</p>
                  <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-violet-600 h-2 rounded-full transition-all"
                      style={{ width: key.usage }}
                    ></div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
                  <button className="text-sm text-red-600 hover:text-red-800">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DirkSidebar />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-500 mt-1">Configure your DIRK Agency platform preferences</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Tab Navigation */}
          <div className="mb-8">
            <nav className="flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-violet-500 text-violet-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings Sections</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ClientOnlyLink
                href="/settings/general"
                className="p-4 border-2 border-dashed border-violet-300 rounded-xl hover:border-violet-500 hover:bg-violet-50 transition-colors group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-violet-200">
                    <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">General Settings</h4>
                  <p className="text-sm text-gray-500 mt-1">Basic preferences and options</p>
                </div>
              </ClientOnlyLink>

              <ClientOnlyLink
                href="/settings/integrations"
                className="p-4 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">Integrations</h4>
                  <p className="text-sm text-gray-500 mt-1">Connect external services</p>
                </div>
              </ClientOnlyLink>

              <ClientOnlyLink
                href="/settings/api-keys"
                className="p-4 border-2 border-dashed border-green-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors group"
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">API Keys</h4>
                  <p className="text-sm text-gray-500 mt-1">Manage authentication keys</p>
                </div>
              </ClientOnlyLink>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'integrations' && renderIntegrations()}
          {activeTab === 'api-keys' && renderApiKeys()}
          {(activeTab === 'performance' || activeTab === 'security') && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{activeTab === 'performance' ? 'Performance Settings' : 'Security Settings'}</h3>
                <p className="text-gray-500">Advanced {activeTab} configuration options coming soon</p>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button className="px-6 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}