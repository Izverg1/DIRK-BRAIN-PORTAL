import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Cylinder, Html } from '@react-three/drei';
import * as THREE from 'three';

interface TaskProgress {
  taskId: string;
  progress: number; // 0-100
  status: string;
}

interface AgentVisualizationData {
  id: string;
  type: 'DIRK.c' | 'DIRK.g' | 'DIRK.desktop';
  workload: number; // 0-100
  performance: number; // 0-100
  communicationVolume: number; // e.g., messages per second
  taskProgress: TaskProgress[];
  position: [number, number, number];
}

interface DynamicAgentEntityProps {
  agent: AgentVisualizationData;
  onHover: (id: string | null) => void;
}

const DynamicAgentEntity: React.FC<DynamicAgentEntityProps> = ({ agent, onHover }) => {
  const ref = useRef<THREE.Group>(null);
  const [initialScale] = useState(() => new THREE.Vector3(1, 1, 1));

  useFrame((state) => {
    if (ref.current) {
      // Bind workload to agent size (scale)
      const scaleFactor = 1 + (agent.workload / 100) * 0.5; // Scales from 1x to 1.5x
      ref.current.scale.set(initialScale.x * scaleFactor, initialScale.y * scaleFactor, initialScale.z * scaleFactor);

      // Bind performance to glow intensity (emissiveIntensity)
      const glowIntensity = (agent.performance / 100) * 2; // Scales from 0 to 2
      // Assuming the material is directly on the first child mesh
      const mesh = ref.current.children[0] as THREE.Mesh;
      if (mesh && mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.emissiveIntensity = glowIntensity;
        mesh.material.emissive.set(agent.performance > 70 ? '#00ff00' : '#ffcc00'); // Green for high perf, yellow for medium
      }

      // Pulsing animation for active agents (based on communication volume)
      const pulseScale = 1 + Math.sin(state.clock.elapsedTime * (1 + agent.communicationVolume / 10)) * 0.05;
      ref.current.scale.multiplyScalar(pulseScale);

      // Simple rotation for visual interest
      ref.current.rotation.y += 0.01;
    }
  });

  const renderAgentShape = () => {
    switch (agent.type) {
      case 'DIRK.c':
        return <Box args={[1, 1, 1]} />;
      case 'DIRK.g':
        return <Cylinder args={[0.5, 0.5, 1.5, 32]} />;
      case 'DIRK.desktop':
        return <Sphere args={[0.7, 32, 32]} />;
      default:
        return <Sphere args={[0.7, 32, 32]} />;
    }
  };

  return (
    <group
      ref={ref}
      position={agent.position}
      onPointerOver={() => onHover(agent.id)}
      onPointerOut={() => onHover(null)}
    >
      {renderAgentShape()}
      <meshStandardMaterial color={agent.workload > 80 ? 'red' : 'blue'} />
    </group>
  );
};

export default DynamicAgentEntity;
