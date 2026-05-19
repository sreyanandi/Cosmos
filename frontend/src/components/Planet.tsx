import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import * as THREE from 'three';
import { createProceduralTexture, createRingTexture } from '../utils/proceduralTextures';

interface PlanetProps {
  name: string;
  radius: number;
  distance: number;
  speed: number;
  color: string;
  onClick: (name: string, position: THREE.Vector3) => void;
  emissive?: string;
  emissiveIntensity?: number;
}

export default function Planet({
  name,
  radius,
  distance,
  speed,
  color,
  onClick,
  emissive,
  emissiveIntensity = 0
}: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  // Generate procedural textures lazily
  const surfaceTexture = useMemo(() => createProceduralTexture(name, color), [name, color]);
  const ringTexture = useMemo(() => (name === 'Saturn' ? createRingTexture() : null), [name]);

  // Animate orbit and rotation
  useFrame((state) => {
    if (orbitRef.current && speed !== 0) {
      orbitRef.current.rotation.y = state.clock.elapsedTime * speed;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
    if (cloudRef.current) {
      cloudRef.current.rotation.y += 0.013; // Clouds spin slightly faster
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.lookAt(state.camera.position);
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (meshRef.current) {
      const position = new THREE.Vector3();
      meshRef.current.getWorldPosition(position);
      onClick(name, position);
    }
  };

  const hasAtmosphere = ['Earth', 'Venus', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'].includes(name);

  return (
    <group ref={orbitRef}>
      <group position={[distance, 0, 0]}>
        {speed !== 0 ? (
          <Trail
            width={0.4}
            color={new THREE.Color(color)}
            length={3.5}
            decay={1.8}
            local={false}
            stride={0}
            interval={1}
          >
            <group>
              {/* Primary Planet Sphere */}
              <mesh ref={meshRef} onClick={handleClick}>
                <sphereGeometry args={[radius, 32, 32]} />
                <meshStandardMaterial 
                  map={surfaceTexture}
                  roughness={name === 'Earth' ? 0.4 : 0.7}
                  metalness={name === 'Earth' ? 0.1 : 0.2}
                  emissive={emissive || '#000000'}
                  emissiveIntensity={emissiveIntensity}
                />
              </mesh>

              {/* Earth Cloud Layer */}
              {name === 'Earth' && (
                <mesh ref={cloudRef}>
                  <sphereGeometry args={[radius * 1.015, 32, 32]} />
                  <meshStandardMaterial 
                    color="#ffffff"
                    transparent
                    opacity={0.35}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                  />
                </mesh>
              )}

              {/* Saturn's Majestic Rings */}
              {name === 'Saturn' && ringTexture && (
                <mesh rotation={[-Math.PI / 2.2, 0, 0]}>
                  <ringGeometry args={[radius * 1.4, radius * 2.6, 64]} />
                  <meshStandardMaterial 
                    map={ringTexture}
                    transparent
                    opacity={0.8}
                    side={THREE.DoubleSide}
                    roughness={0.6}
                  />
                </mesh>
              )}

              {/* Uranus's Tilted Rings */}
              {name === 'Uranus' && (
                <mesh rotation={[Math.PI / 6, 0, Math.PI / 2.2]}>
                  <ringGeometry args={[radius * 1.3, radius * 1.7, 64]} />
                  <meshStandardMaterial 
                    color="#88bbee"
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              )}

              {/* Atmospheric Glow Ring */}
              {hasAtmosphere && (
                <mesh ref={atmosphereRef} scale={[1.08, 1.08, 1.08]}>
                  <sphereGeometry args={[radius, 32, 32]} />
                  <meshBasicMaterial 
                    color={color}
                    transparent
                    opacity={0.12}
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                  />
                </mesh>
              )}
            </group>
          </Trail>
        ) : (
          /* Sun logic (speed === 0) */
          <group>
            <mesh ref={meshRef} onClick={handleClick}>
              <sphereGeometry args={[radius, 32, 32]} />
              <meshBasicMaterial map={surfaceTexture} />
              <pointLight intensity={2.5} distance={100} decay={2} color={color} />
            </mesh>

            {/* Sun Solar Aura */}
            <mesh scale={[1.15, 1.15, 1.15]}>
              <sphereGeometry args={[radius, 32, 32]} />
              <meshBasicMaterial 
                color="#ffaa00"
                transparent
                opacity={0.25}
                side={THREE.BackSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}
