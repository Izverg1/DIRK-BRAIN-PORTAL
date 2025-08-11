'use client';

import { useState } from 'react';
import DirkSidebar from '@/components/DirkSidebar';
import ClientOnlyLink from '@/components/ClientOnlyLink';

interface ServerConfig {
  name: string;
  description: string;
  type: 'filesystem' | 'database' | 'api' | 'custom';
  port: number;
  config: Record<string, any>;
}

export default function CreateLocalMCPPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [serverConfig, setServerConfig] = useState<ServerConfig>({
    name: '',
    description: '',
    type: 'filesystem',
    port: 3333,
    config: {}
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ServerBasicInfo serverConfig={serverConfig} setServerConfig={setServerConfig} />;
      case 2:
        return <ServerTypeSelection serverConfig={serverConfig} setServerConfig={setServerConfig} />;
      case 3:
        return <ServerConfiguration serverConfig={serverConfig} setServerConfig={setServerConfig} />;
      case 4:
        return <ServerReview serverConfig={serverConfig} />;
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
              <h1 className="text-2xl font-bold text-gray-900">Create Local MCP Server</h1>
              <p className="text-gray-500 mt-1">Deploy a new Model Context Protocol server locally</p>
            </div>
            <ClientOnlyLink
              href="/mcp-factory"
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              ← Back to Factory
            </ClientOnlyLink>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-violet-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Wizard Steps */}
        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            {renderStep()}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  currentStep === 1
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>

              <div className="flex space-x-2">
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      i + 1 === currentStep
                        ? 'bg-violet-600'
                        : i + 1 < currentStep
                        ? 'bg-violet-400'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={currentStep === totalSteps ? () => console.log('Deploy!') : handleNext}
                className="px-6 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors"
              >
                {currentStep === totalSteps ? 'Deploy Server' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Step Components
function ServerBasicInfo({ serverConfig, setServerConfig }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
        <p className="text-gray-500 mt-2">Let&apos;s start with the basics about your MCP server</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Server Name</label>
          <input
            type="text"
            value={serverConfig.name}
            onChange={(e) => setServerConfig({ ...serverConfig, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            placeholder="My Custom MCP Server"
          />
          <p className="text-sm text-gray-500 mt-1">Choose a descriptive name for your server</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
          <textarea
            value={serverConfig.description}
            onChange={(e) => setServerConfig({ ...serverConfig, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            placeholder="Describe what this MCP server will do..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Port</label>
          <input
            type="number"
            value={serverConfig.port}
            onChange={(e) => setServerConfig({ ...serverConfig, port: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            min="3000"
            max="9999"
          />
          <p className="text-sm text-gray-500 mt-1">Port number for the MCP server (3000-9999)</p>
        </div>
      </div>
    </div>
  );
}

function ServerTypeSelection({ serverConfig, setServerConfig }: any) {
  const serverTypes = [
    {
      type: 'filesystem',
      name: 'File System',
      description: 'Access and manipulate files and directories',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ),
      features: ['File operations', 'Directory traversal', 'File watching', 'Permissions management']
    },
    {
      type: 'database',
      name: 'Database',
      description: 'Connect to and query databases',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      ),
      features: ['SQL queries', 'CRUD operations', 'Schema management', 'Connection pooling']
    },
    {
      type: 'api',
      name: 'API Integration',
      description: 'Bridge to external APIs and services',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      ),
      features: ['HTTP requests', 'Authentication', 'Rate limiting', 'Response caching']
    },
    {
      type: 'custom',
      name: 'Custom',
      description: 'Build a custom MCP server from scratch',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      features: ['Custom logic', 'Flexible architecture', 'Advanced configurations', 'Full control']
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-gray-900">Choose Server Type</h2>
        <p className="text-gray-500 mt-2">Select the type of MCP server you want to create</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {serverTypes.map((type) => (
          <div
            key={type.type}
            onClick={() => setServerConfig({ ...serverConfig, type: type.type as any })}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              serverConfig.type === type.type
                ? 'border-violet-500 bg-violet-50'
                : 'border-gray-200 hover:border-violet-300 hover:bg-violet-25'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
              serverConfig.type === type.type
                ? 'bg-violet-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {type.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{type.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{type.description}</p>
            <div className="space-y-1">
              {type.features.map((feature, idx) => (
                <div key={idx} className="flex items-center text-xs text-gray-500">
                  <svg className="w-3 h-3 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServerConfiguration({ serverConfig, setServerConfig }: any) {
  const renderConfigFields = () => {
    switch (serverConfig.type) {
      case 'filesystem':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Root Directory</label>
              <input
                type="text"
                value={serverConfig.config.rootPath || ''}
                onChange={(e) => setServerConfig({
                  ...serverConfig,
                  config: { ...serverConfig.config, rootPath: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                placeholder="/path/to/directory"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={serverConfig.config.allowWrite || false}
                onChange={(e) => setServerConfig({
                  ...serverConfig,
                  config: { ...serverConfig.config, allowWrite: e.target.checked }
                })}
                className="h-4 w-4 text-violet-600 rounded border-gray-300"
              />
              <label className="ml-2 text-sm text-gray-900">Allow write operations</label>
            </div>
          </>
        );
      case 'database':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Database Type</label>
              <select
                value={serverConfig.config.dbType || 'postgresql'}
                onChange={(e) => setServerConfig({
                  ...serverConfig,
                  config: { ...serverConfig.config, dbType: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
              >
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="sqlite">SQLite</option>
                <option value="mongodb">MongoDB</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Connection URL</label>
              <input
                type="text"
                value={serverConfig.config.connectionUrl || ''}
                onChange={(e) => setServerConfig({
                  ...serverConfig,
                  config: { ...serverConfig.config, connectionUrl: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                placeholder="postgresql://user:password@localhost:5432/dbname"
              />
            </div>
          </>
        );
      case 'api':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Base URL</label>
              <input
                type="url"
                value={serverConfig.config.baseUrl || ''}
                onChange={(e) => setServerConfig({
                  ...serverConfig,
                  config: { ...serverConfig.config, baseUrl: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                placeholder="https://api.example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">API Key</label>
              <input
                type="password"
                value={serverConfig.config.apiKey || ''}
                onChange={(e) => setServerConfig({
                  ...serverConfig,
                  config: { ...serverConfig.config, apiKey: e.target.value }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                placeholder="Your API key"
              />
            </div>
          </>
        );
      default:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Custom Configuration (JSON)</label>
            <textarea
              value={JSON.stringify(serverConfig.config, null, 2)}
              onChange={(e) => {
                try {
                  const config = JSON.parse(e.target.value);
                  setServerConfig({ ...serverConfig, config });
                } catch {}
              }}
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 font-mono text-sm"
              placeholder='{\n  "key": "value"\n}'
            />
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-gray-900">Server Configuration</h2>
        <p className="text-gray-500 mt-2">Configure your {serverConfig.type} server settings</p>
      </div>

      <div className="space-y-6">
        {renderConfigFields()}
      </div>
    </div>
  );
}

function ServerReview({ serverConfig }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold text-gray-900">Review & Deploy</h2>
        <p className="text-gray-500 mt-2">Review your server configuration before deployment</p>
      </div>

      <div className="space-y-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Server Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Name:</span>
              <span className="ml-2 font-medium">{serverConfig.name}</span>
            </div>
            <div>
              <span className="text-gray-500">Type:</span>
              <span className="ml-2 font-medium capitalize">{serverConfig.type}</span>
            </div>
            <div>
              <span className="text-gray-500">Port:</span>
              <span className="ml-2 font-medium">{serverConfig.port}</span>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <span className="ml-2 text-green-600 font-medium">Ready to Deploy</span>
            </div>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Configuration</h3>
          <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
            {JSON.stringify(serverConfig.config, null, 2)}
          </pre>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-medium text-blue-900">Deployment Notes</h4>
              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                <li>• Server will be deployed locally on port {serverConfig.port}</li>
                <li>• Configuration files will be created in ~/.dirk/mcp-servers/</li>
                <li>• Server will start automatically on system boot</li>
                <li>• Logs will be available in the dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}