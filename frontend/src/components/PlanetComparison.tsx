import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Scale, Compass, Thermometer, ShieldAlert } from 'lucide-react';

const PLANETS = {
  Mercury: { 
    temp: '167°C', 
    moons: 0, 
    dist: '58M km', 
    radius: '2,439 km', 
    color: '#8c8c8c', 
    rawRadius: 0.38, 
    rawTemp: 167, 
    rawMoons: 0.1, 
    rawDist: 0.39, 
    hasRings: false 
  },
  Venus: { 
    temp: '464°C', 
    moons: 0, 
    dist: '108M km', 
    radius: '6,051 km', 
    color: '#e3bb76', 
    rawRadius: 0.94, 
    rawTemp: 464, 
    rawMoons: 0.1, 
    rawDist: 0.72, 
    hasRings: false 
  },
  Earth: { 
    temp: '15°C', 
    moons: 1, 
    dist: '149M km', 
    radius: '6,371 km', 
    color: '#3b82f6', 
    rawRadius: 1.0, 
    rawTemp: 15, 
    rawMoons: 1, 
    rawDist: 1.0, 
    hasRings: false 
  },
  Mars: { 
    temp: '-65°C', 
    moons: 2, 
    dist: '227M km', 
    radius: '3,389 km', 
    color: '#ef4444', 
    rawRadius: 0.53, 
    rawTemp: -65, 
    rawMoons: 2, 
    rawDist: 1.52, 
    hasRings: false 
  },
  Jupiter: { 
    temp: '-110°C', 
    moons: 95, 
    dist: '778M km', 
    radius: '69,911 km', 
    color: '#c0a480', 
    rawRadius: 2.2, 
    rawTemp: -110, 
    rawMoons: 95, 
    rawDist: 5.2, 
    hasRings: false 
  },
  Saturn: { 
    temp: '-140°C', 
    moons: 146, 
    dist: '1.4B km', 
    radius: '58,232 km', 
    color: '#fef3c7', 
    rawRadius: 1.9, 
    rawTemp: -140, 
    rawMoons: 146, 
    rawDist: 9.58, 
    hasRings: true 
  },
  Uranus: { 
    temp: '-195°C', 
    moons: 28, 
    dist: '2.9B km', 
    radius: '25,362 km', 
    color: '#4b70dd', 
    rawRadius: 1.4, 
    rawTemp: -195, 
    rawMoons: 28, 
    rawDist: 19.2, 
    hasRings: false 
  },
  Neptune: { 
    temp: '-200°C', 
    moons: 16, 
    dist: '4.5B km', 
    radius: '24,622 km', 
    color: '#274687', 
    rawRadius: 1.3, 
    rawTemp: -200, 
    rawMoons: 16, 
    rawDist: 30.0, 
    hasRings: false 
  }
};

