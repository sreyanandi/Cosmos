import React, { useEffect, useState } from 'react';
import { Rocket } from 'lucide-react';

export default function RocketLaunch({ destination, onComplete }: { destination: string, onComplete: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage 0: Prep (2s)
    // Stage 1: Launching (3s)
    // Stage 2: Arrived (2s)
    const t1 = setTimeout(() => setStage(1), 2000);
    const t2 = setTimeout(() => setStage(2), 5000);
    const t3 = setTimeout(() => onComplete(), 8000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Starfield background */}
      <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:20px_20px]" />
      
      <h1 className="text-4xl font-bold text-white mb-12 z-10 uppercase tracking-[0.3em] text-center">
        {stage === 0 && "Initiating Launch Sequence..."}
        {stage === 1 && `Trajectory Set: ${destination}`}
        {stage === 2 && `Approaching ${destination}`}
      </h1>

      <div className="relative w-full h-96 flex items-center justify-center">
        {/* Rocket */}
        <div 
          className="absolute transition-all duration-[3000ms] ease-in-out"
          style={{
            transform: stage === 0 
              ? 'translateY(150px) scale(1)' 
              : stage === 1 
                ? 'translateY(-50px) scale(1.5)' 
                : 'translateY(-300px) scale(0.5)',
            opacity: stage === 2 ? 0 : 1
          }}
        >
          <Rocket size={100} className="text-white drop-shadow-[0_0_20px_#fff]" />
          
          {/* Exhaust flames */}
          {stage > 0 && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-8 h-24 bg-gradient-to-b from-orange-400 via-red-500 to-transparent rounded-full animate-pulse blur-sm" />
          )}
        </div>

        {/* Destination Planet */}
        <div 
          className="absolute transition-all duration-[3000ms] ease-in-out"
          style={{
            transform: stage < 2 ? 'translateY(-400px) scale(0.1)' : 'translateY(0px) scale(2)',
            opacity: stage < 2 ? 0 : 1
          }}
        >
          <div className="w-32 h-32 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.5)] border-4 border-white/20 flex items-center justify-center bg-slate-800">
            <span className="text-xl font-bold text-white">{destination}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
