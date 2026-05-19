import { useRef, Suspense, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ScrollControls, Scroll, Stars, useScroll } from '@react-three/drei';
import * as THREE from 'three';
import Planet from './Planet';
import GalaxyExplorer from './scenes/GalaxyExplorer';
import BlackHole from './scenes/BlackHole';
import IssTracker from './IssTracker';
import NasaApod from './NasaApod';
import OrbitingOverview from './scenes/OrbitingOverview';
import { useSpaceContext } from '../context/SpaceContext';
import { motion } from 'framer-motion';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

const PLANETS_DATA = [
  { name: 'Mercury', radius: 0.4, distance: 0, speed: 0.1, color: '#8c8c8c', temp: '167°C', moons: 0, fact: 'The smallest planet in our solar system and closest to the Sun.', dist: '58M km' },
  { name: 'Venus', radius: 0.9, distance: 0, speed: 0.1, color: '#e3bb76', temp: '464°C', moons: 0, fact: 'Spins slowly in the opposite direction from most planets.', dist: '108M km' },
  { name: 'Earth', radius: 1.0, distance: 0, speed: 0.1, color: '#3b82f6', temp: '15°C', moons: 1, fact: 'Our home planet, the only known place in the universe to harbor life.', dist: '149M km' },
  { name: 'Mars', radius: 0.5, distance: 0, speed: 0.1, color: '#ef4444', temp: '-65°C', moons: 2, fact: 'Known as the Red Planet, it may have once had liquid water.', dist: '227M km' },
  { name: 'Jupiter', radius: 2.2, distance: 0, speed: 0.1, color: '#c0a480', temp: '-110°C', moons: 95, fact: 'The largest planet, featuring the Great Red Spot.', dist: '778M km' },
  { name: 'Saturn', radius: 1.8, distance: 0, speed: 0.1, color: '#fef3c7', temp: '-140°C', moons: 146, fact: 'Adorned with a dazzling, complex system of icy rings.', dist: '1.4B km' },
  { name: 'Uranus', radius: 1.4, distance: 0, speed: 0.1, color: '#4b70dd', temp: '-195°C', moons: 28, fact: 'Rotates on its side, making it unique in the solar system.', dist: '2.9B km' },
  { name: 'Neptune', radius: 1.3, distance: 0, speed: 0.1, color: '#274687', temp: '-200°C', moons: 16, fact: 'Dark, cold, and whipped by supersonic winds.', dist: '4.5B km' },
];

const MOON_DATA = { name: 'Moon', radius: 0.2, distance: 2, speed: 1, color: '#d1d5db' };

const OptimizedStars = memo(function OptimizedStars() {
  return (
    <Stars
      radius={80}
      depth={35}
      count={5000}
      factor={3}
      saturation={0}
      fade speed={0.5}
    />
  );
});

function Scene() {
  const scroll = useScroll();
  const cameraGroup = useRef<THREE.Group>(null);
  const { setSelectedEntity } = useSpaceContext();

  const handlePlanetClick = (name: string) => {
    setSelectedEntity(name);
  };

  useFrame(() => {
    if (!cameraGroup.current) return;

    const zPos = THREE.MathUtils.lerp(15, -300, scroll.offset);
    cameraGroup.current.position.z = zPos;
    cameraGroup.current.rotation.y = THREE.MathUtils.lerp(0, Math.PI / 8, scroll.offset);
  });

  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} />

      <OptimizedStars />

      <group position={[0, -2, 5]}>
        <OrbitingOverview />
      </group>

      <group position={[4, 0, -15]}><Planet {...PLANETS_DATA[0]} onClick={handlePlanetClick} /></group>
      <group position={[-4, 0, -35]}><Planet {...PLANETS_DATA[1]} onClick={handlePlanetClick} /></group>

      <group position={[4, 0, -55]}>
        <Planet {...PLANETS_DATA[2]} onClick={handlePlanetClick} />
        <Planet {...MOON_DATA} onClick={handlePlanetClick} />
      </group>

      <group position={[-4, 0, -75]}><Planet {...PLANETS_DATA[3]} onClick={handlePlanetClick} /></group>
      <group position={[6, 0, -95]}><Planet {...PLANETS_DATA[4]} onClick={handlePlanetClick} /></group>
      <group position={[-6, 0, -115]}><Planet {...PLANETS_DATA[5]} onClick={handlePlanetClick} /></group>
      <group position={[5, 0, -135]}><Planet {...PLANETS_DATA[6]} onClick={handlePlanetClick} /></group>
      <group position={[-5, 0, -155]}><Planet {...PLANETS_DATA[7]} onClick={handlePlanetClick} /></group>

      <group position={[0, 0, -175]}><GalaxyExplorer type="milkyway" /></group>
      <group position={[5, 0, -195]}><GalaxyExplorer type="andromeda" /></group>
      <group position={[-5, 0, -215]}><GalaxyExplorer type="whirlpool" /></group>
      <group position={[0, 0, -235]}><GalaxyExplorer type="sombrero" /></group>

      <group position={[0, 0, -260]}><BlackHole /></group>

      <group ref={cameraGroup}>
        <perspectiveCamera position={[0, 0, 0]} />
      </group>
    </>
  );
}

