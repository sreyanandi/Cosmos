import React, { useState, useRef } from 'react';
import { useSpaceContext } from '../context/SpaceContext';
import { Rocket, Gamepad2, Scale, Clock, Star, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SpaceQuiz from './SpaceQuiz';
import PlanetComparison from './PlanetComparison';
import SpaceTimeline from './SpaceTimeline';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

function ParticleDust() {
  const pointsRef = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.015;
      pointsRef.current.rotation.x = state.clock.getElapsedTime() * 0.005;
    }
  });

  const count = 1000;
  const positions = React.useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 80;
    }
    return arr;
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#00f0ff"
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

const PLANET_UI: Record<string, { gradient: string, shadow: string, ring?: boolean }> = {
  Mercury: { gradient: 'radial-gradient(circle at 30% 30%, #a8a29e 0%, #57534e 60%, #292524 100%)', shadow: 'rgba(168,162,158,0.5)' },
  Venus: { gradient: 'radial-gradient(circle at 30% 30%, #fde047 0%, #ca8a04 60%, #713f12 100%)', shadow: 'rgba(234,179,8,0.5)' },
  Earth: { gradient: 'radial-gradient(circle at 30% 30%, #93c5fd 0%, #2563eb 55%, #1e3a8a 85%, #0f172a 100%)', shadow: 'rgba(59,130,246,0.6)' },
  Moon: { gradient: 'radial-gradient(circle at 30% 30%, #f1f5f9 0%, #94a3b8 65%, #475569 100%)', shadow: 'rgba(148,163,184,0.4)' },
  Mars: { gradient: 'radial-gradient(circle at 30% 30%, #fca5a5 0%, #ef4444 60%, #7f1d1d 100%)', shadow: 'rgba(239,68,68,0.6)' },
  Jupiter: { gradient: 'radial-gradient(circle at 30% 30%, #ffedd5 0%, #d97706 50%, #78350f 85%, #451a03 100%)', shadow: 'rgba(245,158,11,0.5)' },
  Saturn: { gradient: 'radial-gradient(circle at 30% 30%, #fef08a 0%, #ca8a04 55%, #713f12 85%, #422006 100%)', shadow: 'rgba(234,179,8,0.5)', ring: true },
  Uranus: { gradient: 'radial-gradient(circle at 30% 30%, #cffafe 0%, #06b6d4 60%, #155e75 100%)', shadow: 'rgba(6,182,212,0.5)' },
  Neptune: { gradient: 'radial-gradient(circle at 30% 30%, #bfdbfe 0%, #3b82f6 60%, #1e3a8a 100%)', shadow: 'rgba(59,130,246,0.5)' }
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

const ALL_DESTINATIONS = ['Mercury', 'Venus', 'Earth', 'Moon', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];

export default function Dashboard() {
  const { setAppMode, audioEnabled, setAudioEnabled, setSelectedEntity } = useSpaceContext();
  const [activeTab, setActiveTab] = useState<'mission' | 'quiz' | 'compare' | 'timeline' | 'favorites'>('mission');

  const tabs = [
    { id: 'mission', icon: Rocket, label: 'Missions' },
    { id: 'quiz', icon: Gamepad2, label: 'Space Quiz' },
    { id: 'compare', icon: Scale, label: 'Compare' },
    { id: 'timeline', icon: Clock, label: 'Timeline' },
    { id: 'favorites', icon: Star, label: 'Favorites' }
  ];

  const [aiFact, setAiFact] = useState<string>('Generating cosmic knowledge...');
  const [favorites, setFavorites] = useState<string[]>([]);

  React.useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_URL || '';
    fetch(`${API_BASE}/api/fact`)
      .then(res => res.json())
      .then(data => setAiFact(data.fact || 'The universe is vast and expanding.'))
      .catch(() => setAiFact('Failed to communicate with Deep Space Network.'));

    try {
      const existing = localStorage.getItem('cosmos_favorites');
      setFavorites(existing ? JSON.parse(existing) : []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  React.useEffect(() => {
    if (activeTab === 'favorites') {
      try {
        const existing = localStorage.getItem('cosmos_favorites');
        setFavorites(existing ? JSON.parse(existing) : []);
      } catch (e) {
        console.error(e);
      }
    }
  }, [activeTab]);

  const handleLaunch = (dest: string) => {
    setSelectedEntity(dest);
    setAppMode('storytelling');
  };

  return (
    <div className="w-full h-full pt-32 p-8 overflow-y-auto bg-[#020617]/90 text-slate-200 backdrop-blur-md relative z-20">
      
      {/* Dynamic 3D Particle Space Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <Stars radius={50} depth={50} count={1000} factor={3} saturation={0.5} fade speed={1} />
          <ParticleDust />
        </Canvas>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-6xl mx-auto relative z-10"
      >
        <motion.div variants={itemVariants} className="flex justify-between items-center mb-8">
          <button 
            onClick={() => setAppMode('scroll')}
            className="flex items-center gap-2 text-neon-blue hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} /> Back to Cosmos
          </button>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="p-3 rounded-full border border-slate-700 hover:bg-slate-800 transition text-neon-blue glass cursor-pointer"
            >
              {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>
        </motion.div>

        {/* AI Fact Banner */}
        <motion.div variants={itemVariants} className="w-full glass-premium rounded-2xl p-6 mb-8 flex items-center gap-4 border border-white/5 bg-slate-950/40 backdrop-blur-xl">
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="p-3 bg-neon-blue/20 rounded-full text-neon-blue border border-neon-blue/30 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
          >
            <Star size={24} />
          </motion.div>
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">AstroBot's Daily Fact</h3>
            <p className="text-lg text-white font-light">{aiFact}</p>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-2 px-6 py-3 rounded-xl border transition-all overflow-hidden cursor-pointer ${
                  isActive
                    ? 'border-neon-blue text-white shadow-[0_0_15px_rgba(0,240,255,0.2)] bg-slate-900/80' 
                    : 'border-slate-800 hover:border-slate-600 text-slate-400 hover:text-slate-200 bg-slate-950/50 backdrop-blur-md'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-neon-blue/10"
                    initial={false}
                    transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon size={20} className="relative z-10 text-neon-blue" />
                <span className="font-bold uppercase tracking-wider relative z-10">{tab.label}</span>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Tab Content */}
        <motion.div 
          variants={itemVariants} 
          className="rounded-3xl p-8 border glass-premium border-white/5 bg-slate-950/50 backdrop-blur-2xl shadow-2xl"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'mission' && (
                <div className="flex flex-col items-center">
                  <h2 className="text-3xl font-black mb-6 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-300 to-slate-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">Choose Your Mission</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full">
                    {ALL_DESTINATIONS.map((dest, i) => {
                      const ui = PLANET_UI[dest] || { gradient: 'radial-gradient(circle at 30% 30%, #555, #111)', shadow: 'rgba(255,255,255,0.1)' };
                      return (
                        <motion.button 
                          key={dest}
                          whileHover={{ scale: 1.05, y: -4 }}
                          whileTap={{ scale: 0.96 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => handleLaunch(dest)}
                          className="p-6 rounded-2xl border border-slate-800 bg-slate-950/40 hover:bg-neon-blue/5 hover:border-neon-blue transition-all group flex flex-col items-center shadow-2xl relative overflow-hidden cursor-pointer"
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-neon-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                          
                          {/* Realistic 3D CSS Planet Sphere */}
                          <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                            {/* Outer Atmospheric Glow */}
                            <div 
                              className="absolute inset-0 rounded-full blur-[8px] opacity-40 transition-all duration-300 group-hover:scale-125 group-hover:opacity-90" 
                              style={{ 
                                background: ui.gradient, 
                                boxShadow: `0 0 15px ${ui.shadow}` 
                              }} 
                            />
                            {/* Solid Planet Body */}
                            <div 
                              className="w-12 h-12 rounded-full relative z-10 transition-transform duration-700 group-hover:rotate-90"
                              style={{ 
                                background: ui.gradient,
                                boxShadow: 'inset -3px -3px 8px rgba(0,0,0,0.8), inset 3px 3px 8px rgba(255,255,255,0.2)'
                              }} 
                            />
                            {/* Custom Rings */}
                            {ui.ring && (
                              <div 
                                className="absolute w-20 h-3 border-[1.5px] border-amber-300/35 rounded-full z-20 pointer-events-none" 
                                style={{ 
                                  transform: 'rotate(-15deg)',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
                                }}
                              />
                            )}
                          </div>

                          <span className="text-lg font-extrabold text-slate-100 group-hover:text-neon-blue transition-colors relative z-10 tracking-wider">{dest}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {activeTab === 'quiz' && <SpaceQuiz />}
              {activeTab === 'compare' && <PlanetComparison />}
              {activeTab === 'timeline' && <SpaceTimeline />}
              {activeTab === 'favorites' && (
                <div>
                  <h2 className="text-3xl font-bold mb-6 text-white tracking-widest uppercase text-center">Your Favorite Planets</h2>
                  {favorites.length === 0 ? (
                    <p className="text-slate-400 text-center text-lg py-8">You haven't saved any planets yet.</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {favorites.map((fav, i) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          key={i} 
                          className="p-6 glass-premium border border-slate-800 bg-slate-900/30 rounded-xl text-center hover:border-neon-blue transition-colors cursor-default"
                        >
                          <span className="text-xl font-bold text-neon-blue">{fav}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
