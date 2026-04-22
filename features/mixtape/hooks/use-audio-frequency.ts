'use client';
import { useEffect, useRef, useState } from 'react';

export function useAudioFrequency(audioElement: HTMLAudioElement | null) {
  const [dataArray, setDataArray] = useState<Uint8Array>(new Uint8Array(32));
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const source = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!audioElement) return;

    // Initialize Audio Context on user interaction
    const initAudio = () => {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyser.current = audioContext.current.createAnalyser();
        analyser.current.fftSize = 256; // Increased resolution for better visualization
        
        try {
          source.current = audioContext.current.createMediaElementSource(audioElement);
          source.current.connect(analyser.current);
          analyser.current.connect(audioContext.current.destination);
        } catch (err) {
          console.error("Failed to create media element source:", err);
        }
      }
    };

    audioElement.addEventListener('play', initAudio);

    const updateFrequency = () => {
      if (analyser.current) {
        const array = new Uint8Array(analyser.current.frequencyBinCount);
        analyser.current.getByteFrequencyData(array);
        setDataArray(new Uint8Array(array)); // Copy to trigger state update
      }
      animationRef.current = requestAnimationFrame(updateFrequency);
    };

    updateFrequency();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      audioElement.removeEventListener('play', initAudio);
    };
  }, [audioElement]);

  return dataArray;
}
