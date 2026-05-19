import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Cpu, RefreshCcw, Eye, ShieldAlert, Activity } from 'lucide-react';

interface ApodData {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  date: string;
  media_type: string;
}

export default function NasaApod() {
  const [data, setData] = useState<ApodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    const fetchApod = async () => {
      try {
        setLoading(true);
        // Using DEMO_KEY for NASA APOD API
        const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const json = await res.json();
        if (json.error || !json.url || !json.title) {
          throw new Error(json.error?.message || 'Invalid APOD payload structure');
        }
        setData(json);
        setIsFallback(false);
      } catch (err) {
        console.warn('NASA APOD telemetry disrupted, loading deep-space archival backup:', err);
        setData({
          title: "The Majestic Carina Nebula",
          explanation: "This dramatic view of the Carina Nebula, a gargantuan star-forming region located approximately 7,600 light-years away, showcases towering pillars of dust and glowing gas illuminated by the intense radiation of newborn stars. Captured in pristine clarity, these cosmic clouds serve as stellar nurseries where massive star systems are born, mature, and eventually explode as spectacular supernovae.",
          url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1200",
          date: new Date().toISOString().split('T')[0],
          media_type: "image"
        });
        setIsFallback(true);
      } finally {
        setLoading(false);
      }
    };
    fetchApod();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 flex flex-col items-center justify-center gap-4 text-slate-400 bg-slate-950/20 rounded-3xl border border-white/5 h-80 font-mono">
        <Activity className="w-8 h-8 text-neon-blue animate-pulse" />
        <span className="text-sm font-bold uppercase tracking-widest animate-pulse">Decrypting Deep-Space Telescope Capture...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 flex flex-col items-center justify-center gap-4 text-red-400 bg-slate-950/20 rounded-3xl border border-red-500/20 h-80 font-mono">
        <ShieldAlert className="w-8 h-8" />
        <span className="text-sm font-bold uppercase tracking-widest">Failed to decrypt telescope feed. Check uplink protocols.</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-2 pointer-events-auto relative z-10 text-slate-100">
      
      {/* Outer Holographic Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-white/5 overflow-hidden shadow-2xl bg-slate-950/40 relative">
        
        {/* Media Frame Grid (APOD Image / Video) */}
        <div className="lg:col-span-7 h-[300px] lg:h-[500px] relative bg-black flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-white/5">
          {data.media_type === 'image' ? (
            <>
              {/* Actual Image */}
              <img 
                src={data.url} 
                alt={data.title} 
                className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-1000 hover:scale-105"
              />
              
              {/* Sci-Fi HUD Crosshair Overlays */}
              <div className="absolute inset-4 border border-white/5 pointer-events-none rounded-xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-12 h-12 border border-neon-blue/40 rounded-full animate-ping" />
                <div className="w-2 h-2 bg-neon-blue rounded-full absolute top-5 left-5 shadow-[0_0_8px_#00f0ff]" />
              </div>
              
              {/* Corner tech indicators */}
              <div className="absolute top-8 left-8 text-[9px] font-mono text-neon-blue/60 uppercase tracking-widest pointer-events-none">
                SEC: {isFallback ? 'ARCHIVE_RECOVERY' : 'DSC_DEC.9912'} <br />
                RESOLUTION: {isFallback ? 'TELEMETRY_EMULATED' : 'RAW_HDR'}
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Cpu className="text-neon-blue w-10 h-10 animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-widest font-bold">Deep Space Video Broadcast Detected</span>
              <a 
                href={data.url} 
                target="_blank" 
                rel="noreferrer"
                className="px-4 py-2 border border-neon-blue/20 bg-neon-blue/10 hover:bg-neon-blue text-neon-blue hover:text-black font-extrabold rounded-lg tracking-wider text-xs uppercase transition-all duration-300"
              >
                Launch External Feed
              </a>
            </div>
          )}
        </div>

        {/* Telemetry metadata Explanatory Box */}
        <div className="lg:col-span-5 p-8 flex flex-col justify-between max-h-[500px] overflow-y-auto custom-scrollbar bg-slate-900/10 backdrop-blur-2xl">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="p-1.5 bg-neon-blue/10 rounded border border-neon-blue/25 text-neon-blue">
                <Image size={14} />
              </span>
              <span className="text-[10px] text-neon-blue font-black tracking-widest uppercase">
                {isFallback ? 'Archival Astrometric Data' : 'Astrometric Signal Intel'}
              </span>
            </div>

            <h2 className="text-2xl font-black text-white leading-tight mb-2 tracking-wide uppercase">{data.title}</h2>
            <div className="text-slate-400 font-mono text-xs tracking-wider mb-6 flex items-center gap-2">
              <span>Timestamp: {data.date}</span>
              {isFallback ? (
                <span className="text-amber-500 font-black animate-pulse">• archival backup</span>
              ) : (
                <span className="text-emerald-500 font-black">• decrypted</span>
              )}
            </div>
            
            <p className="text-slate-300 text-sm leading-relaxed font-light font-sans text-justify">
              {data.explanation}
            </p>
          </div>

          <div className="border-t border-white/5 pt-6 mt-8 flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <span>NASA Planetary Feed</span>
            <span>Uplink Secure</span>
          </div>
        </div>

      </div>

    </div>
  );
}
