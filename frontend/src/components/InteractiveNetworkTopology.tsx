import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface AgentNode {
  id: string;
  position: [number, number, number];
  status: string;
  type?: string;
  workload?: number;
}

interface Connection {
  from: string;
  to: string;
  strength: number;
  dataType?: string;
  latency?: number;
}

interface InteractiveNetworkTopologyProps {
  nodes: AgentNode[];
  connections: Connection[];
}

const InteractiveNetworkTopology: React.FC<InteractiveNetworkTopologyProps> = ({
  nodes,
  connections,
}) => {
  const lineMeshRef = useRef<THREE.LineSegments>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredConnection, setHoveredConnection] = useState<Connection | null>(null);

  // Enhanced line visualization with data flow particles
  const { linePositions, flowParticles } = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const particles: Array<{
      position: THREE.Vector3;
      direction: THREE.Vector3;
      speed: number;
      color: THREE.Color;
      connectionIndex: number;
    }> = [];
    
    const color = new THREE.Color();

    connections.forEach((conn, index) => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);

      if (fromNode && toNode) {
        const fromPos = new THREE.Vector3(...fromNode.position);
        const toPos = new THREE.Vector3(...toNode.position);
        
        positions.push(...fromNode.position);
        positions.push(...toNode.position);

        // Enhanced color coding based on connection properties
        if (conn.strength > 0.8) {
          color.setHSL(0, 1, 0.6); // Red for high traffic
        } else if (conn.strength > 0.4) {
          color.setHSL(0.15, 1, 0.6); // Orange for medium traffic
        } else {
          color.setHSL(0.3, 1, 0.6); // Green for low traffic
        }

        // Add latency-based color modification
        if (conn.latency && conn.latency > 100) {
          color.multiplyScalar(0.7); // Dim for high latency
        }

        colors.push(color.r, color.g, color.b);
        colors.push(color.r, color.g, color.b);

        // Create data flow particles
        const particleCount = Math.max(1, Math.floor(conn.strength * 5));
        for (let i = 0; i < particleCount; i++) {
          const direction = new THREE.Vector3().subVectors(toPos, fromPos).normalize();
          const startPos = fromPos.clone().add(direction.clone().multiplyScalar(i * 0.5));
          
          particles.push({
            position: startPos,
            direction: direction,
            speed: 0.02 + conn.strength * 0.03,
            color: color.clone(),
            connectionIndex: index
          });
        }
      }
    });

    return { 
      linePositions: { 
        positions: new Float32Array(positions), 
        colors: new Float32Array(colors) 
      },
      flowParticles: particles
    };
  }, [nodes, connections]);

  // Node visualization with status indicators
  const nodeElements = useMemo(() => {
    return nodes.map(node => {
      let nodeColor = new THREE.Color();
      switch (node.status) {
        case 'active':
          nodeColor.setHSL(0.3, 1, 0.5); // Green
          break;
        case 'busy':
          nodeColor.setHSL(0.15, 1, 0.5); // Orange
          break;
        case 'error':
          nodeColor.setHSL(0, 1, 0.5); // Red
          break;
        default:
          nodeColor.setHSL(0.6, 0.5, 0.5); // Blue-gray
      }

      const workloadScale = 0.1 + (node.workload || 0) * 0.01;

      return {
        ...node,
        color: nodeColor,
        scale: workloadScale
      };
    });
  }, [nodes]);

  useFrame((state) => {
    if (lineMeshRef.current) {
      // Animate connection lines with data flow effect
      const material = lineMeshRef.current.material as THREE.LineBasicMaterial;
      const baseOpacity = 0.6;
      const pulseIntensity = Math.sin(state.clock.elapsedTime * 2) * 0.2;
      material.opacity = baseOpacity + pulseIntensity;
    }

    // Animate flow particles
    flowParticles.forEach(particle => {
      particle.position.add(particle.direction.clone().multiplyScalar(particle.speed));
      
      // Reset particle if it's traveled too far
      const connection = connections[particle.connectionIndex];
      if (connection) {
        const fromNode = nodes.find(n => n.id === connection.from);
        const toNode = nodes.find(n => n.id === connection.to);
        if (fromNode && toNode) {
          const fromPos = new THREE.Vector3(...fromNode.position);
          const toPos = new THREE.Vector3(...toNode.position);
          const distance = fromPos.distanceTo(toPos);
          
          if (particle.position.distanceTo(fromPos) > distance) {
            particle.position.copy(fromPos);
          }
        }
      }
    });
  });

  return (
    <group>
      {/* Connection lines */}
      <lineSegments ref={lineMeshRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[linePositions.colors, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial 
          vertexColors 
          transparent 
          opacity={0.6}
          linewidth={2}
        />
      </lineSegments>

      {/* Network nodes */}
      {nodeElements.map(node => (
        <group key={node.id} position={node.position}>
          <Sphere 
            args={[node.scale, 16, 16]}
            onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
            onPointerOver={() => setSelectedNode(node.id)}
          >
            <meshStandardMaterial 
              color={node.color}
              emissive={node.color}
              emissiveIntensity={0.3}
              transparent
              opacity={0.8}
            />
          </Sphere>

          {/* Node status indicator ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[node.scale * 1.2, node.scale * 1.4, 16]} />
            <meshBasicMaterial 
              color={node.color}
              transparent
              opacity={0.5}
            />
          </mesh>

          {/* Node information panel */}
          {selectedNode === node.id && (
            <Html position={[0, node.scale + 0.3, 0]} center>
              <div className="bg-black/90 backdrop-blur-md border border-cyan-400/50 rounded-lg p-3 text-white text-xs min-w-[180px]">
                <div className="text-cyan-400 font-bold mb-2">{node.id}</div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-semibold ${
                      node.status === 'active' ? 'text-green-400' :
                      node.status === 'busy' ? 'text-orange-400' :
                      node.status === 'error' ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {node.status}
                    </span>
                  </div>
                  {node.type && (
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="text-blue-400">{node.type}</span>
                    </div>
                  )}
                  {node.workload !== undefined && (
                    <div className="flex justify-between">
                      <span>Workload:</span>
                      <span className="text-yellow-400">{node.workload}%</span>
                    </div>
                  )}
                </div>
              </div>
            </Html>
          )}
        </group>
      ))}

      {/* Data flow particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(flowParticles.flatMap(p => [p.position.x, p.position.y, p.position.z])), 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[new Float32Array(flowParticles.flatMap(p => [p.color.r, p.color.g, p.color.b])), 3]}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.03}
          transparent
          opacity={0.8}
          vertexColors
          sizeAttenuation
        />
      </points>
    </group>
  );
};

export default InteractiveNetworkTopology;
