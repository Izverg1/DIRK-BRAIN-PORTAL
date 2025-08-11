import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box } from '@react-three/drei';
import * as THREE from 'three';

interface ProjectWorkspaceProps {
  position: [number, number, number];
  size?: [number, number, number];
  color?: string;
}

const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({ position, size = [1, 1, 0.1], color = '#808080' }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      // Optional: Add a subtle animation when hovered
      meshRef.current.scale.set(hovered ? 1.1 : 1, hovered ? 1.1 : 1, 1);
    }
  });

  return (
    <Box
      args={size}
      position={position}
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <meshStandardMaterial color={hovered ? '#00aaff' : color} />
    </Box>
  );
};

export default ProjectWorkspace;
