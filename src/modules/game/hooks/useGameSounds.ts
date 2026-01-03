import { useRef, useCallback, useEffect } from 'react';

export function useGameSounds() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Initialize audio context
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.gain.value = 0.3; // Master volume
      masterGainRef.current.connect(audioContextRef.current.destination);
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Laser shot sound (pew pew)
  const playLaserShot = useCallback(() => {
    if (!audioContextRef.current || !masterGainRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // Oscillator for the main tone
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(masterGainRef.current);

    // Frequency sweep from high to low (pew sound)
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.1);

    // Volume envelope
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    oscillator.type = 'square';
    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }, []);

  // Horizontal laser sound (lightsaber-style sustained hum)
  const playHorizontalLaser = useCallback(() => {
    if (!audioContextRef.current || !masterGainRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    const duration = 0.5; // Match laser duration

    // Create multiple oscillators for rich lightsaber sound
    const oscillator1 = ctx.createOscillator();
    const oscillator2 = ctx.createOscillator();
    const oscillator3 = ctx.createOscillator();
    
    // Add LFO (Low Frequency Oscillator) for the characteristic hum/wobble
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Connect LFO to create frequency modulation
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator1.frequency);
    lfoGain.connect(oscillator2.frequency);
    
    oscillator1.connect(filter);
    oscillator2.connect(filter);
    oscillator3.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(masterGainRef.current);

    // Lightsaber base frequencies (lower, more menacing)
    oscillator1.frequency.setValueAtTime(180, now);
    oscillator2.frequency.setValueAtTime(360, now); // Octave above
    oscillator3.frequency.setValueAtTime(90, now);  // Octave below
    
    // LFO for the characteristic hum/wobble
    lfo.frequency.setValueAtTime(6, now); // 6 Hz wobble
    lfoGain.gain.setValueAtTime(15, now); // Modulation depth

    // Band-pass filter for that "energy beam" quality
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.Q.setValueAtTime(2, now);

    // Volume envelope - sustained with quick attack and release
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.05); // Quick attack
    gainNode.gain.setValueAtTime(0.5, now + duration - 0.1); // Sustain
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration); // Quick release

    // Waveforms for rich harmonic content
    oscillator1.type = 'sawtooth';
    oscillator2.type = 'square';
    oscillator3.type = 'sawtooth';
    lfo.type = 'sine';
    
    oscillator1.start(now);
    oscillator2.start(now);
    oscillator3.start(now);
    lfo.start(now);
    
    oscillator1.stop(now + duration);
    oscillator2.stop(now + duration);
    oscillator3.stop(now + duration);
    lfo.stop(now + duration);
  }, []);

  // Explosion sound
  const playExplosion = useCallback(() => {
    if (!audioContextRef.current || !masterGainRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // Noise generator for explosion
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();

    noise.buffer = buffer;
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(masterGainRef.current);

    // Low-pass filter for bass-heavy explosion
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.3);

    // Volume envelope
    gainNode.gain.setValueAtTime(0.5, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    noise.start(now);
    noise.stop(now + 0.3);
  }, []);

  // Hit/damage sound
  const playHit = useCallback(() => {
    if (!audioContextRef.current || !masterGainRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(masterGainRef.current);

    // Sharp, low frequency for impact
    oscillator.frequency.setValueAtTime(100, now);
    oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.15);

    gainNode.gain.setValueAtTime(0.4, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    oscillator.type = 'sawtooth';
    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }, []);

  // Power-up/deploy sound
  const playDeploy = useCallback(() => {
    if (!audioContextRef.current || !masterGainRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(masterGainRef.current);

    // Rising frequency for positive feedback
    oscillator.frequency.setValueAtTime(200, now);
    oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.2);

    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    oscillator.type = 'sine';
    oscillator.start(now);
    oscillator.stop(now + 0.2);
  }, []);

  // Level up sound
  const playLevelUp = useCallback(() => {
    if (!audioContextRef.current || !masterGainRef.current) return;

    const ctx = audioContextRef.current;
    const masterGain = masterGainRef.current;
    const now = ctx.currentTime;

    // Play a chord progression
    const frequencies = [523.25, 659.25, 783.99]; // C, E, G (C major chord)
    
    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(masterGain);

      oscillator.frequency.setValueAtTime(freq, now + index * 0.1);
      
      gainNode.gain.setValueAtTime(0, now + index * 0.1);
      gainNode.gain.linearRampToValueAtTime(0.15, now + index * 0.1 + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.1 + 0.3);

      oscillator.type = 'sine';
      oscillator.start(now + index * 0.1);
      oscillator.stop(now + index * 0.1 + 0.3);
    });
  }, []);

  // Nebula spawn warning sound
  const playNebulaWarning = useCallback(() => {
    if (!audioContextRef.current || !masterGainRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(masterGainRef.current);

    // Pulsing warning tone
    oscillator.frequency.setValueAtTime(440, now);
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.setValueAtTime(0.05, now + 0.1);
    gainNode.gain.setValueAtTime(0.2, now + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    oscillator.type = 'triangle';
    oscillator.start(now);
    oscillator.stop(now + 0.3);
  }, []);

  return {
    playLaserShot,
    playHorizontalLaser,
    playExplosion,
    playHit,
    playDeploy,
    playLevelUp,
    playNebulaWarning,
  };
}
