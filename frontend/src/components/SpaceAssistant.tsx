import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Satellite, AlertCircle, RefreshCw, Radio } from 'lucide-react';

export default function SpaceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai'; text: string}[]>([
    { role: 'ai', text: 'Telemetry Uplink established. I am your ORACLE Intelligence Drone. Ask me any planetary questions or timeline specifications, Commander.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();

      setTimeout(() => {
        setIsTyping(false);
        if (data.reply) {
          setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
        } else if (res.status === 429) {
          setMessages(prev => [...prev, { role: 'ai', text: '⚠️ Telemetry bandwidth exhausted. API quota reached — the system is retrying automatically. Please stand by, Commander.' }]);
        } else {
          setMessages(prev => [...prev, { role: 'ai', text: `⚠️ Signal disrupted: ${data.error ?? 'Unknown anomaly detected.'}` }]);
        }
      }, 1000);
    } catch (error) {
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { role: 'ai', text: '🔴 Uplink severed. Ensure the Cosmos backend is running on port 3001 and retry transmission.' }]);
      }, 1000);
    }
  };

  return (
    <>
      {/* High-tech Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="absolute bottom-8 right-8 p-4 rounded-full border border-neon-blue bg-slate-950/60 text-neon-blue shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:scale-105 transition-all duration-300 group z-40 cursor-pointer backdrop-blur-md pointer-events-auto"
        title="Open Space Communications Drone"
      >
        <Satellite className="group-hover:rotate-12 transition-transform text-neon-blue" size={24} />
      </button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-24 right-8 w-96 h-[460px] rounded-3xl flex flex-col overflow-hidden shadow-2xl border border-white/5 bg-slate-950/80 backdrop-blur-2xl z-40 pointer-events-auto"
          >
            {/* Holographic scanner top gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-blue via-indigo-500 to-purple-500 shadow-[0_1px_10px_#00f0ff]" />

            {/* Header */}
            <div className="bg-black/50 p-4 flex items-center justify-between border-b border-white/5 mt-1">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500 relative border border-white/20" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-widest text-white">ORACLE AI v2.8</h3>
                  <span className="text-[10px] uppercase font-mono text-neon-blue font-bold tracking-widest block mt-0.5">Uplink Active</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-full cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Feed area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 flex flex-col custom-scrollbar bg-slate-900/5">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                    msg.role === 'user' 
                      ? 'bg-neon-blue/15 border border-neon-blue/30 text-white self-end rounded-tr-none' 
                      : 'bg-white/5 border border-white/5 text-slate-300 self-start rounded-tl-none'
                  }`}
                >
                  <p className="font-sans font-light">{msg.text}</p>
                </div>
              ))}
              
              {/* Typing simulation dots */}
              {isTyping && (
                <div className="bg-white/5 border border-white/5 text-slate-300 self-start rounded-2xl rounded-tl-none p-4 max-w-[85%] flex items-center gap-1.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-neon-blue animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-neon-blue animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-neon-blue animate-bounce" />
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Futuristic Input Dock */}
            <div className="p-4 bg-black/60 border-t border-white/5 flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Transmit cosmic telemetry prompt..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-slate-500 px-3 py-2 rounded-xl focus:bg-white/5 transition-colors font-mono font-medium"
              />
              <button 
                onClick={handleSend}
                disabled={isTyping}
                className="bg-neon-blue/25 hover:bg-neon-blue/50 text-neon-blue border border-neon-blue/20 p-3 rounded-xl transition-all duration-300 flex items-center justify-center cursor-pointer disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
