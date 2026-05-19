import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Zap, HelpCircle, Eye, RefreshCw, Trophy, ShieldAlert } from 'lucide-react';

const QUESTIONS = [
  { 
    q: "What is the largest planet in our solar system?", 
    options: ["Earth", "Saturn", "Jupiter", "Neptune"], 
    a: 2,
    hint: "AstroBot Scan: It is famous for its massive gravity and the swirling giant Red Spot!"
  },
  { 
    q: "Which planet is known as the Red Planet?", 
    options: ["Mars", "Venus", "Jupiter", "Mercury"], 
    a: 0,
    hint: "AstroBot Scan: It has rusty iron-rich soil and home to the massive volcano Olympus Mons!" 
  },
  { 
    q: "How many moons does Earth have?", 
    options: ["0", "1", "2", "79"], 
    a: 1,
    hint: "AstroBot Scan: It stabilizes our planet's axial tilt and was visited by Apollo astronauts." 
  },
  { 
    q: "What is the name of our galaxy?", 
    options: ["Andromeda", "Whirlpool", "Milky Way", "Sombrero"], 
    a: 2,
    hint: "AstroBot Scan: It's structured as a barred spiral and named after a creamy cosmic path." 
  },
  { 
    q: "Which planet has the most extensive ring system?", 
    options: ["Uranus", "Jupiter", "Neptune", "Saturn"], 
    a: 3,
    hint: "AstroBot Scan: It is a gas giant orbited by billions of glistening ice and rock particles!" 
  },
  { 
    q: "What is the hottest planet in the Solar System?", 
    options: ["Mercury", "Venus", "Mars", "Jupiter"], 
    a: 1,
    hint: "AstroBot Scan: Runaway carbon dioxide gas traps immense heat, baking its hellish sulfuric surface!"
  },
  { 
    q: "How long does it take for solar photons to reach Earth?", 
    options: ["8 seconds", "8 minutes", "8 hours", "8 days"], 
    a: 1,
    hint: "AstroBot Scan: Light travels at ~300,000 km/s and bridges our 150-million km distance in this duration."
  }
];

