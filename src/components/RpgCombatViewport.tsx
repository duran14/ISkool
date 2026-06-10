"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useGamification } from '@/context/gamification-context';
import { Volume2, VolumeX, Shield, Swords, Sparkles, HelpCircle, Briefcase, Zap, RotateCcw } from 'lucide-react';

// Motor de Audio Retro sintetizado
class RetroSoundEngine {
  private ctx: AudioContext | null = null;

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch (e) {
      console.warn("Web Audio API no está soportado en este navegador.", e);
    }
  }

  public play(type: 'laser' | 'hit' | 'victory' | 'defeat' | 'error' | 'powerup') {
    this.init();
    if (!this.ctx) return;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;

    switch (type) {
      case 'laser': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.16);
        break;
      }
      case 'hit': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(30, now + 0.12);
        
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.13);
        break;
      }
      case 'victory': {
        // Melodía victoriosa de 8 bits
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        const durations = [0.08, 0.08, 0.08, 0.4];
        let time = now;
        
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, time);
          
          gain.gain.setValueAtTime(0.12, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + durations[idx] - 0.01);
          
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          
          osc.start(time);
          osc.stop(time + durations[idx]);
          
          time += durations[idx];
        });
        break;
      }
      case 'defeat': {
        const notes = [196.00, 164.81, 130.81]; // G3, E3, C3
        const durations = [0.15, 0.15, 0.45];
        let time = now;
        
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, time);
          
          gain.gain.setValueAtTime(0.18, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + durations[idx] - 0.02);
          
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          
          osc.start(time);
          osc.stop(time + durations[idx]);
          
          time += durations[idx];
        });
        break;
      }
      case 'error': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.25);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.26);
        break;
      }
      case 'powerup': {
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        const durations = [0.08, 0.08, 0.2];
        let time = now;
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, time);
          gain.gain.setValueAtTime(0.12, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + durations[idx] - 0.01);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(time);
          osc.stop(time + durations[idx]);
          time += durations[idx];
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
    stats,
    currentStudent
  } = useGamification();

  const elenaSub = guildSubmissions.find(s => s.student_id === 'std-sec');

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [combatState, setCombatState] = useState<'idle' | 'attacking' | 'boss_hurt' | 'victory' | 'defeat'>('idle');
  const [sombraText, setSombraText] = useState('Sombra: ¡El Guardián de Historia custodia el portal! Registren sus evidencias a tiempo para iniciar el ataque sincronizado.');
  
  // Daño y XP flotantes
  const [damageNumber, setDamageNumber] = useState<number | null>(null);
  const [xpNumber, setXpNumber] = useState<number | null>(null);

  // Salud del equipo (simulada basada en el contexto)
  const [partyHp, setPartyHp] = useState(75);

  const prevBossHp = useRef(guildBoss.hp_actual);

  // Reproducir efectos de sonido si el audio está habilitado
  const playSound = (type: 'laser' | 'hit' | 'victory' | 'defeat' | 'error' | 'powerup') => {
    if (audioEnabled) {
      soundEngine.play(type);
    }
  };

  // Observar cambios en el HP del jefe para disparar animaciones secundarias si es necesario
  useEffect(() => {
    if (guildBoss.hp_actual === 0 && combatState !== 'victory') {
      setCombatState('victory');
      playSound('victory');
      setSombraText('Sombra: ¡Felicidades, Héroes! Han derrotado al Guardián de Historia. El portal de conocimiento está abierto. (+500 XP Gremial)');
    } else if (guildBoss.hp_actual > 0 && guildBoss.hp_actual < prevBossHp.current) {
      // Si el HP bajó y no estamos en animación, resetear
      prevBossHp.current = guildBoss.hp_actual;
    }
  }, [guildBoss.hp_actual]);

  // Ejecutar el ataque sincronizado
  const handleSincronizadoAttack = () => {
    if (guildBoss.hp_actual <= 0) return;
    
    // Verificar si Elena ya entregó
    const elenaSub = guildSubmissions.find(s => s.student_id === 'std-sec');
    if (!elenaSub || elenaSub.status === 'pending') {
      playSound('error');
      setSombraText('Sombra: ¡Alto! Elena la Mago aún no ha entregado su evidencia. Completa la misión abajo para activar la sincronía del gremio.');
      return;
    }

    // Iniciar secuencia de animación
    setCombatState('attacking');
    playSound('laser');
    setSombraText('Sombra: ¡Excelente! Su sincronía activó un Ataque Triple. ¡El guardián no pudo resistir!');

    setTimeout(() => {
      setCombatState('boss_hurt');
      playSound('hit');
      
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

  // Simular fallo / entrega tardía para ver el contraataque
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
      {/* Marco de Dispositivo Móvil / Celular Horizontal */}
      <div className="relative w-full max-w-4xl mx-auto rounded-[36px] bg-zinc-950 border-[12px] border-zinc-800 shadow-2xl overflow-hidden aspect-[16/9] flex flex-col justify-between p-4 md:p-6 text-white font-sans select-none select-none">
        {/* Notch / Cámara del Teléfono */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-4 h-16 bg-zinc-800 rounded-r-xl z-50 flex flex-col justify-center items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
          <div className="w-1 h-8 rounded-full bg-zinc-900" />
        </div>
        
        {/* Top UI Bar (Stats y Barras HP) */}
        <div className="flex justify-between items-start w-full px-4 z-20">
          {/* Jugador Stats */}
          <div className="flex items-center gap-2 bg-black/45 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-zinc-800 shadow-lg">
            <div className="h-8 w-8 rounded-xl bg-purple-600 border border-purple-500 flex items-center justify-center font-bold text-xs shadow-inner">
              🧙‍♀️
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-zinc-300">Cyber_Mecha</span>
                <span className="text-[9px] text-zinc-500 font-semibold">({stats.rpg_class || 'mago'})</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-black text-purple-400">HP</span>
                <div className="w-24 h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500" 
                    style={{ width: `${partyHp}%` }}
                  />
                </div>
                <span className="text-[9px] font-bold text-zinc-400">{partyHp}%</span>
              </div>
            </div>
          </div>

          {/* Audio y Reset en la esquina superior */}
          <div className="flex gap-2">
            <button 
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="p-2 rounded-xl bg-black/40 border border-zinc-800 hover:bg-black/60 transition-all"
              title={audioEnabled ? "Silenciar audio" : "Activar audio"}
            >
              {audioEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4 text-zinc-500" />}
            </button>
            <button 
              onClick={handleReset}
              className="p-2 rounded-xl bg-black/40 border border-zinc-800 hover:bg-black/60 transition-all text-zinc-400 hover:text-white"
              title="Reiniciar batalla"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Jefe Stats */}
          <div className="flex items-center gap-2 bg-black/45 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-zinc-800 shadow-lg text-right">
            <div className="text-right">
              <span className="text-[10px] font-black uppercase text-zinc-300 block">{guildBoss.name}</span>
              <div className="flex items-center gap-1.5 mt-0.5 justify-end">
                <span className="text-[9px] font-bold text-zinc-400">{guildBoss.hp_actual} / {guildBoss.hp_max} HP</span>
                <div className="w-24 h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-600 to-orange-500 transition-all duration-500" 
                    style={{ width: `${(guildBoss.hp_actual / guildBoss.hp_max) * 100}%` }}
                  />
                </div>
                <span className="text-[9px] font-black text-rose-500">HP</span>
              </div>
            </div>
            <div className="h-8 w-8 rounded-xl bg-zinc-900 border border-rose-950 flex items-center justify-center font-bold text-xs relative overflow-hidden">
              👾
              {combatState === 'boss_hurt' && (
                <div className="absolute inset-0 bg-red-600/60 animate-ping" />
              )}
            </div>
          </div>
        </div>

        {/* Campo de batalla isométrico en SVG/Canvas */}
        <div className={`relative flex-1 w-full flex items-center justify-center ${combatState === 'boss_hurt' && partyHp === 35 ? 'animate-shake' : ''}`}>
          <svg viewBox="0 0 800 360" className="w-full h-full">
            {/* Definiciones de gradientes y filtros de brillo */}
            <defs>
              <linearGradient id="neon-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818CF8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#C084FC" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="grid-laser" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0" />
                <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0891B2" stopOpacity="1" />
              </linearGradient>
              <filter id="glow-fx" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Piso isométrico digital */}
            <polygon 
              points="400,60 750,180 400,300 50,180" 
              fill="#090514" 
              stroke="#4338CA" 
              strokeWidth="2" 
              opacity="0.9"
            />
            {/* Rejilla de luz isométrica */}
            <path d="M 400,60 L 400,300" stroke="#312E81" strokeWidth="1" opacity="0.5" />
            <path d="M 50,180 L 750,180" stroke="#312E81" strokeWidth="1" opacity="0.5" />
            <path d="M 225,120 L 575,240" stroke="#1E1B4B" strokeWidth="1" opacity="0.4" />
            <path d="M 575,120 L 225,240" stroke="#1E1B4B" strokeWidth="1" opacity="0.4" />

            {/* Columnas Neon / Líneas decorativas de fondo */}
            <line x1="80" y1="80" x2="80" y2="280" stroke="#F43F5E" strokeWidth="3" filter="url(#glow-fx)" opacity="0.6" />
            <line x1="720" y1="80" x2="720" y2="280" stroke="#06B6D4" strokeWidth="3" filter="url(#glow-fx)" opacity="0.6" />

            {/* 1. santi (Guerrero) */}
            <g transform="translate(180, 240)" className="transition-transform duration-300">
              {/* Sombra */}
              <ellipse cx="0" cy="25" rx="20" ry="8" fill="black" opacity="0.4" />
              {/* Cuerpo del personaje (Guerrero azul) */}
              <circle cx="0" cy="-10" r="14" fill="#3B82F6" stroke="#60A5FA" strokeWidth="2" />
              {/* Casco / Visor */}
              <rect x="-10" y="-16" width="20" height="6" rx="2" fill="#06B6D4" filter="url(#glow-fx)" />
              {/* Armadura */}
              <path d="M-15,4 L15,4 L10,25 L-10,25 Z" fill="#1D4ED8" />
              {/* Espada/Escudo */}
              <path d="M-22,-5 L-18,-5 L-18,15 L-22,15 Z" fill="#9CA3AF" />
              <circle cx="18" cy="10" r="8" fill="#60A5FA" opacity="0.9" />
              {/* Nombre etiqueta */}
              <text x="0" y="42" fill="#9CA3AF" fontSize="9" fontWeight="bold" textAnchor="middle">Santi (Guerrero)</text>
            </g>

            {/* 2. lucas (Explorador) */}
            <g transform="translate(140, 160)">
              {/* Sombra */}
              <ellipse cx="0" cy="25" rx="20" ry="8" fill="black" opacity="0.4" />
              {/* Cuerpo (Verde) */}
              <circle cx="0" cy="-10" r="14" fill="#10B981" stroke="#34D399" strokeWidth="2" />
              <rect x="-8" y="-15" width="16" height="5" rx="1" fill="#FBBF24" />
              <path d="M-13,4 L13,4 L8,25 L-8,25 Z" fill="#047857" />
              {/* Blaster */}
              <path d="M12,4 L22,4 L22,8 L12,8 Z" fill="#4B5563" />
              <circle cx="23" cy="6" r="2" fill="#F43F5E" filter="url(#glow-fx)" />
              <text x="0" y="42" fill="#9CA3AF" fontSize="9" fontWeight="bold" textAnchor="middle">Lucas (Explo)</text>
            </g>

            {/* 3. elena (Mago - Personaje activo) */}
            <g transform="translate(250, 190)">
              {/* Sombra */}
              <ellipse cx="0" cy="25" rx="22" ry="9" fill="black" opacity="0.4" />
              {/* Aura de Sincronía / Carga */}
              {elenaSub?.status === 'submitted_on_time' && (
                <>
                  <circle cx="0" cy="-6" r="30" fill="none" stroke="#A78BFA" strokeWidth="2" opacity="0.8" className="animate-ping" />
                  <ellipse cx="0" cy="25" rx="35" ry="12" fill="none" stroke="#C084FC" strokeWidth="1.5" opacity="0.6" className="animate-pulse" />
                </>
              )}
              {/* Cuerpo (Púrpura) */}
              <circle cx="0" cy="-12" r="15" fill="#8B5CF6" stroke="#A78BFA" strokeWidth="2" />
              {/* Visor holográfico */}
              <polygon points="-9,-14 9,-14 7,-8 -7,-8" fill="#EC4899" filter="url(#glow-fx)" />
              {/* Toga */}
              <path d="M-15,4 L15,4 L12,25 L-12,25 Z" fill="#6D28D9" />
              {/* Bastón de Mago */}
              <line x1="16" y1="-15" x2="16" y2="25" stroke="#D1D5DB" strokeWidth="2" />
              <circle cx="16" cy="-16" r="6" fill="#A78BFA" filter="url(#glow-fx)" className={combatState === 'attacking' ? 'animate-pulse' : elenaSub?.status === 'submitted_on_time' ? 'animate-pulse' : ''} />
              
              {/* Brillo especial en el staff cuando está lista */}
              {elenaSub?.status === 'submitted_on_time' && (
                <circle cx="16" cy="-16" r="12" fill="none" stroke="#F43F5E" strokeWidth="1.5" className="animate-ping" opacity="0.8" />
              )}
              
              <text x="0" y="42" fill="#E9D5FF" fontSize="9" fontWeight="extrabold" textAnchor="middle">Elena (Tú)</text>
            </g>

            {/* Lasers de Ataque Triple */}
            {combatState === 'attacking' && (
              <g>
                {/* Rayos láser directos */}
                <line x1="162" y1="166" x2="550" y2="180" stroke="#06B6D4" strokeWidth="4" filter="url(#glow-fx)" />
                <line x1="198" y1="244" x2="550" y2="180" stroke="#06B6D4" strokeWidth="4" filter="url(#glow-fx)" />
                <line x1="266" y1="174" x2="550" y2="180" stroke="#EC4899" strokeWidth="4" filter="url(#glow-fx)" />
                
                {/* Rayo central amplificado */}
                <line x1="266" y1="174" x2="550" y2="180" stroke="#FFFFFF" strokeWidth="2" />
              </g>
            )}

            {/* Boss: Guardián de Historia */}
            {guildBoss.hp_actual > 0 ? (
              <g 
                transform="translate(550, 180)" 
                className={`${combatState === 'boss_hurt' ? 'animate-hurt-bounce' : 'animate-levitate'}`}
              >
                {/* Sombra */}
                <ellipse cx="0" cy="65" rx="55" ry="16" fill="black" opacity="0.5" />
                
                {/* Escudo digital hexagonal externo */}
                <polygon 
                  points="0,-75 55,-40 55,30 0,65 -55,30 -55,-40" 
                  fill="none" 
                  stroke="#EC4899" 
                  strokeWidth="1.5" 
                  strokeDasharray="6,4"
                  opacity="0.3"
                  className="animate-spin-slow"
                />

                {/* Núcleo de Matriz Digital (Cuadros superpuestos y glitch) */}
                <rect x="-40" y="-50" width="80" height="100" fill="url(#neon-glow)" rx="8" opacity="0.85" stroke="#A78BFA" strokeWidth="2" />
                
                {/* Rostro pixelado y matrices */}
                <rect x="-25" y="-25" width="50" height="3" fill="#111827" />
                <circle cx="-15" cy="-12" r="4" fill="#000" />
                <circle cx="15" cy="-12" r="4" fill="#000" />
                
                {/* Ojos brillantes en modo herido */}
                {combatState === 'boss_hurt' ? (
                  <>
                    <rect x="-20" y="-16" width="10" height="8" fill="#EF4444" />
                    <rect x="10" y="-16" width="10" height="8" fill="#EF4444" />
                  </>
                ) : (
                  <>
                    <rect x="-18" y="-15" width="6" height="6" fill="#06B6D4" filter="url(#glow-fx)" />
                    <rect x="12" y="-15" width="6" height="6" fill="#06B6D4" filter="url(#glow-fx)" />
                  </>
                )}
                
                {/* Boca estilo glitch */}
                <path d="M-12,15 L12,15 L8,20 L-8,20 Z" fill="#EF4444" opacity="0.8" />
                
                {/* Partículas / Fragmentos de código binario flotantes */}
                <text x="-32" y="45" fill="#34D399" fontSize="8" fontFamily="monospace" opacity="0.8">01</text>
                <text x="22" y="45" fill="#34D399" fontSize="8" fontFamily="monospace" opacity="0.8">10</text>
                <text x="-20" y="-35" fill="#06B6D4" fontSize="8" fontFamily="monospace" opacity="0.6">SYS_ERR</text>
                <text x="10" y="32" fill="#F43F5E" fontSize="7" fontFamily="monospace" opacity="0.7">404</text>
              </g>
            ) : (
              // Explosión digital al morir el jefe
              <g transform="translate(550, 180)">
                <ellipse cx="0" cy="65" rx="55" ry="16" fill="black" opacity="0.2" />
                <circle cx="0" cy="0" r="45" fill="none" stroke="#EC4899" strokeWidth="3" className="animate-ping" />
                <circle cx="0" cy="0" r="15" fill="#FEE2E2" filter="url(#glow-fx)" opacity="0.8" />
                <text x="0" y="-55" fill="#FBBF24" fontSize="16" fontWeight="black" textAnchor="middle" filter="url(#glow-fx)">¡DERROTADO!</text>
              </g>
            )}

            {/* Números flotantes de Daño y XP */}
            {damageNumber !== null && (
              <g transform="translate(550, 90)" className="animate-float-damage">
                <rect x="-35" y="-18" width="70" height="24" rx="12" fill="#EF4444" opacity="0.95" />
                <text x="0" y="-1" fill="#FFFFFF" fontSize="12" fontWeight="black" textAnchor="middle">-{damageNumber} HP</text>
              </g>
            )}

            {xpNumber !== null && (
              <g transform="translate(620, 120)" className="animate-float-damage-delay">
                <rect x="-35" y="-18" width="70" height="24" rx="12" fill="#FBBF24" opacity="0.95" />
                <text x="0" y="-1" fill="#111827" fontSize="11" fontWeight="black" textAnchor="middle">-{xpNumber} XP</text>
              </g>
            )}
          </svg>
        </div>

        {/* Diálogo de Sombra y Botones de Acción Móvil */}
        <div className="w-full flex flex-col gap-3 z-10 px-2 md:px-4 pb-1">
          {/* Diálogo de la Inteligencia de Soporte */}
          <div className="bg-zinc-950/75 border border-purple-900/50 rounded-2xl p-3 flex gap-2.5 items-center backdrop-blur-md">
            <div className="h-7 w-7 rounded-lg bg-indigo-950 border border-indigo-500 flex items-center justify-center text-xs animate-bounce shadow">
              💡
            </div>
            <div className="flex-1">
              <span className="text-[8px] font-black text-cyan-400 tracking-wider uppercase block">Sombra AI</span>
              <p className="text-[10px] md:text-xs text-zinc-200 mt-0.5 leading-normal">{sombraText}</p>
            </div>
          </div>

          {/* Menú de Botones del Juego */}
          <div className="flex justify-between items-center gap-4 mt-1">
            <div className="flex gap-2">
              <button 
                onClick={() => setSombraText('Sombra: Pista: Para derrotar al guardián, debes entregar tareas pendientes de Matemáticas. ¡Eso recarga los núcleos de daño!')}
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-[10px] md:text-xs font-bold rounded-lg border border-zinc-800 tracking-wide transition-all uppercase"
              >
                [ 🔍 Pista ]
              </button>
              <button 
                onClick={() => setSombraText('Sombra: Inventario actual: 1x Pergamino del Gremio, 3x Viales de Tinta de Sincronía.')}
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-[10px] md:text-xs font-bold rounded-lg border border-zinc-800 tracking-wide transition-all uppercase"
              >
                [ 🎒 Inventario ]
              </button>
            </div>

            {/* Controles de Ataque */}
            <div className="flex gap-2.5">
              <button
                onClick={handleSincronizadoAttack}
                disabled={guildBoss.hp_actual <= 0 || combatState === 'attacking'}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-xs font-black tracking-widest uppercase transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
              >
                <Zap className="h-3.5 w-3.5 fill-current text-yellow-300" />
                Ataque Sincronizado
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controladores de Simulación del Gremio (Fuera del visor celular para no contaminar la interfaz de juego) */}
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
