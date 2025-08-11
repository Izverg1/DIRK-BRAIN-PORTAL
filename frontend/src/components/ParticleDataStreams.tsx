import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DataStream {
  id: string;
  source: [number, number, number];
  destination: [number, number, number];
  dataType: 'task' | 'metric' | 'log' | 'command';
  intensity: number; // 0-1
  speed: number;
}

interface ParticleDataStreamsProps {
  streams: DataStream[];
  globalIntensity?: number;
}

const ParticleDataStreams: React.FC<ParticleDataStreamsProps> = ({
  streams,
  globalIntensity = 1.0
}) => {
  const particleSystemsRef = useRef<any>([]);

  // Create particle systems for each stream
  const particleSystems = useMemo(() => {
    return streams.map((stream, streamIndex) => {
      const particleCount = Math.floor(50 * stream.intensity * globalIntensity);
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      const velocities = new Float32Array(particleCount * 3);
      const lifetimes = new Float32Array(particleCount);

      const sourceVec = new THREE.Vector3(...stream.source);
      const destVec = new THREE.Vector3(...stream.destination);
      const direction = new THREE.Vector3().subVectors(destVec, sourceVec).normalize();
      const distance = sourceVec.distanceTo(destVec);

      // Color mapping for different data types
      let baseColor: THREE.Color;
      switch (stream.dataType) {
        case 'task':
          baseColor = new THREE.Color(0x00ff00); // Green
          break;
        case 'metric':
          baseColor = new THREE.Color(0x0088ff); // Blue
          break;
        case 'log':
          baseColor = new THREE.Color(0xffaa00); // Orange
          break;
        case 'command':
          baseColor = new THREE.Color(0xff0088); // Pink
          break;
        default:
          baseColor = new THREE.Color(0xffffff); // White
      }

      for (let i = 0; i < particleCount; i++) {
        // Initial positions along the stream path with some randomness
        const t = Math.random();
        const basePos = new THREE.Vector3().lerpVectors(sourceVec, destVec, t);
        
        // Add perpendicular randomness to create stream width
        const perpendicular1 = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();
        const perpendicular2 = new THREE.Vector3().crossVectors(direction, perpendicular1).normalize();
        
        const randomOffset = perpendicular1.clone()
          .multiplyScalar((Math.random() - 0.5) * 0.2)
          .add(perpendicular2.clone().multiplyScalar((Math.random() - 0.5) * 0.2));
        
        basePos.add(randomOffset);

        positions[i * 3] = basePos.x;
        positions[i * 3 + 1] = basePos.y;
        positions[i * 3 + 2] = basePos.z;

        // Velocities with some randomness
        const baseSpeed = stream.speed * (0.8 + Math.random() * 0.4);
        velocities[i * 3] = direction.x * baseSpeed;
        velocities[i * 3 + 1] = direction.y * baseSpeed;
        velocities[i * 3 + 2] = direction.z * baseSpeed;

        // Colors with intensity variation
        const colorVariation = 0.8 + Math.random() * 0.4;
        const finalColor = baseColor.clone().multiplyScalar(colorVariation);
        colors[i * 3] = finalColor.r;
        colors[i * 3 + 1] = finalColor.g;
        colors[i * 3 + 2] = finalColor.b;

        // Sizes based on data type and intensity
        const baseSize = stream.dataType === 'command' ? 0.08 : 0.04;
        sizes[i] = baseSize * (0.5 + Math.random() * 0.5) * stream.intensity;

        // Lifetimes for particle recycling
        lifetimes[i] = Math.random() * distance / baseSpeed;
      }

      return {
        streamIndex,
        particleCount,
        positions,
        colors,
        sizes,
        velocities,
        lifetimes,
        stream,
        sourceVec,
        destVec,
        direction,
        distance
      };
    });
  }, [streams, globalIntensity]);

  useFrame((state, delta) => {
    particleSystems.forEach((system, index) => {
      const particlesRef = particleSystemsRef.current[index];
      if (!particlesRef) return;

      const positions = particlesRef.geometry.attributes.position.array as Float32Array;
      const colors = particlesRef.geometry.attributes.color.array as Float32Array;
      const sizes = particlesRef.geometry.attributes.size.array as Float32Array;

      for (let i = 0; i < system.particleCount; i++) {
        const i3 = i * 3;

        // Update positions
        positions[i3] += system.velocities[i3] * delta;
        positions[i3 + 1] += system.velocities[i3 + 1] * delta;
        positions[i3 + 2] += system.velocities[i3 + 2] * delta;

        // Update lifetimes
        system.lifetimes[i] -= delta;

        // Check if particle needs to be recycled
        const currentPos = new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]);
        const distanceFromSource = currentPos.distanceTo(system.sourceVec);
        
        if (system.lifetimes[i] <= 0 || distanceFromSource > system.distance + 1) {
          // Reset particle to source with some randomness
          const perpendicular1 = new THREE.Vector3().crossVectors(system.direction, new THREE.Vector3(0, 1, 0)).normalize();
          const perpendicular2 = new THREE.Vector3().crossVectors(system.direction, perpendicular1).normalize();
          
          const randomOffset = perpendicular1.clone()
            .multiplyScalar((Math.random() - 0.5) * 0.2)
            .add(perpendicular2.clone().multiplyScalar((Math.random() - 0.5) * 0.2));
          
          const newPos = system.sourceVec.clone().add(randomOffset);
          
          positions[i3] = newPos.x;
          positions[i3 + 1] = newPos.y;
          positions[i3 + 2] = newPos.z;

          // Reset lifetime
          system.lifetimes[i] = system.distance / system.stream.speed;

          // Vary color slightly for visual interest
          const baseColor = new THREE.Color();
          switch (system.stream.dataType) {
            case 'task':
              baseColor.setHSL(0.3, 1, 0.5 + Math.random() * 0.3);
              break;
            case 'metric':
              baseColor.setHSL(0.6, 1, 0.5 + Math.random() * 0.3);
              break;
            case 'log':
              baseColor.setHSL(0.1, 1, 0.5 + Math.random() * 0.3);
              break;
            case 'command':
              baseColor.setHSL(0.8, 1, 0.5 + Math.random() * 0.3);
              break;
          }
          
          colors[i3] = baseColor.r;
          colors[i3 + 1] = baseColor.g;
          colors[i3 + 2] = baseColor.b;
        }

        // Animate size based on distance from destination (fade out effect)
        const distanceFromDest = currentPos.distanceTo(system.destVec);
        const fadeDistance = 1.0;
        const fadeFactor = Math.min(1, distanceFromDest / fadeDistance);
        const originalSize = system.sizes[i];
        sizes[i] = originalSize * fadeFactor;

        // Add pulsing effect based on stream intensity
        const pulseIntensity = 1 + Math.sin(state.clock.elapsedTime * 5 + i * 0.1) * 0.2 * system.stream.intensity;
        sizes[i] *= pulseIntensity;
      }

      // Mark attributes as needing update
      particlesRef.geometry.attributes.position.needsUpdate = true;
      particlesRef.geometry.attributes.color.needsUpdate = true;
      particlesRef.geometry.attributes.size.needsUpdate = true;
    });
  });

  return (
    <group>
      {particleSystems.map((system, index) => (
        <points
          key={`stream-${system.streamIndex}`}
          ref={(ref) => {
            if (ref) particleSystemsRef.current[index] = ref;
          }}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[system.positions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[system.colors, 3]}
            />
            <bufferAttribute
              attach="attributes-size"
              args={[system.sizes, 1]}
            />
          </bufferGeometry>
          <pointsMaterial
            transparent
            opacity={0.8}
            vertexColors
            sizeAttenuation
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      ))}

      {/* Stream path indicators */}
      {streams.map((stream, index) => (
        <line key={`path-${stream.id}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([
                ...stream.source,
                ...stream.destination
              ]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={
              stream.dataType === 'task' ? '#00ff00' :
              stream.dataType === 'metric' ? '#0088ff' :
              stream.dataType === 'log' ? '#ffaa00' : '#ff0088'
            }
            transparent
            opacity={0.1 * stream.intensity}
          />
        </line>
      ))}
    </group>
  );
};

export default ParticleDataStreams;