export default function SpaceQuiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  
  // Lifelines
  const [used5050, setUsed5050] = useState(false);
  const [usedScan, setUsedScan] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  const [scanActive, setScanActive] = useState(false);

  // Selected Option States
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);

  useEffect(() => {
    if (showResult || isAnswering) return;

    setTimeLeft(15);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQ, showResult, isAnswering]);

  const handleTimeout = () => {
    setIsAnswering(true);
    setSelectedAns(-1); // Mark as timeout
    setStreak(0);
    setScanActive(false);

    setTimeout(() => {
      goToNext();
    }, 2000);
  };

  const handleAnswer = (index: number) => {
    if (isAnswering) return;
    setIsAnswering(true);
    setSelectedAns(index);
    setScanActive(false);

    const isCorrect = index === QUESTIONS[currentQ].a;
    if (isCorrect) {
      setScore(prev => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      // Points calculation based on time left + streak multiplier
      const calculatedPoints = Math.round((100 + timeLeft * 10) * (1 + newStreak * 0.2));
      setPoints(prev => prev + calculatedPoints);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      goToNext();
    }, 2000);
  };

  const goToNext = () => {
    setSelectedAns(null);
    setIsAnswering(false);
    setDisabledOptions([]);
    
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  // 50:50 Lifeline
  const trigger5050 = () => {
    if (used5050 || isAnswering) return;
    setUsed5050(true);
    const correctIdx = QUESTIONS[currentQ].a;
    const incorrectIdxs = [0, 1, 2, 3].filter(idx => idx !== correctIdx);
    
    // Pick two random incorrect indices to disable
    const disabled: number[] = [];
    while (disabled.length < 2) {
      const randomIdx = incorrectIdxs[Math.floor(Math.random() * incorrectIdxs.length)];
      if (!disabled.includes(randomIdx)) {
        disabled.push(randomIdx);
      }
    }
    setDisabledOptions(disabled);
  };

  // AstroBot Deep Scan Lifeline
  const triggerScan = () => {
    if (usedScan || isAnswering) return;
    setUsedScan(true);
    setScanActive(true);
  };

  const reset = () => {
    setCurrentQ(0);
    setScore(0);
    setPoints(0);
    setStreak(0);
    setShowResult(false);
    setUsed5050(false);
    setUsedScan(false);
    setDisabledOptions([]);
    setScanActive(false);
    setSelectedAns(null);
    setIsAnswering(false);
  };

  const getRank = () => {
    const percentage = (score / QUESTIONS.length) * 100;
    if (percentage === 100) return { title: "Grand Galactic Fleet Commander", color: "text-[#00f0ff] drop-shadow-[0_0_8px_#00f0ff]", desc: "Flawless mission parameters! You possess deep understanding of the outer systems." };
    if (percentage >= 70) return { title: "Stellar System Navigator", color: "text-[#d97706]", desc: "Superb execution, Commander! Your astrometric parameters are highly detailed." };
    if (percentage >= 40) return { title: "Junior Space Cadet", color: "text-[#3b82f6]", desc: "A great launch into orbit. Continue study at the solar archives!" };
    return { title: "Cosmic Voyager Trainee", color: "text-slate-400", desc: "Engine thrusters offline. Return to mission control and try again!" };
  };

  if (showResult) {
    const rank = getRank();
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center max-w-xl mx-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="glass-premium p-8 rounded-3xl border border-white/10 w-full bg-slate-950/60 shadow-[0_0_30px_rgba(0,240,255,0.15)] relative overflow-hidden"
        >
          {/* Certificate visual lines */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,240,255,0.08),transparent_70%)] pointer-events-none" />
          
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
          
          <h2 className="text-4xl font-black text-white uppercase tracking-wider mb-2">Quiz Concluded</h2>
          <p className="text-slate-400 tracking-widest uppercase text-xs mb-8">Official Flight Credentials</p>
          
          <div className="bg-black/40 p-6 rounded-2xl border border-white/5 mb-8">
            <span className="text-xs uppercase text-slate-500 tracking-widest font-semibold block mb-1">Earned Rank</span>
            <h3 className={`text-2xl font-black uppercase tracking-wider ${rank.color} mb-3`}>{rank.title}</h3>
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm mx-auto">{rank.desc}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
              <span className="text-xs text-slate-500 uppercase tracking-wider">Correct Answers</span>
              <p className="text-2xl font-black text-white mt-1">{score} / {QUESTIONS.length}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
              <span className="text-xs text-slate-500 uppercase tracking-wider">Total Points</span>
              <p className="text-2xl font-black text-neon-blue mt-1">{points}</p>
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            className="w-full py-4 bg-neon-blue/20 text-neon-blue border border-neon-blue hover:bg-neon-blue hover:text-black font-extrabold tracking-widest uppercase transition-all duration-300 rounded-full flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] cursor-pointer"
          >
            <RefreshCw size={18} /> Initiate New Mission
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = QUESTIONS[currentQ];
  const progressPercent = ((currentQ) / QUESTIONS.length) * 100;

  return (
    <div className="max-w-3xl mx-auto py-4 relative z-10 text-slate-100">
      
      {/* HUD Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-xs uppercase text-slate-500 font-bold tracking-widest block mb-1">Sector Progress</span>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black tracking-wider text-slate-200">Question {currentQ + 1} of {QUESTIONS.length}</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-xs uppercase text-slate-500 font-bold tracking-widest block mb-1">Streak</span>
            <div className="flex items-center justify-end gap-1.5 text-orange-500 font-extrabold">
              <Zap size={16} className={streak > 0 ? "animate-pulse" : "opacity-40"} />
              <span className="text-lg">{streak}x</span>
            </div>
          </div>
          
          <div className="text-right">
            <span className="text-xs uppercase text-slate-500 font-bold tracking-widest block mb-1">Points</span>
            <span className="text-xl font-black text-neon-blue tracking-wider">{points}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-8 border border-white/5">
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-500 to-neon-blue rounded-full shadow-[0_0_8px_#00f0ff]" 
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Timer Bar / Alert */}
      <div className="flex items-center gap-3 mb-6 bg-slate-950/30 p-3 rounded-xl border border-white/5">
        <Timer size={20} className={timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-neon-blue"} />
        <span className="text-xs text-slate-400 font-bold tracking-wider uppercase">System Timer</span>
        <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full rounded-full ${timeLeft <= 5 ? "bg-red-500" : "bg-neon-blue"}`}
            initial={{ width: "100%" }}
            animate={{ width: `${(timeLeft / 15) * 100}%` }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </div>
        <span className={`font-black w-6 text-right ${timeLeft <= 5 ? "text-red-500 animate-ping" : "text-neon-blue"}`}>{timeLeft}s</span>
      </div>

      {/* Question Panel */}
      <div className="bg-slate-950/40 p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/5 rounded-full blur-3xl pointer-events-none" />
        
        <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-8 tracking-wide leading-snug">{currentQuestion.q}</h3>
        
        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((opt, i) => {
            const isDisabled = disabledOptions.includes(i);
            const isCorrect = i === currentQuestion.a;
            const isSelected = selectedAns === i;
            
            let btnClass = "border-slate-800 bg-slate-950/50 text-slate-300 hover:border-neon-blue/50 hover:bg-neon-blue/5";

            if (isAnswering) {
              if (isSelected) {
                if (isCorrect) {
                  btnClass = "border-green-500 bg-green-500/10 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.2)]";
                } else {
                  btnClass = "border-red-500 bg-red-500/10 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-shake";
                }
              } else if (isCorrect) {
                btnClass = "border-green-500/50 bg-green-500/5 text-green-400";
              } else {
                btnClass = "border-slate-900 bg-slate-950/20 text-slate-600 opacity-40";
              }
            } else if (scanActive && isCorrect) {
              btnClass = "border-yellow-500 bg-yellow-500/5 text-yellow-200 shadow-[0_0_12px_rgba(234,179,8,0.2)] animate-pulse";
            }

            if (isDisabled) {
              return (
                <div key={i} className="p-5 rounded-2xl border border-slate-950 bg-slate-950/20 text-slate-700 select-none flex items-center justify-center opacity-25">
                  DATA EXCLUDED
                </div>
              );
            }

            return (
              <motion.button
                whileHover={!isAnswering ? { scale: 1.02 } : {}}
                whileTap={!isAnswering ? { scale: 0.98 } : {}}
                key={i}
                disabled={isAnswering}
                onClick={() => handleAnswer(i)}
                className={`p-5 text-left rounded-2xl border text-lg font-bold transition-all duration-300 flex justify-between items-center cursor-pointer ${btnClass}`}
              >
                <span>{opt}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Lifelines Bar */}
      <div className="flex gap-4 items-center">
        <span className="text-xs uppercase text-slate-500 font-bold tracking-widest">Tactical Lifelines:</span>
        
        {/* 50:50 Lifeline Button */}
        <motion.button
          whileHover={!used5050 && !isAnswering ? { scale: 1.05 } : {}}
          whileTap={!used5050 && !isAnswering ? { scale: 0.95 } : {}}
          onClick={trigger5050}
          disabled={used5050 || isAnswering}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            used5050 
              ? 'border-slate-900 text-slate-600 opacity-45' 
              : 'border-purple-500/40 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500'
          }`}
        >
          <HelpCircle size={14} /> 50:50
        </motion.button>

        {/* AstroBot Scan Lifeline Button */}
        <motion.button
          whileHover={!usedScan && !isAnswering ? { scale: 1.05 } : {}}
          whileTap={!usedScan && !isAnswering ? { scale: 0.95 } : {}}
          onClick={triggerScan}
          disabled={usedScan || isAnswering}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            usedScan 
              ? 'border-slate-900 text-slate-600 opacity-45' 
              : 'border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500'
          }`}
        >
          <Eye size={14} /> AstroBot Scan
        </motion.button>
      </div>

      {/* Diagnostic Scan Output */}
      <AnimatePresence>
        {scanActive && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 text-yellow-300 text-sm flex gap-3 items-center backdrop-blur-md"
          >
            <Zap className="text-yellow-400 w-5 h-5 flex-shrink-0 animate-bounce" />
            <p className="font-light italic leading-relaxed">{currentQuestion.hint}</p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
