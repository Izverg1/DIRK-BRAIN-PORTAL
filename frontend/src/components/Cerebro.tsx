'use client';

import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import ProjectSphere from './ProjectSphere';
import AgentEntity from './AgentEntity';
import TaskProgressBar from './TaskProgressBar';
import DataStream from './DataStream';
import AgentSwarm from './AgentSwarm';
import CerebroHUD from './CerebroHUD';

// Scene setup component
function SceneSetup() {
  const { scene, gl } = useThree();
  
  useMemo(() => {
    // Dark space-like background
    scene.background = new THREE.Color(0x000814);
    scene.fog = new THREE.FogExp2(0x000814, 0.001);
    
    // Enable shadows
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
  }, [scene, gl]);
  
  return null;
}

// Animated background particles
function BackgroundParticles() {
  const points = useRef<THREE.Points>(null);
  const particlesCount = 500;
  
  const positions = useMemo(() => {
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
    }
    return positions;
  }, []);
  
  useFrame((state) => {
    if (points.current) {
      points.current.rotation.x = state.clock.elapsedTime * 0.001;
      points.current.rotation.y = state.clock.elapsedTime * 0.002;
    }
  });
  
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        color="#4a5568"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Main lighting setup
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.1} color="#1a202c" />
      <directionalLight
        position={[50, 50, 50]}
        intensity={0.5}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-50, 20, -50]} intensity={0.3} color="#3182ce" />
      <pointLight position={[50, 20, -50]} intensity={0.3} color="#805ad5" />
      <directionalLight
        position={[0, -50, 0]}
        intensity={0.2}
        color="#63b3ed"
      />
    </>
  );
}

// Grid floor for spatial reference
function GridFloor() {
  return (
    <gridHelper
      args={[200, 40, '#1a365d', '#1a365d']}
      position={[0, -20, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

interface CerebroProps {
  agents: any;
  tasks: any;
  projects: any[];
  metrics: any;
  onCommandExecute: (command: string) => void;
}

export default function Cerebro({ agents, tasks, projects, metrics, onCommandExecute }: CerebroProps) {
  // Calculate project positions
  const projectPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const count = projects.length;
    const radius = 40;
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      positions.push([
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ]);
    }
    
    return positions;
  }, [projects.length]);
  
  // Calculate agent positions
  const agentPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const agentArray = Object.values(agents);
    
    agentArray.forEach((_, index) => {
      const angle = (index / agentArray.length) * Math.PI * 2;
      const radius = 20;
      positions.push([
        Math.cos(angle) * radius,
        10,
        Math.sin(angle) * radius
      ]);
    });
    
    return positions;
  }, [agents]);
  
  // Group active agents by project
  const activeAgentsByProject = useMemo(() => {
    const agentArray = Object.values(agents);
    const activeAgents = agentArray.filter((a: any) => a.status === 'active');
    
    // For demo, assign agents to first project
    if (projects.length > 0 && activeAgents.length > 0) {
      return [{
        projectIndex: 0,
        agents: activeAgents
      }];
    }
    
    return [];
  }, [agents, projects]);
  
  return (
    <div className="w-full h-screen relative bg-gray-900">
      <Canvas>
        <SceneSetup />
        <PerspectiveCamera makeDefault position={[0, 30, 100]} fov={60} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={30}
          maxDistance={200}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={0}
        />
        
        <Suspense fallback={null}>
          <Lighting />
          <BackgroundParticles />
          <GridFloor />
          
          {/* Project Spheres */}
          {projects.map((project, index) => (
            <ProjectSphere
              key={project.id}
              project={project}
              position={projectPositions[index]}
              color="#3b82f6"
            />
          ))}
          
          {/* Agent Entities */}
          {Object.entries(agents).map(([id, agent], index) => (
            <AgentEntity
              key={id}
              agent={agent}
              position={agentPositions[index]}
              targetProject={agent.status === 'active' ? projectPositions[0] : undefined}
            />
          ))}
          
          {/* Task Progress Bars */}
          {tasks.active.map((task: any, index: number) => {
            const agentIndex = Object.keys(agents).findIndex(id => id === task.assignee);
            const position = agentPositions[agentIndex] || [0, 20, 0];
            
            return (
              <TaskProgressBar
                key={task.task_id}
                task={task}
                position={[position[0], position[1] + 5, position[2]]}
                progress={task.verification_status === 'PENDING' ? 50 : 100}
              />
            );
          })}
          
          {/* Data Streams and Swarms temporarily disabled for stability */}
          {/* Will re-enable after fixing performance issues */}
        </Suspense>
      </Canvas>
      
      {/* HUD Overlay */}
      <CerebroHUD
        agents={agents}
        tasks={tasks}
        projects={projects}
        metrics={metrics}
        onCommandExecute={onCommandExecute}
      />
    </div>
  );
}