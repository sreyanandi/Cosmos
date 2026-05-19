import React from 'react';
import { motion } from 'framer-motion';
import { Globe, User, Flag, Navigation, Eye, Server, Compass, Telescope, Milestone } from 'lucide-react';

const MISSIONS = [
  { 
    year: '1957', 
    title: 'Sputnik 1 Launch', 
    desc: 'The dawn of the space age. The Soviet Union successfully launches the first artificial Earth satellite into orbit, transmitting radio pulses back to ground systems.',
    icon: Globe,
    color: 'from-blue-500 to-neon-blue'
  },
  { 
    year: '1961', 
    title: 'Vostok 1 Flight', 
    desc: 'Yuri Gagarin enters orbit, braving extreme gravitational stress to become the historic first human in space, declaring the planetary view peaceful and brilliant.',
    icon: User,
    color: 'from-purple-500 to-indigo-500'
  },
  { 
    year: '1969', 
    title: 'Apollo 11 Landing', 
    desc: 'Humanity touches another world. Neil Armstrong and Buzz Aldrin step onto the lunar surface in the Sea of Tranquility, returning historic soil samples.',
    icon: Flag,
    color: 'from-amber-500 to-orange-500'
  },
  { 
    year: '1977', 
    title: 'Voyager Interstellar', 
    desc: 'NASA launches Voyager 1 and 2 probes on a grand tour of gas giants, carrying golden records bearing greetings from Earth into deep interstellar space.',
    icon: Navigation,
    color: 'from-red-500 to-pink-500'
  },
  { 
    year: '1990', 
    title: 'Hubble Deployment', 
    desc: 'The deployment of the Hubble Space Telescope into low Earth orbit, lifting our view above atmospheric distortion to capture deep-field universe history.',
    icon: Eye,
    color: 'from-cyan-500 to-teal-500'
  },
  { 
    year: '1998', 
    title: 'ISS Assembly Start', 
    desc: 'The initial core modules of the International Space Station are linked in orbit, initiating the longest continuous international scientific outpost in space.',
    icon: Server,
    color: 'from-indigo-500 to-blue-500'
  },
  { 
    year: '2012', 
    title: 'Curiosity Mars Touch', 
    desc: 'NASA Curiosity rover executes a complex sky-crane landing inside Gale Crater, scanning sedimentary layers to establish Mars historical habitability.',
    icon: Compass,
    color: 'from-orange-600 to-red-500'
  },
  { 
    year: '2021', 
    title: 'James Webb Deployment', 
    desc: 'Launching the massive gold-plated hexagonal primary mirror system to the Second Lagrange point, tracking infrared light from first-generation galaxy formations.',
    icon: Telescope,
    color: 'from-yellow-500 to-amber-600'
  },
];

export default function SpaceTimeline() {
  return (
    <div className="max-w-4xl mx-auto py-4 relative z-10 text-slate-100">
      
      <h2 className="text-3xl font-black text-center mb-16 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-300 to-slate-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
        Chronology of Cosmic Conquest
      </h2>
      
      <div className="relative border-l border-white/10 ml-6 md:ml-[50%] space-y-12 pb-12">
        {MISSIONS.map((mission, index) => {
          const Icon = mission.icon;
          const isEven = index % 2 === 0;
          
          return (
            <div key={index} className="relative">
              
              {/* Timeline Center Pulse Dot */}
              <div className="absolute left-[-16px] md:left-[50%] md:-ml-[16px] top-1.5 w-8 h-8 rounded-full bg-slate-950 border border-white/15 flex items-center justify-center z-20 shadow-[0_0_10px_rgba(0,0,0,0.8)]">
                <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${mission.color} animate-pulse`} />
              </div>
              
              {/* Timeline Content Block */}
              <motion.div 
                initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, type: "spring", damping: 15 }}
                className={`w-[calc(100%-40px)] ml-10 md:ml-0 md:w-[calc(50%-40px)] ${
                  isEven ? 'md:mr-auto md:text-right' : 'md:ml-auto md:pl-0'
                }`}
              >
                <div className="bg-slate-950/40 p-6 rounded-3xl border border-white/5 hover:border-neon-blue transition-all duration-500 hover:shadow-[0_0_20px_rgba(0,240,255,0.05)] group relative overflow-hidden">
                  
                  {/* Decorative glowing gradient backdrop */}
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  {/* Category icon indicator */}
                  <div className={`p-3 bg-gradient-to-r ${mission.color} rounded-2xl w-fit flex items-center justify-center text-black mb-4 group-hover:scale-110 transition-transform duration-300 ${
                    isEven ? 'md:ml-auto' : ''
                  }`}>
                    <Icon size={18} />
                  </div>
                  
                  <span className="font-mono text-neon-blue font-black text-xl tracking-widest block">{mission.year}</span>
                  <h3 className="text-2xl font-black text-white mt-1 mb-3 uppercase tracking-wide group-hover:text-neon-blue transition-colors">{mission.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-light">{mission.desc}</p>
                </div>
              </motion.div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
