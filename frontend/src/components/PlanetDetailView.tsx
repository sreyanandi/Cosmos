import { useRef, useState, useMemo } from 'react';
import { useSpaceContext } from '../context/SpaceContext';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { X, Heart, Info, Orbit, Globe, Layers, Compass, Rocket, Zap, Thermometer, Milestone, Star } from 'lucide-react';
import GalaxyExplorer from './scenes/GalaxyExplorer';
import { createProceduralTexture, createRingTexture } from '../utils/proceduralTextures';
import { motion, AnimatePresence } from 'framer-motion';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

const PLANET_DETAILS: Record<string, any> = {
  Mercury: {
    color: '#8c8c8c',
    radius: 1.5,
    mass: '3.30 × 10^23 kg',
    gravity: '3.7 m/s²',
    day: '58.6 Earth days',
    year: '88 Earth days',
    moons: '0',
    temp: '-173°C to 427°C',
    distSun: '57.9M km',
    discovery: 'Known since antiquity (Sumerians)',
    history: 'Mariner 10, MESSENGER, BepiColombo mapping mission',
    atmosphere: 'Extremely thin exosphere (Oxygen, Sodium, Hydrogen, Helium)',
    structure: 'Large metallic core (mostly iron) making up 85% of its radius, rocky mantle and crust.',
    desc: 'Mercury is the smallest planet in our solar system and closest to the Sun. Despite being closest to the sun, it is not the hottest planet because it lacks a substantial atmosphere to trap heat.',
    funFact: 'A year on Mercury is 88 Earth days, but a single day-night cycle takes 176 Earth days!'
  },
  Venus: {
    color: '#e3bb76',
    radius: 2,
    mass: '4.87 × 10^24 kg',
    gravity: '8.87 m/s²',
    day: '243 Earth days',
    year: '225 Earth days',
    moons: '0',
    temp: '462°C',
    distSun: '108.2M km',
    discovery: 'Known since antiquity (Babylonians)',
    history: 'Mariner 2, Venera 7 (first landing), Magellan radar mapping mission',
    atmosphere: 'Thick, toxic clouds of sulfuric acid and Carbon Dioxide (96.5%) causing a runaway greenhouse effect.',
    structure: 'Molten iron-nickel core, rocky silicate mantle, and a thin silicate crust.',
    desc: 'Venus spins slowly in the opposite direction from most planets. Its thick atmosphere traps heat in a runaway greenhouse effect, making it the hottest planet in our solar system.',
    funFact: 'A day on Venus is longer than its year! It takes 243 Earth days to rotate once, but only 225 Earth days to orbit the Sun.'
  },
  Earth: {
    color: '#3b82f6',
    radius: 2,
    mass: '5.97 × 10^24 kg',
    gravity: '9.8 m/s²',
    day: '24 hours',
    year: '365.25 days',
    moons: '1',
    temp: '-89°C to 58°C',
    distSun: '149.6M km',
    discovery: 'Known since prehistory',
    history: 'First photographed from space in 1946, mapped by thousands of orbital spacecraft',
    atmosphere: 'Nitrogen (78%), Oxygen (21%), Argon (0.9%), and trace gases keeping temperatures habitable.',
    structure: 'Solid iron-nickel inner core, liquid outer core, highly viscous mantle, and solid silicate crust.',
    desc: 'Our home planet is the only place we know of so far that is inhabited by living things. It is also the only planet in our solar system with liquid water on the surface.',
    funFact: 'Earth is the only planet in our solar system not named after a mythological god or goddess.',
    hasClouds: true
  },
  Moon: {
    color: '#d1d5db',
    radius: 0.5,
    mass: '7.34 × 10^22 kg',
    gravity: '1.62 m/s² (16.6% of Earth)',
    day: '27.3 Earth days',
    year: '27.3 Earth days (tidally locked)',
    moons: '0',
    temp: '-130°C to 120°C',
    distSun: '384,400 km from Earth',
    discovery: 'Known since prehistory',
    history: 'Luna 2 (1959), Apollo 11 (1969 - first human landing), Chang\'e, Artemis program',
    atmosphere: 'Virtually nonexistent (extremely thin exosphere of Helium, Neon, and Argon)',
    structure: 'Solid iron inner core, fluid outer core, partially molten boundary, rocky mantle, and crust of regolith.',
    desc: 'The Moon is Earth\'s only natural satellite. It is the fifth largest satellite in the Solar System and is tidally locked to Earth, meaning we always see the same face.',
    funFact: 'The Moon is slowly drifting away from Earth at a rate of 3.8 centimeters per year!'
  },
  Mars: {
    color: '#ef4444',
    radius: 1.6,
    mass: '6.42 × 10^23 kg',
    gravity: '3.71 m/s²',
    day: '24.6 hours',
    year: '687 Earth days',
    moons: '2 (Phobos, Deimos)',
    temp: '-153°C to 20°C',
    distSun: '227.9M km',
    discovery: 'Known since antiquity (Egyptians)',
    history: 'Viking 1 (1976), Pathfinder, Opportunity, Curiosity, Perseverance rover',
    atmosphere: 'Thin exosphere, mostly Carbon Dioxide (95%), Nitrogen (2.8%), and Argon (2%).',
    structure: 'Solid iron-nickel-sulfur core, rocky silicate mantle, and an iron-oxide rich dust crust.',
    desc: 'Known as the Red Planet, Mars is a dusty, cold, desert world with a very thin atmosphere. There is strong evidence Mars was—billions of years ago—wetter and warmer, with a thicker atmosphere.',
    funFact: 'Mars is home to Olympus Mons, the tallest volcano in the solar system, which is three times higher than Mount Everest!'
  },
  Jupiter: {
    color: '#c0a480',
    radius: 3,
    mass: '1.90 × 10^27 kg',
    gravity: '24.79 m/s²',
    day: '9.9 hours',
    year: '11.9 Earth years',
    moons: '95',
    temp: '-110°C',
    distSun: '778.5M km',
    discovery: 'Known since antiquity (Galileo first observed moons in 1610)',
    history: 'Pioneer 10, Voyager 1 & 2 flybys, Galileo orbiter, Juno spacecraft',
    atmosphere: 'Hydrogen (89.8%), Helium (10.2%), with swirling ammonia and water ice cloud layers.',
    structure: 'Dense core of rock and metals, surrounded by helium-rich liquid metallic hydrogen and liquid molecular hydrogen layers.',
    desc: 'Jupiter is more than twice as massive than the other planets of our solar system combined. The giant planet\'s Great Red Spot is a centuries-old storm bigger than Earth.',
    funFact: 'Jupiter acts as a giant cosmic shield, using its immense gravitational field to deflect comets and asteroids away from the inner planets.'
  },
  Saturn: {
    color: '#fef3c7',
    radius: 2.8,
    mass: '5.68 × 10^26 kg',
    gravity: '10.4 m/s²',
    day: '10.7 hours',
    year: '29.5 Earth years',
    moons: '146',
    temp: '-140°C',
    distSun: '1.43B km',
    discovery: 'Known since antiquity (Galileo first viewed rings in 1610)',
    history: 'Pioneer 11, Voyager 1 & 2 flybys, Cassini-Huygens orbiter (2004-2017)',
    atmosphere: 'Hydrogen (96%), Helium (3%), with trace amounts of methane and ammonia clouds.',
    structure: 'Hot solid core, liquid metallic hydrogen layer, molecular hydrogen layer, and gaseous outer shell.',
    desc: 'Adorned with a dazzling, complex system of icy rings, Saturn is unique in our solar system. The other giant planets have rings, but none are as spectacular as Saturn\'s.',
    funFact: 'Saturn has the lowest density of all planets in the solar system; it is less dense than water and could float in a giant bathtub!',
    hasRings: true
  },
  Uranus: {
    color: '#4b70dd',
    radius: 2.4,
    mass: '8.68 × 10^25 kg',
    gravity: '8.69 m/s²',
    day: '17.2 hours',
    year: '84 Earth years',
    moons: '28',
    temp: '-195°C',
    distSun: '2.87B km',
    discovery: 'William Herschel (1781)',
    history: 'Voyager 2 flyby (1986 - only spacecraft to visit)',
    atmosphere: 'Hydrogen (83%), Helium (15%), Methane (2%), giving it a striking cyan hue.',
    structure: 'Small silicate-iron core, deep icy mantle of water, ammonia, and methane, and outer gas envelope.',
    desc: 'Uranus rotates at a nearly 90-degree angle from the plane of its orbit. This unique tilt makes Uranus appear to spin on its side.',
    funFact: 'Uranus is the coldest planet in the solar system and smells like rotten eggs due to the high concentration of hydrogen sulfide in its clouds!'
  },
  Neptune: {
    color: '#274687',
    radius: 2.3,
    mass: '1.02 × 10^26 kg',
    gravity: '11.15 m/s²',
    day: '16.1 hours',
    year: '165 Earth years',
    moons: '16',
    temp: '-200°C',
    distSun: '4.50B km',
    discovery: 'Johann Galle & Urbain Le Verrier (1846)',
    history: 'Voyager 2 flyby (1989 - only spacecraft to visit)',
    atmosphere: 'Hydrogen (80%), Helium (19%), Methane (1.5%), with high-altitude methane clouds.',
    structure: 'Rocky iron core, mantle of water/ammonia/methane ice, and outer gaseous layer.',
    desc: 'Dark, cold, and whipped by supersonic winds, ice giant Neptune is the eighth and most distant planet in our solar system.',
    funFact: 'Neptune has the most powerful winds in the solar system, reaching speeds of up to 2,100 kilometers per hour!'
  },
  'Milky Way Galaxy': {
    color: '#ffffff',
    radius: 5,
    mass: '1.5 × 10^12 Solar masses',
    gravity: 'N/A',
    day: 'N/A',
    year: '225M years (Galactic Year)',
    moons: 'Over 50 satellite galaxies',
    temp: '2.7 K (cosmic background)',
    distSun: '26,000 light-years from core',
    discovery: 'Known since antiquity, resolved into stars by Galileo (1610)',
    history: 'COBE, WMAP, Planck, ESA Gaia mapping mission',
    atmosphere: 'Interstellar medium (dust, hydrogen and helium gases)',
    structure: 'Barred spiral galaxy with central bulge, disk with spiral arms, and supermassive black hole Sagittarius A*.',
    desc: 'The Milky Way is the galaxy that contains our Solar System, with the name describing the galaxy\'s appearance from Earth: a hazy band of light seen in the night sky formed from stars.',
    funFact: 'The Milky Way is spinning at 270 km/s, but still takes about 200 million years to complete a single rotation!',
    isGalaxy: 'milkyway'
  },
  'Andromeda Galaxy': {
    color: '#60a5fa',
    radius: 5,
    mass: '1.23 × 10^12 Solar masses',
    gravity: 'N/A',
    day: 'N/A',
    year: 'N/A',
    moons: '14 satellite galaxies',
    temp: '2.7 K',
    distSun: '2.54M light-years from Earth',
    discovery: 'Abd al-Rahman al-Sufi (964 AD)',
    history: 'Hubble Space Telescope, Swift, Gaia mapping',
    atmosphere: 'Interstellar gas and dust clouds',
    structure: 'Huge spiral galaxy, slightly larger than the Milky Way, containing nearly 1 trillion stars.',
    desc: 'The Andromeda Galaxy is a barred spiral galaxy approximately 2.5 million light-years from Earth and the nearest major galaxy to the Milky Way.',
    funFact: 'Andromeda is speeding toward us at 110 km/s and will collide with the Milky Way to form a giant elliptical galaxy in 4.5 billion years!',
    isGalaxy: 'andromeda'
  },
  'Whirlpool Galaxy': {
    color: '#f472b6',
    radius: 5,
    mass: '1.6 × 10^11 Solar masses',
    gravity: 'N/A',
    day: 'N/A',
    year: 'N/A',
    moons: '1 companion (NGC 5195)',
    temp: '2.7 K',
    distSun: '23M light-years from Earth',
    discovery: 'Charles Messier (1773)',
    history: 'Hubble Space Telescope, Chandra X-ray Observatory',
    atmosphere: 'Interstellar molecular gas clouds',
    structure: 'Grand-design spiral galaxy interacting with smaller neighbor NGC 5195, causing high starburst activity.',
    desc: 'The Whirlpool Galaxy, also known as Messier 51a, is an interacting grand-design spiral galaxy with a Seyfert 2 active galactic nucleus.',
    funFact: 'The Whirlpool Galaxy was the first galaxy recognized to have a spiral structure, sketched by Lord Rosse in 1845!',
    isGalaxy: 'whirlpool'
  },
  'Sombrero Galaxy': {
    color: '#fb923c',
    radius: 5,
    mass: '8.0 × 10^11 Solar masses',
    gravity: 'N/A',
    day: 'N/A',
    year: 'N/A',
    moons: 'Over 2,000 globular clusters',
    temp: '2.7 K',
    distSun: '28M light-years from Earth',
    discovery: 'Pierre Méchain (1781)',
    history: 'Hubble Space Telescope, Spitzer Infrared Observatory',
    atmosphere: 'Thick ring of dust and cold gas',
    structure: 'Symmetric unbarred spiral galaxy featuring an exceptionally large central stellar bulge and thick dark dust lane.',
    desc: 'The Sombrero Galaxy is an unbarred spiral galaxy in the constellation Virgo. It has a bright nucleus, an unusually large central bulge, and a prominent dust lane in its inclined disk.',
    funFact: 'The Sombrero Galaxy houses a supermassive black hole at its center with the mass of one billion suns!',
    isGalaxy: 'sombrero'
  }
};

