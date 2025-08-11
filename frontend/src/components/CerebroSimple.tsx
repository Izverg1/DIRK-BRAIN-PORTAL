'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Simple rotating cube for agents
function AgentCube({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });
  
  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Simple sphere for projects
function ProjectBall({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.5;
    }
  });
  
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[2, 16, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

interface CerebroSimpleProps {
  agents: any;
  tasks: any;
  projects: any[];
  metrics?: any;
  onCommandExecute?: (command: string) => void;
}

export default function CerebroSimple({ agents, tasks, projects, metrics, onCommandExecute }: CerebroSimpleProps) {
  return (
    <div className="w-full h-screen bg-black">
      <Canvas camera={{ position: [0, 5, 20], fov: 50 }}>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        {/* Controls */}
        <OrbitControls enableDamping />
        
        {/* Grid */}
        <gridHelper args={[50, 50, 0x444444, 0x222222]} />
        
        {/* Projects as spheres */}
        {projects.map((project, i) => (
          <ProjectBall
            key={project.id}
            position={[(i - 1) * 8, 0, 0]}
            color={project.status === 'active' ? '#10b981' : '#6b7280'}
          />
        ))}
        
        {/* Agents as cubes */}
        {Object.entries(agents).map(([id, agent]: any, i) => (
          <AgentCube
            key={id}
            position={[(i - 1) * 4, 3, 5]}
            color={agent.type === 'DIRK.c' ? '#3b82f6' : '#f59e0b'}
          />
        ))}
      </Canvas>
      
      {/* Simple HUD */}
      <div className="absolute top-0 left-0 w-full p-6 text-white">
        <h1 className="text-4xl font-bold mb-2">CEREBRO</h1>
        <p className="text-xl">AI Command Center</p>
      </div>
      
      {/* Status Panel */}
      <div className="absolute bottom-0 left-0 p-6 bg-gray-900/80 rounded-tr-lg">
        <div className="text-white">
          <p>Active Agents: {Object.keys(agents).length}</p>
          <p>Active Tasks: {tasks.active.length}</p>
          <p>Projects: {projects.length}</p>
        </div>
      </div>
    </div>
  );
}