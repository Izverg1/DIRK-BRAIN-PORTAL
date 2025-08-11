import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TaskDataTunnelProps {
  startPosition: [number, number, number];
  endPosition: [number, number, number];
  dataVolume: number; // e.g., size of data being transferred
  dataType: string; // e.g., 'code', 'metrics', 'logs'
}

const TaskDataTunnels: React.FC<TaskDataTunnelProps> = ({
  startPosition,
  endPosition,
  dataVolume,
  dataType
}) => {
  const meshRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(dataVolume * 3); // More particles for higher volume
    const startVec = new THREE.Vector3(...startPosition);
    const endVec = new THREE.Vector3(...endPosition);

    for (let i = 0; i < dataVolume; i++) {
      const t = Math.random();
      const point = new THREE.Vector3().lerpVectors(startVec, endVec, t);
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
    }
    return positions;
  }, [startPosition, endPosition, dataVolume]);

  const particleColor = useMemo(() => {
    let color = new THREE.Color(0x00ffff); // Default cyan
    switch (dataType) {
      case 'code':
        color.set(0xff0000); // Red for code
        break;
      case 'metrics':
        color.set(0x00ff00); // Green for metrics
        break;
      case 'logs':
        color.set(0x0000ff); // Blue for logs
        break;
      default:
        break;
    }
    return color;
  }, [dataType]);

  useFrame((state) => {
    if (meshRef.current) {
      const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
      const startVec = new THREE.Vector3(...startPosition);
      const endVec = new THREE.Vector3(...endPosition);
      const direction = new THREE.Vector3().subVectors(endVec, startVec).normalize();
      const speed = 0.05 + (dataVolume / 100) * 0.05; // Faster for higher volume

      for (let i = 0; i < dataVolume; i++) {
        positions[i * 3] += direction.x * speed;
        positions[i * 3 + 1] += direction.y * speed;
        positions[i * 3 + 2] += direction.z * speed;

        const currentPos = new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
        if (currentPos.distanceTo(startVec) > startVec.distanceTo(endVec) + 1) {
          positions[i * 3] = startVec.x;
          positions[i * 3 + 1] = startVec.y;
          positions[i * 3 + 2] = startVec.z;
        }
      }
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial attach="material" color={particleColor} size={0.03} transparent opacity={0.7} />
    </points>
  );
};

export default TaskDataTunnels;
