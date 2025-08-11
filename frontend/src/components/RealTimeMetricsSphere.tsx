import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';

interface RealTimeMetricsSphereProps {
  position: [number, number, number];
  metrics: { cpu: number; memory: number; network: number };
  agentId?: string;
  performance?: number;
}

const RealTimeMetricsSphere: React.FC<RealTimeMetricsSphereProps> = ({ 
  position, 
  metrics, 
  agentId = 'unknown',
  performance = 0 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const [hovered, setHovered] = React.useState(false);

  // Create particle system for performance visualization
  const particleSystem = useMemo(() => {
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Create particles in a sphere around the main sphere
      const radius = 1 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Color particles based on performance
      const color = new THREE.Color();
      if (performance > 80) color.setHSL(0.3, 1, 0.5); // Green for high performance
      else if (performance > 50) color.setHSL(0.15, 1, 0.5); // Yellow for medium
      else color.setHSL(0, 1, 0.5); // Red for low performance

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 0.1 + 0.05;
    }

    return { positions, colors, sizes };
  }, [performance]);

  useFrame((state) => {
    if (meshRef.current) {
      // Scale based on overall metric intensity
      const overallMetric = (metrics.cpu + metrics.memory + metrics.network) / 300;
      const baseScale = 0.5 + overallMetric * 1.5;
      const pulseScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.set(baseScale * pulseScale, baseScale * pulseScale, baseScale * pulseScale);

      // Dynamic color based on metrics with smooth transitions
      let targetColor = new THREE.Color('white');
      if (metrics.cpu > metrics.memory && metrics.cpu > metrics.network) {
        targetColor.setHSL(0, 0.8, 0.6); // Red for CPU
      } else if (metrics.memory > metrics.cpu && metrics.memory > metrics.network) {
        targetColor.setHSL(0.6, 0.8, 0.6); // Blue for memory
      } else if (metrics.network > metrics.cpu && metrics.network > metrics.memory) {
        targetColor.setHSL(0.3, 0.8, 0.6); // Green for network
      }

      if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
        meshRef.current.material.color.lerp(targetColor, 0.1);
        meshRef.current.material.emissive.copy(targetColor).multiplyScalar(0.3);
        meshRef.current.material.emissiveIntensity = overallMetric * 2 + Math.sin(state.clock.elapsedTime * 3) * 0.5;
      }

      // Rotate based on activity level
      meshRef.current.rotation.y += 0.01 * (1 + overallMetric);
      meshRef.current.rotation.x += 0.005 * (1 + overallMetric);
    }

    // Animate particles
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        // Orbit particles around the sphere
        const time = state.clock.elapsedTime * 0.5;
        const radius = 1 + Math.sin(time + i * 0.1) * 0.5;
        const angle = time * 0.5 + i * 0.01;
        
        positions[i] = Math.cos(angle) * radius;
        positions[i + 1] = Math.sin(angle) * radius;
        positions[i + 2] = Math.sin(time + i * 0.05) * 0.5;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group position={position}>
      {/* Main performance sphere */}
      <Sphere 
        args={[0.5, 32, 32]} 
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          transparent 
          opacity={0.8}
          roughness={0.1}
          metalness={0.8}
        />
      </Sphere>

      {/* Particle system for performance visualization */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particleSystem.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[particleSystem.colors, 3]}
          />
          <bufferAttribute
            attach="attributes-size"
            args={[particleSystem.sizes, 1]}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.05} 
          transparent 
          opacity={0.6}
          vertexColors
          sizeAttenuation
        />
      </points>

      {/* Holographic info panel when hovered */}
      {hovered && (
        <Html position={[0, 1, 0]} center>
          <div className="bg-black/80 backdrop-blur-md border border-cyan-400/50 rounded-lg p-4 text-white text-sm min-w-[200px]">
            <div className="text-cyan-400 font-bold mb-2">{agentId}</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>CPU:</span>
                <span className="text-red-400">{metrics.cpu.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Memory:</span>
                <span className="text-blue-400">{metrics.memory.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Network:</span>
                <span className="text-green-400">{metrics.network.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Performance:</span>
                <span className="text-yellow-400">{performance.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

export default RealTimeMetricsSphere;