function AnimatedPlanet({ config, name }: { config: any; name: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  // Generate procedural textures lazily
  const surfaceTexture = useMemo(() => createProceduralTexture(name, config.color), [name, config.color]);
  const ringTexture = useMemo(() => (name === 'Saturn' ? createRingTexture() : null), [name]);

  useFrame((state) => {
    if (meshRef.current) meshRef.current.rotation.y += 0.005;
    if (cloudRef.current) cloudRef.current.rotation.y += 0.007;
    if (ringRef.current) ringRef.current.rotation.z -= 0.002;
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += 0.005;
      atmosphereRef.current.lookAt(state.camera.position);
    }
  });

  const hasAtmosphere = ['Earth', 'Venus', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'].includes(name);

  return (
    <group>
      {/* Base Planet */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[config.radius, 128, 128]} />
        <meshPhysicalMaterial 
          map={surfaceTexture}
          roughness={name === 'Earth' ? 0.4 : 0.7} 
          metalness={name === 'Earth' ? 0.1 : 0.2} 
          clearcoat={name === 'Earth' ? 0.3 : 0.1}
          clearcoatRoughness={0.5}
          bumpScale={0.05}
        />
      </mesh>

      {/* Atmospheric Glow (Rim Light Effect) */}
      {hasAtmosphere && (
        <mesh ref={atmosphereRef} scale={[1.05, 1.05, 1.05]}>
          <sphereGeometry args={[config.radius, 64, 64]} />
          <meshPhysicalMaterial 
            color={config.color}
            transparent 
            opacity={0.15} 
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Earth Clouds */}
      {name === 'Earth' && (
        <mesh ref={cloudRef}>
          <sphereGeometry args={[config.radius * 1.015, 64, 64]} />
          <meshPhysicalMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.4} 
            depthWrite={false} 
            roughness={1} 
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Saturn Rings */}
      {name === 'Saturn' && ringTexture && (
        <mesh ref={ringRef} rotation={[-Math.PI / 2.2, 0, 0]}>
          <ringGeometry args={[config.radius * 1.3, config.radius * 2.6, 128]} />
          <meshPhysicalMaterial 
            map={ringTexture}
            transparent 
            opacity={0.85} 
            side={THREE.DoubleSide} 
            roughness={0.5}
          />
        </mesh>
      )}

      {/* Uranus Rings */}
      {name === 'Uranus' && (
        <mesh rotation={[Math.PI / 6, 0, Math.PI / 2.2]}>
          <ringGeometry args={[config.radius * 1.3, config.radius * 1.8, 128]} />
          <meshPhysicalMaterial 
            color="#88bbee"
            transparent 
            opacity={0.4} 
            side={THREE.DoubleSide} 
            roughness={0.5}
          />
        </mesh>
      )}
    </group>
  );
}

export default function PlanetDetailView() {
  const { selectedEntity, setSelectedEntity, setAppMode } = useSpaceContext();
  const [activeTab, setActiveTab] = useState<'telemetry' | 'geology' | 'exploration'>('telemetry');

  if (!selectedEntity || !PLANET_DETAILS[selectedEntity]) return null;

  const data = PLANET_DETAILS[selectedEntity];

  const handleSaveFavorite = async () => {
    try {
      const existing = localStorage.getItem('cosmos_favorites');
      const favoritesList: string[] = existing ? JSON.parse(existing) : [];
      if (!favoritesList.includes(selectedEntity)) {
        favoritesList.push(selectedEntity);
        localStorage.setItem('cosmos_favorites', JSON.stringify(favoritesList));
      }
      alert(`${selectedEntity} saved to favorites!`);
    } catch (e) {
      console.error(e);
    }
  };

  const panelVariants = {
    hidden: { opacity: 0, x: 50 },
    show: {
      opacity: 1, x: 0,
      transition: { staggerChildren: 0.08, duration: 0.5, ease: "easeOut" as any }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#020617] flex flex-col md:flex-row overflow-hidden"
    >
      
      {/* Dynamic Colored Close Button Overlay */}
      <button 
        onClick={() => {
          setSelectedEntity(null);
          setAppMode('scroll');
        }}
        className="absolute top-8 left-8 z-50 p-4 rounded-full bg-slate-900/60 hover:bg-white/10 border transition-all duration-300 text-white shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md cursor-pointer"
        style={{ borderColor: `${data.color}33` }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = data.color;
          e.currentTarget.style.boxShadow = `0 0 15px ${data.color}44`;
          e.currentTarget.style.color = data.color;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = `${data.color}33`;
          e.currentTarget.style.boxShadow = `0 0 15px rgba(0,0,0,0.5)`;
          e.currentTarget.style.color = 'white';
        }}
      >
        <X size={24} />
      </button>

      {/* 3D Canvas Side */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full md:w-1/2 h-[45vh] md:h-screen relative bg-[radial-gradient(ellipse_at_center,rgba(0,10,30,1)_0%,rgba(2,6,23,1)_100%)] border-b md:border-b-0 md:border-r border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.7)]"
      >
        <Canvas camera={{ position: [0, 0, data.isGalaxy ? 30 : data.radius * 3], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={2} />
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
          <OrbitControls 
            enablePan={false} 
            minDistance={data.radius * 1.3} 
            maxDistance={data.isGalaxy ? 100 : data.radius * 6} 
          />
          
          {data.isGalaxy ? (
            <group scale={[0.1, 0.1, 0.1]}>
              <GalaxyExplorer type={data.isGalaxy as any} />
            </group>
          ) : (
            <AnimatedPlanet config={data} name={selectedEntity} />
          )}

          <EffectComposer>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} />
          </EffectComposer>
        </Canvas>
        
        {/* Helper Hint */}
        <div className="absolute bottom-6 w-full text-center text-slate-400 pointer-events-none flex items-center justify-center gap-2 text-sm uppercase tracking-widest font-bold">
          <Orbit size={16} className="animate-spin-slow" /> Drag to rotate
        </div>
      </motion.div>

      {/* Dynamic Scrolling Info Side */}
      <motion.div 
        variants={panelVariants}
        initial="hidden"
        animate="show"
        className="w-full md:w-1/2 h-[55vh] md:h-screen overflow-y-auto bg-slate-950/80 backdrop-blur-2xl p-6 md:p-16 border-l border-white/5"
      >
        <div className="max-w-xl mx-auto flex flex-col justify-center space-y-8 min-h-full">
          
          {/* Header Description Section */}
          <motion.div variants={itemVariants} className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 text-xs font-black uppercase tracking-widest rounded-full bg-white/5 border border-white/10" style={{ color: data.color }}>
                  {data.isGalaxy ? 'Deep Space Galaxy' : 'Solar System Entity'}
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black mb-3 uppercase tracking-tight drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]" style={{ color: data.color }}>
                {selectedEntity}
              </h1>
              <p className="text-base md:text-lg text-slate-300 leading-relaxed font-light">{data.desc}</p>
            </div>
            <button 
              onClick={handleSaveFavorite}
              className="p-4 rounded-full border border-slate-800 hover:border-neon-blue hover:text-neon-blue transition-all duration-300 cursor-pointer text-slate-400 backdrop-blur-sm bg-slate-900/50"
              title="Save to Favorites"
            >
              <Heart size={24} />
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="h-px w-full bg-gradient-to-r from-slate-800 to-transparent" />

          {/* Sci-Fi Tabs Controller */}
          <motion.div variants={itemVariants} className="flex border border-slate-800 rounded-xl p-1 bg-slate-900/40 backdrop-blur-md">
            {[
              { id: 'telemetry', label: 'Telemetry Profile', icon: Globe },
              { id: 'geology', label: 'Geology & Atmosphere', icon: Layers },
              { id: 'exploration', label: 'Missions & Logs', icon: Compass }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    isActive 
                      ? 'bg-slate-800 border text-white shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                  style={isActive ? { borderColor: `${data.color}44`, backgroundColor: `${data.color}11`, color: data.color } : {}}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </motion.div>

          {/* Dynamic Tab Content with Framer Motion */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex-1 space-y-6"
            >
              {activeTab === 'telemetry' && (
                <div className="grid grid-cols-2 gap-4">
                  <StatCard icon={Compass} label="Avg Distance" value={data.distSun} color={data.color} />
                  <StatCard icon={Thermometer} label="Temperature" value={data.temp} color={data.color} />
                  <StatCard icon={Orbit} label="Orbital Year" value={data.year} color={data.color} />
                  <StatCard icon={Info} label="Mass" value={data.mass} color={data.color} />
                  <StatCard icon={Info} label="Gravity" value={data.gravity} color={data.color} />
                  <StatCard icon={Info} label="Length of Day" value={data.day} color={data.color} />
                  <div className="col-span-2">
                    <StatCard icon={Star} label="Moons / Satellites" value={data.moons} color={data.color} />
                  </div>
                </div>
              )}

              {activeTab === 'geology' && (
                <div className="space-y-4">
                  {/* Custom System Notification badges */}
                  {(data.hasRings || data.hasClouds) && (
                    <div className="flex gap-2">
                      {data.hasRings && (
                        <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 animate-pulse">
                          ⚠️ Spectacular Ring System Detected
                        </span>
                      )}
                      {data.hasClouds && (
                        <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 animate-pulse">
                          💧 Dynamic Cloud Layers Detected
                        </span>
                      )}
                    </div>
                  )}

                  <div className="bg-slate-900/40 border p-6 rounded-2xl glass-premium" style={{ borderColor: `${data.color}22` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Globe size={18} style={{ color: data.color }} />
                      <h3 className="text-slate-200 uppercase tracking-widest text-sm font-bold">Atmospheric Composition</h3>
                    </div>
                    <p className="text-base text-slate-300 leading-relaxed font-light">{data.atmosphere}</p>
                  </div>
                  
                  <div className="bg-slate-900/40 border p-6 rounded-2xl glass-premium" style={{ borderColor: `${data.color}22` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Layers size={18} style={{ color: data.color }} />
                      <h3 className="text-slate-200 uppercase tracking-widest text-sm font-bold">Internal Geological Structure</h3>
                    </div>
                    <p className="text-base text-slate-300 leading-relaxed font-light">{data.structure}</p>
                  </div>
                </div>
              )}

              {activeTab === 'exploration' && (
                <div className="space-y-4">
                  <div className="bg-slate-900/40 border p-6 rounded-2xl glass-premium" style={{ borderColor: `${data.color}22` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Milestone size={18} style={{ color: data.color }} />
                      <h3 className="text-slate-200 uppercase tracking-widest text-sm font-bold">Discovery History</h3>
                    </div>
                    <p className="text-base text-slate-300 leading-relaxed font-light">{data.discovery}</p>
                  </div>

                  <div className="bg-slate-900/40 border p-6 rounded-2xl glass-premium" style={{ borderColor: `${data.color}22` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Rocket size={18} style={{ color: data.color }} />
                      <h3 className="text-slate-200 uppercase tracking-widest text-sm font-bold">Key Spacecraft Missions</h3>
                    </div>
                    <p className="text-base text-slate-300 leading-relaxed font-light">{data.history}</p>
                  </div>

                  {/* Fun Fact Glowing Callout Box */}
                  <motion.div 
                    initial={{ scale: 0.98 }}
                    animate={{ scale: 1 }}
                    className="border p-6 rounded-2xl relative overflow-hidden" 
                    style={{ borderColor: `${data.color}44`, background: `linear-gradient(135deg, ${data.color}15 0%, rgba(2,6,23,0.9) 100%)` }}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-15" style={{ color: data.color }}>
                      <Zap size={60} />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={18} style={{ color: data.color }} />
                      <h3 className="uppercase tracking-widest text-xs font-black" style={{ color: data.color }}>Cosmic Intel Log</h3>
                    </div>
                    <p className="text-base text-white font-medium italic leading-relaxed">
                      "{data.funFact}"
                    </p>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

        </div>
      </motion.div>

    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.02 }}
      className="flex flex-col gap-1 p-4 rounded-xl border transition-all duration-300 bg-slate-900/30 backdrop-blur-sm"
      style={{
        borderColor: hovered ? color : 'rgba(255,255,255,0.05)',
        boxShadow: hovered ? `0 0 15px ${color}1a` : 'none'
      }}
    >
      <div className="text-slate-400 flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1">
        <Icon size={14} style={{ color }} /> {label}
      </div>
      <div className="text-white font-mono text-base md:text-lg font-semibold">{value}</div>
    </motion.div>
  );
}
