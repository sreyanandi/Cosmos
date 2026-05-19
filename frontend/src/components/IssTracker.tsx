import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Globe, Navigation, Radio, Compass, ShieldAlert } from 'lucide-react';

// Custom pulsing radar satellite marker icon using DivIcon
const satelliteIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-10 h-10 rounded-full bg-[#00f0ff]/30 animate-ping"></div>
      <div class="absolute w-6 h-6 rounded-full bg-[#00f0ff]/50 animate-pulse"></div>
      <div class="relative w-4.5 h-4.5 rounded-full bg-[#00f0ff] border border-white shadow-[0_0_12px_#00f0ff]"></div>
    </div>
  `,
  className: 'custom-satellite-icon',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

interface IssPosition {
  latitude: number;
  longitude: number;
  velocity: number;
  altitude: number;
}

export default function IssTracker() {
  const [position, setPosition] = useState<IssPosition | null>(null);
  const [locationName, setLocationName] = useState<string>('LOCKING SATELLITE VECTOR...');

  useEffect(() => {
    const fetchIss = async () => {
      try {
        const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        const data = await res.json();
        setPosition({
          latitude: data.latitude,
          longitude: data.longitude,
          velocity: data.velocity,
          altitude: data.altitude
        });

        // Reverse Geocoding with custom User-Agent to comply with Nominatim Policy
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${data.latitude}&lon=${data.longitude}&format=json&zoom=3`,
            {
              headers: {
                'User-Agent': 'SpaceExplorerTelemetry/1.0 (contact: info@spaceexplorer.net)'
              }
            }
          );
          const geoData = await geoRes.json();
          
          if (geoData.error) {
            setLocationName('ORBITING BEYOND DECLARED SECTORS');
          } else {
            const place = geoData.address?.country || geoData.name || 'DEEP SPACE';
            setLocationName(`TRANSMITTING OVER: ${place.toUpperCase()}`);
          }
        } catch (geoErr) {
          setLocationName('ORBITING SECTOR: DEEP OCEAN VECT');
        }

      } catch (err) {
        console.error('Error fetching ISS data:', err);
      }
    };

    fetchIss();
    const interval = setInterval(fetchIss, 5000); // 5s telemetry loop
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto py-2 pointer-events-auto relative z-10 text-slate-100">
      
      {/* Telemetry Control Header Panel */}
      <div className="bg-slate-950/40 p-6 rounded-t-3xl border-t border-x border-white/5 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-3">
          <div className="p-3 bg-neon-blue/10 rounded-xl border border-neon-blue/20">
            <Radio size={24} className="text-neon-blue animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-widest text-white">ISS Telemetry Feed</h2>
            <p className="text-xs font-mono text-neon-blue font-bold tracking-wider mt-1">{locationName}</p>
          </div>
        </div>
        
        {position && (
          <div className="flex flex-wrap gap-4 text-xs font-mono">
            <div className="bg-black/50 px-4 py-2.5 rounded-lg border border-white/5 flex flex-col">
              <span className="text-slate-500 uppercase font-black text-[10px] tracking-widest mb-0.5">Altitude</span>
              <span className="text-white font-extrabold">{Math.round(position.altitude)} KM</span>
            </div>
            <div className="bg-black/50 px-4 py-2.5 rounded-lg border border-white/5 flex flex-col">
              <span className="text-slate-500 uppercase font-black text-[10px] tracking-widest mb-0.5">Velocity</span>
              <span className="text-neon-blue font-extrabold">{Math.round(position.velocity)} KM/H</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Map Container */}
      <div className="w-full h-[400px] relative border-b border-x border-white/5 rounded-b-3xl overflow-hidden shadow-2xl">
        {position ? (
          <MapContainer 
            center={[position.latitude, position.longitude]} 
            zoom={3} 
            scrollWheelZoom={false}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <Marker position={[position.latitude, position.longitude]} icon={satelliteIcon}>
              <Popup>
                <div className="bg-slate-900 text-white p-2 font-mono text-xs rounded border border-white/10">
                  <span className="text-neon-blue font-bold block mb-1">ISS Core Telemetry</span>
                  Lat: {position.latitude.toFixed(4)}<br />
                  Lon: {position.longitude.toFixed(4)}<br />
                  Alt: {Math.round(position.altitude)} KM<br />
                  Vel: {Math.round(position.velocity)} KM/H
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-950/80 gap-3 border border-white/5">
            <Radio size={36} className="text-neon-blue animate-spin" />
            <span className="text-sm font-mono tracking-widest font-bold uppercase animate-pulse">Establishing Satellite Uplink...</span>
          </div>
        )}
      </div>

      {/* Auxiliary Coordinate Feed readout */}
      {position && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 flex items-center gap-3">
            <Globe className="text-neon-blue w-5 h-5 flex-shrink-0" />
            <div>
              <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest block">Latitude</span>
              <span className="font-mono text-sm font-bold text-slate-200">{position.latitude.toFixed(5)}°</span>
            </div>
          </div>
          
          <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 flex items-center gap-3">
            <Navigation className="text-neon-blue w-5 h-5 flex-shrink-0" />
            <div>
              <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest block">Longitude</span>
              <span className="font-mono text-sm font-bold text-slate-200">{position.longitude.toFixed(5)}°</span>
            </div>
          </div>

          <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 flex items-center gap-3 col-span-2">
            <Compass className="text-amber-500 w-5 h-5 flex-shrink-0" />
            <div>
              <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest block">Active Telemetry Stream</span>
              <span className="font-mono text-xs text-slate-300">RECEIVING CONTINUOUS 5.0s TELEMETRY BURSTS</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
