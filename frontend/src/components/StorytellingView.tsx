import React, { useEffect, useState, useRef } from 'react';
import { useSpaceContext } from '../context/SpaceContext';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { X, Volume2, VolumeX, RotateCcw, Radio } from 'lucide-react';
import { createProceduralTexture, createRingTexture } from '../utils/proceduralTextures';

// Simplified PLANET_DETAILS for storytelling
const STORY_DATA: Record<string, any> = {
  Mercury: { 
    color: '#8c8c8c', 
    radius: 1.5, 
    story: "Mercury, the silent iron core of the inner system, sits baked by solar winds. Discovered in ancient times, it remains a world of extreme contrasts—where days reach a blistering 800 degrees Fahrenheit, and nights plummet to minus 290. Probes like Mariner 10 and NASA's MESSENGER revealed a highly active volcanic past and vast water ice deposits hiding deep inside shadowed polar craters." 
  },
  Venus: { 
    color: '#e3bb76', 
    radius: 2, 
    story: "Venus is Earth's toxic twin, a hellish sphere cloaked in sulfurous clouds. Beneath its thick carbon dioxide canopy lies a runaway greenhouse nightmare with a crushing pressure ninety times that of Earth. Soviet Venera landers in the 1970s braved the acid rain to reveal Venus's volcanic geology, sending back historic panoramic views before melting under the extreme 900-degree surface heat." 
  },
  Earth: { 
    color: '#3b82f6', 
    radius: 2, 
    hasClouds: true, 
    story: "Earth, the vibrant blue marble, stands as a rare oasis of biological wonder. Wrapped in a nitrogen-oxygen shield and driven by active plate tectonics, it is the only world known to harbor life. Its oceans contain nearly all of our planet's water, stabilized by a perfectly sized Moon and protected by a robust iron-core magnetic field that deflects lethal solar cosmic radiation." 
  },
  Moon: { 
    color: '#d1d5db', 
    radius: 0.5, 
    story: "The Moon is Earth's silent companion, holding the key to our cosmic infancy. Formed from a cataclysmic planetary collision four billion years ago, its scarred cratered plains tell the story of the solar system's early bombardment. Visited by Apollo 11 in 1969, its dust holds ancient volcanic history, and its gravity continues to stabilize Earth's seasonal rotation and guide our tidal cycles." 
  },
  Mars: { 
    color: '#ef4444', 
    radius: 1.6, 
    story: "Mars, the iron-dusted Red Planet, whispers secrets of ancient rivers and frozen lakes. Billions of years ago, magnetic fields shielded active liquid water systems flowing across its vast surface. Modern robotic explorers, from the Curiosity and Perseverance rovers to orbiters, have confirmed ancient lake beds in Gale Crater, setting the stage for humanity's first deep-space colony." 
  },
  Jupiter: { 
    color: '#c0a480', 
    radius: 3, 
    story: "Jupiter, the colossal sovereign of gas giants, holds more mass than all other planets combined. Beneath its beautiful banded storm clouds lies a metallic hydrogen core generating a gigantic magnetic field. Visited by Pioneer, Voyager, and the Galileo probes, its swirling Great Red Spot storm has raged for over three centuries, surrounded by a court of ocean moons like Europa." 
  },
  Saturn: { 
    color: '#fef3c7', 
    radius: 2.8, 
    hasRings: true, 
    story: "Saturn is the jewel of the cosmos, adorned with a spectacular ring system spanning 175,000 miles. Composed of countless billions of highly reflective water ice fragments, these rings dance in perfect orbital alignment. The Cassini probe revealed Saturn's intense storms, and mapped its gas-giant moons Titan and Enceladus, which harbor active hydrocarbon lakes and thermal ocean vents." 
  },
  Uranus: { 
    color: '#4b70dd', 
    radius: 2.4, 
    story: "Uranus is the enigmatic sideways ice giant, tilted at a bizarre 98-degree angle. This extreme tilt causes Uranus to roll around the Sun, resulting in decades-long seasonal days. Wrapped in a pale cyan methane shroud, Voyager 2 discovered a freezing complex ring system and extreme magnetic field profiles, suggesting an interior rich in active diamond rain storms." 
  },
  Neptune: { 
    color: '#274687', 
    radius: 2.3, 
    story: "Neptune, the dark blue sentinel, reigns at the freezing outer boundaries of the solar system. Driven by supersonic winds reaching 1,200 miles per hour, this active ice giant is whipped by colossal dark storm vortices. Voyager 2 revealed a turbulent planetary weather system and explored its captured icy moon Triton, which orbits backward and shoots giant cryogenic geysers into space." 
  },
};

