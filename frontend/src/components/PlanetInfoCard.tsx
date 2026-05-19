import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, Globe, Scale } from 'lucide-react';

interface PlanetInfo {
  name: string;
  mass: string;
  gravity: string;
  description: string;
}

const PLANET_DETAILS: Record<string, PlanetInfo> = {
  Sun: { name: 'Sun', mass: '1.989 × 10^30 kg', gravity: '274 m/s²', description: 'The star around which the Earth and other planets orbit.' },
  Mercury: { name: 'Mercury', mass: '3.285 × 10^23 kg', gravity: '3.7 m/s²', description: 'The smallest planet in our solar system and nearest to the Sun.' },
  Venus: { name: 'Venus', mass: '4.867 × 10^24 kg', gravity: '8.87 m/s²', description: 'Often called "Earth\'s twin" because they are similar in size and structure, but Venus has extreme surface heat.' },
  Earth: { name: 'Earth', mass: '5.972 × 10^24 kg', gravity: '9.807 m/s²', description: 'Our home planet is the only place we know of so far that\'s inhabited by living things.' },
  Mars: { name: 'Mars', mass: '6.39 × 10^23 kg', gravity: '3.721 m/s²', description: 'A dusty, cold, desert world with a very thin atmosphere.' },
  Jupiter: { name: 'Jupiter', mass: '1.898 × 10^27 kg', gravity: '24.79 m/s²', description: 'More than twice as massive than the other planets of our solar system combined.' },
  Saturn: { name: 'Saturn', mass: '5.683 × 10^26 kg', gravity: '10.44 m/s²', description: 'Adorned with a dazzling, complex system of icy rings.' },
};

interface PlanetInfoCardProps {
  planetName: string;
  onClose: () => void;
}

export default function PlanetInfoCard({ planetName, onClose }: PlanetInfoCardProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const details = PLANET_DETAILS[planetName];

  useEffect(() => {
    // NASA API Integration: fetching an image for the planet
    // We'll use the NASA images library search
    const fetchImage = async () => {
      try {
        const res = await fetch(`https://images-api.nasa.gov/search?q=${planetName}&media_type=image`);
        const data = await res.json();
        if (data.collection?.items?.length > 0) {
          const item = data.collection.items[0];
          setImageUrl(item.links[0].href);
        }
      } catch (err) {
        console.error('Error fetching NASA image:', err);
      }
    };

    if (planetName) {
      fetchImage();
    }
  }, [planetName]);

  return (
    <AnimatePresence>
      {planetName && details && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute left-8 top-1/2 -translate-y-1/2 w-80 glass rounded-2xl overflow-hidden shadow-2xl shadow-cyan-900/20 z-10"
        >
          {/* Header Image */}
          <div className="h-48 bg-slate-800 relative w-full overflow-hidden">
            {imageUrl ? (
              <img src={imageUrl} alt={planetName} className="w-full h-full object-cover opacity-80" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">Loading NASA Asset...</div>
            )}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 p-2 rounded-full backdrop-blur-md transition-colors"
            >
              <X size={16} className="text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <h2 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
              <Globe className="text-neon-blue" size={24} />
              {details.name}
            </h2>
            <div className="w-12 h-1 bg-neon-blue rounded-full mb-4"></div>
            
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              {details.description}
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-black/30 p-3 rounded-lg border border-white/5">
                <Scale className="text-purple-400" size={18} />
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Mass</div>
                  <div className="text-sm font-medium">{details.mass}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-black/30 p-3 rounded-lg border border-white/5">
                <Info className="text-cyan-400" size={18} />
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Gravity</div>
                  <div className="text-sm font-medium">{details.gravity}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
