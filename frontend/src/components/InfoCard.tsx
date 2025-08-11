'use client';

import React from 'react';

interface InfoCardProps {
  title: string;
  subtitle: string;
  color?: 'blue' | 'cyan' | 'teal';
}

const InfoCard: React.FC<InfoCardProps> = ({ 
  title, 
  subtitle,
  color = 'blue' 
}) => {
  const colorVariants = {
    blue: 'bg-blue-600',
    cyan: 'bg-cyan-500',
    teal: 'bg-teal-400'
  };

  return (
    <div className={`${colorVariants[color]} text-white p-6 rounded-lg`}>
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <p className="text-sm opacity-90">{subtitle}</p>
    </div>
  );
};

export default InfoCard;