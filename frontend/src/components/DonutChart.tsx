'use client';

import { useEffect, useRef } from 'react';

interface ChartSegment {
  value: number;
  color: string;
  label: string;
}

export default function DonutChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size for retina displays
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    canvas.style.width = canvas.offsetWidth + 'px';
    canvas.style.height = canvas.offsetHeight + 'px';
    ctx.scale(2, 2);
    
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(width, height) / 2 - 20;
    const innerRadius = outerRadius * 0.6;
    
    // Data for the donut chart
    const segments: ChartSegment[] = [
      { value: 35, color: '#8b5cf6', label: 'Claude' },
      { value: 28, color: '#a855f7', label: 'GPT-4' },
      { value: 22, color: '#6366f1', label: 'Gemini' },
      { value: 15, color: '#3b82f6', label: 'Others' }
    ];
    
    // Calculate angles
    const total = segments.reduce((sum, seg) => sum + seg.value, 0);
    let currentAngle = -Math.PI / 2; // Start from top
    
    // Draw segments
    segments.forEach((segment, index) => {
      const segmentAngle = (segment.value / total) * Math.PI * 2;
      
      // Draw segment
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + segmentAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + segmentAngle, currentAngle, true);
      ctx.closePath();
      
      // Create gradient for each segment
      const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);
      gradient.addColorStop(0, segment.color);
      gradient.addColorStop(1, adjustColor(segment.color, -20));
      
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Add subtle shadow between segments
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw hover effect (slightly larger arc for selected segment)
      if (index === 0) { // Highlight first segment by default
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius + 3, currentAngle, currentAngle + segmentAngle);
        ctx.arc(centerX, centerY, innerRadius - 3, currentAngle + segmentAngle, currentAngle, true);
        ctx.closePath();
        ctx.fillStyle = 'rgba(139, 92, 246, 0.1)';
        ctx.fill();
        ctx.restore();
      }
      
      currentAngle += segmentAngle;
    });
    
    // Draw center circle with gradient
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, innerRadius);
    centerGradient.addColorStop(0, '#ffffff');
    centerGradient.addColorStop(1, '#f9fafb');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius - 2, 0, Math.PI * 2);
    ctx.fillStyle = centerGradient;
    ctx.fill();
    
    // Add center text
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('100%', centerX, centerY - 8);
    
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('Total', centerX, centerY + 12);
    
    // Helper function to adjust color brightness
    function adjustColor(color: string, amount: number): string {
      const hex = color.replace('#', '');
      const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
      const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
      const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
      return `rgb(${r}, ${g}, ${b})`;
    }
    
  }, []);
  
  return (
    <canvas 
      ref={canvasRef}
      className="w-full h-48"
    />
  );
}