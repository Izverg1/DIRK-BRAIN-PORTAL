'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface AgentEntityProps {
  agent: {
    id: string;
    type: string;
    status: string;
    workload: number;
    performance: number;
    role: string;
    tasks_assigned: number;
  };
  position: [number, number, number];
  targetProject?: [number, number, number];
}

export default function AgentEntity({ agent, position, targetProject }: AgentEntityProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [currentPos] = useState(new THREE.Vector3(...position));
  const [velocity] = useState(new THREE.Vector3());
  
  // Agent type colors
  const agentColors = {
    'DIRK.c': '#3b82f6', // Blue for computational
    'DIRK.g': '#10b981', // Green for generative
    'DIRK.d': '#f59e0b', // Yellow for desktop
    'Mr.Wolf': '#ef4444' // Red for security
  };
  
  const color = agentColors[agent.type as keyof typeof agentColors] || '#8b5cf6';
  
  // Movement patterns based on status
  useFrame((state) => {
    if (!meshRef.current || !groupRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    if (agent.status === 'active' && targetProject) {
      // Move towards target project
      const target = new THREE.Vector3(...targetProject);
      const direction = target.clone().sub(currentPos).normalize();
      velocity.lerp(direction.multiplyScalar(0.5), 0.02);
      
      // Add some orbital movement
      const angle = time * 0.5;
      const radius = 20;
      velocity.x += Math.cos(angle) * 0.1;
      velocity.z += Math.sin(angle) * 0.1;
    } else {
      // Idle wandering
      velocity.x += (Math.random() - 0.5) * 0.02;
      velocity.y += (Math.random() - 0.5) * 0.02;
      velocity.z += (Math.random() - 0.5) * 0.02;
    }
    
    // Apply velocity with damping
    velocity.multiplyScalar(0.98);
    currentPos.add(velocity);
    
    // Keep within bounds
    const maxDistance = 50;
    if (currentPos.length() > maxDistance) {
      currentPos.normalize().multiplyScalar(maxDistance);
    }
    
    groupRef.current.position.copy(currentPos);
    
    // Pulsing based on workload
    const scale = 1 + Math.sin(time * 3) * 0.1 * (agent.workload / 100);
    meshRef.current.scale.setScalar(scale);
    
    // Rotation based on performance
    meshRef.current.rotation.x += 0.01 * (agent.performance / 100);
    meshRef.current.rotation.y += 0.02 * (agent.performance / 100);
  });
  
  // Size based on tasks assigned
  const agentSize = 1 + (agent.tasks_assigned * 0.2);
  
  return (
    <group ref={groupRef}>
      <Sphere ref={meshRef} args={[agentSize, 16, 16]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>
      
      {/* Agent label */}
      <Text
        position={[0, agentSize + 2, 0]}
        fontSize={0.8}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {agent.id}
      </Text>
      
      {/* Status indicator */}
      <mesh position={[0, agentSize + 3, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshBasicMaterial
          color={agent.status === 'active' ? '#10b981' : '#6b7280'}
          emissive={agent.status === 'active' ? '#10b981' : '#6b7280'}
          emissiveIntensity={1}
        />
      </mesh>
      
      {/* Energy field */}
      <EnergyField 
        radius={agentSize * 2} 
        color={color} 
        intensity={agent.workload / 100}
      />
    </group>
  );
}

// Energy field effect around agent
function EnergyField({ radius, color, intensity }: { radius: number; color: string; intensity: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[radius, 2]} />
      <meshBasicMaterial
        color={color}
        wireframe
        transparent
        opacity={intensity * 0.3}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}