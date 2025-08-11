import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AgentPositionMap {
  [agentId: string]: [number, number, number];
}

interface WorkflowExecutionStreamProps {
  tasks: Array<{ id: string; fromAgentId: string; toAgentId: string; progress: number; status: string; }>;
  agentPositions: AgentPositionMap;
}

const WorkflowExecutionStream: React.FC<WorkflowExecutionStreamProps> = ({ tasks, agentPositions }) => {
  const particleMeshRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const color = new THREE.Color();

    tasks.forEach(task => {
      const fromPos = agentPositions[task.fromAgentId];
      const toPos = agentPositions[task.toAgentId];

      if (fromPos && toPos) {
        const start = new THREE.Vector3(...fromPos);
        const end = new THREE.Vector3(...toPos);
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();
        direction.normalize();

        // Create particles along the path, more for longer paths
        const numParticles = Math.max(5, Math.floor(length * 10));

        for (let i = 0; i < numParticles; i++) {
          const t = i / numParticles; // Distribute evenly
          const point = new THREE.Vector3().addVectors(start, direction.clone().multiplyScalar(length * t));
          positions.push(point.x, point.y, point.z);

          // Color based on task status
          if (task.status === 'completed') color.set(0x00ff00); // Green
          else if (task.status === 'in-progress') color.set(0xffff00); // Yellow
          else color.set(0x0000ff); // Blue for pending/other
          colors.push(color.r, color.g, color.b);
        }
      }
    });
    return { positions: new Float32Array(positions), colors: new Float32Array(colors) };
  }, [tasks, agentPositions]);

  useFrame((state) => {
    if (particleMeshRef.current) {
      const positions = particleMeshRef.current.geometry.attributes.position.array as Float32Array;
      const startVec = new THREE.Vector3();
      const endVec = new THREE.Vector3();
      const tempVec = new THREE.Vector3();

      let particleIndex = 0;
      tasks.forEach(task => {
        const fromPos = agentPositions[task.fromAgentId];
        const toPos = agentPositions[task.toAgentId];

        if (fromPos && toPos) {
          startVec.set(...fromPos);
          endVec.set(...toPos);
          const direction = tempVec.subVectors(endVec, startVec).normalize();
          const length = startVec.distanceTo(endVec);
          const numParticles = Math.max(5, Math.floor(length * 10));

          for (let i = 0; i < numParticles; i++) {
            // Move particles along the path
            positions[particleIndex * 3] += direction.x * 0.05; // Speed
            positions[particleIndex * 3 + 1] += direction.y * 0.05;
            positions[particleIndex * 3 + 2] += direction.z * 0.05;

            // If particle goes past end, reset to start
            const currentParticlePos = new THREE.Vector3(positions[particleIndex * 3], positions[particleIndex * 3 + 1], positions[particleIndex * 3 + 2]);
            if (currentParticlePos.distanceTo(startVec) > length + 0.1) { // +0.1 for buffer
              positions[particleIndex * 3] = startVec.x;
              positions[particleIndex * 3 + 1] = startVec.y;
              positions[particleIndex * 3 + 2] = startVec.z;
            }
            particleIndex++;
          }
        }
      });
      particleMeshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particleMeshRef}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particles.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        attach="material"
        vertexColors={true}
        size={0.05}
        transparent
        opacity={0.7}
        sizeAttenuation={true}
      />
    </points>
  );
};

export default WorkflowExecutionStream;
