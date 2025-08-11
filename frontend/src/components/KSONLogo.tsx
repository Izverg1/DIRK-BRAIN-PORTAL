"use client";

interface KSONLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function KSONLogo({ size = 'md', className = '' }: KSONLogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  return (
    <div className={`kson-logo ${sizeClasses[size]} ${className}`}>
      <div className="flex items-center space-x-1">
        <span className="text-primary font-extrabold">K</span>
        <span className="text-secondary font-extrabold">S</span>
        <span className="text-primary font-extrabold">O</span>
        <span className="text-secondary font-extrabold">N</span>
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse ml-1" />
      </div>
    </div>
  );
}