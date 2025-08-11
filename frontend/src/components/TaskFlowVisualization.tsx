import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TaskData {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  progress: number; // 0-100
  status: string; // e.g., 'pending', 'in-progress', 'completed'
}

interface AgentPositionMap {
  [agentId: string]: [number, number, number];
}

interface TaskFlowVisualizationProps {
  tasks: TaskData[];
  agentPositions: AgentPositionMap;
}

const TaskFlowVisualization: React.FC<TaskFlowVisualizationProps> = ({ tasks, agentPositions }) => {
  const particleMeshRef = useRef<THREE.Points>(null);
  const objectMeshRef = useRef<THREE.InstancedMesh>(null);

  const particlePositions = useMemo(() => {
    const positions: number[] = [];
    tasks.forEach(task => {
      const fromPos = agentPositions[task.fromAgentId];
      const toPos = agentPositions[task.toAgentId];

      if (fromPos && toPos) {
        // Simulate particles flowing from source to destination
        const start = new THREE.Vector3(...fromPos);
        const end = new THREE.Vector3(...toPos);
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();
        direction.normalize();

        // Create a few particles along the path
        for (let i = 0; i < 5; i++) {
          const t = Math.random(); // Random position along the line
          const point = new THREE.Vector3().addVectors(start, direction.multiplyScalar(length * t));
          positions.push(point.x, point.y, point.z);
        }
      }
    });
    return new Float32Array(positions);
  }, [tasks, agentPositions]);

  const objectInstances = useMemo(() => {
    const instances: { position: [number, number, number], scale: number, color: THREE.Color }[] = [];
    tasks.forEach(task => {
      const toPos = agentPositions[task.toAgentId];
      if (toPos) {
        const scale = 0.1 + (task.progress / 100) * 0.2; // Grow with progress
        let color = new THREE.Color(0x00ff00); // Green for completed
        if (task.status === 'in-progress') color = new THREE.Color(0xffff00); // Yellow for in-progress
        if (task.status === 'pending') color = new THREE.Color(0x0000ff); // Blue for pending

        instances.push({ position: toPos, scale, color });
      }
    });
    return instances;
  }, [tasks, agentPositions]);

  useFrame((state) => {
    // Animate particles
    if (particleMeshRef.current) {
      particleMeshRef.current.rotation.y += 0.005;
    }

    // Animate task objects (e.g., subtle pulse)
    if (objectMeshRef.current) {
      objectInstances.forEach((instance, i) => {
        const matrix = new THREE.Matrix4();
        const pulseScale = instance.scale * (1 + Math.sin(state.clock.elapsedTime * 5 + i) * 0.1);
        matrix.compose(
          new THREE.Vector3(...instance.position),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(0, state.clock.elapsedTime * 0.5, 0)),
          new THREE.Vector3(pulseScale, pulseScale, pulseScale)
        );
        objectMeshRef.current?.setMatrixAt(i, matrix);
      });
      objectMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Particle streams for task flow */}
      <points ref={particleMeshRef}>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial attach="material" color={0x00ffff} size={0.02} transparent opacity={0.6} />
      </points>

      {/* 3D objects for task progress */}
      {objectInstances.length > 0 && (
        <instancedMesh ref={objectMeshRef} args={[undefined, undefined, objectInstances.length]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial />
          {objectInstances.map((instance, i) => (
            <object3D key={i} position={instance.position} scale={[instance.scale, instance.scale, instance.scale]} />
          ))}
        </instancedMesh>
      )}
    </group>
  );
};

export default TaskFlowVisualization;
