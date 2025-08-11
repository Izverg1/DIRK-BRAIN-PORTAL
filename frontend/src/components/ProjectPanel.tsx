'use client';

import React, { useState, useEffect } from 'react';
import { Folder, FolderOpen, Plus, Users, Activity, Globe, Cloud, Home } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface Project {
  id: string;
  name: string;
  description?: string;
  pods: any[];
  deployment: 'local' | 'remote' | 'cloud';
  status: 'active' | 'inactive';
}

export default function ProjectPanel({ onSelectProject }: { onSelectProject?: (project: string) => void }) {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'NOT_TODAY',
      name: 'NOT_TODAY',
      description: 'Task management and automation platform',
      pods: [],
      deployment: 'local',
      status: 'active'
    },
    {
      id: 'DIRK_Brain',
      name: 'DIRK Brain Portal',
      description: 'AI Agent Orchestration Platform',
      pods: [],
      deployment: 'cloud',
      status: 'active'
    },
    {
      id: 'CrawlZilla',
      name: 'CrawlZilla',
      description: 'Web scraping and data extraction',
      pods: [],
      deployment: 'remote',
      status: 'inactive'
    },
    {
      id: 'E-Commerce',
      name: 'E-Commerce Platform',
      description: 'Full-stack online shopping platform',
      pods: [],
      deployment: 'cloud',
      status: 'active'
    }
  ]);
  
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  // Load pods for each project
  useEffect(() => {
    fetchProjectPods();
    const interval = setInterval(fetchProjectPods, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchProjectPods = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/pods');
      const pods = await response.json();
      
      // Group pods by project
      const projectPods: { [key: string]: any[] } = {};
      pods.forEach((pod: any) => {
        if (pod.project) {
          if (!projectPods[pod.project]) {
            projectPods[pod.project] = [];
          }
          projectPods[pod.project].push(pod);
        }
      });
      
      // Update projects with their pods
      setProjects(prev => prev.map(project => ({
        ...project,
        pods: projectPods[project.id] || []
      })));
    } catch (error) {
      console.error('Failed to fetch project pods:', error);
    }
  };

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const getDeploymentIcon = (deployment: string) => {
    switch (deployment) {
      case 'local': return <Home className="h-3 w-3" />;
      case 'remote': return <Globe className="h-3 w-3" />;
      case 'cloud': return <Cloud className="h-3 w-3" />;
      default: return <Home className="h-3 w-3" />;
    }
  };

  const getTotalAgents = (pods: any[]) => {
    return pods.reduce((sum, pod) => sum + (pod.agents?.length || 0), 0);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-2">Projects</h2>
        <p className="text-sm text-gray-500">Manage agent pods across projects</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {projects.map(project => {
          const isExpanded = expandedProjects.has(project.id);
          const totalAgents = getTotalAgents(project.pods);
          
          return (
            <Card key={project.id} className="overflow-hidden">
              <div
                className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  selectedProject === project.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                onClick={() => {
                  toggleProject(project.id);
                  setSelectedProject(project.id);
                  onSelectProject?.(project.id);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    {isExpanded ? (
                      <FolderOpen className="h-5 w-5 text-blue-500 mt-0.5" />
                    ) : (
                      <Folder className="h-5 w-5 text-gray-400 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-sm">{project.name}</h3>
                        <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {project.status}
                        </Badge>
                        <div className="flex items-center space-x-1 text-gray-500">
                          {getDeploymentIcon(project.deployment)}
                          <span className="text-xs">{project.deployment}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{project.description}</p>
                      <div className="flex items-center space-x-3 mt-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{project.pods.length} pods</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Activity className="h-3 w-3" />
                          <span>{totalAgents} agents</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {isExpanded && project.pods.length > 0 && (
                <div className="border-t px-3 py-2 bg-gray-50 dark:bg-gray-900/50">
                  <div className="space-y-2">
                    {project.pods.map(pod => (
                      <div key={pod.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                        <div>
                          <p className="text-sm font-medium">{pod.name}</p>
                          <p className="text-xs text-gray-500">
                            {pod.agents?.length || 0} agents • {pod.type}
                          </p>
                        </div>
                        <Badge variant={pod.status === 'active' ? 'success' : 'outline'} className="text-xs">
                          {pod.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      
      <div className="p-4 border-t">
        <Button className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create New Project
        </Button>
      </div>
    </div>
  );
}