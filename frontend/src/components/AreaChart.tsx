'use client';

import { useEffect, useRef } from 'react';

export default function AreaChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = canvas.offsetWidth * 2; // For retina displays
    canvas.height = canvas.offsetHeight * 2;
    canvas.style.width = canvas.offsetWidth + 'px';
    canvas.style.height = canvas.offsetHeight + 'px';
    ctx.scale(2, 2);
    
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    
    // Sample data points
    const data = [30, 45, 35, 50, 49, 60, 70, 65, 80, 75, 90, 85];
    const maxValue = Math.max(...data);
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.0)');
    
    // Draw area
    ctx.beginPath();
    ctx.moveTo(0, height);
    
    data.forEach((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - (value / maxValue) * height * 0.8;
      
      if (index === 0) {
        ctx.lineTo(x, y);
      } else {
        const prevX = ((index - 1) / (data.length - 1)) * width;
        const prevY = height - (data[index - 1] / maxValue) * height * 0.8;
        const cp1x = prevX + (x - prevX) / 2;
        const cp1y = prevY;
        const cp2x = prevX + (x - prevX) / 2;
        const cp2y = y;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
      }
    });
    
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw line
    ctx.beginPath();
    data.forEach((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - (value / maxValue) * height * 0.8;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        const prevX = ((index - 1) / (data.length - 1)) * width;
        const prevY = height - (data[index - 1] / maxValue) * height * 0.8;
        const cp1x = prevX + (x - prevX) / 2;
        const cp1y = prevY;
        const cp2x = prevX + (x - prevX) / 2;
        const cp2y = y;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
      }
    });
    
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw dots
    data.forEach((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - (value / maxValue) * height * 0.8;
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#8b5cf6';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    
    // Draw grid lines
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
  }, []);
  
  return (
    <canvas 
      ref={canvasRef}
      className="w-full h-48"
    />
  );
}