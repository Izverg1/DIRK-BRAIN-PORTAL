import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Tube } from '@react-three/drei';
import * as THREE from 'three';

interface TimeSeriesDataPoint {
  timestamp: number;
  value: number;
  type: 'cpu' | 'memory' | 'network' | 'performance';
}

interface DataTunnelProps {
  startPosition: [number, number, number];
  endPosition: [number, number, number];
  historicalData?: TimeSeriesDataPoint[];
  color?: string;
  speed?: number;
  particleCount?: number;
  tunnelRadius?: number;
}

const DataTunnels: React.FC<DataTunnelProps> = ({
  startPosition,
  endPosition,
  historicalData = [],
  color = '#00ff00',
  speed = 0.02,
  particleCount = 100,
  tunnelRadius = 0.1
}) => {
  const particlesRef = useRef<THREE.Points>(null);
  const tunnelRef = useRef<THREE.Mesh>(null);
  const [showHistoricalData, setShowHistoricalData] = useState(false);

  // Create tunnel geometry
  const tunnelGeometry = useMemo(() => {
    const startVec = new THREE.Vector3(...startPosition);
    const endVec = new THREE.Vector3(...endPosition);
    const direction = new THREE.Vector3().subVectors(endVec, startVec);
    const distance = direction.length();
    
    // Create a curved path for more interesting visualization
    const curve = new THREE.CatmullRomCurve3([
      startVec,
      startVec.clone().add(direction.clone().multiplyScalar(0.3)).add(new THREE.Vector3(0, 0.5, 0)),
      startVec.clone().add(direction.clone().multiplyScalar(0.7)).add(new THREE.Vector3(0, -0.3, 0)),
      endVec
    ]);

    return new THREE.TubeGeometry(curve, 64, tunnelRadius, 8, false);
  }, [startPosition, endPosition, tunnelRadius]);

  // Create particle system for data flow
  const particleSystem = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);

    const startVec = new THREE.Vector3(...startPosition);
    const endVec = new THREE.Vector3(...endPosition);
    const direction = new THREE.Vector3().subVectors(endVec, startVec).normalize();

    for (let i = 0; i < particleCount; i++) {
      // Distribute particles along the tunnel
      const t = Math.random();
      const point = new THREE.Vector3().lerpVectors(startVec, endVec, t);
      
      // Add some randomness within the tunnel radius
      const offset = new THREE.Vector3(
        (Math.random() - 0.5) * tunnelRadius * 2,
        (Math.random() - 0.5) * tunnelRadius * 2,
        (Math.random() - 0.5) * tunnelRadius * 2
      );
      point.add(offset);

      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;

      // Velocity based on direction with some randomness
      velocities[i * 3] = direction.x * speed + (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 1] = direction.y * speed + (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 2] = direction.z * speed + (Math.random() - 0.5) * 0.01;

      // Color based on historical data if available
      const dataColor = new THREE.Color(color);
      if (historicalData.length > 0) {
        const dataPoint = historicalData[i % historicalData.length];
        switch (dataPoint.type) {
          case 'cpu':
            dataColor.setHSL(0, 1, 0.5 + dataPoint.value * 0.005);
            break;
          case 'memory':
            dataColor.setHSL(0.6, 1, 0.5 + dataPoint.value * 0.005);
            break;
          case 'network':
            dataColor.setHSL(0.3, 1, 0.5 + dataPoint.value * 0.005);
            break;
          case 'performance':
            dataColor.setHSL(0.15, 1, 0.5 + dataPoint.value * 0.005);
            break;
        }
      }

      colors[i * 3] = dataColor.r;
      colors[i * 3 + 1] = dataColor.g;
      colors[i * 3 + 2] = dataColor.b;

      sizes[i] = 0.02 + Math.random() * 0.03;
    }

    return { positions, colors, sizes, velocities };
  }, [startPosition, endPosition, particleCount, color, historicalData, speed, tunnelRadius]);

  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const colors = particlesRef.current.geometry.attributes.color.array as Float32Array;
      const startVec = new THREE.Vector3(...startPosition);
      const endVec = new THREE.Vector3(...endPosition);
      const distance = startVec.distanceTo(endVec);

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Update positions based on velocities
        positions[i3] += particleSystem.velocities[i3];
        positions[i3 + 1] += particleSystem.velocities[i3 + 1];
        positions[i3 + 2] += particleSystem.velocities[i3 + 2];

        // Check if particle has traveled too far and reset
        const currentPos = new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]);
        if (currentPos.distanceTo(startVec) > distance + 1) {
          positions[i3] = startVec.x + (Math.random() - 0.5) * tunnelRadius;
          positions[i3 + 1] = startVec.y + (Math.random() - 0.5) * tunnelRadius;
          positions[i3 + 2] = startVec.z + (Math.random() - 0.5) * tunnelRadius;
        }

        // Animate colors based on time for dynamic effect
        if (historicalData.length > 0) {
          const time = state.clock.elapsedTime;
          const intensity = 0.5 + Math.sin(time * 2 + i * 0.1) * 0.3;
          colors[i3] *= intensity;
          colors[i3 + 1] *= intensity;
          colors[i3 + 2] *= intensity;
        }
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.geometry.attributes.color.needsUpdate = true;
    }

    // Animate tunnel material
    if (tunnelRef.current && tunnelRef.current.material instanceof THREE.MeshStandardMaterial) {
      const time = state.clock.elapsedTime;
      tunnelRef.current.material.emissiveIntensity = 0.2 + Math.sin(time * 3) * 0.1;
    }
  });

  return (
    <group>
      {/* Tunnel structure */}
      <mesh 
        ref={tunnelRef}
        geometry={tunnelGeometry}
        onClick={() => setShowHistoricalData(!showHistoricalData)}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Data flow particles */}
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
          transparent
          opacity={0.8}
          vertexColors
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Historical data visualization panel */}
      {showHistoricalData && historicalData.length > 0 && (
        <Html position={[
          (startPosition[0] + endPosition[0]) / 2,
          (startPosition[1] + endPosition[1]) / 2 + 1,
          (startPosition[2] + endPosition[2]) / 2
        ]} center>
          <div className="bg-black/90 backdrop-blur-md border border-cyan-400/50 rounded-lg p-4 text-white text-xs min-w-[300px]">
            <div className="text-cyan-400 font-bold mb-3">Historical Data Analysis</div>
            <div className="space-y-2">
              <div className="text-xs text-gray-300">Recent Data Points:</div>
              {historicalData.slice(-5).map((point, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-400">
                    {new Date(point.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`font-mono ${
                    point.type === 'cpu' ? 'text-red-400' :
                    point.type === 'memory' ? 'text-blue-400' :
                    point.type === 'network' ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {point.type}: {point.value.toFixed(1)}%
                  </span>
                </div>
              ))}
              <div className="mt-3 pt-2 border-t border-gray-600">
                <div className="text-xs text-gray-300">
                  Avg: {(historicalData.reduce((sum, p) => sum + p.value, 0) / historicalData.length).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

export default DataTunnels;
