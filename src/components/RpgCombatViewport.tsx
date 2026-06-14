"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useGamification } from '@/context/gamification-context';
import { Volume2, VolumeX, Shield, Swords, Sparkles, HelpCircle, Briefcase, Zap, RotateCcw } from 'lucide-react';
import dynamic from 'next/dynamic';

// Importar dinámicamente el canvas Data-Driven desactivando SSR para evitar errores del objeto window
const DataDrivenCombatCanvas = dynamic(
  () => import('./DataDrivenCombatCanvas'),
  { ssr: false }
);

// Motor de Audio Avanzado sintetizado con Música de Fondo Retro y Control de Volumen Master
class RetroSoundEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private bgMusicInterval: any = null;
  private isMusicPlaying = false;
  private masterGain: GainNode | null = null;
  private volumeLevel = 0.5; // Por defecto al 50%

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        
        // Crear Nodo de Ganancia Master
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volumeLevel, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
        
        // Generar buffer de ruido para explosiones digitales
        const bufferSize = this.ctx.sampleRate * 0.45;
        this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
      }
    } catch (e) {
      console.warn("Web Audio API no está soportado en este navegador.", e);
    }
  }

  public setVolume(volume: number) {
    this.volumeLevel = volume;
    this.init(); // Asegurar inicialización
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(volume, this.ctx.currentTime);
    }
  }

  public startBackgroundMusic() {
    this.init();
    if (!this.ctx || this.isMusicPlaying) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMusicPlaying = true;
    let step = 0;
    
    // Secuenciador retro simple (Cyberpunk chiptune loop)
    const bassline = [73.42, 73.42, 87.31, 98.00, 73.42, 73.42, 110.00, 98.00]; // D2, D2, F2, G2, D2, D2, A2, G2
    const melody = [293.66, 0, 349.23, 392.00, 293.66, 440.00, 392.00, 0]; // D4, F4, G4, A4
    
    this.bgMusicInterval = setInterval(() => {
      if (!this.ctx || this.ctx.state === 'suspended') return;
      const now = this.ctx.currentTime;
      
      // Nota de Bajo (Sintetizador analógico de onda sierra con filtro de paso bajo)
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      const bassFilter = this.ctx.createBiquadFilter();
      
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.value = bassline[step % bassline.length];
      
      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(350, now);
      
      bassGain.gain.setValueAtTime(0.05, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      
      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.masterGain || this.ctx.destination);
      
      bassOsc.start(now);
      bassOsc.stop(now + 0.24);
      
      // Melodía principal
      const melFreq = melody[step % melody.length];
      if (melFreq > 0 && step % 2 === 0) {
        const melOsc = this.ctx.createOscillator();
        const melGain = this.ctx.createGain();
        const melDelay = this.ctx.createDelay();
        const delayGain = this.ctx.createGain();

        melOsc.type = 'square';
        melOsc.frequency.value = melFreq;
        
        melGain.gain.setValueAtTime(0.015, now);
        melGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        
        melDelay.delayTime.value = 0.15;
        delayGain.gain.value = 0.4; // Feedback
        
        melOsc.connect(melGain);
        melGain.connect(this.masterGain || this.ctx.destination);
        
        // Efecto delay retro
        melGain.connect(melDelay);
        melDelay.connect(delayGain);
        delayGain.connect(this.masterGain || this.ctx.destination);
        
        melOsc.start(now);
        melOsc.stop(now + 0.45);
      }
      
      step++;
    }, 240); // BPM ~125
  }

  public stopBackgroundMusic() {
    if (this.bgMusicInterval) {
      clearInterval(this.bgMusicInterval);
      this.bgMusicInterval = null;
    }
    this.isMusicPlaying = false;
  }

  public play(type: 'laser' | 'hit' | 'victory' | 'defeat' | 'error' | 'powerup' | 'charge') {
    this.init();
    if (!this.ctx) return;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;

    switch (type) {
      case 'charge': {
        // Carga de energía láser
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.6);
        
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.exponentialRampToValueAtTime(0.15, now + 0.6);
        
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
        break;
      }
      case 'laser': {
        // Disparo láser de 16-bits con doble oscilador y barrido resonante
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc1.type = 'sawtooth';
        osc2.type = 'square';
        
        osc1.frequency.setValueAtTime(950, now);
        osc1.frequency.exponentialRampToValueAtTime(180, now + 0.4);
        osc2.frequency.setValueAtTime(930, now);
        osc2.frequency.exponentialRampToValueAtTime(170, now + 0.4);

        filter.type = 'lowpass';
        filter.Q.value = 6;
        filter.frequency.setValueAtTime(2800, now);
        filter.frequency.exponentialRampToValueAtTime(350, now + 0.4);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.41);
        osc2.stop(now + 0.41);
        break;
      }
      case 'hit': {
        // Glitch explosion: sub-drop de bajos y ruido blanco bandpass
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(30, now + 0.45);
        
        oscGain.gain.setValueAtTime(0.38, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        
        osc.connect(oscGain);
        oscGain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.46);

        if (this.noiseBuffer) {
          const noiseSource = this.ctx.createBufferSource();
          const noiseGain = this.ctx.createGain();
          const noiseFilter = this.ctx.createBiquadFilter();

          noiseSource.buffer = this.noiseBuffer;
          
          noiseFilter.type = 'bandpass';
          noiseFilter.Q.value = 4.5;
          noiseFilter.frequency.setValueAtTime(1300, now);
          noiseFilter.frequency.exponentialRampToValueAtTime(120, now + 0.38);

          noiseGain.gain.setValueAtTime(0.32, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

          noiseSource.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(this.masterGain || this.ctx.destination);

          noiseSource.start(now);
          noiseSource.stop(now + 0.39);
        }
        break;
      }
      case 'victory': {
        // Melodía gloriosa arpegiada
        const chords = [
          [261.63, 329.63, 392.00], // Do mayor (C)
          [349.23, 440.00, 523.25], // Fa mayor (F)
          [392.00, 493.88, 587.33], // Sol mayor (G)
          [523.25, 659.25, 783.99, 1046.50] // C5 + C6
        ];
        const durations = [0.14, 0.14, 0.14, 0.65];
        let time = now;
        
        chords.forEach((freqs, idx) => {
          freqs.forEach((freq) => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = idx === 3 ? 'sine' : 'square';
            osc.frequency.setValueAtTime(freq, time);
            
            gain.gain.setValueAtTime(0.08, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + durations[idx] - 0.02);
            
            osc.connect(gain);
            gain.connect(this.masterGain || this.ctx.destination);
            
            osc.start(time);
            osc.stop(time + durations[idx]);
          });
          time += durations[idx] * 0.9;
        });
        break;
      }
      case 'defeat': {
        const notes = [196.00, 164.81, 130.81, 98.00];
        const durations = [0.18, 0.18, 0.18, 0.5];
        let time = now;
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, time);
          
          gain.gain.setValueAtTime(0.18, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + durations[idx] - 0.02);
          
          osc.connect(gain);
          gain.connect(this.masterGain || this.ctx.destination);
          
          osc.start(time);
          osc.stop(time + durations[idx]);
          time += durations[idx] * 0.95;
        });
        break;
      }
      case 'error': {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(140, now);
        osc1.frequency.linearRampToValueAtTime(120, now + 0.35);
        
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(143, now);
        osc2.frequency.linearRampToValueAtTime(123, now + 0.35);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.36);
        osc2.stop(now + 0.36);
        break;
      }
      case 'powerup': {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        const durations = [0.08, 0.08, 0.08, 0.3];
        let time = now;
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, time);
          gain.gain.setValueAtTime(0.14, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + durations[idx] - 0.01);
          osc.connect(gain);
          gain.connect(this.masterGain || this.ctx.destination);
          osc.start(time);
          osc.stop(time + durations[idx]);
          time += durations[idx] * 0.7;
        });
        break;
      }
    }
  }
}

