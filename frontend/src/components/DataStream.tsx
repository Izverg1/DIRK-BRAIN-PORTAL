'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { CatmullRomCurve3, Vector3 } from 'three';
import * as THREE from 'three';

interface DataStreamProps {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  particleCount?: number;
  speed?: number;
}

export default function DataStream({ 
  start, 
  end, 
  color = '#3b82f6', 
  particleCount = 100,
  speed = 1
}: DataStreamProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  
  // Create a curved path between start and end
  const curve = useMemo(() => {
    const startVec = new Vector3(...start);
    const endVec = new Vector3(...end);
    const midPoint = new Vector3()
      .addVectors(startVec, endVec)
      .multiplyScalar(0.5);
    
    // Add some curve to the path
    midPoint.y += 10;
    midPoint.x += (Math.random() - 0.5) * 20;
    midPoint.z += (Math.random() - 0.5) * 20;
    
    return new CatmullRomCurve3([startVec, midPoint, endVec]);
  }, [start, end]);
  
  // Initialize particle positions along the curve
  const { positions, offsets } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const offsets = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      offsets[i] = Math.random();
      const point = curve.getPoint(offsets[i]);
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    }
    
    return { positions, offsets };
  }, [particleCount, curve]);
  
  useFrame((state) => {
    if (!particlesRef.current) return;
    
    const time = state.clock.elapsedTime;
    const geometry = particlesRef.current.geometry;
    const positions = geometry.attributes.position.array as Float32Array;
    
    // Update particle positions along the curve
    for (let i = 0; i < particleCount; i++) {
      const offset = (offsets[i] + time * speed * 0.1) % 1;
      const point = curve.getPoint(offset);
      
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    }
    
    geometry.attributes.position.needsUpdate = true;
    
    // Pulsing effect
    if (materialRef.current) {
      materialRef.current.opacity = 0.6 + Math.sin(time * 3) * 0.2;
    }
  });
  
  return (
    <group>
      {/* Data stream particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={materialRef}
          size={0.5}
          color={color}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
      
      {/* Stream path line */}
      <mesh>
        <tubeGeometry args={[curve, 64, 0.1, 8, false]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}