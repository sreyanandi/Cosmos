import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function BlackHole() {
  const accretionDiskRef = useRef<THREE.Points>(null);
  const lensedDiskRef = useRef<THREE.Points>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const verticalRingRef = useRef<THREE.Mesh>(null);

  const particlesCount = 8000;
  
  // Horizontal Accretion Disk Particles
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      
      // Convective radial spacing concentrated near the event horizon
      const radius = 2.1 + Math.pow(Math.random(), 1.5) * 8; 
      const angle = Math.random() * Math.PI * 2;
      
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = (Math.random() - 0.5) * 0.18; // Very thin gas plane
      positions[i3 + 2] = Math.sin(angle) * radius;

      // Hot white near horizon, deep orange-red in the outer boundaries
      const t = (radius - 2.1) / 8; // 0 to 1
      const color = new THREE.Color().lerpColors(
        new THREE.Color('#ffffff'), 
        new THREE.Color('#ff5500'), 
        t
      ).lerp(new THREE.Color('#1f0000'), Math.pow(t, 2.5));

      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    return [positions, colors];
  }, []);

  // Lensed Ring Particles (representing bent light wrapping vertically behind)
  const [lensedPositions, lensedColors] = useMemo(() => {
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      
      // Halo-like lensed structure wrapping vertically around the shadow
      const radius = 2.05 + Math.pow(Math.random(), 1.3) * 6; 
      const angle = Math.random() * Math.PI * 2;
      
      // Coordinates mapped to render a vertical lensed halo
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = Math.sin(angle) * radius;
      positions[i3 + 2] = (Math.random() - 0.5) * 0.12;

      const t = (radius - 2.05) / 6;
      const color = new THREE.Color().lerpColors(
        new THREE.Color('#ffffff'), 
        new THREE.Color('#ffaa00'), 
        t
      ).lerp(new THREE.Color('#0a0000'), Math.pow(t, 2));

      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    return [positions, colors];
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    if (accretionDiskRef.current) {
      accretionDiskRef.current.rotation.y = elapsed * 0.8;
    }
    if (lensedDiskRef.current) {
      // Rotation for lensed vertical particles (slower/counter-rotating)
      lensedDiskRef.current.rotation.z = -elapsed * 0.4;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = elapsed * 0.2;
    }
    if (verticalRingRef.current) {
      verticalRingRef.current.rotation.z = -elapsed * 0.15;
    }
    if (groupRef.current) {
      // Gentle floating animation to mimic warped spacetime
      const targetRotationX = Math.PI / 12 + state.pointer.y * 0.15;
      const targetRotationY = state.pointer.x * 0.15;
      
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotationX, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. The Event Horizon (Pure absorption black sphere) */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* 2. Concentric Horizontal Accretion Disk (Rotates around center) */}
      <points ref={accretionDiskRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexColors={true}
        />
      </points>

      {/* 3. Vertically Lensed Spacetime Accretion Ring (Interstellar signature) */}
      <points ref={lensedDiskRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[lensedPositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[lensedColors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexColors={true}
        />
      </points>

      {/* 4. Highly reflective Photon Sphere Boundary (Glow immediately outside horizon) */}
      <mesh ref={ringRef} position={[0, 0, -0.05]}>
        <ringGeometry args={[2.02, 2.22, 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.65} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      
      {/* 5. Vertically Lensed Background Photon Glow */}
      <mesh ref={verticalRingRef} position={[0, 0, -0.1]} rotation={[0, Math.PI / 2, 0]}>
        <ringGeometry args={[2.02, 2.3, 128]} />
        <meshBasicMaterial color="#ff7700" transparent opacity={0.35} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* 6. Surrounding Space distortion (Atmospheric glow) */}
      <mesh scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial 
          color="#ff4400"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