// Speech Synthesis Helper Function
const speakText = (text: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/<[^>]*>/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      // Try to find a highly soothing natural english voice
      const desiredVoice = voices.find(v => 
        v.lang.startsWith('en') && 
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David') || v.name.includes('Hazel') || v.name.includes('Zira'))
      );
      if (desiredVoice) utterance.voice = desiredVoice;
      utterance.rate = 0.82; // Calmer, slower cinematic speed
      utterance.pitch = 0.85; // Deeper resonant baritone
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      setVoiceAndSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
    }
  }
};

function CinematicPlanet({ config, name }: { config: any; name: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);

  const surfaceTexture = React.useMemo(() => createProceduralTexture(name, config.color), [name, config.color]);
  const ringTexture = React.useMemo(() => name === 'Saturn' ? createRingTexture() : null, [name]);

  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.002;
    if (ringRef.current) ringRef.current.rotation.z -= 0.001;
    if (cloudRef.current) cloudRef.current.rotation.y += 0.003;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[config.radius, 128, 128]} />
        <meshPhysicalMaterial
          map={surfaceTexture}
          roughness={name === 'Earth' ? 0.4 : 0.7}
          metalness={0.1}
        />
      </mesh>

      {name === 'Earth' && (
        <mesh ref={cloudRef}>
          <sphereGeometry args={[config.radius * 1.015, 64, 64]} />
          <meshPhysicalMaterial color="#ffffff" transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      )}

      {name === 'Saturn' && ringTexture && (
        <mesh ref={ringRef} rotation={[-Math.PI / 2.2, 0, 0]}>
          <ringGeometry args={[config.radius * 1.3, config.radius * 2.6, 128]} />
          <meshPhysicalMaterial map={ringTexture} transparent opacity={0.9} side={THREE.DoubleSide} roughness={0.4} />
        </mesh>
      )}

      {/* Atmospheric glow */}
      {['Earth', 'Venus', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'].includes(name) && (
        <mesh scale={[1.06, 1.06, 1.06]}>
          <sphereGeometry args={[config.radius, 32, 32]} />
          <meshBasicMaterial color={config.color} transparent opacity={0.12} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

function CameraRig() {
  useFrame((state) => {
    state.camera.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 2;
    state.camera.position.y = Math.cos(state.clock.elapsedTime * 0.1) * 1;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function StorytellingView() {
  const { selectedEntity, setSelectedEntity, setAppMode, audioEnabled, setAudioEnabled } = useSpaceContext();
  const [phase, setPhase] = useState(0);
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2000);
    const t2 = setTimeout(() => setPhase(2), 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const data = selectedEntity ? STORY_DATA[selectedEntity] : null;
  const storyText = data?.story || '';

  // Trigger voice narration when phase 2 is reached and audio is enabled
  useEffect(() => {
    if (phase === 2 && audioEnabled && storyText) {
      speakText(storyText);
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [phase, audioEnabled, storyText]);

  // Synchronized typewriter effect inside phase 2
  useEffect(() => {
    if (phase < 2 || !storyText) {
      setTypedText('');
      return;
    }

    let currentLength = 0;
    setTypedText('');
    
    const timer = setInterval(() => {
      currentLength++;
      setTypedText(storyText.slice(0, currentLength));
      
      if (currentLength >= storyText.length) {
        clearInterval(timer);
      }
    }, 28); // 28ms prints letters beautifully in lockstep with the slower pacing

    return () => clearInterval(timer);
  }, [phase, storyText]);

  if (!selectedEntity || !data) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
      className="absolute inset-0 z-50 bg-black overflow-hidden"
    >
      <button 
        onClick={() => {
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
          setSelectedEntity(null);
          setAppMode('dashboard');
        }}
        className="absolute top-8 left-8 z-50 p-4 rounded-full bg-black/50 hover:bg-white/10 border border-white/20 transition text-white backdrop-blur-md cursor-pointer hover:border-neon-blue hover:text-neon-blue"
      >
        <X size={24} />
      </button>

      {/* Right Floating Audio Controls Overlay */}
      <div className="absolute top-8 right-8 z-50 flex items-center gap-3">
        {audioEnabled && phase >= 2 && (
          <motion.button 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => speakText(data.story)}
            className="p-4 rounded-full bg-black/50 hover:bg-white/10 border border-white/20 text-slate-300 hover:text-white transition backdrop-blur-md flex items-center justify-center cursor-pointer hover:border-neon-blue"
            title="Re-narrate Story"
          >
            <RotateCcw size={20} />
          </motion.button>
        )}
        
        <button 
          onClick={() => setAudioEnabled(!audioEnabled)}
          className={`p-4 rounded-full transition backdrop-blur-md flex items-center gap-3 border shadow-lg cursor-pointer ${
            audioEnabled 
              ? 'bg-neon-blue/20 border-neon-blue text-neon-blue shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
              : 'bg-black/50 border-white/20 text-slate-400 hover:text-white hover:border-white/40'
          }`}
          title={audioEnabled ? "Mute Narrator" : "Enable AI Narrator"}
        >
          {audioEnabled ? (
            <>
              <Volume2 size={20} />
              {phase >= 2 && (
                <div className="flex items-end gap-[3px] h-3 w-5">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      custom={i}
                      variants={{
                        animate: (idx: number) => ({
                          height: ["4px", "12px", "4px"],
                          transition: {
                            duration: 0.5 + idx * 0.1,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }
                        })
                      }}
                      animate="animate"
                      className="w-[2px] bg-neon-blue rounded-full origin-bottom"
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <VolumeX size={20} />
          )}
        </button>
      </div>

      {/* 3D Cinematic Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, data.radius * 4], fov: 45 }}>
          <color attach="background" args={['#000000']} />
          <ambientLight intensity={0.05} />
          <directionalLight position={[10, 5, -5]} intensity={3} color="#ffffff" />
          <directionalLight position={[-10, -5, 5]} intensity={0.5} color={data.color} />
          
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
          
          <CinematicPlanet config={data} name={selectedEntity || ''} />
          <CameraRig />

          <EffectComposer>
            <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} height={300} intensity={2} />
            <Noise opacity={0.02} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Cinematic Text Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-24 pointer-events-none p-10 text-center">
        <AnimatePresence>
          {phase >= 1 && (
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9, letterSpacing: "0.1em" }}
              animate={{ opacity: 1, scale: 1, letterSpacing: "0.5em" }}
              transition={{ duration: 4, ease: "easeOut" }}
              className="text-7xl md:text-9xl font-black text-white uppercase mb-8 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] mix-blend-overlay"
            >
              {selectedEntity}
            </motion.h1>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase >= 2 && (
            <div className="relative w-full max-w-4xl">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 text-xs font-bold tracking-widest text-neon-blue uppercase drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]"
              >
                <Radio size={14} className="animate-pulse text-neon-blue" />
                Cosmic Transmission
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="text-lg md:text-xl text-slate-200 leading-relaxed font-light drop-shadow-xl p-8 rounded-3xl bg-black/60 border border-white/5 backdrop-blur-md pointer-events-auto shadow-2xl relative overflow-hidden"
              >
                {/* Tech scanline visual decoration */}
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,240,255,0.02)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] pointer-events-none" />
                <p className="relative z-10 font-sans tracking-wide text-left text-slate-200">
                  {typedText}
                  <span className="w-1.5 h-4 bg-neon-blue inline-block animate-ping ml-1" />
                </p>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
