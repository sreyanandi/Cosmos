import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Spaceship() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    
    // Floating animation
    group.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
  });

  return (
    <group ref={group} scale={0.5}>
      {/* Main Body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.4, 2, 16]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Cockpit */}
      <mesh position={[0, 0.2, 0.5]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.1} emissive="#0284c7" emissiveIntensity={0.5} />
      </mesh>

      {/* Left Wing */}
      <mesh position={[-0.6, -0.2, -0.3]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[1, 0.1, 0.8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Right Wing */}
      <mesh position={[0.6, -0.2, -0.3]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[1, 0.1, 0.8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Engine Thrusters */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.3, 0.2, 0.4, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.5} />
      </mesh>

      {/* Engine Flame */}
      <mesh position={[0, -1.3, 0]}>
        <coneGeometry args={[0.2, 0.6, 16]} />
        <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={2} toneMapped={false} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}
