'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface ProjectSphereProps {
  project: {
    id: string;
    name: string;
    status: string;
    agents: number;
  };
  position: [number, number, number];
  color: string;
}

export default function ProjectSphere({ project, position, color }: ProjectSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  
  // Floating animation
  useFrame((state) => {
    if (meshRef.current && groupRef.current) {
      // Gentle floating motion
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime + position[0]) * 0.5;
      
      // Slow rotation
      meshRef.current.rotation.x += 0.001;
      meshRef.current.rotation.y += 0.002;
      
      // Scale on hover
      const targetScale = hovered ? 1.2 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  // Status-based colors
  const statusColors = {
    active: '#10b981',
    planning: '#f59e0b',
    inactive: '#6b7280'
  };

  const sphereColor = statusColors[project.status as keyof typeof statusColors] || color;

  return (
    <group ref={groupRef} position={position}>
      <Sphere
        ref={meshRef}
        args={[5, 32, 32]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setClicked(!clicked)}
      >
        <meshStandardMaterial
          color={sphereColor}
          roughness={0.2}
          metalness={0.8}
          emissive={sphereColor}
          emissiveIntensity={hovered ? 0.5 : 0.2}
        />
      </Sphere>
      
      {/* Project name label */}
      <Text
        position={[0, 8, 0]}
        fontSize={1.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {project.name}
      </Text>
      
      {/* Agent count */}
      <Text
        position={[0, -8, 0]}
        fontSize={1}
        color="#60a5fa"
        anchorX="center"
        anchorY="middle"
      >
        {project.agents} Agents
      </Text>
      
      {/* Glowing aura */}
      <pointLight
        position={[0, 0, 0]}
        intensity={hovered ? 2 : 1}
        color={sphereColor}
        distance={20}
      />
      
      {/* Orbiting particles */}
      <OrbitingParticles count={project.agents * 10} radius={7} color={sphereColor} />
    </group>
  );
}

// Orbiting particles around the sphere
function OrbitingParticles({ count, radius, color }: { count: number; radius: number; color: string }) {
  const particlesRef = useRef<THREE.Points>(null);
  
  const positions = React.useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 2;
      const y = (Math.random() - 0.5) * 4;
      const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 2;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    return positions;
  }, [count, radius]);
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        color={color}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}