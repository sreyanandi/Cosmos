import React, { useEffect, useRef } from 'react';
import { useSpaceContext } from '../context/SpaceContext';

export default function SoundManager() {
  const { audioEnabled } = useSpaceContext();
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (audioEnabled) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create an oscillator for a deep space drone
        oscillatorRef.current = audioCtxRef.current.createOscillator();
        oscillatorRef.current.type = 'sine';
        oscillatorRef.current.frequency.setValueAtTime(55, audioCtxRef.current.currentTime); // Low frequency
        
        // Create a gain node for volume control
        gainNodeRef.current = audioCtxRef.current.createGain();
        gainNodeRef.current.gain.setValueAtTime(0.1, audioCtxRef.current.currentTime); // Low volume
        
        oscillatorRef.current.connect(gainNodeRef.current);
        gainNodeRef.current.connect(audioCtxRef.current.destination);
        
        oscillatorRef.current.start();
      }
      
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    } else {
      if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
        audioCtxRef.current.suspend();
      }
    }

    return () => {
      // Cleanup on unmount
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch (e) {}
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, [audioEnabled]);

  return null; // This component doesn't render anything visually
}
