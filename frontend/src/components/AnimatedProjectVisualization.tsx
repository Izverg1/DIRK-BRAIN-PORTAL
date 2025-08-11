'use client';

import { useEffect, useRef, useState } from 'react';

interface Agent {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  projectId: string;
  status: 'idle' | 'working' | 'completing';
}

interface Project {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  agents: string[];
  progress: number;
}

export default function AnimatedProjectVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2; // For retina displays
      canvas.height = rect.height * 2;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.scale(2, 2);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize projects
    const initialProjects: Project[] = [
      {
        id: 'web-dev',
        name: 'Web Development',
        x: 150,
        y: 100,
        color: '#8B5CF6',
        agents: [],
        progress: 0
      },
      {
        id: 'ai-research',
        name: 'AI Research',
        x: 400,
        y: 150,
        color: '#10B981',
        agents: [],
        progress: 0
      },
      {
        id: 'data-analysis',
        name: 'Data Analysis',
        x: 650,
        y: 120,
        color: '#F59E0B',
        agents: [],
        progress: 0
      },
      {
        id: 'mobile-app',
        name: 'Mobile App',
        x: 300,
        y: 280,
        color: '#EF4444',
        agents: [],
        progress: 0
      },
      {
        id: 'security',
        name: 'Security Audit',
        x: 550,
        y: 300,
        color: '#6366F1',
        agents: [],
        progress: 0
      }
    ];

    // Initialize agents
    const initialAgents: Agent[] = [
      {
        id: 'claude-1',
        name: 'Claude Opus',
        color: '#8B5CF6',
        x: 50,
        y: 50,
        targetX: 150,
        targetY: 100,
        projectId: 'web-dev',
        status: 'idle'
      },
      {
        id: 'claude-2',
        name: 'Claude Sonnet',
        color: '#10B981',
        x: 100,
        y: 80,
        targetX: 400,
        targetY: 150,
        projectId: 'ai-research',
        status: 'idle'
      },
      {
        id: 'claude-3',
        name: 'Claude Haiku',
        color: '#F59E0B',
        x: 75,
        y: 120,
        targetX: 650,
        targetY: 120,
        projectId: 'data-analysis',
        status: 'idle'
      },
      {
        id: 'claude-4',
        name: 'Claude Dev',
        color: '#EF4444',
        x: 25,
        y: 160,
        targetX: 300,
        targetY: 280,
        projectId: 'mobile-app',
        status: 'idle'
      },
      {
        id: 'claude-5',
        name: 'Claude Security',
        color: '#6366F1',
        x: 150,
        y: 200,
        targetX: 550,
        targetY: 300,
        projectId: 'security',
        status: 'idle'
      }
    ];

    setProjects(initialProjects);
    setAgents(initialAgents);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);

      // Draw connection lines
      agents.forEach(agent => {
        const project = projects.find(p => p.id === agent.projectId);
        if (project) {
          ctx.beginPath();
          ctx.moveTo(agent.x, agent.y);
          ctx.lineTo(project.x, project.y);
          ctx.strokeStyle = `${agent.color}40`;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Animated particles along the connection
          const dx = project.x - agent.x;
          const dy = project.y - agent.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          for (let i = 0; i < 3; i++) {
            const progress = ((Date.now() / 1000 + i * 0.3) % 1);
            const particleX = agent.x + dx * progress;
            const particleY = agent.y + dy * progress;
            
            ctx.beginPath();
            ctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
            ctx.fillStyle = agent.color;
            ctx.fill();
          }
        }
      });

      // Draw projects
      projects.forEach(project => {
        // Project circle
        ctx.beginPath();
        ctx.arc(project.x, project.y, 30, 0, Math.PI * 2);
        ctx.fillStyle = `${project.color}20`;
        ctx.fill();
        ctx.strokeStyle = project.color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Progress ring
        const progress = project.progress / 100;
        ctx.beginPath();
        ctx.arc(project.x, project.y, 35, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
        ctx.strokeStyle = project.color;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Project label
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 12px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(project.name, project.x, project.y - 50);

        // Progress percentage
        ctx.fillStyle = project.color;
        ctx.font = 'bold 10px system-ui';
        ctx.fillText(`${Math.round(project.progress)}%`, project.x, project.y + 5);
      });

      // Draw agents
      agents.forEach(agent => {
        // Agent movement animation
        agent.x += (agent.targetX - agent.x) * 0.02;
        agent.y += (agent.targetY - agent.y) * 0.02;

        // Agent circle with pulsing effect
        const pulseSize = 8 + Math.sin(Date.now() / 500 + agent.id.length) * 2;
        
        ctx.beginPath();
        ctx.arc(agent.x, agent.y, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = agent.color;
        ctx.fill();
        
        // Outer ring
        ctx.beginPath();
        ctx.arc(agent.x, agent.y, pulseSize + 3, 0, Math.PI * 2);
        ctx.strokeStyle = agent.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Agent label
        ctx.fillStyle = '#1F2937';
        ctx.font = '10px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(agent.name, agent.x, agent.y + 25);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Update project progress periodically
    const updateProgress = () => {
      setProjects(prev => prev.map(project => ({
        ...project,
        progress: Math.min(100, project.progress + Math.random() * 2)
      })));
    };

    const progressInterval = setInterval(updateProgress, 1000);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearInterval(progressInterval);
    };
  }, [agents, projects]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200"
      />
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Web Development</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">AI Research</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Data Analysis</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Mobile App</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Security Audit</span>
        </div>
      </div>

      {/* Status indicators */}
      <div className="absolute top-2 right-2 space-y-1">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>5 Agents Active</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Real-time Sync</span>
        </div>
      </div>
    </div>
  );
}