const PlanetCard = ({ planet, align, onSelect }: { planet: any; align: 'left' | 'right'; onSelect: (name: string) => void }) => (
  <div className={`w-full h-screen flex flex-col justify-center p-20 pointer-events-none overflow-hidden ${align === 'right' ? 'items-end' : 'items-start'}`}>
    <motion.div
      initial={{ opacity: 0, x: align === 'right' ? 70 : -70 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, amount: 0.35 }}
      transition={{ duration: 0.45 }}
      className="glass-premium p-8 rounded-2xl max-w-md pointer-events-auto shadow-2xl"
    >
      <h2 className="text-4xl font-bold text-white mb-2" style={{ color: planet.color, textShadow: `0 0 10px ${planet.color}` }}>{planet.name}</h2>
      <div className="flex gap-4 text-xs font-bold text-slate-400 mb-4 tracking-wider uppercase">
        <span>Dist: {planet.dist}</span>
        <span>Temp: {planet.temp}</span>
        <span>Moons: {planet.moons}</span>
      </div>
      <p className="text-slate-300 mb-6">{planet.fact}</p>
      <button onClick={() => onSelect(planet.name)} className="px-6 py-2 bg-slate-800 hover:bg-neon-blue/20 text-white rounded-full border border-slate-600 hover:border-neon-blue transition">
        View Full Details
      </button>
    </motion.div>
  </div>
);

