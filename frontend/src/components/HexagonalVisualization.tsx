'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface Agent {
  id: string;
  name: string;
  type: string;
  provider: string;
  status: 'idle' | 'active' | 'deploying';
}

interface Pod {
  id: string;
  name: string;
  type: string;
  agents: Agent[];
  status: 'idle' | 'active' | 'deploying';
}

interface Props {
  pods: Pod[];
}

export default function HexagonalVisualization({ pods }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>();
  const hexagonsRef = useRef<Map<string, THREE.Mesh>>(new Map());

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f6ff);
    scene.fog = new THREE.Fog(0xf8f6ff, 10, 50);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 10, 20);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);

    // Add rim lighting for better visibility
    const rimLight = new THREE.DirectionalLight(0x8b5cf6, 0.3);
    rimLight.position.set(-10, 10, -10);
    scene.add(rimLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 50;
    controls.minDistance = 5;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Grid helper
    const gridHelper = new THREE.GridHelper(30, 30, 0x8b5cf6, 0xe0d9ff);
    scene.add(gridHelper);

    // Create hexagonal geometry
    const createHexagon = (radius: number = 1) => {
      const shape = new THREE.Shape();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) {
          shape.moveTo(x, y);
        } else {
          shape.lineTo(x, y);
        }
      }
      shape.closePath();
      
      const extrudeSettings = {
        steps: 2,
        depth: 0.5,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelSegments: 3
      };
      
      return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    };

    // Create agent hexagons for each pod
    const hexagonGeometry = createHexagon(0.8);
    
    pods.forEach((pod, podIndex) => {
      const podGroup = new THREE.Group();
      const podRadius = 5 + podIndex * 8;
      
      pod.agents.forEach((agent, agentIndex) => {
        const angle = (agentIndex / pod.agents.length) * Math.PI * 2;
        const x = Math.cos(angle) * podRadius;
        const z = Math.sin(angle) * podRadius;
        
        // Color based on provider
        const colorMap: { [key: string]: number } = {
          'claude': 0x8b5cf6,
          'gpt': 0xa855f7,
          'gemini': 0x6366f1,
          'local': 0x3b82f6
        };
        
        const color = colorMap[agent.provider.toLowerCase()] || 0x8b5cf6;
        
        const material = new THREE.MeshPhysicalMaterial({
          color: color,
          metalness: 0.3,
          roughness: 0.4,
          clearcoat: 1,
          clearcoatRoughness: 0.2,
          emissive: color,
          emissiveIntensity: agent.status === 'active' ? 0.2 : 0
        });
        
        const hexagon = new THREE.Mesh(hexagonGeometry, material);
        hexagon.position.set(x, Math.sin(agentIndex) * 2, z);
        hexagon.rotation.x = Math.PI / 2;
        hexagon.castShadow = true;
        hexagon.receiveShadow = true;
        
        // Store reference for updates
        hexagonsRef.current.set(agent.id, hexagon);
        
        // Add glow effect for active agents
        if (agent.status === 'active') {
          const glowGeometry = createHexagon(0.85);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3
          });
          const glow = new THREE.Mesh(glowGeometry, glowMaterial);
          glow.position.copy(hexagon.position);
          glow.rotation.copy(hexagon.rotation);
          podGroup.add(glow);
        }
        
        podGroup.add(hexagon);
      });
      
      scene.add(podGroup);
    });

    // Add connection lines between agents
    const createConnections = () => {
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.3
      });
      
      pods.forEach((pod) => {
        if (pod.type === 'mesh' || pod.type === 'swarm') {
          // Connect all agents in a mesh/swarm
          for (let i = 0; i < pod.agents.length; i++) {
            for (let j = i + 1; j < pod.agents.length; j++) {
              const hex1 = hexagonsRef.current.get(pod.agents[i].id);
              const hex2 = hexagonsRef.current.get(pod.agents[j].id);
              
              if (hex1 && hex2) {
                const points = [];
                points.push(hex1.position);
                points.push(hex2.position);
                
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(geometry, lineMaterial);
                scene.add(line);
              }
            }
          }
        } else if (pod.type === 'pipeline') {
          // Connect agents in sequence for pipeline
          for (let i = 0; i < pod.agents.length - 1; i++) {
            const hex1 = hexagonsRef.current.get(pod.agents[i].id);
            const hex2 = hexagonsRef.current.get(pod.agents[i + 1].id);
            
            if (hex1 && hex2) {
              const points = [];
              points.push(hex1.position);
              points.push(hex2.position);
              
              const geometry = new THREE.BufferGeometry().setFromPoints(points);
              const line = new THREE.Line(geometry, lineMaterial);
              scene.add(line);
            }
          }
        }
      });
    };
    
    createConnections();

    // Add particle system for data flow
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 30;
      positions[i + 1] = Math.random() * 10;
      positions[i + 2] = (Math.random() - 0.5) * 30;
      
      velocities[i] = (Math.random() - 0.5) * 0.02;
      velocities[i + 1] = Math.random() * 0.02;
      velocities[i + 2] = (Math.random() - 0.5) * 0.02;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x8b5cf6,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      // Update controls
      controls.update();
      
      // Animate hexagons
      hexagonsRef.current.forEach((hexagon, id) => {
        const agent = pods.flatMap(p => p.agents).find(a => a.id === id);
        if (agent?.status === 'active') {
          hexagon.rotation.z += 0.01;
          hexagon.position.y = Math.sin(Date.now() * 0.001) * 0.5 + 1;
        }
      });
      
      // Animate particles
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];
        
        // Reset particles that go out of bounds
        if (Math.abs(positions[i]) > 15 || positions[i + 1] > 10 || Math.abs(positions[i + 2]) > 15) {
          positions[i] = (Math.random() - 0.5) * 30;
          positions[i + 1] = 0;
          positions[i + 2] = (Math.random() - 0.5) * 30;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;
      
      renderer.render(scene, camera);
    };
    
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, [pods]);

  return <div ref={mountRef} className="w-full h-full" />;
}