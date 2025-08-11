'use client';

import { useEffect, useRef, useState } from 'react';

interface Agent {
  id: string;
  team: 'claude' | 'enemy';
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  health: number;
  maxHealth: number;
  isDead: boolean;
  weapon: 'laser' | 'missile' | 'plasma';
  lastShot: number;
  name: string;
}

interface Projectile {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  type: 'laser' | 'missile' | 'plasma';
  damage: number;
  speed: number;
}

interface Explosion {
  id: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export default function RTSLoadingScreen({ onComplete }: { onComplete?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [battlePhase, setBattlePhase] = useState<'deploying' | 'fighting' | 'victory' | 'complete'>('deploying');
  const [loadingProgress, setLoadingProgress] = useState(0);

  const claudeNames = [
    'Claude-Alpha', 'Claude-Beta', 'Claude-Gamma', 'Claude-Delta', 'Claude-Prime',
    'Claude-Nova', 'Claude-Omega', 'Claude-Zero', 'Claude-Neo', 'Claude-X'
  ];

  const enemyNames = [
    'Bug-Bot', 'Error-404', 'Null-Pointer', 'Stack-Overflow', 'Memory-Leak',
    'Infinite-Loop', 'Race-Condition', 'Deadlock', 'Buffer-Overflow', 'Syntax-Error'
  ];

  const battleMessages = [
    '🚀 Initializing DIRK Agency combat protocols...',
    '⚡ Claude agents deploying to battlefield...',
    '🎯 Scanning for hostile code entities...',
    '💥 Engaging enemy processes!',
    '🛡️ Claude-Alpha: "Initiating defensive subroutines!"',
    '⚔️ Bug-Bot detected! All units converge!',
    '🔥 Claude-Prime: "Error entities eliminated!"',
    '🏆 Claude forces victorious! Portal secure!',
    '✅ DIRK Agency platform fully operational!'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.scale(2, 2);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize battle
    initializeBattle();

    // Battle progression timer
    const battleTimer = setTimeout(() => {
      if (battlePhase === 'deploying') setBattlePhase('fighting');
    }, 2000);

    const victoryTimer = setTimeout(() => {
      if (battlePhase === 'fighting') setBattlePhase('victory');
    }, 8000);

    const completeTimer = setTimeout(() => {
      setBattlePhase('complete');
      if (onComplete) onComplete();
    }, 12000);

    // Message timer
    let messageIndex = 0;
    const messageTimer = setInterval(() => {
      if (messageIndex < battleMessages.length) {
        setMessages(prev => [...prev, battleMessages[messageIndex]]);
        messageIndex++;
      }
    }, 1500);

    // Progress timer
    const progressTimer = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = Math.min(100, prev + Math.random() * 15);
        // Auto-complete if progress reaches 100%
        if (newProgress >= 100 && onComplete) {
          setTimeout(onComplete, 1000);
        }
        return newProgress;
      });
    }, 500);
    
    // Fallback completion timer (in case progress gets stuck)
    const fallbackTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 8000);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearTimeout(battleTimer);
      clearTimeout(victoryTimer);
      clearTimeout(completeTimer);
      clearTimeout(fallbackTimer);
      clearInterval(messageTimer);
      clearInterval(progressTimer);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [onComplete]);

  const initializeBattle = () => {
    const newAgents: Agent[] = [];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    // Create Claude agents (left side)
    for (let i = 0; i < 5; i++) {
      newAgents.push({
        id: `claude-${i}`,
        team: 'claude',
        x: 50 + Math.random() * 100,
        y: 100 + i * 60,
        targetX: 200 + Math.random() * 100,
        targetY: 100 + i * 60,
        health: 100,
        maxHealth: 100,
        isDead: false,
        weapon: ['laser', 'missile', 'plasma'][Math.floor(Math.random() * 3)] as any,
        lastShot: 0,
        name: claudeNames[i]
      });
    }

    // Create enemy agents (right side)
    for (let i = 0; i < 7; i++) {
      newAgents.push({
        id: `enemy-${i}`,
        team: 'enemy',
        x: width - 50 - Math.random() * 100,
        y: 80 + i * 50,
        targetX: width - 200 - Math.random() * 100,
        targetY: 80 + i * 50,
        health: 60,
        maxHealth: 60,
        isDead: false,
        weapon: ['laser', 'missile'][Math.floor(Math.random() * 2)] as any,
        lastShot: 0,
        name: enemyNames[i]
      });
    }

    setAgents(newAgents);
    animate();
  };

  const animate = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid background
    drawGrid(ctx, width, height);

    // Update and draw agents
    setAgents(prevAgents => {
      const updatedAgents = prevAgents.map(agent => updateAgent(agent, prevAgents));
      drawAgents(ctx, updatedAgents);
      return updatedAgents;
    });

    // Update and draw projectiles
    setProjectiles(prevProjectiles => {
      const updatedProjectiles = prevProjectiles
        .map(proj => updateProjectile(proj))
        .filter(proj => proj.x >= 0 && proj.x <= width && proj.y >= 0 && proj.y <= height);
      
      drawProjectiles(ctx, updatedProjectiles);
      return updatedProjectiles;
    });

    // Update and draw explosions
    setExplosions(prevExplosions => {
      const updatedExplosions = prevExplosions
        .map(exp => ({
          ...exp,
          radius: Math.min(exp.maxRadius, exp.radius + 2),
          alpha: Math.max(0, exp.alpha - 0.05)
        }))
        .filter(exp => exp.alpha > 0);
      
      drawExplosions(ctx, updatedExplosions);
      return updatedExplosions;
    });

    animationRef.current = requestAnimationFrame(animate);
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const updateAgent = (agent: Agent, allAgents: Agent[]): Agent => {
    if (agent.isDead || battlePhase !== 'fighting') return agent;

    // Move towards target
    const dx = agent.targetX - agent.x;
    const dy = agent.targetY - agent.y;
    const speed = 0.5;

    const newAgent = {
      ...agent,
      x: agent.x + dx * speed * 0.1,
      y: agent.y + dy * speed * 0.1
    };

    // Find enemy to attack
    const enemies = allAgents.filter(a => a.team !== agent.team && !a.isDead);
    const nearestEnemy = enemies.reduce((closest, enemy) => {
      const dist1 = Math.sqrt((agent.x - enemy.x) ** 2 + (agent.y - enemy.y) ** 2);
      const dist2 = closest ? Math.sqrt((agent.x - closest.x) ** 2 + (agent.y - closest.y) ** 2) : Infinity;
      return dist1 < dist2 ? enemy : closest;
    }, null as Agent | null);

    // Shoot at enemy
    if (nearestEnemy && Date.now() - agent.lastShot > 1500) {
      const distance = Math.sqrt((agent.x - nearestEnemy.x) ** 2 + (agent.y - nearestEnemy.y) ** 2);
      if (distance < 250) {
        setProjectiles(prev => [...prev, {
          id: `proj-${Date.now()}-${Math.random()}`,
          x: agent.x,
          y: agent.y,
          targetX: nearestEnemy.x,
          targetY: nearestEnemy.y,
          type: agent.weapon,
          damage: 25,
          speed: 3
        }]);
        newAgent.lastShot = Date.now();
      }
    }

    return newAgent;
  };

  const updateProjectile = (projectile: Projectile): Projectile => {
    const dx = projectile.targetX - projectile.x;
    const dy = projectile.targetY - projectile.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 5) {
      // Hit target - create explosion
      setExplosions(prev => [...prev, {
        id: `exp-${Date.now()}`,
        x: projectile.x,
        y: projectile.y,
        radius: 0,
        maxRadius: 20,
        alpha: 1
      }]);

      // Damage nearby enemies
      setAgents(prev => prev.map(agent => {
        const dist = Math.sqrt((agent.x - projectile.x) ** 2 + (agent.y - projectile.y) ** 2);
        if (dist < 30 && !agent.isDead) {
          const newHealth = agent.health - projectile.damage;
          return {
            ...agent,
            health: newHealth,
            isDead: newHealth <= 0
          };
        }
        return agent;
      }));

      return projectile; // Will be filtered out
    }

    const moveX = (dx / distance) * projectile.speed;
    const moveY = (dy / distance) * projectile.speed;

    return {
      ...projectile,
      x: projectile.x + moveX,
      y: projectile.y + moveY
    };
  };

  const drawAgents = (ctx: CanvasRenderingContext2D, agents: Agent[]) => {
    agents.forEach(agent => {
      if (agent.isDead) return;

      // Agent color based on team
      const color = agent.team === 'claude' ? '#8b5cf6' : '#ef4444';
      const size = 8;

      // Draw agent
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(agent.x, agent.y, size, 0, Math.PI * 2);
      ctx.fill();

      // Draw health bar
      const barWidth = 20;
      const barHeight = 3;
      const healthPercent = agent.health / agent.maxHealth;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(agent.x - barWidth/2, agent.y - size - 8, barWidth, barHeight);
      
      ctx.fillStyle = healthPercent > 0.5 ? '#10b981' : healthPercent > 0.25 ? '#f59e0b' : '#ef4444';
      ctx.fillRect(agent.x - barWidth/2, agent.y - size - 8, barWidth * healthPercent, barHeight);

      // Draw name
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(agent.name, agent.x, agent.y + size + 15);
    });
  };

  const drawProjectiles = (ctx: CanvasRenderingContext2D, projectiles: Projectile[]) => {
    projectiles.forEach(proj => {
      const colors = {
        laser: '#00ff00',
        missile: '#ff6b00',
        plasma: '#ff00ff'
      };

      ctx.fillStyle = colors[proj.type];
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, 3, 0, Math.PI * 2);
      ctx.fill();

      // Trail effect
      ctx.strokeStyle = colors[proj.type];
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(proj.x, proj.y);
      ctx.lineTo(proj.x - (proj.targetX - proj.x) * 0.1, proj.y - (proj.targetY - proj.y) * 0.1);
      ctx.stroke();
      ctx.globalAlpha = 1;
    });
  };

  const drawExplosions = (ctx: CanvasRenderingContext2D, explosions: Explosion[]) => {
    explosions.forEach(exp => {
      ctx.globalAlpha = exp.alpha;
      
      // Outer ring
      ctx.strokeStyle = '#ff6b00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Inner fill
      const gradient = ctx.createRadialGradient(exp.x, exp.y, 0, exp.x, exp.y, exp.radius);
      gradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 107, 0, 0.2)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(exp.x, exp.y, exp.radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.globalAlpha = 1;
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-50">
      {/* Battle Canvas */}
      <div className="relative w-full h-2/3 max-w-4xl border border-slate-700 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ background: 'linear-gradient(45deg, #0f172a 0%, #1e293b 100%)' }}
        />
        
        {/* Battle UI Overlay */}
        <div className="absolute top-4 left-4 text-white">
          <div className="bg-slate-800/80 rounded-lg p-3 backdrop-blur">
            <h3 className="font-bold text-lg mb-2 text-violet-400">⚔️ DIRK Agency Battle</h3>
            <div className="text-sm space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
                <span>Claude Forces: {agents.filter(a => a.team === 'claude' && !a.isDead).length}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Bug Entities: {agents.filter(a => a.team === 'enemy' && !a.isDead).length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Battle Status */}
        <div className="absolute top-4 right-4 text-white">
          <div className="bg-slate-800/80 rounded-lg p-3 backdrop-blur text-right">
            <div className="text-sm font-mono">
              Phase: <span className="text-cyan-400 capitalize">{battlePhase}</span>
            </div>
            <div className="text-sm font-mono">
              Active Projectiles: <span className="text-yellow-400">{projectiles.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Message Console */}
      <div className="w-full max-w-4xl mt-4 bg-black/80 rounded-lg p-4 h-32 overflow-y-auto">
        <div className="font-mono text-green-400 text-sm space-y-1">
          {messages.map((msg, i) => (
            <div key={i} className="animate-pulse">
              <span className="text-cyan-400">[{new Date().toLocaleTimeString()}]</span> {msg}
            </div>
          ))}
        </div>
      </div>

      {/* Loading Progress */}
      <div className="w-full max-w-4xl mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-semibold">Loading DIRK Agency Platform</span>
          <span className="text-violet-400 font-mono">{Math.round(loadingProgress)}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-violet-500 to-purple-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${loadingProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Victory Message */}
      {battlePhase === 'victory' && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-gradient-to-br from-violet-600 to-purple-600 text-white p-8 rounded-2xl text-center animate-pulse">
            <h2 className="text-3xl font-bold mb-4">🏆 VICTORY!</h2>
            <p className="text-lg">Claude agents have secured the DIRK Portal!</p>
            <p className="text-sm mt-2 opacity-75">All hostile processes eliminated</p>
          </div>
        </div>
      )}
    </div>
  );
}