function OverlayContent() {
  const { setAppMode, setSelectedEntity } = useSpaceContext();

  const handleStartJourney = () => {
    setAppMode('dashboard');
  };

  return (
    <Scroll html style={{ width: '100%', height: '100%' }}>
      <div className="w-full h-screen flex flex-col justify-center items-start p-20 pointer-events-none">
        <motion.h1 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} transition={{ duration: 0.45 }} className="text-6xl font-bold text-white mb-4 pointer-events-auto drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          Explore Beyond Earth
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: false }} transition={{ duration: 0.35, delay: 0.1 }} className="text-xl text-slate-300 max-w-lg pointer-events-auto mb-8 drop-shadow-md">
          Scroll to journey through the cosmos, or initiate Mission Control below.
        </motion.p>

        <motion.button initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: false }} transition={{ duration: 0.35, delay: 0.15 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleStartJourney} className="pointer-events-auto px-8 py-4 bg-neon-blue/20 hover:bg-neon-blue/40 text-neon-blue font-bold tracking-widest uppercase rounded-full border border-neon-blue backdrop-blur-md transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.5)] hover:shadow-[0_0_25px_rgba(0,240,255,0.8)]">
          Start Journey
        </motion.button>
      </div>

      <PlanetCard planet={PLANETS_DATA[0]} align="left" onSelect={setSelectedEntity} />
      <PlanetCard planet={PLANETS_DATA[1]} align="right" onSelect={setSelectedEntity} />
      <PlanetCard planet={PLANETS_DATA[2]} align="left" onSelect={setSelectedEntity} />
      <PlanetCard planet={PLANETS_DATA[3]} align="right" onSelect={setSelectedEntity} />
      <PlanetCard planet={PLANETS_DATA[4]} align="left" onSelect={setSelectedEntity} />
      <PlanetCard planet={PLANETS_DATA[5]} align="right" onSelect={setSelectedEntity} />
      <PlanetCard planet={PLANETS_DATA[6]} align="left" onSelect={setSelectedEntity} />
      <PlanetCard planet={PLANETS_DATA[7]} align="right" onSelect={setSelectedEntity} />

      <div className="w-full h-screen flex flex-col justify-center items-center p-20 pointer-events-none">
        <h2 className="text-6xl font-bold text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] pointer-events-auto text-center mb-6">Milky Way</h2>
        <button onClick={() => setSelectedEntity('Milky Way Galaxy')} className="pointer-events-auto px-6 py-2 bg-slate-800 hover:bg-white text-white hover:text-black rounded-full border border-white transition font-bold uppercase tracking-widest">Explore</button>
      </div>

      <div className="w-full h-screen flex flex-col justify-center items-start p-20 pointer-events-none">
        <h2 className="text-6xl font-bold text-blue-400 drop-shadow-[0_0_15px_rgba(0,100,255,0.8)] pointer-events-auto text-center mb-6">Andromeda</h2>
        <button onClick={() => setSelectedEntity('Andromeda Galaxy')} className="pointer-events-auto px-6 py-2 bg-slate-800 hover:bg-blue-400 text-white hover:text-black rounded-full border border-blue-400 transition font-bold uppercase tracking-widest">Explore</button>
      </div>

      <div className="w-full h-screen flex flex-col justify-center items-end p-20 pointer-events-none">
        <h2 className="text-6xl font-bold text-pink-400 drop-shadow-[0_0_15px_rgba(255,0,255,0.8)] pointer-events-auto text-center mb-6">Whirlpool Galaxy</h2>
        <button onClick={() => setSelectedEntity('Whirlpool Galaxy')} className="pointer-events-auto px-6 py-2 bg-slate-800 hover:bg-pink-400 text-white hover:text-black rounded-full border border-pink-400 transition font-bold uppercase tracking-widest">Explore</button>
      </div>

      <div className="w-full h-screen flex flex-col justify-center items-center p-20 pointer-events-none">
        <h2 className="text-6xl font-bold text-orange-400 drop-shadow-[0_0_15px_rgba(255,100,0,0.8)] pointer-events-auto text-center mb-6">Sombrero Galaxy</h2>
        <button onClick={() => setSelectedEntity('Sombrero Galaxy')} className="pointer-events-auto px-6 py-2 bg-slate-800 hover:bg-orange-400 text-white hover:text-black rounded-full border border-orange-400 transition font-bold uppercase tracking-widest">Explore</button>
      </div>

      <div className="w-full h-screen flex flex-col justify-center items-center p-20 pointer-events-none">
        <h2 className="text-7xl font-bold text-black drop-shadow-[0_0_10px_rgba(255,255,255,1)] pointer-events-auto" style={{ WebkitTextStroke: '2px white' }}>The Black Hole</h2>
        <p className="text-2xl text-white mt-4 pointer-events-auto shadow-black drop-shadow-lg">Where time and space warp. Drag to look around.</p>
      </div>

      <div className="w-full h-screen flex flex-col justify-center items-center p-10 pointer-events-none">
        <IssTracker />
      </div>

      <div className="w-full h-screen flex flex-col justify-center items-center p-10 pointer-events-none">
        <NasaApod />
      </div>
    </Scroll>
  );
}

export default function SolarSystem() {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#020617] z-0">
      <Canvas
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        camera={{ position: [0, 2, 5], fov: 45 }}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          <ScrollControls pages={16} damping={0.15}>
            <Scene />
            <OverlayContent />
          </ScrollControls>

          <EffectComposer multisampling={0}>
            <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.8} height={150} intensity={0.9} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}