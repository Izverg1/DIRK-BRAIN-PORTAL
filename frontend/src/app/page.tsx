'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DirkSidebar from '@/components/DirkSidebar';
import RTSLoadingScreen from '@/components/RTSLoadingScreen';
import NoSSR from '@/components/NoSSR';
import { HydrationErrorBoundary } from '@/components/HydrationErrorBoundary';
import KSONLogo from '@/components/KSONLogo';
import AgentWorldVisualization from '@/components/AgentWorldVisualization';
import DirkAgentGridView from '@/components/DirkAgentGridView';
import DirkPerformanceMetrics from '@/components/DirkPerformanceMetrics';
import DirkNeuralTopology from '@/components/DirkNeuralTopology';
import DirkGlobalDistribution from '@/components/DirkGlobalDistribution';
import RPGAgentInterface from '@/components/RPGAgentInterface';
import CleanAgentInterface from '@/components/CleanAgentInterface';

// VS Code style right sidebar
const VSCodeRightSidebar = dynamic(() => import('@/components/VSCodeRightSidebar'), {
  ssr: false,
  loading: () => <div className="w-80 bg-black border-l border-red-600 animate-pulse" />
});

// Global Agent Map
const GlobalAgentMap = dynamic(() => import('@/components/GlobalAgentMap'), {
  ssr: false,
  loading: () => <div className="w-full h-96 bg-slate-900 rounded-2xl animate-pulse" />
});

// Dynamic imports for charts
const AreaChart = dynamic(() => import('@/components/AreaChart'), {
  ssr: false,
  loading: () => <div className="w-full h-48 bg-gray-50 animate-pulse rounded-lg" />
});

const DonutChart = dynamic(() => import('@/components/DonutChart'), {
  ssr: false,
  loading: () => <div className="w-full h-48 bg-gray-50 animate-pulse rounded-lg" />
});