function ComparisonPlanet({ color, hasRings }: { color: string; hasRings?: boolean }) {
  const sphereRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.008;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z -= 0.005;
    }
  });

  return (
    <group>
      <mesh ref={sphereRef}>
        <sphereGeometry args={[1.3, 64, 64]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.7} 
          metalness={0.15} 
          bumpScale={0.05}
        />
      </mesh>
      {hasRings && (
        <mesh ref={ringRef} rotation={[-Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[1.7, 2.8, 64]} />
          <meshStandardMaterial color="#d4b58e" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function StatGauge({ 
  label, 
  val1, 
  val2, 
  rawVal1, 
  rawVal2,
  icon: Icon
}: { 
  label: string; 
  val1: string | number; 
  val2: string | number; 
  rawVal1: number; 
  rawVal2: number;
  icon: any;
}) {
  const absVal1 = Math.abs(rawVal1);
  const absVal2 = Math.abs(rawVal2);
  const total = absVal1 + absVal2 || 1;
  const pct1 = Math.round((absVal1 / total) * 100);
  const pct2 = 100 - pct1;

  return (
    <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className="text-neon-blue" />
        <span className="text-xs font-black uppercase text-slate-400 tracking-widest">{label}</span>
      </div>
      
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg font-bold text-white tracking-wider font-mono">{val1}</span>
        <span className="text-lg font-bold text-white tracking-wider font-mono">{val2}</span>
      </div>
      
      {/* Neon dual slide track */}
      <div className="h-2.5 bg-slate-900 rounded-full flex overflow-hidden border border-white/5 relative">
        <div 
          className="h-full bg-gradient-to-r from-neon-blue to-blue-500 rounded-l-full shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all duration-500" 
          style={{ width: `${pct1}%` }} 
        />
        <div className="w-[2px] bg-slate-950 z-10" />
        <div 
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-r-full shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all duration-500" 
          style={{ width: `${pct2}%` }} 
        />
      </div>
    </div>
  );
}

export default function PlanetComparison() {
  const [p1, setP1] = useState<keyof typeof PLANETS>('Earth');
  const [p2, setP2] = useState<keyof typeof PLANETS>('Mars');

  const info1 = PLANETS[p1];
  const info2 = PLANETS[p2];

  return (
    <div className="max-w-5xl mx-auto py-4 relative z-10 text-slate-100">
      <h2 className="text-3xl font-black text-center mb-8 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-300 to-slate-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">Planet Comparison HUD</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 items-center">
        
        {/* Planet 1 Card */}
        <div className="lg:col-span-3 bg-slate-950/40 p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden flex flex-col items-center">
          {/* Top selection drop menu */}
          <select 
            value={p1} 
            onChange={(e) => setP1(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-lg font-bold text-white mb-6 focus:outline-none focus:border-neon-blue cursor-pointer"
          >
            {Object.keys(PLANETS).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          
          {/* 3D Canvas rotating sphere */}
          <div className="h-56 w-full bg-black/60 rounded-2xl overflow-hidden border border-white/5 relative mb-4">
            <Canvas camera={{ position: [0, 0, 3.2], fov: 45 }}>
              <ambientLight intensity={0.2} />
              <directionalLight position={[5, 3, -1]} intensity={2} color="#ffffff" />
              <directionalLight position={[-5, -3, 1]} intensity={0.5} color={info1.color} />
              <Stars radius={50} depth={20} count={200} factor={2} fade />
              <ComparisonPlanet color={info1.color} hasRings={info1.hasRings} />
            </Canvas>
            
            {/* HUD scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:100%_8px] pointer-events-none" />
            <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1 rounded-md border border-white/5 text-xs text-neon-blue font-mono uppercase tracking-widest font-bold">
              SYSTEM 01
            </div>
          </div>
          
          {/* Static details readout */}
          <div className="w-full space-y-2 mt-2">
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-xs uppercase text-slate-500 font-bold tracking-wider">Classification</span>
              <span className="text-sm font-semibold text-slate-300">{info1.hasRings || info1.rawRadius > 1.2 ? "Gas Giant" : "Terrestrial"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-xs uppercase text-slate-500 font-bold tracking-wider">Orbital Order</span>
              <span className="text-sm font-semibold text-slate-300 font-mono">Order: {Object.keys(PLANETS).indexOf(p1) + 1}</span>
            </div>
          </div>
        </div>

        {/* Center Split VS */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center py-4">
          <div className="w-12 h-12 rounded-full border border-white/10 bg-slate-900/60 flex items-center justify-center text-neon-blue font-black uppercase text-sm tracking-wider shadow-[0_0_15px_rgba(0,240,255,0.15)] pointer-events-none">
            VS
          </div>
          <div className="w-[1px] h-16 bg-gradient-to-b from-white/10 to-transparent mt-2 hidden lg:block" />
        </div>

        {/* Planet 2 Card */}
        <div className="lg:col-span-3 bg-slate-950/40 p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden flex flex-col items-center">
          {/* Top selection drop menu */}
          <select 
            value={p2} 
            onChange={(e) => setP2(e.target.value as any)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-lg font-bold text-white mb-6 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {Object.keys(PLANETS).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          
          {/* 3D Canvas rotating sphere */}
          <div className="h-56 w-full bg-black/60 rounded-2xl overflow-hidden border border-white/5 relative mb-4">
            <Canvas camera={{ position: [0, 0, 3.2], fov: 45 }}>
              <ambientLight intensity={0.2} />
              <directionalLight position={[5, 3, -1]} intensity={2} color="#ffffff" />
              <directionalLight position={[-5, -3, 1]} intensity={0.5} color={info2.color} />
              <Stars radius={50} depth={20} count={200} factor={2} fade />
              <ComparisonPlanet color={info2.color} hasRings={info2.hasRings} />
            </Canvas>
            
            {/* HUD scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:100%_8px] pointer-events-none" />
            <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1 rounded-md border border-white/5 text-xs text-amber-500 font-mono uppercase tracking-widest font-bold">
              SYSTEM 02
            </div>
          </div>
          
          {/* Static details readout */}
          <div className="w-full space-y-2 mt-2">
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-xs uppercase text-slate-500 font-bold tracking-wider">Classification</span>
              <span className="text-sm font-semibold text-slate-300">{info2.hasRings || info2.rawRadius > 1.2 ? "Gas Giant" : "Terrestrial"}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-xs uppercase text-slate-500 font-bold tracking-wider">Orbital Order</span>
              <span className="text-sm font-semibold text-slate-300 font-mono">Order: {Object.keys(PLANETS).indexOf(p2) + 1}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Holographic Comparison Gauges Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatGauge 
          label="Radius Size Scale" 
          val1={info1.radius} 
          val2={info2.radius} 
          rawVal1={info1.rawRadius} 
          rawVal2={info2.rawRadius} 
          icon={Scale}
        />
        <StatGauge 
          label="Distance from Star System" 
          val1={info1.dist} 
          val2={info2.dist} 
          rawVal1={info1.rawDist} 
          rawVal2={info2.rawDist} 
          icon={Compass}
        />
        <StatGauge 
          label="Average Surface Temperature" 
          val1={info1.temp} 
          val2={info2.temp} 
          rawVal1={info1.rawTemp} 
          rawVal2={info2.rawTemp} 
          icon={Thermometer}
        />
        <StatGauge 
          label="Natural Satellites (Moons)" 
          val1={info1.moons} 
          val2={info2.moons} 
          rawVal1={info1.rawMoons} 
          rawVal2={info2.rawMoons} 
          icon={ShieldAlert}
        />
      </div>

    </div>
  );
}
