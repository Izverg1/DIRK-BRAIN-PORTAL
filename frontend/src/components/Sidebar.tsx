'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Home, 
  FileText, 
  Folder, 
  Star, 
  Trash2, 
  BarChart3, 
  LogOut 
} from 'lucide-react';

interface SidebarProps {
  activeItem?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem = 'dashboard' }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'agents', label: 'AI Agents', icon: FileText },
    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'tasks', label: 'Active Tasks', icon: Star },
    { id: 'completed', label: 'Completed', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Folder },
  ];

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-blue-800 to-blue-900 text-white p-4 flex flex-col">
      <h1 className="text-2xl font-bold mb-8">DIRK Brain</h1>
      
      <nav className="flex-1">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href="#"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
              activeItem === item.id 
                ? 'bg-white/20 text-white' 
                : 'hover:bg-white/10 text-white/80'
            }`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      
      <Link
        href="#"
        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-white/80 mt-auto"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </Link>
    </div>
  );
};

export default Sidebar;