'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface AgentSwarmProps {
  agents: any[];
  center: [number, number, number];
  formation: 'circle' | 'spiral' | 'sphere' | 'helix';
  radius: number;
}

export default function AgentSwarm({ agents, center, formation, radius }: AgentSwarmProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Calculate positions based on formation
  const agentPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const agentCount = agents.length;
    
    switch (formation) {
      case 'circle':
        for (let i = 0; i < agentCount; i++) {
          const angle = (i / agentCount) * Math.PI * 2;
          positions.push([
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
          ]);
        }
        break;
        
      case 'spiral':
        for (let i = 0; i < agentCount; i++) {
          const angle = (i / agentCount) * Math.PI * 4;
          const r = (i / agentCount) * radius;
          positions.push([
            Math.cos(angle) * r,
            i * 0.5,
            Math.sin(angle) * r
          ]);
        }
        break;
        
      case 'sphere':
        for (let i = 0; i < agentCount; i++) {
          const phi = Math.acos(1 - 2 * i / agentCount);
          const theta = Math.sqrt(agentCount * Math.PI) * phi;
          positions.push([
            Math.cos(theta) * Math.sin(phi) * radius,
            Math.sin(theta) * Math.sin(phi) * radius,
            Math.cos(phi) * radius
          ]);
        }
        break;
        
      case 'helix':
        for (let i = 0; i < agentCount; i++) {
          const t = i / agentCount * 4 * Math.PI;
          positions.push([
            Math.cos(t) * radius,
            t * 2,
            Math.sin(t) * radius
          ]);
        }
        break;
    }
    
    return positions;
  }, [agents.length, formation, radius]);
  
  // Animate the swarm
  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Rotate the entire formation
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    
    // Pulsing effect
    const scale = 1 + Math.sin(state.clock.elapsedTime) * 0.1;
    groupRef.current.scale.setScalar(scale);
  });
  
  return (
    <group ref={groupRef} position={center}>
      {agents.map((agent, index) => (
        <SwarmAgent
          key={agent.id}
          agent={agent}
          position={agentPositions[index] || [0, 0, 0]}
          index={index}
        />
      ))}
      
      {/* Connection lines between agents */}
      <ConnectionLines positions={agentPositions} />
      
      {/* Central energy core */}
      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[2, 2]} />
        <meshBasicMaterial
          color="#f59e0b"
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

// Individual swarm agent
function SwarmAgent({ agent, position, index }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Individual movement
    const time = state.clock.elapsedTime;
    meshRef.current.position.x = position[0] + Math.sin(time + index) * 0.5;
    meshRef.current.position.y = position[1] + Math.cos(time + index) * 0.5;
    meshRef.current.position.z = position[2] + Math.sin(time + index * 0.5) * 0.5;
    
    // Rotation
    meshRef.current.rotation.x += 0.01;
    meshRef.current.rotation.y += 0.02;
  });
  
  const agentColors = {
    'DIRK.c': '#3b82f6',
    'DIRK.g': '#10b981',
    'DIRK.d': '#f59e0b'
  };
  
  const color = agentColors[agent.type as keyof typeof agentColors] || '#8b5cf6';
  
  return (
    <Sphere ref={meshRef} args={[0.5, 8, 8]} position={position}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        metalness={0.8}
        roughness={0.2}
      />
    </Sphere>
  );
}

// Connection lines between agents
function ConnectionLines({ positions }: { positions: [number, number, number][] }) {
  const linesRef = useRef<THREE.LineSegments>(null);
  
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    
    // Connect each agent to nearby agents
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const distance = new THREE.Vector3(...positions[i])
          .distanceTo(new THREE.Vector3(...positions[j]));
        
        if (distance < 10) { // Only connect nearby agents
          points.push(
            new THREE.Vector3(...positions[i]),
            new THREE.Vector3(...positions[j])
          );
        }
      }
    }
    
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [positions]);
  
  useFrame((state) => {
    if (linesRef.current && linesRef.current.material) {
      const material = linesRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });
  
  return (
    <lineSegments ref={linesRef} geometry={geometry}>
      <lineBasicMaterial
        color="#60a5fa"
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}