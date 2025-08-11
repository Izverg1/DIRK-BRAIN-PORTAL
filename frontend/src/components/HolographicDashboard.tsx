import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Plane } from '@react-three/drei';
import * as THREE from 'three';

interface DashboardPanel {
  id: string;
  title: string;
  type: 'metrics' | 'chart' | 'status' | 'logs';
  data: any;
  position: [number, number, number];
  size: [number, number];
}

interface HolographicDashboardProps {
  panels: DashboardPanel[];
  centerPosition?: [number, number, number];
}

const HolographicDashboard: React.FC<HolographicDashboardProps> = ({
  panels,
  centerPosition = [0, 0, 0]
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);

  // Create holographic panel materials
  const panelMaterials = useMemo(() => {
    return panels.map((panel, index) => {
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(index * 0.2, 0.7, 0.5),
        transparent: true,
        opacity: 0.1,
        emissive: new THREE.Color().setHSL(index * 0.2, 0.7, 0.3),
        emissiveIntensity: 0.2,
        side: THREE.DoubleSide
      });
      return material;
    });
  }, [panels]);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle rotation of the entire dashboard
      groupRef.current.rotation.y += 0.002;
      
      // Animate individual panels
      groupRef.current.children.forEach((child, index) => {
        if (child instanceof THREE.Group) {
          const panel = panels[index];
          if (panel) {
            // Floating animation
            child.position.y = panel.position[1] + Math.sin(state.clock.elapsedTime + index) * 0.1;
            
            // Subtle rotation
            child.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.05;
            
            // Scale animation when selected
            const targetScale = selectedPanel === panel.id ? 1.1 : 1.0;
            child.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
          }
        }
      });
    }
  });

  const renderPanelContent = (panel: DashboardPanel) => {
    switch (panel.type) {
      case 'metrics':
        return (
          <div className="space-y-2">
            {Object.entries(panel.data || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-cyan-300">{key}:</span>
                <span className="text-white font-mono">{String(value)}</span>
              </div>
            ))}
          </div>
        );
      
      case 'chart':
        return (
          <div className="space-y-2">
            <div className="text-cyan-300 text-sm">Performance Trend</div>
            <div className="flex items-end space-x-1 h-16">
              {(panel.data?.values || []).map((value: number, index: number) => (
                <div
                  key={index}
                  className="bg-cyan-400 w-2 opacity-70"
                  style={{ height: `${(value / 100) * 100}%` }}
                />
              ))}
            </div>
          </div>
        );
      
      case 'status':
        return (
          <div className="space-y-2">
            {(panel.data?.items || []).map((item: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  item.status === 'active' ? 'bg-green-400' :
                  item.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                }`} />
                <span className="text-white text-sm">{item.name}</span>
              </div>
            ))}
          </div>
        );
      
      case 'logs':
        return (
          <div className="space-y-1 font-mono text-xs">
            {(panel.data?.entries || []).slice(-5).map((entry: any, index: number) => (
              <div key={index} className="text-gray-300">
                <span className="text-cyan-400">{entry.timestamp}</span>
                <span className="ml-2">{entry.message}</span>
              </div>
            ))}
          </div>
        );
      
      default:
        return <div className="text-white">No data available</div>;
    }
  };

  return (
    <group ref={groupRef} position={centerPosition}>
      {panels.map((panel, index) => (
        <group key={panel.id} position={panel.position}>
          {/* Holographic panel background */}
          <Plane 
            args={panel.size}
            material={panelMaterials[index]}
            onClick={() => setSelectedPanel(panel.id === selectedPanel ? null : panel.id)}
          />
          
          {/* Panel border effect */}
          <lineSegments>
            <edgesGeometry args={[new THREE.PlaneGeometry(...panel.size)]} />
            <lineBasicMaterial 
              color={new THREE.Color().setHSL(index * 0.2, 1, 0.6)}
              transparent
              opacity={0.8}
            />
          </lineSegments>
          
          {/* Holographic content */}
          <Html
            position={[0, 0, 0.01]}
            transform
            occlude
            style={{
              width: `${panel.size[0] * 100}px`,
              height: `${panel.size[1] * 100}px`,
              pointerEvents: selectedPanel === panel.id ? 'auto' : 'none'
            }}
          >
            <div className="w-full h-full bg-black/20 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-4 text-white">
              <div className="text-cyan-400 font-bold text-sm mb-3 border-b border-cyan-400/30 pb-2">
                {panel.title}
              </div>
              <div className="text-xs">
                {renderPanelContent(panel)}
              </div>
              
              {/* Panel controls when selected */}
              {selectedPanel === panel.id && (
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button 
                    className="w-4 h-4 bg-cyan-400/20 border border-cyan-400/50 rounded text-xs hover:bg-cyan-400/40"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Minimize panel logic
                    }}
                  >
                    −
                  </button>
                  <button 
                    className="w-4 h-4 bg-red-400/20 border border-red-400/50 rounded text-xs hover:bg-red-400/40"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPanel(null);
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </Html>
          
          {/* Particle effects around selected panel */}
          {selectedPanel === panel.id && (
            <points>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  args={[new Float32Array(Array.from({ length: 60 }, () => 
                    (Math.random() - 0.5) * (panel.size[0] + 1)
                  )), 3]}
                />
              </bufferGeometry>
              <pointsMaterial
                color={new THREE.Color().setHSL(index * 0.2, 1, 0.6)}
                size={0.02}
                transparent
                opacity={0.6}
              />
            </points>
          )}
        </group>
      ))}
      
      {/* Central hub connection lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(panels.flatMap(panel => [
              0, 0, 0, // Center
              ...panel.position // Panel position
            ])), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial 
          color="#00ffff"
          transparent
          opacity={0.2}
        />
      </lineSegments>
    </group>
  );
};

export default HolographicDashboard;