'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Upload, Download, Globe, Home, Cloud, Key, FolderOpen, Plus, Trash2, Edit2, Database, Server } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

interface ProjectSource {
  id: string;
  name: string;
  type: 'local' | 'remote' | 'cloud';
  path?: string;
  url?: string;
  apiKey?: string;
  enabled: boolean;
}

interface Settings {
  projectSources: ProjectSource[];
  aiProviders: {
    anthropic: { apiKey: string; enabled: boolean };
    google: { apiKey: string; enabled: boolean };
    openai: { apiKey: string; enabled: boolean };
    local: { endpoint: string; enabled: boolean };
  };
  mcp: {
    enabled: boolean;
    servers: Array<{
      id: string;
      name: string;
      endpoint: string;
      enabled: boolean;
    }>;
  };
  deployment: {
    defaultTarget: 'local' | 'remote' | 'cloud';
    localPath: string;
    remoteEndpoint: string;
    cloudProvider: string;
  };
}

export default function SettingsPanel({ onClose, onSave }: { onClose?: () => void; onSave?: (settings: Settings) => void }) {
  const [settings, setSettings] = useState<Settings>({
    projectSources: [
      {
        id: '1',
        name: 'Local Projects',
        type: 'local',
        path: '~/projects',
        enabled: true
      },
      {
        id: '2',
        name: 'GitHub Projects',
        type: 'remote',
        url: 'https://api.github.com/user/repos',
        apiKey: '',
        enabled: false
      }
    ],
    aiProviders: {
      anthropic: { apiKey: '', enabled: false },
      google: { apiKey: '', enabled: false },
      openai: { apiKey: '', enabled: false },
      local: { endpoint: 'http://localhost:11434', enabled: true }
    },
    mcp: {
      enabled: true,
      servers: [
        { id: '1', name: 'Filesystem MCP', endpoint: 'localhost:3100', enabled: true },
        { id: '2', name: 'Docker MCP', endpoint: 'localhost:3101', enabled: false }
      ]
    },
    deployment: {
      defaultTarget: 'local',
      localPath: '/Users/izverg/projects',
      remoteEndpoint: '',
      cloudProvider: 'aws'
    }
  });

  const [showAddSource, setShowAddSource] = useState(false);
  const [newSource, setNewSource] = useState<Partial<ProjectSource>>({
    type: 'local'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Load settings from localStorage or config file
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Try to load from localStorage first
      const savedSettings = localStorage.getItem('dirk-brain-settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
        return;
      }

      // Try to load from backend config
      const response = await fetch('http://localhost:3001/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      // Save to localStorage
      localStorage.setItem('dirk-brain-settings', JSON.stringify(settings));

      // Save to backend
      await fetch('http://localhost:3001/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      onSave?.(settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Check console for details.');
    }
  };

  const addProjectSource = () => {
    if (!newSource.name || (!newSource.path && !newSource.url)) {
      alert('Please provide name and path/URL for the project source');
      return;
    }

    const source: ProjectSource = {
      id: Date.now().toString(),
      name: newSource.name!,
      type: newSource.type as 'local' | 'remote' | 'cloud',
      path: newSource.path,
      url: newSource.url,
      apiKey: newSource.apiKey,
      enabled: true
    };

    setSettings({
      ...settings,
      projectSources: [...settings.projectSources, source]
    });
    setShowAddSource(false);
    setNewSource({ type: 'local' });
  };

  const removeProjectSource = (id: string) => {
    setSettings({
      ...settings,
      projectSources: settings.projectSources.filter(s => s.id !== id)
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const config = JSON.parse(text);
      
      // Merge uploaded config with existing settings
      setSettings({
        ...settings,
        ...config
      });
      
      alert('Configuration imported successfully!');
    } catch (error) {
      console.error('Failed to import configuration:', error);
      alert('Invalid configuration file');
    }
  };

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dirk-brain-settings.json';
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-[800px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Settings & Configuration</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="projects">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="ai">AI Providers</TabsTrigger>
              <TabsTrigger value="mcp">MCP Servers</TabsTrigger>
              <TabsTrigger value="deployment">Deployment</TabsTrigger>
              <TabsTrigger value="import">Import/Export</TabsTrigger>
            </TabsList>

            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Sources</CardTitle>
                  <CardDescription>Configure where to load projects from</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {settings.projectSources.map(source => (
                    <div key={source.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {source.type === 'local' ? <Home className="h-4 w-4" /> : 
                         source.type === 'remote' ? <Globe className="h-4 w-4" /> : 
                         <Cloud className="h-4 w-4" />}
                        <div>
                          <p className="font-medium">{source.name}</p>
                          <p className="text-sm text-gray-500">
                            {source.path || source.url}
                          </p>
                        </div>
                        <Badge variant={source.enabled ? 'default' : 'secondary'}>
                          {source.enabled ? 'Active' : 'Disabled'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={source.enabled}
                          onCheckedChange={(checked) => {
                            setSettings({
                              ...settings,
                              projectSources: settings.projectSources.map(s =>
                                s.id === source.id ? { ...s, enabled: checked } : s
                              )
                            });
                          }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeProjectSource(source.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button onClick={() => setShowAddSource(true)} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project Source
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Providers Tab */}
            <TabsContent value="ai" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI Provider Configuration</CardTitle>
                  <CardDescription>Configure API keys and endpoints for AI providers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Anthropic */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Anthropic Claude</Label>
                      <Switch
                        checked={settings.aiProviders.anthropic.enabled}
                        onCheckedChange={(checked) => {
                          setSettings({
                            ...settings,
                            aiProviders: {
                              ...settings.aiProviders,
                              anthropic: { ...settings.aiProviders.anthropic, enabled: checked }
                            }
                          });
                        }}
                      />
                    </div>
                    <Input
                      type="password"
                      placeholder="API Key"
                      value={settings.aiProviders.anthropic.apiKey}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          aiProviders: {
                            ...settings.aiProviders,
                            anthropic: { ...settings.aiProviders.anthropic, apiKey: e.target.value }
                          }
                        });
                      }}
                    />
                  </div>

                  {/* Google */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Google Gemini</Label>
                      <Switch
                        checked={settings.aiProviders.google.enabled}
                        onCheckedChange={(checked) => {
                          setSettings({
                            ...settings,
                            aiProviders: {
                              ...settings.aiProviders,
                              google: { ...settings.aiProviders.google, enabled: checked }
                            }
                          });
                        }}
                      />
                    </div>
                    <Input
                      type="password"
                      placeholder="API Key"
                      value={settings.aiProviders.google.apiKey}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          aiProviders: {
                            ...settings.aiProviders,
                            google: { ...settings.aiProviders.google, apiKey: e.target.value }
                          }
                        });
                      }}
                    />
                  </div>

                  {/* OpenAI */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>OpenAI GPT</Label>
                      <Switch
                        checked={settings.aiProviders.openai.enabled}
                        onCheckedChange={(checked) => {
                          setSettings({
                            ...settings,
                            aiProviders: {
                              ...settings.aiProviders,
                              openai: { ...settings.aiProviders.openai, enabled: checked }
                            }
                          });
                        }}
                      />
                    </div>
                    <Input
                      type="password"
                      placeholder="API Key"
                      value={settings.aiProviders.openai.apiKey}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          aiProviders: {
                            ...settings.aiProviders,
                            openai: { ...settings.aiProviders.openai, apiKey: e.target.value }
                          }
                        });
                      }}
                    />
                  </div>

                  {/* Local Models */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Local Models (Ollama)</Label>
                      <Switch
                        checked={settings.aiProviders.local.enabled}
                        onCheckedChange={(checked) => {
                          setSettings({
                            ...settings,
                            aiProviders: {
                              ...settings.aiProviders,
                              local: { ...settings.aiProviders.local, enabled: checked }
                            }
                          });
                        }}
                      />
                    </div>
                    <Input
                      placeholder="Endpoint (e.g., http://localhost:11434)"
                      value={settings.aiProviders.local.endpoint}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          aiProviders: {
                            ...settings.aiProviders,
                            local: { ...settings.aiProviders.local, endpoint: e.target.value }
                          }
                        });
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* MCP Servers Tab */}
            <TabsContent value="mcp" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>MCP Server Configuration</CardTitle>
                  <CardDescription>Configure Model Context Protocol servers for local deployment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <Label>Enable MCP Integration</Label>
                    <Switch
                      checked={settings.mcp.enabled}
                      onCheckedChange={(checked) => {
                        setSettings({
                          ...settings,
                          mcp: { ...settings.mcp, enabled: checked }
                        });
                      }}
                    />
                  </div>

                  {settings.mcp.servers.map(server => (
                    <div key={server.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Server className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{server.name}</p>
                          <p className="text-sm text-gray-500">{server.endpoint}</p>
                        </div>
                      </div>
                      <Switch
                        checked={server.enabled}
                        onCheckedChange={(checked) => {
                          setSettings({
                            ...settings,
                            mcp: {
                              ...settings.mcp,
                              servers: settings.mcp.servers.map(s =>
                                s.id === server.id ? { ...s, enabled: checked } : s
                              )
                            }
                          });
                        }}
                      />
                    </div>
                  ))}

                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add MCP Server
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Deployment Tab */}
            <TabsContent value="deployment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Deployment Configuration</CardTitle>
                  <CardDescription>Configure default deployment targets and paths</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Default Deployment Target</Label>
                    <Select
                      value={settings.deployment.defaultTarget}
                      onValueChange={(value: 'local' | 'remote' | 'cloud') => {
                        setSettings({
                          ...settings,
                          deployment: { ...settings.deployment, defaultTarget: value }
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">Local</SelectItem>
                        <SelectItem value="remote">Remote Server</SelectItem>
                        <SelectItem value="cloud">Cloud Provider</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Local Deployment Path</Label>
                    <Input
                      value={settings.deployment.localPath}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          deployment: { ...settings.deployment, localPath: e.target.value }
                        });
                      }}
                    />
                  </div>

                  <div>
                    <Label>Remote Server Endpoint</Label>
                    <Input
                      placeholder="e.g., ssh://user@server.com"
                      value={settings.deployment.remoteEndpoint}
                      onChange={(e) => {
                        setSettings({
                          ...settings,
                          deployment: { ...settings.deployment, remoteEndpoint: e.target.value }
                        });
                      }}
                    />
                  </div>

                  <div>
                    <Label>Cloud Provider</Label>
                    <Select
                      value={settings.deployment.cloudProvider}
                      onValueChange={(value) => {
                        setSettings({
                          ...settings,
                          deployment: { ...settings.deployment, cloudProvider: value }
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aws">AWS</SelectItem>
                        <SelectItem value="gcp">Google Cloud</SelectItem>
                        <SelectItem value="azure">Azure</SelectItem>
                        <SelectItem value="vercel">Vercel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Import/Export Tab */}
            <TabsContent value="import" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Import/Export Settings</CardTitle>
                  <CardDescription>Backup or restore your configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Import Configuration</Label>
                      <div className="mt-2">
                        <Input
                          type="file"
                          accept=".json"
                          onChange={handleFileUpload}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Export Configuration</Label>
                      <div className="mt-2">
                        <Button onClick={exportSettings} variant="outline" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Export Settings as JSON
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Note:</strong> Settings are automatically saved to your browser&apos;s local storage. 
                        Export your settings to create a backup or share with team members.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={saveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      {/* Add Project Source Dialog */}
      <Dialog open={showAddSource} onOpenChange={setShowAddSource}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Project Source</DialogTitle>
            <DialogDescription>
              Add a new source to load projects from
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Source Name</Label>
              <Input
                placeholder="e.g., My GitHub Projects"
                value={newSource.name || ''}
                onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Source Type</Label>
              <Select
                value={newSource.type}
                onValueChange={(value: 'local' | 'remote' | 'cloud') => 
                  setNewSource({ ...newSource, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local Filesystem</SelectItem>
                  <SelectItem value="remote">Remote API</SelectItem>
                  <SelectItem value="cloud">Cloud Storage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newSource.type === 'local' ? (
              <div>
                <Label>Directory Path</Label>
                <Input
                  placeholder="e.g., ~/projects"
                  value={newSource.path || ''}
                  onChange={(e) => setNewSource({ ...newSource, path: e.target.value })}
                />
              </div>
            ) : (
              <>
                <div>
                  <Label>API URL</Label>
                  <Input
                    placeholder="e.g., https://api.github.com/user/repos"
                    value={newSource.url || ''}
                    onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                  />
                </div>
                <div>
                  <Label>API Key (optional)</Label>
                  <Input
                    type="password"
                    placeholder="Your API key"
                    value={newSource.apiKey || ''}
                    onChange={(e) => setNewSource({ ...newSource, apiKey: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSource(false)}>
              Cancel
            </Button>
            <Button onClick={addProjectSource}>
              Add Source
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}