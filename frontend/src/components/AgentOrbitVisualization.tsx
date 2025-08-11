'use client';

import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Agent3D {
  id: string;
  name: string;
  type: 'local' | 'remote';
  class: 'CLAUDE' | 'GPT' | 'GEMINI' | 'LOCAL';
  position: [number, number, number];
  level: number;
  status: 'ACTIVE' | 'RESTING' | 'DEPLOYING' | 'ERROR';
  health: number;
  mana: number;
}

interface Agent3DEntityProps {
  agent: Agent3D;
  onClick: (agent: Agent3D) => void;
  isSelected: boolean;
}

function Agent3DEntity({ agent, onClick, isSelected }: Agent3DEntityProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  // Class colors - ONLY BLACK, RED, WHITE
  const classColors = {
    'CLAUDE': '#FFFFFF', // White for Claude
    'GPT': '#FFFFFF',    // White for GPT  
    'GEMINI': '#FFFFFF', // White for Gemini
    'LOCAL': '#FF0000'   // Red for Local
  };
  
  // Status colors - ONLY BLACK, RED, WHITE
  const statusColors = {
    'ACTIVE': '#FFFFFF',
    'RESTING': '#FFFFFF',
    'DEPLOYING': '#FF0000', 
    'ERROR': '#FF0000'
  };
  
  const baseColor = classColors[agent.class];
  const statusColor = statusColors[agent.status];
  
  // Pulsing animation based on health and mana
  useFrame((state) => {
    if (!meshRef.current || !groupRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // Gentle rotation
    if (agent.status === 'ACTIVE') {
      groupRef.current.rotation.y += 0.01;
    }
    
    // Pulsing scale based on health
    const pulse = 1 + Math.sin(time * 2) * 0.1 * (agent.health / 100);
    meshRef.current.scale.setScalar(pulse);
    
    // Color intensity based on mana
    if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      meshRef.current.material.emissiveIntensity = 0.3 * (agent.mana / 100);
    }
  });
  
  // Agent size based on level and type
  const agentSize = agent.type === 'local' ? 1.2 : 1.0;
  const levelScale = 1 + (agent.level / 50);
  
  return (
    <group ref={groupRef} position={agent.position} onClick={() => onClick(agent)}>
      {/* Main agent sphere */}
      <mesh ref={meshRef}>
        {agent.type === 'local' ? (
          // Local agents as cubes
          <boxGeometry args={[agentSize * levelScale, agentSize * levelScale, agentSize * levelScale]} />
        ) : (
          // Remote agents as spheres
          <sphereGeometry args={[agentSize * levelScale, 16, 16]} />
        )}
        <meshStandardMaterial
          color={baseColor}
          emissive={statusColor}
          emissiveIntensity={0.3}
          wireframe={agent.status === 'ERROR'}
          transparent={agent.status === 'RESTING'}
          opacity={agent.status === 'RESTING' ? 0.7 : 1.0}
        />
      </mesh>
      
      {/* Selection indicator */}
      {isSelected && (
        <mesh>
          <sphereGeometry args={[agentSize * levelScale + 0.5, 16, 16]} />
          <meshBasicMaterial color="#FF0000" wireframe transparent opacity={0.5} />
        </mesh>
      )}
      
      {/* Health/Mana bars floating above */}
      <Html position={[0, agentSize * levelScale + 1.5, 0]} center>
        <div className="bg-black/80 border border-red-600 p-2 rounded text-white text-xs min-w-[100px]">
          <div className="text-center font-bold mb-1">{agent.name}</div>
          <div className="flex justify-between text-[10px]">
            <span className="text-red-600">HP: {agent.health}</span>
            <span className="text-white">MP: {agent.mana}</span>
          </div>
          <div className="text-center text-[10px] text-white/60">
            {agent.type === 'local' ? '🖥️ LOCAL' : '☁️ REMOTE'}
          </div>
        </div>
      </Html>
    </group>
  );
}

