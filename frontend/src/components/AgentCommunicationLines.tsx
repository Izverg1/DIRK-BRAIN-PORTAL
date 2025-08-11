import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AgentEntityProps {
  position: [number, number, number];
  id: string;
  // Add other relevant props if needed, e.g., type, status
}

interface AgentCommunicationLinesProps {
  agents: AgentEntityProps[];
}

const AgentCommunicationLines: React.FC<AgentCommunicationLinesProps> = ({ agents }) => {
  const meshRef = useRef<THREE.LineSegments>(null);

  const positions = useMemo(() => {
    const temp: number[] = [];
    if (agents.length > 1) {
      // Simulate communication by drawing lines between agents
      // Connect each agent to a few random other agents
      agents.forEach((agent1, index1) => {
        // Connect to a few random other agents (e.g., 2-3)
        const numConnections = Math.floor(Math.random() * 2) + 1; // 1 to 2 connections
        for (let i = 0; i < numConnections; i++) {
          let index2 = Math.floor(Math.random() * agents.length);
          let agent2 = agents[index2]; // Declare and initialize agent2 here
          // Ensure not connecting to self and not connecting to the same agent multiple times in this loop
          while (index2 === index1 || (temp.includes(agent1.position[0]) && temp.includes(agent2.position[0]) && temp.includes(agent1.position[1]) && temp.includes(agent2.position[1]))) {
            index2 = Math.floor(Math.random() * agents.length);
            agent2 = agents[index2]; // Reassign agent2 inside the loop
          }

          temp.push(...agent1.position);
          temp.push(...agent2.position);
        }
      });
    }
    return new Float32Array(temp);
  }, [agents]); // Re-generate lines if agents data changes

  useFrame((state) => {
    if (meshRef.current) {
      // Simple animation: make lines subtly pulse opacity
      const material = meshRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2; // Pulse opacity between 0.3 and 0.7
    }
  });

  return (
    <lineSegments ref={meshRef}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial attach="material" color="#00ffff" linewidth={1} transparent />
    </lineSegments>
  );
};

export default AgentCommunicationLines;
