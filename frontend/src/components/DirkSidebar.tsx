'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import ClientOnlyLink from '@/components/ClientOnlyLink';
import NoSSR from '@/components/NoSSR';
import { HydrationErrorBoundary } from '@/components/HydrationErrorBoundary';
import { withExtensionResilience } from '@/components/ExtensionResilient';

interface SidebarItem {
  id: string;
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  subItems?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    href: '/',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
      </svg>
    ),
  },
  {
    id: 'orchestrator',
    name: 'Agent Orchestrator',
    href: '/orchestrator',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-5v5m0 5v5" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 14l3 3 7-7" />
      </svg>
    ),
    badge: 'Live',
  },
  {
    id: 'performance',
    name: 'Performance Analytics',
    href: '/performance',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    badge: 'Neural',
  },
  {
    id: 'neural-systems',
    name: 'Neural Systems',
    href: '/neural-systems',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    badge: 'Live',
  },
  {
    id: 'projects',
    name: 'Active Projects',
    href: '/projects',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-5v5m0 5v5" />
      </svg>
    ),
    subItems: [
      { id: 'project-overview', name: 'Project Overview', href: '/projects/overview', icon: null },
      { id: 'agent-assignments', name: 'Agent Assignments', href: '/projects/assignments', icon: null },
      { id: 'project-analytics', name: 'Project Analytics', href: '/projects/analytics', icon: null },
    ]
  },
  {
    id: 'mcp-factory',
    name: 'MCP Server Factory',
    href: '/mcp-factory',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    badge: 'New',
    subItems: [
      { id: 'local-servers', name: 'Local MCP Servers', href: '/mcp-factory/local', icon: null },
      { id: 'remote-servers', name: 'Remote Deployment', href: '/mcp-factory/remote', icon: null },
      { id: 'server-templates', name: 'Server Templates', href: '/mcp-factory/templates', icon: null },
    ]
  },
  {
    id: 'slash-commands',
    name: 'Slash Commands',
    href: '/slash-commands',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    subItems: [
      { id: 'command-builder', name: 'Command Builder', href: '/slash-commands/builder', icon: null },
      { id: 'custom-commands', name: 'Custom Commands', href: '/slash-commands/custom', icon: null },
      { id: 'command-history', name: 'Command History', href: '/slash-commands/history', icon: null },
    ]
  },
  {
    id: 'hooks',
    name: 'Hooks & Automation',
    href: '/hooks',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    subItems: [
      { id: 'git-hooks', name: 'Git Hooks', href: '/hooks/git', icon: null },
      { id: 'webhook-endpoints', name: 'Webhook Endpoints', href: '/hooks/webhooks', icon: null },
      { id: 'automation-rules', name: 'Automation Rules', href: '/hooks/automation', icon: null },
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics',
    href: '/analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    subItems: [
      { id: 'performance', name: 'Performance Metrics', href: '/analytics/performance', icon: null },
      { id: 'usage-stats', name: 'Usage Statistics', href: '/analytics/usage', icon: null },
      { id: 'cost-tracking', name: 'Cost Tracking', href: '/analytics/costs', icon: null },
    ]
  },
  {
    id: 'settings',
    name: 'Settings',
    href: '/settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    subItems: [
      { id: 'general', name: 'General Settings', href: '/settings/general', icon: null },
      { id: 'integrations', name: 'Integrations', href: '/settings/integrations', icon: null },
      { id: 'api-keys', name: 'API Keys', href: '/settings/api-keys', icon: null },
    ]
  }
];

function DirkSidebarComponent() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['projects', 'mcp-factory']);
  const pathname = usePathname();

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <HydrationErrorBoundary fallback={
      <div className="w-64 bg-black h-screen flex items-center justify-center text-white">
        Loading sidebar...
      </div>
    }>
      <div className={`bg-black text-white h-screen transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} flex flex-col border-r border-red-600`}>
      {/* Header */}
      <div className="p-4 border-b border-red-600 flex items-center justify-between">
        {!collapsed && (
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-red-500 uppercase tracking-wide">
              DIRK AGENCY
            </h1>
            <p className="text-xs text-white/70 mt-1 uppercase tracking-wide">
              Neural AI Orchestration
            </p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded hover:bg-red-900/30 transition-colors"
        >
          <svg
            className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => (
          <div key={item.id}>
            <div className="relative">
              <ClientOnlyLink
                href={item.href}
                className={`w-full flex items-center px-3 py-2 rounded text-sm font-medium transition-all duration-200 uppercase tracking-wide ${
                  isActive(item.href)
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'text-white/80 hover:bg-red-900/30 hover:text-white'
                } ${collapsed ? 'justify-center' : 'justify-between'}`}
                onClick={(e) => {
                  if (item.subItems && !collapsed) {
                    e.preventDefault();
                    toggleExpanded(item.id);
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span>{item.name}</span>}
                </div>
                
                {!collapsed && (
                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.badge === 'Live'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-primary/20 text-primary border border-primary/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {item.subItems && (
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          expandedItems.includes(item.id) ? 'rotate-90' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                )}
              </ClientOnlyLink>
            </div>

            {/* Sub Items */}
            {item.subItems && expandedItems.includes(item.id) && !collapsed && (
              <div className="mt-2 ml-4 space-y-1 border-l border-red-600 pl-4">
                {item.subItems.map((subItem) => (
                  <ClientOnlyLink
                    key={subItem.id}
                    href={subItem.href}
                    className={`block px-3 py-2 text-sm rounded transition-colors uppercase tracking-wide ${
                      isActive(subItem.href)
                        ? 'bg-red-900/30 text-red-400'
                        : 'text-white/60 hover:bg-red-900/20 hover:text-white'
                    }`}
                  >
                    {subItem.name}
                  </ClientOnlyLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-red-600">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate uppercase tracking-wide">CLAUDE AGENT</p>
              <p className="text-xs text-white/70 truncate uppercase tracking-wide">GOD MODE ACTIVE</p>
            </div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
      </div>
    </HydrationErrorBoundary>
  );
}

// Export the extension-resilient version
export default withExtensionResilience(DirkSidebarComponent, {
  debug: process.env.NODE_ENV === 'development'
});