// Dynamic import for animated project visualization - placeholder for now

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, change, trend, icon }: MetricCardProps) => (
  <div className="kson-glow bg-card/60 backdrop-blur-sm rounded-xl p-3 shadow-lg hover:shadow-xl kson-border hover:border-primary/50 transition-all group relative overflow-hidden">
    {/* Subtle glow effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    
    <div className="flex items-start justify-between relative z-10">
      <div className="flex-1">
        <p className="text-muted-foreground text-xs font-medium mb-1">{title}</p>
        <p className="text-xl font-bold text-foreground mb-1 font-mono">{value}</p>
        <div className="flex items-center gap-1">
          <span className={`text-xs font-medium ${trend === 'up' ? 'text-primary' : 'text-destructive'}`}>
            {trend === 'up' ? '↗' : '↘'} {change}
          </span>
        </div>
      </div>
      <div className="w-8 h-8 kson-gradient rounded-lg flex items-center justify-center kson-border">
        <div className="text-primary-foreground">
          {icon}
        </div>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [activeView, setActiveView] = useState<'clean' | 'rpg' | 'grid' | 'performance' | 'topology' | 'global'>('rpg');
  const [agents, setAgents] = useState([
    // Claude Agents - Neural Mages
    { id: 1, name: 'Claude-4-Archmagus', status: 'active', tasks: 2847, accuracy: 99.5, type: 'claude', class: 'Archmagus', level: 45 },
    { id: 2, name: 'Claude-3.5-Sonnet', status: 'active', tasks: 1847, accuracy: 99.2, type: 'claude', class: 'Sonnet-Mage', level: 42 },
    { id: 3, name: 'Claude-3-Opus', status: 'active', tasks: 1678, accuracy: 99.4, type: 'claude', class: 'Opus-Scholar', level: 44 },
    { id: 4, name: 'Claude-3-Haiku', status: 'active', tasks: 2156, accuracy: 98.9, type: 'claude', class: 'Haiku-Swift', level: 38 },
    
    // GPT Agents - Battle Warriors  
    { id: 5, name: 'GPT-4-Turbo-Centurion', status: 'active', tasks: 1456, accuracy: 98.7, type: 'gpt', class: 'Centurion', level: 40 },
    { id: 6, name: 'GPT-4o-Champion', status: 'active', tasks: 1234, accuracy: 98.4, type: 'gpt', class: 'Champion', level: 39 },
    { id: 7, name: 'GPT-4o-Mini-Scout', status: 'active', tasks: 987, accuracy: 97.8, type: 'gpt', class: 'Scout', level: 32 },
    { id: 8, name: 'GPT-3.5-Veteran', status: 'active', tasks: 2456, accuracy: 96.2, type: 'gpt', class: 'Veteran', level: 35 },
    
    // Gemini Agents - Oracle Seers
    { id: 9, name: 'Gemini-Pro-Oracle', status: 'active', tasks: 1234, accuracy: 98.1, type: 'gemini', class: 'Oracle', level: 41 },
    { id: 10, name: 'Gemini-Ultra-Seer', status: 'active', tasks: 892, accuracy: 98.8, type: 'gemini', class: 'Seer', level: 43 },
    { id: 11, name: 'Gemini-Flash-Prophet', status: 'processing', tasks: 1567, accuracy: 97.5, type: 'gemini', class: 'Prophet', level: 37 },
    
    // Local Agents - Shadow Rogues
    { id: 12, name: 'Local-Llama-70B-Shadow', status: 'idle', tasks: 623, accuracy: 96.9, type: 'local', class: 'Shadow', level: 28 },
    { id: 13, name: 'Local-Mistral-Large-Thief', status: 'active', tasks: 892, accuracy: 97.5, type: 'local', class: 'Thief', level: 30 },
    { id: 14, name: 'Local-CodeLlama-Assassin', status: 'active', tasks: 445, accuracy: 95.8, type: 'local', class: 'Assassin', level: 26 },
    { id: 15, name: 'Local-Phi3-Rogue', status: 'processing', tasks: 334, accuracy: 94.2, type: 'local', class: 'Rogue', level: 24 },
    
    // Specialized Agents - Elite Classes
    { id: 16, name: 'DeepSeek-Coder-V2-Architect', status: 'active', tasks: 756, accuracy: 98.9, type: 'deepseek', class: 'Code-Architect', level: 41 },
    { id: 17, name: 'Anthropic-Constitutional-Paladin', status: 'active', tasks: 234, accuracy: 99.8, type: 'claude', class: 'Paladin', level: 47 },
    { id: 18, name: 'OpenAI-Reasoning-Strategist', status: 'active', tasks: 567, accuracy: 98.6, type: 'gpt', class: 'Strategist', level: 40 },
    { id: 19, name: 'Google-Multimodal-Diviner', status: 'processing', tasks: 445, accuracy: 97.8, type: 'gemini', class: 'Diviner', level: 36 },
    { id: 20, name: 'Meta-Llama-Guard-Sentinel', status: 'active', tasks: 123, accuracy: 99.1, type: 'local', class: 'Sentinel', level: 33 },
  ]);
  const [showLoading, setShowLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Show RTS loading screen on first visit
  useEffect(() => {
    const hasSeenLoading = localStorage.getItem('dirk-agency-loaded');
    if (!hasSeenLoading) {
      setShowLoading(true);
    } else {
      setShowLoading(false);
      setIsLoaded(true);
    }
  }, []);

  const handleLoadingComplete = () => {
    localStorage.setItem('dirk-agency-loaded', 'true');
    setShowLoading(false);
    setTimeout(() => setIsLoaded(true), 500);
  };

  // Show RTS loading screen
  if (showLoading) {
    return <RTSLoadingScreen onComplete={handleLoadingComplete} />;
  }

  // Show loading state while components initialize
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-5v5m0 5v5" />
            </svg>
          </div>
          <p className="text-gray-600">Initializing DIRK Agency...</p>
        </div>
      </div>
    );
  }

  return (
    <HydrationErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex relative">
        {/* KSON Grid Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(220, 38, 38, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(220, 38, 38, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-red-500 rounded-full opacity-30 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
        {/* Left Sidebar */}
        <NoSSR fallback={
          <div className="w-64 bg-slate-900 h-screen flex items-center justify-center text-white">
            <div className="animate-pulse">Loading navigation...</div>
          </div>
        }>
          <div className="relative z-20">
            <DirkSidebar />
          </div>
        </NoSSR>

        {/* Main Content */}
        <main className="flex-1 overflow-auto relative z-10">
        {/* Header */}
        <header className="bg-black/90 backdrop-blur-sm border-b border-red-600 px-6 py-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <KSONLogo size="md" className="flex-shrink-0" />
              <div>
                <h1 className="text-2xl font-bold text-white uppercase tracking-wide">DIRK BRAIN PORTAL</h1>
                <p className="text-white/70 mt-1 uppercase tracking-wide">Universal AI Agent Orchestration Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* View Selector */}
              <div className="flex items-center space-x-2">
                {[
                  { id: 'rpg', name: 'Guild', icon: '⚔️' },
                  { id: 'clean', name: 'Agents', icon: '■' },
                  { id: 'grid', name: 'Grid', icon: '⚡' },
                  { id: 'performance', name: 'Metrics', icon: '📊' },
                  { id: 'topology', name: 'Network', icon: '🌐' },
                  { id: 'global', name: 'Global', icon: '🌍' }
                ].map((view) => (
                  <button
                    key={view.id}
                    onClick={() => setActiveView(view.id as any)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded text-xs font-medium transition-colors uppercase tracking-wide ${
                      activeView === view.id
                        ? 'bg-red-600 text-white'
                        : 'text-white/70 hover:text-white hover:bg-red-900/30'
                    }`}
                  >
                    <span>{view.icon}</span>
                    <span>{view.name}</span>
                  </button>
                ))}
              </div>
              
              <button className="p-2 text-white/70 hover:text-red-400 relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full ring-2 ring-red-500 bg-red-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">AI</span>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-white uppercase tracking-wide">DIRK AGENT</div>
                  <div className="text-white/70 uppercase tracking-wide">ACTIVE SESSION</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content - RPG Guild Interface (Default) */}
        <div className="flex-1 overflow-hidden">
          {activeView === 'rpg' && (
            <NoSSR fallback={
              <div className="h-full bg-black flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white text-sm uppercase tracking-wide">Loading Neural Guild Interface...</p>
                </div>
              </div>
            }>
              <RPGAgentInterface className="h-full" />
            </NoSSR>
          )}

          {activeView === 'clean' && (
            <NoSSR fallback={
              <div className="h-full bg-black flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white text-sm uppercase tracking-wide">Loading Agent System...</p>
                </div>
              </div>
            }>
              <CleanAgentInterface className="h-full" />
            </NoSSR>
          )}

          {activeView !== 'clean' && activeView !== 'rpg' && (
            <div className="h-full flex flex-col p-6 bg-black/95 backdrop-blur-sm">
              {/* Other Views Header */}
              <div className="flex-shrink-0 mb-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wide">
                  DIRK NEURAL COMMAND CENTER
                </h2>
                <p className="text-white/70 text-sm uppercase tracking-wide">
                  Agent World Visual Systems • Real-time AI Orchestration
                </p>
              </div>

              {/* Status Grid for other views */}
              <div className="flex-shrink-0 grid grid-cols-4 gap-3 mb-4">
                <MetricCard
                  title="Neural Agents"
                  value="63"
                  change="+12.3%"
                  trend="up"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  }
                />
                <MetricCard
                  title="Global Efficiency"
                  value="94.7%"
                  change="+8.4%"
                  trend="up"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  }
                />
                <MetricCard
                  title="Network Latency"
                  value="15.3ms"
                  change="-23.1%"
                  trend="up"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                    </svg>
                  }
                />
                <MetricCard
                  title="Task Success"
                  value="98.2%"
                  change="+2.1%"
                  trend="up"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
              </div>

              {/* Other Views Content */}
              <div className="flex-1 min-h-0">
                {activeView === 'grid' && (
                  <NoSSR fallback={
                    <div className="h-full bg-secondary/10 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-muted-foreground text-sm">Loading AGENT WORLD 3 Grid System...</p>
                      </div>
                    </div>
                  }>
                    <DirkAgentGridView className="h-full" />
                  </NoSSR>
                )}

                {activeView === 'performance' && (
                  <NoSSR fallback={
                    <div className="h-full bg-secondary/10 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-muted-foreground text-sm">Loading AGENT WORLD 4 Metrics System...</p>
                      </div>
                    </div>
                  }>
                    <DirkPerformanceMetrics className="h-full" />
                  </NoSSR>
                )}

                {activeView === 'topology' && (
                  <NoSSR fallback={
                    <div className="h-full bg-secondary/10 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-muted-foreground text-sm">Loading AGENT WORLDMAP Topology...</p>
                      </div>
                    </div>
                  }>
                    <DirkNeuralTopology className="h-full" />
                  </NoSSR>
                )}

                {activeView === 'global' && (
                  <NoSSR fallback={
                    <div className="h-full bg-secondary/10 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-muted-foreground text-sm">Loading AGENT WORLD1 Global System...</p>
                      </div>
                    </div>
                  }>
                    <DirkGlobalDistribution className="h-full" />
                  </NoSSR>
                )}
              </div>
            </div>
          )}
        </div>
        </main>

        {/* Right Sidebar - VS Code Style */}
        <NoSSR fallback={
          <div className="w-80 bg-black border-l border-red-600 animate-pulse">
            <div className="p-4 text-center text-white uppercase tracking-wide">Loading activity panel...</div>
          </div>
        }>
          <div className="relative z-20">
            <VSCodeRightSidebar />
          </div>
        </NoSSR>
      </div>
    </HydrationErrorBoundary>
  );
}