function CameraController() {
  const { camera, gl } = useThree();
  
  useEffect(() => {
    // Set initial camera position for good view of agents
    camera.position.set(15, 10, 15);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  return (
    <OrbitControls
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={5}
      maxDistance={50}
      autoRotate={false}
      autoRotateSpeed={0.5}
    />
  );
}

function SceneEnvironment() {
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.4} />
      
      {/* Main directional light */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Secondary light for fill */}
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#FF0000" />
      
      {/* Grid helper - black/red/white theme only */}
      <gridHelper args={[40, 40, '#FF0000', '#FFFFFF']} />
      
      {/* Minimal axes - red and white only */}
      <group>
        {/* X axis - Red */}
        <mesh position={[2.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 5]} />
          <meshBasicMaterial color="#FF0000" />
        </mesh>
        {/* Y axis - White */}
        <mesh position={[0, 2.5, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 5]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
        {/* Z axis - White */}
        <mesh position={[0, 0, 2.5]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 5]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </group>
    </>
  );
}

interface AgentOrbitVisualizationProps {
  agents: Agent3D[];
  onAgentSelect: (agent: Agent3D | null) => void;
  selectedAgentId: string | null;
  className?: string;
}

export default function AgentOrbitVisualization({
  agents,
  onAgentSelect,
  selectedAgentId,
  className = ''
}: AgentOrbitVisualizationProps) {
  const [autoRotate, setAutoRotate] = useState(true);
  
  // Convert agents to 3D positions in a nice orbit pattern
  const agents3D = useMemo<Agent3D[]>(() => {
    return agents.map((agent, index) => {
      const angle = (index / agents.length) * Math.PI * 2;
      const radius = agent.type === 'local' ? 8 : 12; // Local agents closer to center
      const height = agent.type === 'local' ? 2 : -1;
      
      return {
        ...agent,
        position: [
          Math.cos(angle) * radius,
          height + Math.sin(index * 0.5) * 2,
          Math.sin(angle) * radius
        ] as [number, number, number]
      };
    });
  }, [agents]);
  
  const handleAgentClick = (agent: Agent3D) => {
    onAgentSelect(selectedAgentId === agent.id ? null : agent);
  };
  
  return (
    <div className={`relative bg-black border border-red-600 ${className}`}>
      {/* 3D Controls */}
      <div className="absolute top-4 left-4 z-10 bg-black/80 border border-red-600 p-2 rounded">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-2 py-1 text-xs rounded ${
              autoRotate 
                ? 'bg-red-600 text-white' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Auto Rotate
          </button>
          <div className="text-white text-xs">
            Agents: {agents.length} | Local: {agents.filter(a => a.type === 'local').length}
          </div>
        </div>
      </div>
      
      {/* Agent Count */}
      <div className="absolute top-4 right-4 z-10 bg-black/80 border border-red-600 p-2 rounded">
        <div className="text-white text-xs font-bold">
          🖥️ {agents.filter(a => a.type === 'local').length} LOCAL
        </div>
        <div className="text-white text-xs font-bold">
          ☁️ {agents.filter(a => a.type === 'remote').length} REMOTE
        </div>
      </div>
      
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [15, 10, 15], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 20, 60]} />
        
        <Suspense fallback={null}>
          <SceneEnvironment />
          <CameraController />
          
          {/* Render all agents */}
          {agents3D.map((agent) => (
            <Agent3DEntity
              key={agent.id}
              agent={agent}
              onClick={handleAgentClick}
              isSelected={selectedAgentId === agent.id}
            />
          ))}
          
          {/* Center origin marker */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshBasicMaterial color="#FF0000" transparent opacity={0.7} />
          </mesh>
          
          {/* Orbital rings */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2, 0]}>
            <ringGeometry args={[7, 9, 32]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.1} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
            <ringGeometry args={[11, 13, 32]} />
            <meshBasicMaterial color="#FF0000" transparent opacity={0.1} side={THREE.DoubleSide} />
          </mesh>
        </Suspense>
      </Canvas>
      
      {/* Usage Instructions */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/80 border border-red-600 p-2 rounded">
        <div className="text-white text-xs">
          <div>🖱️ Click to select agent</div>
          <div>🔄 Drag to rotate view</div>
          <div>🔍 Scroll to zoom</div>
        </div>
      </div>
    </div>
  );
}