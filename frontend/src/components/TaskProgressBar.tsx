'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Text } from '@react-three/drei';
import * as THREE from 'three';

interface TaskProgressBarProps {
  task: {
    task_id: string;
    title: string;
    status: string;
    priority: string;
    verification_status: string;
  };
  position: [number, number, number];
  progress: number;
}

export default function TaskProgressBar({ task, position, progress }: TaskProgressBarProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Priority colors
  const priorityColors = {
    HIGH: '#ef4444',
    MEDIUM: '#f59e0b',
    LOW: '#10b981'
  };
  
  const color = priorityColors[task.priority as keyof typeof priorityColors] || '#3b82f6';
  
  // Floating animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });
  
  const barWidth = 5;
  const barHeight = 0.5;
  const barDepth = 0.2;
  
  return (
    <group ref={groupRef} position={position}>
      {/* Background bar */}
      <Box args={[barWidth, barHeight, barDepth]}>
        <meshBasicMaterial color="#1a1a2e" transparent opacity={0.8} />
      </Box>
      
      {/* Progress fill */}
      <Box 
        args={[barWidth * (progress / 100), barHeight * 0.9, barDepth * 0.9]} 
        position={[-(barWidth * (1 - progress / 100)) / 2, 0, 0.01]}
      >
        <meshBasicMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={0.5}
        />
      </Box>
      
      {/* Task title */}
      <Text
        position={[0, 1, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={10}
      >
        {task.title}
      </Text>
      
      {/* Progress percentage */}
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.3}
        color="#60a5fa"
        anchorX="center"
        anchorY="middle"
      >
        {progress}%
      </Text>
      
      {/* Status indicator */}
      <mesh position={[barWidth / 2 + 0.5, 0, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial
          color={task.status === 'ASSIGNED' ? '#f59e0b' : '#10b981'}
          emissive={task.status === 'ASSIGNED' ? '#f59e0b' : '#10b981'}
          emissiveIntensity={1}
        />
      </mesh>
      
      {/* Glowing effect */}
      <pointLight
        position={[0, 0, 1]}
        intensity={0.5}
        color={color}
        distance={5}
      />
    </group>
  );
}