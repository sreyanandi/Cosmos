import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Planet from '../Planet';
import GalaxyExplorer from './GalaxyExplorer';
import Spaceship from './Spaceship';
import { useSpaceContext } from '../../context/SpaceContext';

const ORBITING_PLANETS = [
  { name: 'Sun', radius: 1.5, distance: 0, speed: 0, color: '#ffcc00', emissive: '#ffaa00', emissiveIntensity: 2 },
  { name: 'Mercury', radius: 0.2, distance: 3, speed: 1.6, color: '#8c8c8c' },
  { name: 'Venus', radius: 0.4, distance: 5, speed: 1.18, color: '#e3bb76' },
  { name: 'Earth', radius: 0.5, distance: 7, speed: 1, color: '#3b82f6' },
  { name: 'Mars', radius: 0.3, distance: 9, speed: 0.8, color: '#ef4444' },
  { name: 'Jupiter', radius: 1.2, distance: 13, speed: 0.4, color: '#c0a480' },
  { name: 'Saturn', radius: 1.0, distance: 17, speed: 0.3, color: '#fef3c7' },
  { name: 'Uranus', radius: 0.7, distance: 21, speed: 0.2, color: '#4b70dd' },
  { name: 'Neptune', radius: 0.6, distance: 25, speed: 0.1, color: '#274687' },
];

export default function OrbitingOverview() {
  const groupRef = useRef<THREE.Group>(null);
  const { setSelectedEntity } = useSpaceContext();

  useFrame((state) => {
    if (groupRef.current) {
      // Very slow rotation for the entire system
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      groupRef.current.rotation.x = Math.PI / 12; // Slight tilt
    }
  });

  return (
    <group ref={groupRef}>
      {ORBITING_PLANETS.map((p, i) => (
        <Planet key={i} {...p} onClick={(name) => {
          if (name !== 'Sun') setSelectedEntity(name);
        }} />
      ))}
      
      {/* Background galaxy for the overview */}
      <group position={[0, -10, -20]} scale={[0.5, 0.5, 0.5]}>
        <GalaxyExplorer type="milkyway" />
      </group>

      {/* Orbiting Satellite (Spaceship) */}
      <group>
        <OrbitingSatellite />
      </group>
    </group>
  );
}

function OrbitingSatellite() {
  const satelliteRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (satelliteRef.current) {
      const t = state.clock.elapsedTime * 0.5;
      satelliteRef.current.position.x = Math.cos(t) * 8;
      satelliteRef.current.position.z = Math.sin(t) * 8;
      satelliteRef.current.position.y = Math.sin(t * 2) * 2;
      
      // Face direction of travel
      satelliteRef.current.lookAt(
        Math.cos(t + 0.1) * 8,
        Math.sin((t + 0.1) * 2) * 2,
        Math.sin(t + 0.1) * 8
      );
    }
  });

  return (
    <group ref={satelliteRef} scale={[0.2, 0.2, 0.2]}>
      <Spaceship />
    </group>
  );
}
