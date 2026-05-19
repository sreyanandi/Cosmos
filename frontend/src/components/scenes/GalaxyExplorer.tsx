import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GalaxyProps {
  type?: 'milkyway' | 'andromeda' | 'whirlpool' | 'sombrero';
}

export default function GalaxyExplorer({ type = 'milkyway' }: GalaxyProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const companionRef = useRef<THREE.Points>(null);

  const particlesCount = 18000;
  
  const [positions, colors, sizes] = useMemo(() => {
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);
    
    let colorInside = new THREE.Color('#ff7d45');
    let colorOutside = new THREE.Color('#1f44aa');
    let branches = 3;
    let spread = 1.8;
    let flatness = 0.15;
    let maxRadius = 18;

    switch (type) {
      case 'andromeda':
        colorInside = new THREE.Color('#ffbe3b');
        colorOutside = new THREE.Color('#0b66ff');
        branches = 2;
        flatness = 0.12;
        maxRadius = 20;
        break;
      case 'whirlpool':
        colorInside = new THREE.Color('#ff1fa3');
        colorOutside = new THREE.Color('#00bfff');
        branches = 4;
        flatness = 0.18;
        maxRadius = 15;
        break;
      case 'sombrero':
        colorInside = new THREE.Color('#ffffff');
        colorOutside = new THREE.Color('#ff5500');
        branches = 1; // Elliptical disk
        flatness = 0.04;
        spread = 4.5;
        maxRadius = 22;
        break;
      default: // milkyway
        break;
    }

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      
      const radius = Math.random() * maxRadius;
      const spinAngle = radius * (type === 'sombrero' ? 0.05 : 0.65);
      const branchAngle = ((i % branches) / branches) * Math.PI * 2;
      
      const randomX = Math.pow(Math.random(), spread) * (Math.random() < 0.5 ? 1 : -1) * 1.5;
      const randomY = Math.pow(Math.random(), spread) * (Math.random() < 0.5 ? 1 : -1) * 1.5 * flatness;
      const randomZ = Math.pow(Math.random(), spread) * (Math.random() < 0.5 ? 1 : -1) * 1.5;

      positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

      // Color transition from hot white/orange core to deep blue/red arms
      const mixedColor = colorInside.clone().lerp(colorOutside, radius / maxRadius);
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;

      // Random sizes to give a textured star cluster feel
      sizes[i] = Math.random() * 0.12 + 0.03;
    }

    return [positions, colors, sizes];
  }, [type]);

  // Whirlpool companion galaxy particles (NGC 5195)
  const [companionPositions, companionColors] = useMemo(() => {
    if (type !== 'whirlpool') return [null, null];
    const count = 3000;
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const colorCompInside = new THREE.Color('#ffaa88');
    const colorCompOutside = new THREE.Color('#884488');

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const r = Math.random() * 3.5;
      const theta = Math.random() * Math.PI * 2;
      
      // Spherical/elliptical cluster centered at companion offset [12, 1, -8]
      pos[i3] = 12 + Math.cos(theta) * r + (Math.random() - 0.5) * 0.8;
      pos[i3 + 1] = 1 + (Math.random() - 0.5) * r * 0.6;
      pos[i3 + 2] = -8 + Math.sin(theta) * r + (Math.random() - 0.5) * 0.8;

      const col = colorCompInside.clone().lerp(colorCompOutside, r / 3.5);
      cols[i3] = col.r;
      cols[i3 + 1] = col.g;
      cols[i3 + 2] = col.b;
    }
    return [pos, cols];
  }, [type]);

  useFrame((state) => {
    const elapsed = state.clock.elapsedTime;
    if (pointsRef.current) {
      pointsRef.current.rotation.y = elapsed * 0.04;
      if (type === 'sombrero') {
        pointsRef.current.rotation.x = Math.PI / 18; // Cinematic angle
      }
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = elapsed * 0.08;
    }
    if (companionRef.current) {
      companionRef.current.rotation.y = elapsed * 0.03;
    }
  });

  const coreColor = useMemo(() => {
    switch (type) {
      case 'andromeda': return '#ffcf68';
      case 'whirlpool': return '#ff7fc9';
      case 'sombrero': return '#ffffff';
      default: return '#ffa275';
    }
  }, [type]);

  return (
    <group>
      {/* 1. Starfield Points */}
      <points ref={pointsRef}>
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
          size={type === 'sombrero' ? 0.06 : 0.08}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexColors={true}
        />
      </points>

      {/* 2. Realistic central galactic nucleus (Core Bulge) */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[type === 'sombrero' ? 2.5 : 1.8, 32, 32]} />
        <meshBasicMaterial 
          color={coreColor}
          transparent
          opacity={0.32}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Secondary outer core glow ring */}
      <mesh scale={[1.4, 1.4, 1.4]}>
        <sphereGeometry args={[type === 'sombrero' ? 2.5 : 1.8, 32, 32]} />
        <meshBasicMaterial 
          color={coreColor}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Sombrero Galaxy signature dark dust lane slicing through */}
      {type === 'sombrero' && (
        <mesh rotation={[Math.PI / 18, 0, 0]}>
          <ringGeometry args={[5, 12, 64]} />
          <meshBasicMaterial 
            color="#080503"
            transparent
            opacity={0.88}
            side={THREE.DoubleSide}
            depthWrite={true}
          />
        </mesh>
      )}

      {/* 4. Whirlpool companion galaxy cluster (NGC 5195) */}
      {type === 'whirlpool' && companionPositions && companionColors && (
        <group>
          <points ref={companionRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[companionPositions, 3]}
              />
              <bufferAttribute
                attach="attributes-color"
                args={[companionColors, 3]}
              />
            </bufferGeometry>
            <pointsMaterial
              size={0.07}
              sizeAttenuation={true}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              vertexColors={true}
            />
          </points>
          
          {/* Companion Core Glow */}
          <mesh position={[12, 1, -8]}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshBasicMaterial 
              color="#ffccaa"
              transparent
              opacity={0.3}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
