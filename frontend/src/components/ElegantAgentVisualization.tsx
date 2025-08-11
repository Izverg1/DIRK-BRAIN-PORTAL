'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Line, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface Agent {
  id: string;
  name: string;
  position: [number, number, number];
  status: 'idle' | 'working' | 'transferring';
  type: 'cli' | 'api';
  color: string;
}

interface Project {
  id: string;
  name: string;
  position: [number, number, number];
  agents: string[];
  activity: number;
}

interface DataFlow {
  from: [number, number, number];
  to: [number, number, number];
  progress: number;
}

// Hexagonal project node component
function ProjectHexagon({ project, isActive }: { project: Project; isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle rotation based on activity
      meshRef.current.rotation.z += project.activity * 0.001;
      
      // Pulse effect when active
      if (isActive) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
        meshRef.current.scale.setScalar(scale);
      }
    }
  });

  const hexagonShape = useMemo(() => {
    const shape = new THREE.Shape();
    const sides = 6;
    const radius = 1;
    
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

  const extrudeSettings = {
    depth: 0.2,
    bevelEnabled: true,
    bevelSegments: 1,
    bevelSize: 0.05,
    bevelThickness: 0.05
  };

  return (
    <group position={project.position}>
      <mesh 
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <extrudeGeometry args={[hexagonShape, extrudeSettings]} />
        <meshPhysicalMaterial
          color={isActive ? "#4a9eff" : "#1e3a5f"}
          emissive={isActive ? "#2563eb" : "#0f172a"}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          metalness={0.8}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Project name */}
      <Text
        position={[0, 0, 0.3]}
        fontSize={0.3}
        color={hovered ? "#ffffff" : "#94a3b8"}
        anchorX="center"
        anchorY="middle"
      >
        {project.name}
      </Text>
      
      {/* Agent count indicator */}
      <Text
        position={[0, -0.5, 0.3]}
        fontSize={0.15}
        color="#64748b"
        anchorX="center"
        anchorY="middle"
      >
        {project.agents.length} agents
      </Text>
      
      {/* Activity ring */}
      {project.activity > 0 && (
        <mesh rotation={[0, 0, 0]}>
          <ringGeometry args={[1.2, 1.3, 32]} />
          <meshBasicMaterial
            color="#10b981"
            transparent
            opacity={project.activity}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

// Clean geometric agent representation
function AgentNode({ agent }: { agent: Agent }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y = agent.position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      
      // Rotation for working agents
      if (agent.status === 'working') {
        meshRef.current.rotation.x += 0.02;
        meshRef.current.rotation.y += 0.01;
      }
    }
  });

  const geometry = agent.type === 'cli' ? 
    <octahedronGeometry args={[0.15, 0]} /> : 
    <icosahedronGeometry args={[0.15, 0]} />;

  return (
    <mesh ref={meshRef} position={agent.position}>
      {geometry}
      <meshPhysicalMaterial
        color={agent.color}
        emissive={agent.color}
        emissiveIntensity={agent.status === 'working' ? 0.5 : 0.2}
        metalness={0.5}
        roughness={0.3}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

// Data flow visualization
function DataFlowLine({ flow }: { flow: DataFlow }) {
  const lineRef = useRef<THREE.Line>(null);
  
  const points = useMemo(() => {
    const start = new THREE.Vector3(...flow.from);
    const end = new THREE.Vector3(...flow.to);
    const middle = start.clone().add(end).multiplyScalar(0.5);
    middle.y += 0.5; // Arc the line
    
    const curve = new THREE.QuadraticBezierCurve3(start, middle, end);
    return curve.getPoints(50);
  }, [flow.from, flow.to]);

  useFrame(() => {
    if (lineRef.current) {
      // Animate the dash offset for flow effect
      const material = lineRef.current.material as THREE.LineDashedMaterial;
      material.dashOffset -= 0.01;
    }
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineDashedMaterial
        color="#3b82f6"
        linewidth={2}
        dashSize={0.1}
        gapSize={0.05}
        transparent
        opacity={0.6}
      />
    </line>
  );
}

// Grid floor for spatial reference
function GridFloor() {
  return (
    <gridHelper
      args={[20, 20, '#1e293b', '#0f172a']}
      position={[0, -2, 0]}
    />
  );
}

// Main visualization component
export default function ElegantAgentVisualization({ 
  agents = [], 
  projects = [], 
  dataFlows = [],
  className = "" 
}: {
  agents?: Agent[];
  projects?: Project[];
  dataFlows?: DataFlow[];
  className?: string;
}) {
  // Sample data for demonstration
  const demoProjects: Project[] = projects.length > 0 ? projects : [
    { id: '1', name: 'Frontend', position: [-3, 0, 0], agents: ['a1', 'a2'], activity: 0.7 },
    { id: '2', name: 'Backend', position: [0, 0, 0], agents: ['a3', 'a4'], activity: 0.9 },
    { id: '3', name: 'Database', position: [3, 0, 0], agents: ['a5'], activity: 0.3 },
    { id: '4', name: 'Testing', position: [-1.5, 0, -3], agents: ['a6'], activity: 0.5 },
    { id: '5', name: 'DevOps', position: [1.5, 0, -3], agents: ['a7', 'a8'], activity: 0.8 }
  ];

  const demoAgents: Agent[] = agents.length > 0 ? agents : [
    { id: 'a1', name: 'Claude-1', position: [-3, 1, 0], status: 'working', type: 'cli', color: '#8b5cf6' },
    { id: 'a2', name: 'GPT-1', position: [-3, 1, 0.5], status: 'idle', type: 'api', color: '#10b981' },
    { id: 'a3', name: 'Gemini-1', position: [0, 1, 0], status: 'working', type: 'cli', color: '#3b82f6' },
    { id: 'a4', name: 'Claude-2', position: [0, 1, 0.5], status: 'working', type: 'cli', color: '#8b5cf6' }
  ];

  const demoFlows: DataFlow[] = dataFlows.length > 0 ? dataFlows : [
    { from: [-3, 0.5, 0], to: [0, 0.5, 0], progress: 0.5 },
    { from: [0, 0.5, 0], to: [3, 0.5, 0], progress: 0.3 }
  ];

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 5, 10], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#3b82f6" />
        
        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2}
        />
        
        {/* Scene elements */}
        <GridFloor />
        
        {/* Projects */}
        {demoProjects.map(project => (
          <ProjectHexagon
            key={project.id}
            project={project}
            isActive={project.activity > 0.6}
          />
        ))}
        
        {/* Agents */}
        {demoAgents.map(agent => (
          <AgentNode key={agent.id} agent={agent} />
        ))}
        
        {/* Data flows */}
        {demoFlows.map((flow, idx) => (
          <DataFlowLine key={idx} flow={flow} />
        ))}
        
        {/* Background */}
        <fog attach="fog" args={['#0a0a0a', 10, 30]} />
      </Canvas>
    </div>
  );
}