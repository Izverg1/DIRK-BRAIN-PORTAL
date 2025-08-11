'use client';

import { useEffect, useRef } from 'react';

interface MapPoint {
  x: number;
  y: number;
  type: 'primary' | 'secondary' | 'warning';
  label?: string;
}

export default function MapVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }
    
    // Draw map outline (simplified world map)
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 10;
    
    // Simple continent outlines
    const drawContinent = (points: [number, number][]) => {
      ctx.beginPath();
      ctx.moveTo(points[0][0] * canvas.width, points[0][1] * canvas.height);
      points.forEach(([x, y]) => {
        ctx.lineTo(x * canvas.width, y * canvas.height);
      });
      ctx.stroke();
    };
    
    // North America
    drawContinent([
      [0.15, 0.3], [0.25, 0.25], [0.3, 0.3], [0.28, 0.4], [0.2, 0.45], [0.15, 0.3]
    ]);
    
    // Europe
    drawContinent([
      [0.45, 0.25], [0.55, 0.22], [0.58, 0.3], [0.52, 0.35], [0.45, 0.25]
    ]);
    
    // Asia
    drawContinent([
      [0.6, 0.25], [0.75, 0.22], [0.8, 0.35], [0.7, 0.45], [0.6, 0.35], [0.6, 0.25]
    ]);
    
    // Draw data points
    const points: MapPoint[] = [
      { x: 0.2, y: 0.35, type: 'primary' },
      { x: 0.25, y: 0.38, type: 'secondary' },
      { x: 0.5, y: 0.3, type: 'primary' },
      { x: 0.52, y: 0.32, type: 'warning' },
      { x: 0.7, y: 0.35, type: 'primary' },
      { x: 0.72, y: 0.38, type: 'secondary' },
      { x: 0.18, y: 0.42, type: 'warning' },
      { x: 0.48, y: 0.28, type: 'secondary' },
      { x: 0.65, y: 0.3, type: 'primary' },
    ];
    
    points.forEach(point => {
      const x = point.x * canvas.width;
      const y = point.y * canvas.height;
      
      // Draw point
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      
      if (point.type === 'primary') {
        ctx.fillStyle = '#22d3ee';
        ctx.shadowColor = '#22d3ee';
      } else if (point.type === 'warning') {
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
      } else {
        ctx.fillStyle = '#8b5cf6';
        ctx.shadowColor = '#8b5cf6';
      }
      
      ctx.shadowBlur = 15;
      ctx.fill();
      
      // Draw pulse animation
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.strokeStyle = ctx.fillStyle;
      ctx.globalAlpha = 0.3;
      ctx.stroke();
      ctx.globalAlpha = 1;
    });
    
    // Draw connection lines
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.setLineDash([5, 5]);
    
    // Connect some points
    ctx.beginPath();
    ctx.moveTo(points[0].x * canvas.width, points[0].y * canvas.height);
    ctx.lineTo(points[2].x * canvas.width, points[2].y * canvas.height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(points[2].x * canvas.width, points[2].y * canvas.height);
    ctx.lineTo(points[4].x * canvas.width, points[4].y * canvas.height);
    ctx.stroke();
    
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    
  }, []);
  
  return (
    <canvas 
      ref={canvasRef}
      className="w-full h-full"
      style={{ imageRendering: 'crisp-edges' }}
    />
  );
}