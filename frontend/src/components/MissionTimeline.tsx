import { Rocket } from 'lucide-react';

const MISSIONS = [
  { year: '1969', name: 'Apollo 11', desc: 'First humans on the Moon' },
  { year: '1977', name: 'Voyager 1', desc: 'Farthest human-made object' },
  { year: '1990', name: 'Hubble', desc: 'Space Telescope launch' },
  { year: '2012', name: 'Curiosity', desc: 'Mars Rover landing' },
  { year: '2021', name: 'James Webb', desc: 'Next-gen observatory' },
];

export default function MissionTimeline() {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[800px] glass rounded-2xl p-4 flex items-center justify-between z-10">
      {MISSIONS.map((mission, idx) => (
        <div key={idx} className="flex flex-col items-center group relative cursor-pointer w-32">
          <div className="text-neon-blue font-bold text-lg mb-2">{mission.year}</div>
          
          <div className="relative flex items-center justify-center w-full">
            {/* Timeline Line */}
            {idx !== 0 && <div className="absolute left-[-50%] w-full h-[2px] bg-white/10" />}
            
            {/* Node */}
            <div className="w-4 h-4 rounded-full bg-slate-800 border-2 border-neon-blue z-10 group-hover:scale-150 transition-transform flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-neon-blue rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <h4 className="text-white font-semibold text-sm">{mission.name}</h4>
            <p className="text-slate-400 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute w-full left-0">
              {mission.desc}
            </p>
          </div>
        </div>
      ))}
      
      {/* Decorative Icon */}
      <div className="absolute -top-4 -right-4 bg-purple-600/20 p-3 rounded-full border border-purple-500/30">
        <Rocket className="text-purple-400" size={20} />
      </div>
    </div>
  );
}
