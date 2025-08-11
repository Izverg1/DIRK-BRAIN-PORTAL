'use client';

import React from 'react';
import { Folder, MoreVertical, Calendar } from 'lucide-react';

interface FolderCardProps {
  title: string;
  fileCount: number;
  lastModified: string;
  contributors: string[];
  variant?: 'light' | 'dark' | 'medium';
}

const FolderCard: React.FC<FolderCardProps> = ({ 
  title, 
  fileCount, 
  lastModified, 
  contributors,
  variant = 'light' 
}) => {
  const variants = {
    light: 'bg-sky-200 text-gray-800',
    dark: 'bg-blue-900 text-white',
    medium: 'bg-sky-400 text-white'
  };

  return (
    <div className={`p-6 rounded-xl ${variants[variant]} relative overflow-hidden`}>
      <div className="flex justify-between items-start mb-4">
        <Folder size={32} className={variant === 'light' ? 'text-blue-600' : 'text-white'} />
        <button className="p-1 hover:bg-white/20 rounded">
          <MoreVertical size={20} />
        </button>
      </div>
      
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      
      <div className="flex items-center gap-2 mb-3">
        {contributors.map((contributor, idx) => (
          <div 
            key={idx} 
            className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center text-xs font-semibold"
          >
            {contributor}
          </div>
        ))}
      </div>
      
      <div className="flex items-center gap-2 text-sm opacity-80">
        <Folder size={16} />
        <span>{fileCount} Files</span>
      </div>
      
      <div className="flex items-center gap-2 text-sm opacity-80 mt-1">
        <Calendar size={16} />
        <span>{lastModified}</span>
      </div>
    </div>
  );
};

export default FolderCard;