const soundEngine = new RetroSoundEngine();

export function RpgCombatViewport() {
  const { 
    guildBoss, 
    guildSubmissions, 
    triggerGuildAttack, 
    submitGuildHomework, 
    resetGuildBoss,
    stats
  } = useGamification();

  const elenaSub = guildSubmissions.find(s => s.student_id === 'std-sec');

  // Control de Volumen local
  const [volume, setVolume] = useState(0.5); // 50% por defecto
  const [prevVolume, setPrevVolume] = useState(0.5); // Recordar volumen previo para desmutear

  const [combatState, setCombatState] = useState<'idle' | 'attacking' | 'boss_hurt' | 'victory' | 'defeat'>('idle');
  const [sombraText, setSombraText] = useState('Sombra: ¡El Guardián de Historia custodia el portal! Registren sus evidencias a tiempo para iniciar el ataque sincronizado.');
  
  // Daño y XP flotantes
  const [damageNumber, setDamageNumber] = useState<number | null>(null);
  const [xpNumber, setXpNumber] = useState<number | null>(null);

  // Salud del equipo
  const [partyHp, setPartyHp] = useState(75);

  const prevBossHp = useRef(guildBoss.hp_actual);

  // Controlar ciclo de vida de la música de fondo y aplicar el volumen en tiempo real
  useEffect(() => {
    soundEngine.setVolume(volume);
    if (volume > 0 && combatState !== 'victory') {
      soundEngine.startBackgroundMusic();
    } else {
      soundEngine.stopBackgroundMusic();
    }
    return () => {
      soundEngine.stopBackgroundMusic();
    };
  }, [volume, combatState]);

  // Reproducir efectos de sonido si el volumen no es 0
  const playSound = (type: 'laser' | 'hit' | 'victory' | 'defeat' | 'error' | 'powerup' | 'charge') => {
    if (volume > 0) {
      soundEngine.play(type);
    }
  };

  // Silenciar / Activar Audio (Mute / Unmute)
  const handleToggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
    } else {
      setVolume(prevVolume > 0 ? prevVolume : 0.5);
    }
  };

  // Manejar el cambio del slider de volumen
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (newVol > 0) {
      setPrevVolume(newVol);
    }
  };

  // Observar cambios en el HP del jefe
  useEffect(() => {
    if (guildBoss.hp_actual === 0 && combatState !== 'victory') {
      setCombatState('victory');
      soundEngine.stopBackgroundMusic();
      playSound('victory');
      setSombraText('Sombra: ¡Felicidades, Héroes! Han derrotado al Guardián de Historia. El portal de conocimiento está abierto. (+500 XP Gremial)');
    } else if (guildBoss.hp_actual > 0 && guildBoss.hp_actual < prevBossHp.current) {
      prevBossHp.current = guildBoss.hp_actual;
    }
  }, [guildBoss.hp_actual]);

  // Ejecutar el ataque sincronizado (Triple Ataque)
  const handleSincronizadoAttack = () => {
    if (guildBoss.hp_actual <= 0) return;
    
    // Verificar si Elena ya entregó
    if (!elenaSub || elenaSub.status === 'pending') {
      playSound('error');
      setSombraText('Sombra: ¡Alto! Elena la Mago aún no ha entregado su evidencia. Completa la misión abajo para activar la sincronía del gremio.');
      return;
    }

    // Iniciar secuencia de animación
    setCombatState('attacking');
    playSound('charge'); // Sonido de carga de energía láser
    setSombraText('Sombra: ¡Increíble! Su sincronía activó un Ataque Triple. ¡El guardián no pudo resistir!');

    setTimeout(() => {
      playSound('laser'); // Sonido de disparo masivo láser
    }, 200);

    setTimeout(() => {
      setCombatState('boss_hurt');
      playSound('hit'); // Sonido de impacto glitch
      
      const dmg = 50;
      setDamageNumber(dmg);
      setXpNumber(20);
      triggerGuildAttack(dmg);

      // Limpiar números flotantes después de 1.2 segundos
      setTimeout(() => {
        setDamageNumber(null);
        setXpNumber(null);
        setCombatState('idle');
      }, 1200);

    }, 600);
  };

  // Simular entrega de Elena
  const handleSimularEntrega = () => {
    submitGuildHomework('std-sec', true);
    playSound('powerup');
    setSombraText('Sombra: ¡Elena subió su evidencia a tiempo! Ahora el gremio está en sincronía total. ¡Preparen el Ataque Triple!');
  };

  // Simular fallo / entrega tardía
  const handleSimularFallo = () => {
    submitGuildHomework('std-sec', false);
    playSound('error');
    setPartyHp(35); // Baja la vida del equipo
    setSombraText('Sombra: ¡Oh no! La entrega se registró con retraso. El Guardián de Historia aprovechó la brecha y contraatacó al gremio.');
    
    // Animación corta de daño al equipo (sacudir pantalla)
    setCombatState('boss_hurt');
    setTimeout(() => {
      setCombatState('idle');
    }, 500);
  };

  const handleReset = () => {
    resetGuildBoss();
    setPartyHp(75);
    setCombatState('idle');
    setSombraText('Sombra: ¡El Guardián de Historia custodia el portal! Registren sus evidencias a tiempo para iniciar el ataque sincronizado.');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Estilos Inline CSS para efectos visuales Premium */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-up-fade {
          0% { transform: translateY(0) scale(0.85); opacity: 0; }
          15% { transform: translateY(-20px) scale(1.15); opacity: 1; }
          85% { transform: translateY(-55px) scale(1); opacity: 1; }
          100% { transform: translateY(-75px) scale(0.9); opacity: 0; }
        }
        .anim-float-up { animation: float-up-fade 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
        .clip-diagonal {
          clip-path: polygon(0 0, 85% 0, 100% 100%, 0% 100%);
        }
      `}} />

      {/* Contenedor del Celular de la Presentación */}
      <div className="relative w-full max-w-4xl mx-auto rounded-[46px] bg-zinc-950 border-[14px] border-slate-800 shadow-2xl overflow-hidden aspect-[16/9] flex flex-col justify-between p-3 pb-2 text-white font-sans select-none border-t-[14px] border-b-[14px]">
        
        {/* Notch / Cámara en el lateral izquierdo */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-4 h-20 bg-slate-800 rounded-r-2xl z-50 flex flex-col justify-center items-center gap-1.5 shadow-inner">
          <div className="w-2 h-2 rounded-full bg-zinc-900 border border-zinc-700" />
          <div className="w-1.5 h-6 rounded-full bg-zinc-900 border border-zinc-700" />
        </div>

        {/* Flares de alerta rojos en los bordes laterales */}
        <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-red-600/35 via-red-600/5 to-transparent pointer-events-none z-10 mix-blend-screen animate-pulse" style={{animationDuration: '2s'}} />
        <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-red-600/35 via-red-600/5 to-transparent pointer-events-none z-10 mix-blend-screen animate-pulse" style={{animationDuration: '2s'}} />

        {/* Título de la app en el centro superior */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 z-20 text-[12px] tracking-[6px] font-black uppercase text-cyan-400 font-mono drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
          ISKOOL
        </div>
        
        {/* Top UI Bar (Stats y Barras HP) */}
        <div className="flex justify-between items-start w-full px-4 z-20 mt-1 h-[15%]">
          {/* Jugador Stats */}
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-cyan-500/20 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            <div className="h-8 w-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs relative overflow-hidden shadow-inner">
              <svg viewBox="0 0 100 100" className="w-full h-full p-0.5">
                <circle cx="50" cy="50" r="45" fill="#151d30" />
                <path d="M 20 80 C 20 50, 80 50, 80 80 Z" fill="#475569" stroke="#64748B" strokeWidth="2" />
                <circle cx="50" cy="45" r="24" fill="#38BDF8" opacity="0.8" filter="url(#glow-fx)" />
                <path d="M30 45 Q 50 35 70 45" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" />
                <rect x="25" y="70" width="50" height="12" fill="#1E293B" rx="2" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase text-slate-100 tracking-wider">Cyber_Mecha</span>
                <span className="text-[8px] text-cyan-400/85 font-mono">image_0.png</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-black text-emerald-400 tracking-wider">HP</span>
                <div className="w-28 h-2 bg-zinc-950 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500 shadow-[0_0_6px_#10B981]" 
                    style={{ width: `${partyHp}%` }}
                  />
                </div>
                <span className="text-[9px] font-black text-emerald-400 font-mono">{partyHp}%</span>
              </div>
            </div>
          </div>

          {/* Regulador de Volumen y Reset */}
          <div className="flex gap-2 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-2xl border border-slate-800/40 shadow-lg items-center">
            <button 
              onClick={handleToggleMute}
              className="p-1 rounded-lg bg-zinc-950 border border-slate-800 hover:bg-slate-800 transition-all"
              title={volume === 0 ? "Activar audio" : "Silenciar"}
            >
              {volume === 0 ? <VolumeX className="h-3.5 w-3.5 text-rose-500" /> : <Volume2 className="h-3.5 w-3.5 text-emerald-400" />}
            </button>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              value={volume} 
              onChange={handleVolumeChange}
              className="w-14 md:w-20 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
              title="Regular volumen master"
            />
            <span className="text-[9px] font-bold text-cyan-400/85 font-mono w-6 text-right">
              {Math.round(volume * 100)}%
            </span>
            <div className="w-px h-3.5 bg-slate-800" />
            <button 
              onClick={handleReset}
              className="p-1 rounded-lg bg-zinc-950 border border-slate-800 hover:bg-slate-850 text-zinc-400 hover:text-white transition-all"
              title="Reiniciar batalla"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Jefe Stats */}
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-rose-500/20 shadow-[0_4px_12px_rgba(0,0,0,0.5)] text-right">
            <div className="text-right">
              <span className="text-[10px] font-extrabold uppercase text-slate-100 tracking-wider block">{guildBoss.name}</span>
              <div className="flex items-center gap-1.5 mt-0.5 justify-end relative">
                <span className="text-[9px] font-bold text-rose-400/80 font-mono">{guildBoss.hp_actual} / {guildBoss.hp_max} HP</span>
                <div className="w-28 h-2 bg-zinc-950 rounded-full overflow-hidden border border-slate-800 shadow-inner relative">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-600 to-red-400 transition-all duration-500 shadow-[0_0_6px_#EF4444]" 
                    style={{ width: `${(guildBoss.hp_actual / guildBoss.hp_max) * 100}%` }}
                  />
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 112 10">
                    <path d="M90,-2 L94,5 L91,7 L98,12" stroke="#000" strokeWidth="1.8" fill="none" opacity="0.9" strokeLinecap="round" />
                    <path d="M94,5 L90,8" stroke="#000" strokeWidth="1.2" fill="none" opacity="0.8" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-[9px] font-black text-rose-500 tracking-wider">HP</span>
              </div>
            </div>
            <div className="h-8 w-8 rounded-xl bg-zinc-950 border border-rose-950 flex items-center justify-center font-bold text-xs relative overflow-hidden shadow-inner">
              👾
              {combatState === 'boss_hurt' && (
                <div className="absolute inset-0 bg-red-600/60 animate-ping" />
              )}
            </div>
          </div>
        </div>

        {/* Campo de batalla WebGL dedicado con PixiJS (h-[45%]) */}
        <div className="relative h-[45%] w-full flex items-center justify-center z-10">
          {(() => {
            // Construir Payload JSON Data-Driven
            const combatPayload = {
              mission_id: "mis-hist-01",
              homework_id: "hw-hist-01",
              enemy_data: {
                enemy_id: "boss-firewall",
                name: guildBoss.name,
                hp_max: guildBoss.hp_max,
                hp_remaining: guildBoss.hp_actual,
                skin_id: "skin_firewall"
              },
              attackers: [
                {
                  student_id: "std-sec",
                  name: "Elena",
                  role: "Sage_Cyber",
                  skin_texture_id: "skin_elena",
                  rpg_action: "LASER_BEAM",
                  damage: 20
                },
                {
                  student_id: "std-pa",
                  name: "Santi",
                  role: "Cyber_Marine",
                  skin_texture_id: "skin_santi",
                  rpg_action: "RIFLE_BURST",
                  damage: 15
                },
                {
                  student_id: "std-pb",
                  name: "Lucas",
                  role: "Scout_Space",
                  skin_texture_id: "skin_lucas",
                  rpg_action: "BLASTER_SHOT",
                  damage: 15
                }
              ],
              server_calculated_total_damage: 50
            };

            return (
              <DataDrivenCombatCanvas
                payload={combatPayload}
                localStudentId="std-sec" // Elena es la estudiante local en este visor de Secundaria
                combatState={combatState}
                volume={volume}
                playSound={playSound}
              />
            );
          })()}

          {/* Números flotantes de Daño y XP en HTML (Súper nítidos y posicionados) */}
          {damageNumber !== null && (
            <div className="absolute top-[35%] left-[84%] -translate-x-1/2 -translate-y-1/2 pointer-events-none anim-float-up z-20">
              <div className="flex flex-col items-center">
                {/* Gran destello de impacto */}
                <div className="w-14 h-14 bg-white border-4 border-rose-500 rounded-full animate-ping absolute opacity-45" />
                <div className="px-3 py-1 bg-red-600 border border-white text-white font-extrabold text-xs rounded-xl shadow-lg relative">
                  -{damageNumber} HP
                </div>
              </div>
            </div>
          )}
          {xpNumber !== null && (
            <div className="absolute top-[42%] left-[88%] -translate-x-1/2 -translate-y-1/2 pointer-events-none anim-float-up z-20" style={{ animationDelay: '0.15s' }}>
              <div className="px-2.5 py-0.5 bg-yellow-500 border border-white text-zinc-950 font-extrabold text-[10px] rounded-lg shadow-lg relative">
                -{xpNumber} XP
              </div>
            </div>
          )}
        </div>

        {/* Diálogo de Sombra y Botones de Acción (h-[36%]) */}
        <div className="w-full h-[36%] flex flex-col justify-between px-1 md:px-4 pb-1 z-20">
          {/* Diálogo */}
          <div className="relative bg-zinc-950/90 border border-cyan-500/50 rounded-2xl p-2 md:p-2.5 flex gap-2 items-center backdrop-blur-md shadow-[0_0_12px_rgba(6,182,212,0.25)]">
            {/* Header capsule SOMBRA */}
            <div className="absolute -top-3.5 left-4 px-3 py-0.5 bg-cyan-400 text-[8px] font-black uppercase tracking-wider text-black rounded-t-md rounded-br-md clip-diagonal shadow-lg">
              SOMBRA
            </div>
            
            <div className="h-6 w-6 rounded-lg bg-indigo-950/80 border border-indigo-400/50 flex items-center justify-center text-[10px] animate-bounce shadow mt-1.5">
              💡
            </div>
            <div className="flex-1 pt-1">
              <p className="text-[9.5px] md:text-xs text-zinc-100 font-medium leading-normal">
                <span className="font-extrabold text-cyan-400">Sombra:</span> {sombraText} 💬
              </p>
            </div>
          </div>

          {/* Menú de Botones de Juego */}
          <div className="flex justify-between items-center gap-4">
            <div className="flex gap-1.5">
              <button 
                onClick={() => setSombraText('Sombra: Pista: Para derrotar al guardián, debes entregar tareas pendientes de Matemáticas. ¡Eso recarga los núcleos de daño!')}
                className="px-3 py-1.5 bg-zinc-900/90 hover:bg-zinc-800 text-[9px] md:text-xs font-bold rounded-lg border border-slate-800 tracking-wide transition-all uppercase text-slate-300 hover:text-white"
              >
                [ 🔍 Pista ]
              </button>
              <button 
                onClick={() => setSombraText('Sombra: Inventario actual: 1x Pergamino del Gremio, 3x Viales de Tinta de Sincronía.')}
                className="px-3 py-1.5 bg-zinc-900/90 hover:bg-zinc-800 text-[9px] md:text-xs font-bold rounded-lg border border-slate-800 tracking-wide transition-all uppercase text-slate-300 hover:text-white"
              >
                [ 🎒 Inventario ]
              </button>
            </div>

            {/* Controles de Ataque y Navegación */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSincronizadoAttack}
                disabled={guildBoss.hp_actual <= 0 || combatState === 'attacking'}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-[10px] md:text-xs font-black tracking-widest uppercase transition-all shadow-md shadow-indigo-600/35 flex items-center gap-1.5 border border-purple-500/20"
              >
                <Zap className="h-3 w-3 fill-current text-yellow-300 animate-pulse" />
                Ataque Sincronizado
              </button>

              <div className="flex gap-1.5">
                <button 
                  onClick={() => setSombraText('Sombra: Navegando al hito anterior del portal académico...')}
                  className="px-2 py-1.5 bg-zinc-900/90 hover:bg-zinc-800 border border-slate-800 hover:border-slate-700 rounded-xl font-black text-[10px] text-slate-300 hover:text-white transition-all shadow-inner"
                >
                  &lt;&lt;
                </button>
                <button 
                  onClick={() => setSombraText('Sombra: Explorando el portal de conocimiento avanzado...')}
                  className="px-2 py-1.5 bg-zinc-900/90 hover:bg-zinc-800 border border-slate-800 hover:border-slate-700 rounded-xl font-black text-[10px] text-slate-300 hover:text-white transition-all shadow-inner"
                >
                  &gt;&gt;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Indicador de modo (one-hand) en la base inferior externa */}
        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-slate-600 tracking-widest uppercase pointer-events-none">
          one-hand
        </div>
      </div>

      {/* Controladores de Simulación del Gremio */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
        <h3 className="text-xs font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider mb-4 flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-purple-500" />
          Consola del Gremio: Entregas del Contrato de Historia
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {guildSubmissions.map((member) => (
            <div 
              key={member.student_id} 
              className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-3 text-xs ${
                member.status === 'submitted_on_time' 
                  ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-950/20 dark:bg-emerald-950/10'
                  : member.status === 'submitted_late'
                    ? 'border-orange-200 bg-orange-50/40 dark:border-orange-950/20 dark:bg-orange-950/10'
                    : 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/30'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <strong className="text-zinc-900 dark:text-white block">{member.student_name}</strong>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wide font-medium">Clase: {member.class_name}</span>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                  member.status === 'submitted_on_time'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                    : member.status === 'submitted_late'
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-400'
                      : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                }`}>
                  {member.status === 'submitted_on_time' ? 'A Tiempo ✓' : member.status === 'submitted_late' ? 'Retraso ⌛' : 'Pendiente'}
                </span>
              </div>

              {/* Si es Elena (Tú) y está pendiente, mostrar acciones de simulación */}
              {member.student_id === 'std-sec' && member.status === 'pending' && (
                <div className="flex gap-2 w-full">
                  <button
                    onClick={handleSimularEntrega}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-all"
                  >
                    Entregar a Tiempo
                  </button>
                  <button
                    onClick={handleSimularFallo}
                    className="py-1.5 px-3 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-[10px] font-bold transition-all"
                  >
                    Fallo
                  </button>
                </div>
              )}

              {/* Fecha de entrega simulada */}
              {member.submitted_at && (
                <span className="text-[9px] text-zinc-400 italic">
                  Registrado hace unos instantes
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="p-3 bg-zinc-50 dark:bg-zinc-950/45 rounded-xl border border-zinc-100 dark:border-zinc-850 flex gap-2.5 items-start text-xs text-zinc-500 dark:text-zinc-400">
          <HelpCircle className="h-4.5 w-4.5 text-zinc-400 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Mecánica Cooperativa:</strong> Para poder activar el **Ataque Sincronizado**, todos los miembros del gremio escolar deben haber entregado sus tareas a tiempo. Si todos cumplen, el daño se activa. Si hay retrasos, el jefe contraataca reduciendo la salud de tu equipo.
          </p>
        </div>
      </div>
    </div>
  );
}
