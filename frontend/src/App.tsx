import SoundManager from './components/SoundManager';
import { useSpaceContext } from './context/SpaceContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Suspense, lazy } from 'react';
import './App.css';

const SolarSystem = lazy(() => import('./components/SolarSystem'));
const SpaceAssistant = lazy(() => import('./components/SpaceAssistant'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const PlanetDetailView = lazy(() => import('./components/PlanetDetailView'));
const StorytellingView = lazy(() => import('./components/StorytellingView'));

function CosmosLoader() {
  return (
    <div className="space-loader">
      <div className="space-loader-ring" />
      <span style={{ fontSize: '0.75rem', color: '#00f0ff', letterSpacing: '0.2em' }}>INITIALIZING COSMOS</span>
    </div>
  );
}

function App() {
  const { appMode, selectedEntity } = useSpaceContext();

  return (
    <main className="relative w-full h-screen overflow-hidden bg-transparent">
      <SoundManager />

      <AnimatePresence mode="wait">
        {appMode === 'scroll' && (
          <Suspense fallback={<CosmosLoader />}>
            <motion.div
              key="scroll"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="absolute inset-0"
            >
              <SolarSystem />
            </motion.div>
          </Suspense>
        )}

        {appMode === 'dashboard' && (
          <Suspense fallback={null}>
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-20"
            >
              <Dashboard />
            </motion.div>
          </Suspense>
        )}

        {appMode === 'storytelling' && (
          <Suspense fallback={null}>
            <StorytellingView key="storytelling" />
          </Suspense>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        {selectedEntity && appMode !== 'storytelling' && (
          <PlanetDetailView key="planet-detail" />
        )}
      </Suspense>

      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        className="absolute top-0 left-0 w-full p-8 z-30 pointer-events-none"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              boxShadow: [
                '0px 0px 0px rgba(0,240,255,0)',
                '0px 0px 15px rgba(0,240,255,0.5)',
                '0px 0px 0px rgba(0,240,255,0)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="bg-neon-blue/20 p-2 rounded-full border border-neon-blue/30 backdrop-blur-md overflow-hidden"
          >
            <img
              src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=80"
              alt="Cosmos Logo"
              loading="eager"
              className="w-8 h-8 rounded-full object-cover shadow-inner"
            />
          </motion.div>

          <div>
            <h1 className="text-2xl font-bold tracking-widest text-white uppercase drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]">
              Cosmos Explorer
            </h1>
            <p className="text-sm tracking-[0.2em] text-slate-400 uppercase">
              Interactive Solar System
            </p>
          </div>
        </div>
      </motion.header>

      <Suspense fallback={null}>
        <div className="absolute inset-0 pointer-events-none z-40">
          <SpaceAssistant />
        </div>
      </Suspense>

      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)] z-10" />
    </main>
  );
}

export default App;