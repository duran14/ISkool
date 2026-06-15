"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useGamification } from '@/context/gamification-context';
import { 
  Volume2, VolumeX, Shield, Swords, Sparkles, HelpCircle, 
  Briefcase, Zap, RotateCcw, Award, Heart, Brain, Play, RefreshCw, AlertCircle
} from 'lucide-react';

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
    
    // Secuenciador retro chiptune loop
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
      
      bassGain.gain.setValueAtTime(0.04, now);
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
        
        melGain.gain.setValueAtTime(0.012, now);
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
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.5);
        
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.exponentialRampToValueAtTime(0.12, now + 0.5);
        
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      }
      case 'laser': {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc1.type = 'sawtooth';
        osc2.type = 'square';
        
        osc1.frequency.setValueAtTime(850, now);
        osc1.frequency.exponentialRampToValueAtTime(150, now + 0.35);
        osc2.frequency.setValueAtTime(830, now);
        osc2.frequency.exponentialRampToValueAtTime(140, now + 0.35);

        filter.type = 'lowpass';
        filter.Q.value = 5;
        filter.frequency.setValueAtTime(2500, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.35);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.36);
        osc2.stop(now + 0.36);
        break;
      }
      case 'hit': {
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(20, now + 0.4);
        
        oscGain.gain.setValueAtTime(0.3, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        
        osc.connect(oscGain);
        oscGain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.41);

        if (this.noiseBuffer) {
          const noiseSource = this.ctx.createBufferSource();
          const noiseGain = this.ctx.createGain();
          const noiseFilter = this.ctx.createBiquadFilter();

          noiseSource.buffer = this.noiseBuffer;
          
          noiseFilter.type = 'bandpass';
          noiseFilter.Q.value = 4.0;
          noiseFilter.frequency.setValueAtTime(1100, now);
          noiseFilter.frequency.exponentialRampToValueAtTime(100, now + 0.35);

          noiseGain.gain.setValueAtTime(0.25, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          noiseSource.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(this.masterGain || this.ctx.destination);

          noiseSource.start(now);
          noiseSource.stop(now + 0.36);
        }
        break;
      }
      case 'victory': {
        const chords = [
          [261.63, 329.63, 392.00], 
          [349.23, 440.00, 523.25], 
          [392.00, 493.88, 587.33], 
          [523.25, 659.25, 783.99, 1046.50]
        ];
        const durations = [0.15, 0.15, 0.15, 0.6];
        let time = now;
        
        chords.forEach((freqs, idx) => {
          freqs.forEach((freq) => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = idx === 3 ? 'sine' : 'square';
            osc.frequency.setValueAtTime(freq, time);
            
            gain.gain.setValueAtTime(0.06, time);
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
        const durations = [0.2, 0.2, 0.2, 0.5];
        let time = now;
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, time);
          
          gain.gain.setValueAtTime(0.15, time);
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
        osc1.frequency.setValueAtTime(130, now);
        osc1.frequency.linearRampToValueAtTime(110, now + 0.3);
        
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(133, now);
        osc2.frequency.linearRampToValueAtTime(113, now + 0.3);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.31);
        osc2.stop(now + 0.31);
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
          gain.gain.setValueAtTime(0.12, time);
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
    missions, 
    questAttempts, 
    submitExam, 
    stats, 
    activeStudentId, 
    studentInventoryMap,
    shopArtifacts
  } = useGamification();

  // Control de volumen e hilo musical
  const [volume, setVolume] = useState(0.3);
  const [prevVolume, setPrevVolume] = useState(0.3);
  useEffect(() => {
    soundEngine.setVolume(volume);
    if (volume > 0 && battlePhase === 'fight') {
      soundEngine.startBackgroundMusic();
    } else {
      soundEngine.stopBackgroundMusic();
    }
    return () => {
      soundEngine.stopBackgroundMusic();
    };
  }, [volume]);

  const playSound = (type: 'laser' | 'hit' | 'victory' | 'defeat' | 'error' | 'powerup' | 'charge') => {
    if (volume > 0) {
      soundEngine.play(type);
    }
  };

  // Misiones y filtrado
  const [selectedMissionId, setSelectedMissionId] = useState<string>('mis-fractions');
  const activeMission = missions.find(m => m.id === selectedMissionId) || missions[0];

  // Identificar tareas y el examen (boss)
  const homeworkQuests = activeMission?.quests?.filter(q => q.type !== 'exam') || [];
  
  // Si la misión tiene examen lo usamos, si no creamos uno dinámico
  const missionExamQuest = activeMission?.quests?.find(q => q.type === 'exam') || {
    id: `exam-${selectedMissionId}`,
    mission_id: selectedMissionId,
    title: `Examen de ${activeMission?.title.split(' ')[2] || 'Materia'}`,
    description: "Desafía al guardián final con todo tu conocimiento acumulado.",
    type: "exam",
    sequence_order: homeworkQuests.length + 1,
    xp_reward: 300,
    coins_reward: 50,
    content: {
      bossName: `Guardián de ${activeMission?.title.split(' ')[2] || 'Materia'}`,
      bossHp: 180,
      bossMaxDmg: 25,
      storyIntro: "¡Solo quienes hayan realizado sus tareas obtendrán el poder para vencerme!"
    }
  };

  const examContent = missionExamQuest.content as any;

  // Determinar tareas completadas
  const completedHomeworkCount = homeworkQuests.filter(q => {
    const attempts = questAttempts.filter(a => a.quest_id === q.id);
    return attempts.some(a => a.is_completed || a.score >= 60);
  }).length;

  const totalHomeworkCount = homeworkQuests.length || 1;
  const battlePowerPercent = Math.round((completedHomeworkCount / totalHomeworkCount) * 100);

  // Estados de Combate JRPG
  const [battlePhase, setBattlePhase] = useState<'idle' | 'fight' | 'victory' | 'defeat'>('idle');
  const [sombraText, setSombraText] = useState('Sombra: Selecciona una misión y prepárate. Las tareas completadas recargan tus núcleos de daño contra el Jefe de Examen.');
  const [turnCount, setTurnCount] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [bossHp, setBossHp] = useState(180);
  const [bossMaxHp, setBossMaxHp] = useState(180);
  const [combatState, setCombatState] = useState<'idle' | 'player_attack' | 'boss_attack' | 'boss_hurt' | 'player_hurt' | 'victory' | 'defeat'>('idle');
  
  // Retries e Inventario
  const ownedArtifactIds = studentInventoryMap[activeStudentId] || [];
  const ownedArtifacts = shopArtifacts.filter(a => ownedArtifactIds.includes(a.id));
  
  const [usedAttempts, setUsedAttempts] = useState(0);
  const totalAttemptsAllowed = 1 + ownedArtifacts.length;

  // Números flotantes y efectos
  const [damageNumber, setDamageNumber] = useState<{ amount: number; isBoss: boolean } | null>(null);
  const [activeShield, setActiveShield] = useState(false);
  const [bonusDamage, setBonusDamage] = useState(0);

  // Seleccionar misión resetea el combate
  useEffect(() => {
    handleReset();
  }, [selectedMissionId]);

  const handleReset = () => {
    setBattlePhase('idle');
    setCombatState('idle');
    setTurnCount(0);
    setPlayerHp(100);
    setBossHp(examContent?.bossHp || 150);
    setBossMaxHp(examContent?.bossHp || 150);
    setUsedAttempts(0);
    setActiveShield(false);
    setBonusDamage(0);
    setSombraText('Sombra: ¡El portal de examen está listo! Si tu poder académico es 0%, no podrás dañar al jefe.');
    soundEngine.stopBackgroundMusic();
  };

  const startFight = () => {
    setPlayerHp(100);
    setBossHp(examContent?.bossHp || 150);
    setBossMaxHp(examContent?.bossHp || 150);
    setTurnCount(1);
    setActiveShield(false);
    setBonusDamage(0);
    setBattlePhase('fight');
    setCombatState('idle');
    setSombraText(`Sombra: ¡Comienza el desafío! Turno 1. Lanza tu ataque científico.`);
    if (volume > 0) {
      soundEngine.startBackgroundMusic();
    }
  };

  // ATAQUE DEL JUGADOR
  const handlePlayerAttack = (actionType: 'normal' | 'skill') => {
    if (combatState !== 'idle' || bossHp <= 0 || playerHp <= 0) return;

    // Calcular daño basado en Battle Power
    if (battlePowerPercent === 0) {
      playSound('error');
      setSombraText("Sombra: ⚠️ ¡Poder Académico en 0%! Tu ataque no hace daño. ¡Haz tus tareas!");
      setDamageNumber({ amount: 0, isBoss: true });
      setTimeout(() => setDamageNumber(null), 1000);
      
      // Contraataque inmediato del boss
      triggerBossTurn();
      return;
    }

    setCombatState('player_attack');
    playSound('charge');

    setTimeout(() => {
      // Calcular daño
      const baseDmg = actionType === 'skill' ? 35 : 20;
      const statBonus = actionType === 'skill' 
        ? (stats.attribute_intelligence || 10) * 1.5 
        : (stats.attribute_strength || 10) * 1.2;

      // El factor de daño es battlePowerPercent / 100
      const damageFactor = battlePowerPercent / 100;
      let finalDamage = Math.round((baseDmg + statBonus + bonusDamage) * damageFactor);
      
      // Randomizar +/- 15%
      finalDamage = Math.round(finalDamage * (0.85 + Math.random() * 0.3));
      
      const newBossHp = Math.max(0, bossHp - finalDamage);
      setBossHp(newBossHp);
      setDamageNumber({ amount: finalDamage, isBoss: true });
      playSound('laser');
      setCombatState('boss_hurt');
      setSombraText(`Sombra: ${actionType === 'skill' ? '🔮 ¡Hechizo Lógico!' : '⚔️ ¡Tajo de Energía!'} Infliges ${finalDamage} de daño al jefe.`);

      setTimeout(() => {
        setDamageNumber(null);
        setBonusDamage(0); // Consumir bonus
        
        if (newBossHp <= 0) {
          handleVictory();
        } else {
          triggerBossTurn();
        }
      }, 1000);

    }, 600);
  };

  // TURNO DEL ENEMIGO (BOSS)
  const triggerBossTurn = () => {
    setCombatState('boss_attack');
    
    setTimeout(() => {
      // Daño del boss
      const maxDmg = examContent?.bossMaxDmg || 20;
      let incomingDmg = Math.round(maxDmg * (0.7 + Math.random() * 0.6));
      
      // Mitigación por defensa y escudo
      const defenseMitigation = Math.round((stats.attribute_defense || 10) * 0.6);
      incomingDmg = Math.max(4, incomingDmg - defenseMitigation);
      
      if (activeShield) {
        incomingDmg = Math.round(incomingDmg * 0.4); // Reducir 60%
        setSombraText("Sombra: 🛡️ ¡El Escudo de Concentración bloqueó gran parte del daño!");
      }

      const newPlayerHp = Math.max(0, playerHp - incomingDmg);
      setPlayerHp(newPlayerHp);
      setDamageNumber({ amount: incomingDmg, isBoss: false });
      playSound('hit');
      setCombatState('player_hurt');

      setTimeout(() => {
        setDamageNumber(null);
        
        if (newPlayerHp <= 0) {
          handleDefeat();
        } else {
          setTurnCount(prev => prev + 1);
          setCombatState('idle');
          setSombraText(`Sombra: Turno del Gremio escolar. ¡Diseña tu siguiente movimiento!`);
        }
      }, 1000);

    }, 800);
  };

  // USAR UN ARTEFACTO EN COMBATE
  const [isUsingItem, setIsUsingItem] = useState(false);
  const handleUseItem = (artifact: any) => {
    setIsUsingItem(false);
    playSound('powerup');
    
    // Aplicar efectos según el artefacto
    if (artifact.id.includes('shield') || artifact.id.includes('cape')) {
      setActiveShield(true);
      setSombraText(`Sombra: 🛡️ Usaste "${artifact.name}". Tu defensa se eleva para el próximo ataque.`);
    } else if (artifact.id.includes('potion') || artifact.id.includes('water') || artifact.id.includes('heart')) {
      setPlayerHp(prev => Math.min(100, prev + 50));
      setSombraText(`Sombra: ❤️ Usaste "${artifact.name}". Te has curado +50 HP.`);
    } else if (artifact.id.includes('wand') || artifact.id.includes('dumbbell') || artifact.id.includes('pen')) {
      setBonusDamage(30);
      setSombraText(`Sombra: 💥 Usaste "${artifact.name}". Tu próximo ataque tendrá +30 de daño bonus.`);
    } else {
      setPlayerHp(prev => Math.min(100, prev + 25));
      setBonusDamage(15);
      setSombraText(`Sombra: ✨ Usaste "${artifact.name}". Curado +25 HP y +15 de daño bonus.`);
    }

    // Trigger turno boss inmediatamente después de usar item
    setTimeout(() => {
      triggerBossTurn();
    }, 1200);
  };

  // MANEJAR VICTORIA Y CALIFICACIÓN
  const handleVictory = () => {
    setBattlePhase('victory');
    setCombatState('victory');
    soundEngine.stopBackgroundMusic();
    playSound('victory');

    // Calcular calificación basada en turnos
    let grade = 6;
    if (turnCount <= 3) grade = 10;
    else if (turnCount <= 5) grade = 9;
    else if (turnCount <= 7) grade = 8;
    else if (turnCount <= 9) grade = 7;
    else grade = 6;

    // Calcular recompensas
    const coinsReward = grade * 10;
    const xpReward = missionExamQuest.xp_reward || 200;

    // Enviar calificación
    submitExam(
      missionExamQuest.id, 
      grade * 10, // Pasa score (60-100)
      {}, 
      { intelligence: 2, defense: 1 }, 
      'corona_boss'
    );

    setSombraText(`Sombra: ¡Felicidades! Derrotaste al jefe en ${turnCount} turnos. Tu calificación académica es de ${grade}/10.`);
  };

  // MANEJAR DERROTA
  const handleDefeat = () => {
    setBattlePhase('defeat');
    setCombatState('defeat');
    soundEngine.stopBackgroundMusic();
    playSound('defeat');
    setSombraText("Sombra: ¡Has caído! Tus puntos de vida llegaron a cero.");
  };

  // REINTENTO DE BATALLA (CONSUME RETRY)
  const handleRetryBattle = () => {
    if (usedAttempts < totalAttemptsAllowed - 1) {
      setUsedAttempts(prev => prev + 1);
      startFight();
      setSombraText(`Sombra: ¡Oportunidad extra activada! Oportunidad usada: ${usedAttempts + 1}/${totalAttemptsAllowed - 1}. ¡A pelear!`);
    } else {
      playSound('error');
      alert("No tienes más oportunidades. Compra artefactos en la tienda académica.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes JRPG-float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
        @keyframes slash-hit {
          0% { transform: scale(1) rotate(0deg); opacity: 0; }
          50% { transform: scale(1.4) rotate(45deg); opacity: 1; }
          100% { transform: scale(1) rotate(90deg); opacity: 0; }
        }
        @keyframes firefly-up {
          0% { transform: translateY(0px) scale(0.8); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-30px) scale(1.2); opacity: 0; }
        }
        .jrpg-idle { animation: JRPG-float 2.5s ease-in-out infinite; }
        .slash-effect { animation: slash-hit 0.3s ease-out forwards; }
        .combat-firefly { animation: firefly-up 4s ease-in-out infinite; }
      `}} />

      {/* Contenedor del Celular de la Presentación */}
      <div className="relative w-full max-w-4xl mx-auto rounded-[46px] bg-zinc-950 border-[14px] border-slate-800 shadow-2xl overflow-hidden aspect-[16/9] flex flex-col justify-between p-3 pb-2 text-white font-sans select-none">
        
        {/* Notch en lateral izquierdo */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-4 h-20 bg-slate-800 rounded-r-2xl z-50 flex flex-col justify-center items-center gap-1.5 shadow-inner">
          <div className="w-2 h-2 rounded-full bg-zinc-900 border border-zinc-700" />
          <div className="w-1.5 h-6 rounded-full bg-zinc-900 border border-zinc-700" />
        </div>

        {/* Top Header UI */}
        <div className="flex justify-between items-start w-full px-4 z-20 mt-1 h-[15%]">
          {/* Selector de Asignatura */}
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-purple-500/20">
            <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">ASIGNATURA:</span>
            <select 
              disabled={battlePhase === 'fight'}
              value={selectedMissionId}
              onChange={(e) => setSelectedMissionId(e.target.value)}
              className="bg-transparent text-[10px] font-black border-none text-zinc-100 focus:outline-none cursor-pointer uppercase tracking-wider"
            >
              {missions.map(m => (
                <option key={m.id} value={m.id} className="bg-zinc-900 text-zinc-100">{m.title}</option>
              ))}
            </select>
          </div>

          {/* Regulador de Volumen y Reset */}
          <div className="flex gap-2 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800/40 shadow-lg items-center">
            <button 
              onClick={() => {
                if (volume > 0) {
                  setPrevVolume(volume);
                  setVolume(0);
                } else {
                  setVolume(prevVolume > 0 ? prevVolume : 0.3);
                }
              }}
              className="p-1 rounded bg-zinc-950 border border-slate-800 hover:bg-slate-800 transition-all"
            >
              {volume === 0 ? <VolumeX className="h-3 w-3 text-rose-500" /> : <Volume2 className="h-3 w-3 text-emerald-400" />}
            </button>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              value={volume} 
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-12 md:w-16 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
            <button 
              onClick={handleReset}
              className="p-1 rounded bg-zinc-950 border border-slate-800 hover:bg-slate-850 text-zinc-400 hover:text-white transition-all ml-1"
              title="Reiniciar batalla"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>

          {/* Poder de Batalla */}
          <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <Zap className="h-3 w-3 text-emerald-400 fill-current" />
            <span className="text-[10px] font-black text-zinc-100 uppercase tracking-widest">
              PODER ACADÉMICO: <strong className="text-emerald-400">{battlePowerPercent}%</strong>
            </span>
          </div>
        </div>

        {/* CAMPO DE BATALLA SIDE-VIEW (Classic JRPG) */}
        <div className="relative h-[55%] w-full flex items-center justify-between px-10 bg-gradient-to-b from-indigo-950 via-emerald-950/50 to-zinc-950 border-y border-zinc-900 overflow-hidden">
          
          {/* Forest JRPG Background Backdrop */}
          <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
            <svg viewBox="0 0 800 200" className="w-full h-full object-cover">
              <path d="M 0 200 L 0 120 Q 120 100 240 140 Q 360 180 480 130 Q 600 90 720 150 Q 760 160 800 140 L 800 200 Z" fill="#047857" />
              <path d="M 0 200 L 0 150 Q 200 130 400 170 Q 600 190 800 150 L 800 200 Z" fill="#064E3B" />
              <g fill="#022C22">
                <polygon points="50,140 30,190 70,190" />
                <polygon points="50,110 35,150 65,150" />
                <polygon points="180,150 160,200 200,200" />
                <polygon points="380,130 350,190 410,190" />
                <polygon points="380,105 360,150 400,150" />
                <polygon points="620,140 590,200 650,200" />
                <polygon points="720,130 690,190 750,190" />
                <polygon points="720,105 700,150 740,150" />
              </g>
            </svg>
          </div>

          {/* Floating Firefly Particles */}
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="combat-firefly absolute left-[15%] top-[70%] w-1.5 h-1.5 rounded-full bg-yellow-400 blur-[0.5px]" style={{ animationDelay: '0s' }} />
            <div className="combat-firefly absolute left-[28%] top-[60%] w-1 h-1 rounded-full bg-emerald-400 blur-[0.5px]" style={{ animationDelay: '1.2s' }} />
            <div className="combat-firefly absolute left-[42%] top-[80%] w-2 h-2 rounded-full bg-yellow-300 blur-[1px]" style={{ animationDelay: '0.5s' }} />
            <div className="combat-firefly absolute left-[60%] top-[65%] w-1.5 h-1.5 rounded-full bg-yellow-400 blur-[0.5px]" style={{ animationDelay: '2s' }} />
            <div className="combat-firefly absolute left-[75%] top-[75%] w-1 h-1 rounded-full bg-emerald-300 blur-[0.5px]" style={{ animationDelay: '3s' }} />
            <div className="combat-firefly absolute left-[88%] top-[55%] w-2 h-2 rounded-full bg-yellow-300 blur-[1px]" style={{ animationDelay: '1.7s' }} />
          </div>
          
          {/* EFECTO DE DAÑO FLOTANTE */}
          {damageNumber && (
            <div 
              className={`absolute top-[40%] z-50 px-3 py-1 bg-red-600 border border-white text-white font-extrabold text-sm rounded-xl shadow-lg animate-ping`}
              style={{ left: damageNumber.isBoss ? '70%' : '25%' }}
            >
              -{damageNumber.amount} HP
            </div>
          )}

          {/* SHIELD EFFECT ON PLAYER */}
          {activeShield && combatState === 'player_hurt' && (
            <div className="absolute left-[20%] top-[45%] z-40 h-20 w-20 border-4 border-cyan-400/80 rounded-full animate-pulse flex items-center justify-center bg-cyan-950/20">
              <Shield className="h-10 w-10 text-cyan-400 animate-spin" />
            </div>
          )}

          {/* LADO IZQUIERDO: ALUMNOS (SPRITES) */}
          <div className="flex flex-col gap-4 z-20">
            {/* Elena (Mage) */}
            <div className={`flex items-center gap-3 relative jrpg-idle ${combatState === 'player_attack' ? 'translate-x-12 scale-110 duration-200' : 'duration-500'}`}>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-800 to-indigo-900 p-0.5 border border-purple-500/40 relative shadow-lg shadow-purple-950/30">
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                  {/* Shadow */}
                  <ellipse cx="50" cy="88" rx="28" ry="5" fill="#000" opacity="0.35" />
                  
                  {/* Anime Cape (Back) */}
                  <path d="M 30 55 C 20 62, 16 82, 18 87 C 32 87, 34 72, 34 55" fill="#310D4A" />
                  <path d="M 70 55 C 80 62, 84 82, 82 87 C 68 87, 66 72, 66 55" fill="#310D4A" />

                  {/* Robe / Tunic */}
                  <path d="M 28 85 L 36 52 Q 50 45 64 52 L 72 85 Q 50 90 28 85 Z" fill="#581C87" stroke="#7E22CE" strokeWidth="1" />
                  <path d="M 45 50 L 50 87 L 55 50 Z" fill="#FBBF24" /> {/* Gold center trim */}
                  
                  {/* Amulet */}
                  <circle cx="50" cy="54" r="3.5" fill="#06B6D4" stroke="#22D3EE" strokeWidth="0.8" className="animate-pulse" />

                  {/* Face & Neck */}
                  <path d="M 46 54 L 46 48 L 54 48 L 54 54 Z" fill="#FED7AA" />
                  <path d="M 35 34 C 35 34, 34 48, 50 56 C 66 48, 65 34, 65 34 Z" fill="#FED7AA" stroke="#FDBA74" strokeWidth="0.5" />
                  
                  {/* Cute Anime Blush */}
                  <ellipse cx="40" cy="46" rx="2.5" ry="1.2" fill="#F43F5E" opacity="0.45" />
                  <ellipse cx="60" cy="46" rx="2.5" ry="1.2" fill="#F43F5E" opacity="0.45" />

                  {/* Large Expressive Anime Eyes */}
                  <g id="anime-eyes">
                    <ellipse cx="42" cy="42" rx="3.5" ry="5.5" fill="#BE185D" />
                    <ellipse cx="42" cy="41" rx="2" ry="3.5" fill="#DB2777" />
                    <circle cx="41" cy="39" r="1.2" fill="#FFF" />
                    <circle cx="43.5" cy="43" r="0.6" fill="#FFF" />
                    
                    <ellipse cx="58" cy="42" rx="3.5" ry="5.5" fill="#BE185D" />
                    <ellipse cx="58" cy="41" rx="2" ry="3.5" fill="#DB2777" />
                    <circle cx="57" cy="39" r="1.2" fill="#FFF" />
                    <circle cx="59.5" cy="43" r="0.6" fill="#FFF" />
                    
                    {/* Eyebrows & Lashes */}
                    <path d="M 37 36 Q 42 34 46 37" stroke="#4A044E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    <path d="M 54 36 Q 58 34 63 37" stroke="#4A044E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    <path d="M 37 39 Q 42 38 46 41" stroke="#000" strokeWidth="1.2" fill="none" />
                    <path d="M 63 39 Q 58 38 54 41" stroke="#000" strokeWidth="1.2" fill="none" />
                  </g>
                  
                  {/* Smile */}
                  <path d="M 48 49 Q 50 51.5 52 49" stroke="#991B1B" strokeWidth="1" fill="none" strokeLinecap="round" />
                  
                  {/* Pink Anime Hair - Bangs & Side Locks */}
                  <g id="anime-hair">
                    <path d="M 35 34 C 32 30, 24 45, 23 68 C 28 68, 30 55, 33 42" fill="#EC4899" />
                    <path d="M 65 34 C 68 30, 76 45, 77 68 C 72 68, 70 55, 67 42" fill="#EC4899" />
                    {/* Center bangs */}
                    <path d="M 46 30 Q 50 43 51 43 Q 52 43 54 30 Z" fill="#F472B6" />
                    <path d="M 37 32 Q 44 41 45 41 Q 45 32 46 30 Z" fill="#F472B6" />
                    <path d="M 63 32 Q 56 41 55 41 Q 55 32 54 30 Z" fill="#F472B6" />
                  </g>

                  {/* Elegant Witch Hat */}
                  <g id="wizard-hat">
                    <path d="M 20 28 C 20 28, 50 18, 80 28 C 80 28, 70 8, 50 0 L 20 28 Z" fill="#6B21A8" stroke="#A855F7" strokeWidth="0.8" />
                    <ellipse cx="50" cy="28" rx="33" ry="4.5" fill="#581C87" stroke="#A855F7" strokeWidth="0.8" />
                    {/* Hat Band */}
                    <path d="M 33 26 C 42 24, 58 24, 67 26 L 68 28 C 59 26, 41 26, 32 28 Z" fill="#FDE047" />
                    <rect x="47" y="23" width="6" height="5" fill="#D97706" rx="1" />
                  </g>
                  
                  {/* Mage Staff */}
                  <g id="mage-staff">
                    <line x1="69" y1="85" x2="69" y2="35" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
                    {/* Glowing Crystal Ball */}
                    <circle cx="69" cy="30" r="5" fill="#22D3EE" stroke="#E0F7FA" strokeWidth="0.8" className="animate-pulse" />
                    {/* Orbiting magic ring */}
                    <ellipse cx="69" cy="30" rx="9" ry="2" fill="none" stroke="#22D3EE" strokeWidth="0.8" transform="rotate(-20 69 30)" opacity="0.7" className="animate-spin" />
                  </g>

                  {/* EQUIPPED ARTIFACTS DYNAMIC SVG OVERLAYS */}
                  {ownedArtifactIds.includes('art-boots') && (
                    <g id="equipped-boots">
                      {/* Left Winged Boot */}
                      <path d="M 23 80 L 29 80 L 29 86 L 21 86 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8" />
                      <path d="M 17 78 Q 23 80 20 84 Q 16 82 17 78 Z" fill="#FFFFFF" opacity="0.95" stroke="#E2E8F0" strokeWidth="0.5" />
                      {/* Right Winged Boot */}
                      <path d="M 69 80 L 75 80 L 73 86 L 67 86 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8" />
                      <path d="M 77 78 Q 71 80 74 84 Q 78 82 77 78 Z" fill="#FFFFFF" opacity="0.95" stroke="#E2E8F0" strokeWidth="0.5" />
                    </g>
                  )}

                  {ownedArtifactIds.includes('art-shield') && (
                    <g id="equipped-shield" className="animate-pulse">
                      {/* Protective Magic Shield floating on the left */}
                      <polygon points="12,56 22,52 24,66 18,74 12,66" fill="#3B82F6" stroke="#93C5FD" strokeWidth="1" opacity="0.85" />
                      <polygon points="14,58 20,55 22,64 17,70 14,64" fill="#60A5FA" opacity="0.9" />
                      <path d="M 15 62 L 20 62" stroke="#FFFFFF" strokeWidth="0.8" />
                      <path d="M 17 60 L 17 65" stroke="#FFFFFF" strokeWidth="0.8" />
                    </g>
                  )}

                  {ownedArtifactIds.includes('art-pen') && (
                    <g id="equipped-feather">
                      {/* Phoenix red feather in hat */}
                      <path d="M 40 24 Q 32 12 30 6 Q 36 10 40 18 Z" fill="#EF4444" stroke="#F59E0B" strokeWidth="0.5" />
                      <path d="M 39 24 Q 33 14 32 8" stroke="#FFF" strokeWidth="0.5" fill="none" />
                    </g>
                  )}

                  {ownedArtifactIds.includes('art-potion') && (
                    <g id="equipped-potion">
                      {/* Focus Potion belt vial */}
                      <rect x="33" y="58" width="4" height="6" rx="1" fill="#10B981" stroke="#047857" strokeWidth="0.5" />
                      <rect x="34" y="56" width="2" height="2" fill="#78350F" />
                      <circle cx="35" cy="60" r="0.8" fill="#FFF" opacity="0.8" />
                    </g>
                  )}

                  {ownedArtifactIds.includes('art-crown') && (
                    <g id="equipped-crown" transform="translate(36, -8) scale(0.28)" className="animate-bounce">
                      {/* Crown hovering above hat tip */}
                      <polygon points="10,25 25,5 40,25 32,32 18,32" fill="#FDE047" stroke="#D97706" strokeWidth="1.5" />
                      <circle cx="25" cy="5" r="2.5" fill="#EF4444" />
                      <circle cx="10" cy="25" r="2" fill="#3B82F6" />
                      <circle cx="40" cy="25" r="2" fill="#3B82F6" />
                    </g>
                  )}

                  {ownedArtifactIds.includes('art-book') && (
                    <g id="equipped-book" transform="translate(9, 36) scale(0.35)" className="animate-pulse">
                      {/* Open spellbook floating near left side */}
                      <path d="M 5 5 L 20 2 L 35 5 L 35 25 L 20 22 L 5 25 Z" fill="#78350F" stroke="#FBBF24" strokeWidth="1" />
                      <path d="M 8 7 L 20 4 L 32 7 L 32 23 L 20 20 L 8 23 Z" fill="#FEF3C7" />
                      <line x1="12" y1="10" x2="18" y2="8" stroke="#000" strokeWidth="0.8" />
                      <line x1="12" y1="14" x2="18" y2="12" stroke="#000" strokeWidth="0.8" />
                      <line x1="22" y1="8" x2="28" y2="10" stroke="#000" strokeWidth="0.8" />
                      <line x1="22" y1="12" x2="28" y2="14" stroke="#000" strokeWidth="0.8" />
                    </g>
                  )}
                </svg>
                {/* Visualizador de HP */}
                <div className="absolute -bottom-1 left-0 right-0 h-1.5 bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: `${playerHp}%` }} />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-purple-300 tracking-wider block">Elena (Sage)</span>
                <span className="text-[8px] font-bold text-zinc-400 block font-mono">HP: {playerHp}/100</span>
              </div>
            </div>

            {/* Santi (Warrior) */}
            <div className="flex items-center gap-3 relative jrpg-idle opacity-85">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-800 to-red-950 p-0.5 border border-rose-500/30">
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                  {/* Shadow */}
                  <ellipse cx="50" cy="86" rx="26" ry="5" fill="#000" opacity="0.35" />

                  {/* Blue Steel Plate Tunic */}
                  <path d="M 28 85 L 35 52 Q 50 46 65 52 L 72 85 Z" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="1" />
                  {/* Shoulder pads */}
                  <path d="M 25 54 Q 30 46 38 52 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8" />
                  <path d="M 75 54 Q 70 46 62 52 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8" />
                  {/* Chest plate armor */}
                  <rect x="42" y="55" width="16" height="30" fill="#9CA3AF" stroke="#D1D5DB" strokeWidth="0.8" rx="1" />
                  <circle cx="50" cy="65" r="2.5" fill="#EF4444" /> {/* Red Core Gem */}

                  {/* Face & Neck */}
                  <rect x="46" y="50" width="8" height="6" fill="#FED7AA" />
                  <path d="M 36 34 C 36 34, 34 46, 50 53 C 66 46, 64 34, 64 34 Z" fill="#FED7AA" />
                  
                  {/* Blush */}
                  <ellipse cx="42" cy="44" rx="2" ry="1" fill="#F43F5E" opacity="0.4" />
                  <ellipse cx="58" cy="44" rx="2" ry="1" fill="#F43F5E" opacity="0.4" />

                  {/* Confident blue anime eyes */}
                  <ellipse cx="44" cy="40" rx="2.5" ry="4" fill="#1D4ED8" />
                  <circle cx="43" cy="38" r="0.8" fill="#FFF" />
                  <ellipse cx="56" cy="40" rx="2.5" ry="4" fill="#1D4ED8" />
                  <circle cx="55" cy="38" r="0.8" fill="#FFF" />
                  
                  {/* Sharp eyebrows */}
                  <path d="M 39 34 L 46 36" stroke="#451A03" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M 61 34 L 54 36" stroke="#451A03" strokeWidth="1.5" strokeLinecap="round" />
                  
                  {/* Smile */}
                  <path d="M 48 47 Q 50 49 52 47" stroke="#000" strokeWidth="0.8" fill="none" />

                  {/* Spiky Brown Anime Hair (JRPG style) */}
                  <g id="santi-hair">
                    <path d="M 33 34 C 31 22, 22 30, 20 18 C 26 23, 28 14, 36 24 C 38 12, 44 20, 50 8 C 56 20, 62 12, 64 24 C 72 14, 74 23, 80 18 C 78 30, 69 22, 67 34 Z" fill="#78350F" stroke="#451A03" strokeWidth="0.8" />
                    {/* Front hair strands */}
                    <path d="M 38 34 Q 42 41 43 41 Q 44 32 45 28 Z" fill="#8b4513" />
                    <path d="M 62 34 Q 58 41 57 41 Q 56 32 55 28 Z" fill="#8b4513" />
                  </g>

                  {/* Iron Warrior Sword */}
                  <g id="santi-sword" transform="translate(10, 5) rotate(10)">
                    <line x1="62" y1="80" x2="76" y2="40" stroke="#B5B5B5" strokeWidth="3" strokeLinecap="round" />
                    <line x1="62" y1="80" x2="76" y2="40" stroke="#FFF" strokeWidth="1" strokeLinecap="round" /> {/* Shininess */}
                    <polygon points="74,42 78,35 79,41" fill="#FFF" />
                    {/* Gold guard & grip */}
                    <rect x="58" y="77" width="8" height="3" fill="#D97706" transform="rotate(22 58 77)" />
                    <line x1="59" y1="79" x2="56" y2="85" stroke="#78350F" strokeWidth="2.5" />
                  </g>
                </svg>
              </div>
              <div>
                <span className="text-[9px] font-extrabold uppercase text-rose-300 block">Santi (Guerrero)</span>
                <span className="text-[8px] font-semibold text-zinc-400 block font-mono">HP: 100%</span>
              </div>
            </div>

            {/* Lucas (Scout) */}
            <div className="flex items-center gap-3 relative jrpg-idle opacity-80">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-950 p-0.5 border border-emerald-500/30">
                <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                  {/* Shadow */}
                  <ellipse cx="50" cy="86" rx="26" ry="5" fill="#000" opacity="0.35" />

                  {/* Scout Forest Tunic */}
                  <path d="M 28 85 L 35 52 Q 50 46 65 52 L 72 85 Z" fill="#064E3B" stroke="#059669" strokeWidth="1" />
                  {/* Leather vest straps */}
                  <line x1="37" y1="52" x2="63" y2="85" stroke="#78350F" strokeWidth="2" />
                  <line x1="63" y1="52" x2="37" y2="85" stroke="#78350F" strokeWidth="2" />

                  {/* Flowing Cape (Back) */}
                  <path d="M 28 54 C 18 58, 14 78, 16 85 C 22 82, 30 70, 30 54" fill="#047857" />

                  {/* Face & Neck */}
                  <rect x="46" y="50" width="8" height="6" fill="#FED7AA" />
                  <path d="M 36 34 C 36 34, 34 46, 50 53 C 66 46, 64 34, 64 34 Z" fill="#FED7AA" />
                  
                  {/* Blush */}
                  <ellipse cx="42" cy="44" rx="2" ry="1" fill="#F43F5E" opacity="0.4" />
                  <ellipse cx="58" cy="44" rx="2" ry="1" fill="#F43F5E" opacity="0.4" />

                  {/* Large Green Scout Anime Eyes */}
                  <ellipse cx="44" cy="40" rx="2.5" ry="4" fill="#047857" />
                  <circle cx="43" cy="38" r="0.8" fill="#FFF" />
                  <ellipse cx="56" cy="40" rx="2.5" ry="4" fill="#047857" />
                  <circle cx="55" cy="38" r="0.8" fill="#FFF" />
                  
                  {/* Eyebrows */}
                  <path d="M 39 35 Q 43 33 46 35" stroke="#78350F" strokeWidth="1" fill="none" />
                  <path d="M 61 35 Q 57 33 54 35" stroke="#78350F" strokeWidth="1" fill="none" />

                  {/* Smile */}
                  <path d="M 48 47 Q 50 49 52 47" stroke="#000" strokeWidth="0.8" fill="none" />

                  {/* Spiky Yellow Anime Hair */}
                  <g id="lucas-hair">
                    <path d="M 33 34 C 31 22, 22 30, 21 16 C 27 21, 28 12, 37 22 C 39 10, 45 18, 50 6 C 55 18, 61 10, 63 22 C 71 12, 72 21, 78 16 C 77 30, 68 22, 67 34 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8" />
                    <path d="M 39 34 Q 43 40 44 40 Q 45 32 46 28 Z" fill="#FCD34D" />
                    <path d="M 61 34 Q 57 40 56 40 Q 55 32 54 28 Z" fill="#FCD34D" />
                  </g>

                  {/* Forest Hood draped on shoulders */}
                  <path d="M 33 48 C 33 48, 50 56, 67 48 C 67 48, 50 40, 33 48" fill="#10B981" stroke="#059669" strokeWidth="0.8" />

                  {/* Detailed Ranger Bow */}
                  <g id="lucas-bow" transform="translate(10, 5)">
                    <path d="M 64 78 Q 78 57 64 36" stroke="#92400E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <path d="M 64 78 Q 74 57 64 36" stroke="#D97706" strokeWidth="0.8" fill="none" />
                    <line x1="64" y1="78" x2="64" y2="36" stroke="#E2E8F0" strokeWidth="0.6" opacity="0.8" />
                  </g>
                </svg>
              </div>
              <div>
                <span className="text-[9px] font-extrabold uppercase text-emerald-300 block">Lucas (Explorador)</span>
                <span className="text-[8px] font-semibold text-zinc-400 block font-mono">HP: 100%</span>
              </div>
            </div>
          </div>

          {/* VS INDICATOR */}
          <div className="text-zinc-700 font-black text-xl font-mono tracking-widest select-none">VS</div>

          {/* LADO DERECHO: ENEMIGOS (TAREAS Y BOSS) */}
          <div className="flex flex-col items-end gap-3 z-20">
            {battlePhase !== 'fight' ? (
              // Vista de Tareas Pendientes como Monstruos
              <div className="flex flex-row gap-4">
                {homeworkQuests.map((quest, idx) => {
                  const status = questAttempts.some(a => a.quest_id === quest.id && (a.is_completed || a.score >= 60)) ? 'completed' : 'pending';
                  const isMath = activeMission.subject_id === 'sub-math';
                  
                  return (
                    <div key={quest.id} className="flex flex-col items-center gap-1.5 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800">
                      <div className="relative h-14 w-14 flex items-center justify-center">
                        {status === 'completed' ? (
                          // Enemigo Derrotado
                          <div className="opacity-45 text-center flex flex-col items-center">
                            <span className="text-2xl grayscale">☠️</span>
                            <span className="text-[7px] text-emerald-400 font-black uppercase tracking-wider block mt-1">Vencido</span>
                          </div>
                        ) : (
                          // Tarea Activa (Enemigo Vivo)
                          <div className="jrpg-idle flex flex-col items-center relative">
                            {isMath ? (
                              // Math Slime (JRPG Style)
                              <svg viewBox="0 0 100 100" className="w-12 h-12">
                                {/* Glossy Slime Body */}
                                <ellipse cx="50" cy="65" rx="36" ry="26" fill="url(#slimeGradient)" stroke="#059669" strokeWidth="2" />
                                <ellipse cx="50" cy="62" rx="30" ry="20" fill="url(#slimeInnerGradient)" />
                                <ellipse cx="34" cy="50" rx="12" ry="6" fill="#FFF" opacity="0.45" transform="rotate(-15 34 50)" />
                                <circle cx="34" cy="48" r="2" fill="#FFF" opacity="0.6" />

                                {/* Angry eyes */}
                                <polygon points="32,46 44,52 32,54" fill="#EF4444" />
                                <polygon points="68,46 56,52 68,54" fill="#EF4444" />
                                <circle cx="37" cy="52" r="2.5" fill="#FFF" />
                                <circle cx="63" cy="52" r="2.5" fill="#FFF" />

                                {/* Math symbols floating */}
                                <g stroke="#FFF" strokeWidth="3" strokeLinecap="round" opacity="0.95" className="animate-pulse">
                                  <line x1="50" y1="70" x2="50" y2="80" />
                                  <line x1="45" y1="75" x2="55" y2="75" />
                                  
                                  <line x1="20" y1="30" x2="28" y2="30" stroke="#34D399" />
                                  <circle cx="24" cy="24" r="1.5" fill="#34D399" />
                                  <circle cx="24" cy="36" r="1.5" fill="#34D399" />

                                  <line x1="72" y1="26" x2="80" y2="34" stroke="#34D399" />
                                  <line x1="80" y1="26" x2="72" y2="34" stroke="#34D399" />
                                </g>

                                <defs>
                                  <radialGradient id="slimeGradient" cx="50%" cy="30%" r="75%">
                                    <stop offset="0%" stopColor="#34D399" />
                                    <stop offset="70%" stopColor="#10B981" />
                                    <stop offset="100%" stopColor="#047857" />
                                  </radialGradient>
                                  <radialGradient id="slimeInnerGradient" cx="50%" cy="30%" r="75%">
                                    <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                                  </radialGradient>
                                </defs>
                              </svg>
                            ) : (
                              // Spanish Specter (JRPG Style)
                              <svg viewBox="0 0 100 100" className="w-12 h-12">
                                {/* Ethereal Specter Tail / Body */}
                                <path d="M 50 15 C 26 15, 18 35, 18 65 C 18 78, 30 78, 30 70 C 30 60, 42 75, 50 62 C 58 75, 70 60, 70 70 C 70 78, 82 78, 82 65 C 82 35, 74 15, 50 15 Z" fill="url(#specterGradient)" stroke="#2563EB" strokeWidth="1.5" />

                                <path d="M 30 25 C 40 20, 60 20, 70 25" stroke="#60A5FA" strokeWidth="2.5" fill="none" opacity="0.6" />

                                {/* Ethereal Glow Eyes */}
                                <circle cx="38" cy="38" r="6.5" fill="#FBBF24" />
                                <circle cx="62" cy="38" r="6.5" fill="#FBBF24" />
                                <circle cx="38" cy="38" r="2.5" fill="#000" />
                                <circle cx="62" cy="38" r="2.5" fill="#000" />
                                <circle cx="41" cy="36" r="1" fill="#FFF" />
                                <circle cx="65" cy="36" r="1" fill="#FFF" />

                                {/* Floating Spellbook */}
                                <g transform="translate(35, 62) scale(0.65)" className="animate-bounce">
                                  <path d="M 5 5 L 20 2 L 35 5 L 35 25 L 20 22 L 5 25 Z" fill="#78350F" stroke="#FBBF24" />
                                  <path d="M 8 7 L 20 4 L 32 7 L 32 23 L 20 20 L 8 23 Z" fill="#FEF3C7" />
                                  <line x1="12" y1="10" x2="18" y2="8" stroke="#000" strokeWidth="1" />
                                  <line x1="12" y1="14" x2="18" y2="12" stroke="#000" strokeWidth="1" />
                                  <line x1="22" y1="8" x2="28" y2="10" stroke="#000" strokeWidth="1" />
                                  <line x1="22" y1="12" x2="28" y2="14" stroke="#000" strokeWidth="1" />
                                </g>

                                <defs>
                                  <linearGradient id="specterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.95" />
                                    <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.75" />
                                    <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.1" />
                                  </linearGradient>
                                </defs>
                              </svg>
                            )}
                            {/* HP Bar */}
                            <div className="w-10 h-1 bg-red-950 border border-slate-800 rounded-full mt-1 overflow-hidden">
                              <div className="h-full bg-red-500 w-full" />
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-[8px] font-bold text-zinc-300 text-center truncate w-20">{quest.title}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Vista en Combate: Examen Boss Final Activo
              <div className={`flex flex-col items-center relative gap-2 duration-300 ${combatState === 'boss_attack' ? '-translate-x-20 scale-105 duration-200' : ''}`}>
                
                {/* Sprite del Jefe Final */}
                <div className={`relative ${combatState === 'boss_hurt' ? 'animate-bounce opacity-85' : 'jrpg-idle'}`}>
                  <svg viewBox="0 0 120 120" className="w-28 h-28 filter drop-shadow-[0_0_20px_rgba(239,68,68,0.45)]">
                    {/* Shadow */}
                    <ellipse cx="60" cy="112" rx="42" ry="7" fill="#000" opacity="0.4" />

                    {/* Wings (Flapping back) */}
                    <path d="M 45 65 C 10 40, 5 90, 20 95 C 32 90, 38 75, 45 65 Z" fill="#7F1D1D" stroke="#EF4444" strokeWidth="1.5" />
                    <path d="M 75 65 C 110 40, 115 90, 100 95 C 88 90, 82 75, 75 65 Z" fill="#7F1D1D" stroke="#EF4444" strokeWidth="1.5" />

                    {/* Tail */}
                    <path d="M 42 100 C 30 115, 12 110, 8 98 C 12 92, 28 100, 42 100 Z" fill="#991B1B" />
                    <polygon points="8,94 0,98 8,102" fill="#FBBF24" />

                    {/* Dragon Body / Torso */}
                    <path d="M 38 105 C 32 85, 38 65, 60 65 C 82 65, 88 85, 82 105 Z" fill="url(#dragonBodyGradient)" stroke="#991B1B" strokeWidth="1.5" />
                    
                    {/* Segmented belly plates */}
                    <path d="M 48 68 C 48 68, 60 76, 72 68 C 72 68, 60 84, 48 84" fill="#FDE047" opacity="0.8" />
                    <path d="M 46 82 C 46 82, 60 90, 74 82 C 74 82, 60 98, 46 98" fill="#FDE047" opacity="0.8" />
                    <path d="M 45 96 C 45 96, 60 104, 75 96 C 75 96, 60 110, 45 110" fill="#FDE047" opacity="0.8" />

                    {/* Dragon Neck */}
                    <path d="M 52 70 L 45 42 L 62 42 L 68 70 Z" fill="#991B1B" stroke="#7F1D1D" strokeWidth="1" />

                    {/* Dragon Head (Facing left) */}
                    <path d="M 32 30 C 32 20, 68 20, 68 35 C 68 45, 52 48, 45 45 C 35 45, 28 35, 32 30 Z" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="1.5" />
                    <path d="M 28 42 L 38 42 L 35 48 Z" fill="#991B1B" />

                    {/* Horns */}
                    <path d="M 54 22 C 58 12, 72 6, 75 10 C 70 14, 62 20, 58 22" fill="#FBBF24" stroke="#D97706" />
                    <path d="M 46 22 C 42 12, 28 6, 25 10 C 30 14, 38 20, 42 22" fill="#FBBF24" stroke="#D97706" />

                    {/* Glowing Red Eyes */}
                    <polygon points="35,28 43,30 38,34" fill="#FDE047" />
                    <circle cx="37" cy="30.5" r="1.2" fill="#EF4444" />

                    {/* Spikes along neck & back */}
                    <polygon points="65,58 72,55 68,64" fill="#111827" />
                    <polygon points="67,78 76,75 70,86" fill="#111827" />
                    <polygon points="65,92 74,90 68,100" fill="#111827" />

                    {/* Floating Boss Crown */}
                    <g transform="translate(40, -4) scale(0.65)" className="animate-bounce">
                      <polygon points="10,25 25,5 40,25 32,32 18,32" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
                      <circle cx="25" cy="5" r="2" fill="#EF4444" />
                      <circle cx="10" cy="25" r="1.5" fill="#3B82F6" />
                      <circle cx="40" cy="25" r="1.5" fill="#3B82F6" />
                    </g>

                    {/* Fire breath particles */}
                    <g opacity="0.85">
                      <circle cx="20" cy="48" r="4.5" fill="#F97316" className="animate-ping" />
                      <circle cx="12" cy="54" r="3" fill="#EF4444" className="animate-pulse" />
                      <circle cx="26" cy="52" r="2" fill="#FBBF24" />
                    </g>

                    <defs>
                      <linearGradient id="dragonBodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#DC2626" />
                        <stop offset="100%" stopColor="#7F1D1D" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Glitch Overlay en daño */}
                  {combatState === 'boss_hurt' && (
                    <div className="absolute inset-0 bg-red-500/30 mix-blend-color-dodge animate-ping" />
                  )}
                </div>

                {/* HP Bar del Jefe */}
                <div className="w-36 bg-zinc-950 p-2 rounded-xl border border-purple-950/60 shadow-lg text-center">
                  <div className="flex justify-between items-center text-[8px] font-black text-purple-300 uppercase tracking-widest mb-1">
                    <span>{examContent?.bossName || 'EXAMEN FINAL'}</span>
                    <span>HP {bossHp}/{bossMaxHp}</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div 
                      className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-300"
                      style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
                    />
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* CONTROLES Y DIALOGO DE COMBATE (h-[30%]) */}
        <div className="w-full h-[30%] flex flex-col justify-between px-3 pb-1 z-20">
          
          {/* Diálogo */}
          <div className="relative bg-zinc-950/95 border border-purple-500/40 rounded-xl p-2 flex gap-2.5 items-center backdrop-blur-md shadow-[0_0_12px_rgba(168,85,247,0.15)]">
            <div className="absolute -top-3 left-4 px-2.5 py-0.5 bg-purple-500 text-[8px] font-black uppercase tracking-wider text-white rounded-t-md rounded-br-md shadow-lg">
              SOMBRA LOG
            </div>
            
            <div className="h-6 w-6 rounded bg-purple-950/80 border border-purple-400/50 flex items-center justify-center text-[10px] animate-bounce shrink-0">
              💡
            </div>
            <div className="flex-1 overflow-y-auto max-h-[35px]">
              <p className="text-[9.5px] md:text-xs text-zinc-200 font-medium leading-tight">
                {sombraText}
              </p>
            </div>
          </div>

          {/* Menú de Botones e Interacciones */}
          <div className="flex justify-between items-center gap-4">
            {/* Opciones en reposo */}
            {battlePhase === 'idle' && (
              <div className="flex gap-2">
                <button
                  onClick={startFight}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[10px] md:text-xs font-black tracking-widest uppercase rounded-xl transition-all shadow-md shadow-indigo-650/35 flex items-center gap-1.5 border border-purple-500/20"
                >
                  <Swords className="h-4.5 w-4.5" />
                  Iniciar Examen Boss ⚔_
                </button>
                <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-xl text-[9px] font-bold text-zinc-400">
                  <AlertCircle className="h-3.5 w-3.5 text-zinc-500" />
                  {completedHomeworkCount}/{totalHomeworkCount} Tareas completas
                </div>
              </div>
            )}

            {/* Opciones en Combate */}
            {battlePhase === 'fight' && (
              <div className="flex items-center gap-2 w-full justify-between">
                {/* Comandos del Jugador */}
                <div className="flex gap-2">
                  <button 
                    disabled={combatState !== 'idle'}
                    onClick={() => handlePlayerAttack('normal')}
                    className="px-4 py-2 bg-purple-800 hover:bg-purple-700 disabled:opacity-40 text-[9px] md:text-xs font-black rounded-lg border border-purple-500/30 tracking-wider transition-all uppercase text-white shadow"
                  >
                    [ ⚔️ Atacar ]
                  </button>
                  <button 
                    disabled={combatState !== 'idle'}
                    onClick={() => handlePlayerAttack('skill')}
                    className="px-4 py-2 bg-indigo-800 hover:bg-indigo-700 disabled:opacity-40 text-[9px] md:text-xs font-black rounded-lg border border-indigo-500/30 tracking-wider transition-all uppercase text-white shadow"
                  >
                    [ 🔮 Habilidad ]
                  </button>
                  <button 
                    disabled={combatState !== 'idle' || ownedArtifacts.length === 0}
                    onClick={() => setIsUsingItem(prev => !prev)}
                    className="px-4 py-2 bg-amber-800 hover:bg-amber-700 disabled:opacity-40 text-[9px] md:text-xs font-black rounded-lg border border-amber-500/30 tracking-wider transition-all uppercase text-white shadow"
                  >
                    [ 🎒 Objetos ({ownedArtifacts.length}) ]
                  </button>
                </div>

                <div className="text-[10px] font-bold text-purple-400 bg-purple-950/45 px-2.5 py-1 rounded border border-purple-900/40">
                  Ronda: {turnCount}
                </div>
              </div>
            )}

            {/* Pantalla de Victoria */}
            {battlePhase === 'victory' && (
              <div className="flex items-center gap-3 w-full justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  <span className="text-xs font-black text-emerald-400 uppercase">¡EXAMEN APROBADO!</span>
                </div>
                <div className="flex gap-2">
                  {usedAttempts < totalAttemptsAllowed - 1 && (
                    <button
                      onClick={handleRetryBattle}
                      className="px-4 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-[10px] font-black uppercase text-white rounded-lg transition-all"
                    >
                      Reintentar Examen (Oportunidad)
                    </button>
                  )}
                  <button 
                    onClick={handleReset}
                    className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-black uppercase text-zinc-300 rounded-lg transition-all"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* Pantalla de Derrota */}
            {battlePhase === 'defeat' && (
              <div className="flex items-center gap-3 w-full justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-xs font-black text-red-500 uppercase">Derrota Académica</span>
                </div>
                <div className="flex gap-2">
                  {usedAttempts < totalAttemptsAllowed - 1 ? (
                    <button
                      onClick={handleRetryBattle}
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-[10px] font-black uppercase text-white rounded-lg transition-all"
                    >
                      Usar Oportunidad ({usedAttempts + 1}/{totalAttemptsAllowed - 1})
                    </button>
                  ) : (
                    <div className="text-[9px] text-zinc-500 font-bold bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">
                      Oportunidades agotadas. Consigue monedas y compra artefactos en la Tienda.
                    </div>
                  )}
                  <button 
                    onClick={handleReset}
                    className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-black uppercase text-zinc-300 rounded-lg transition-all"
                  >
                    Salir
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dropdown de Items para usar */}
        {isUsingItem && battlePhase === 'fight' && (
          <div className="absolute left-[38%] bottom-[35%] z-50 w-64 bg-zinc-900 border border-amber-500/40 rounded-xl p-3 shadow-2xl flex flex-col gap-2 max-h-40 overflow-y-auto">
            <span className="text-[9px] font-black text-amber-500 uppercase border-b border-zinc-800 pb-1">Selecciona un artefacto:</span>
            {ownedArtifacts.map((art) => (
              <button
                key={art.id}
                onClick={() => handleUseItem(art)}
                className="flex items-center justify-between p-1.5 rounded bg-zinc-950/80 hover:bg-zinc-800 text-left text-[9px] text-zinc-200 hover:text-white transition-all font-semibold"
              >
                <span>{art.name}</span>
                <span className="text-[8px] text-amber-400 italic font-medium">{art.effect === 'extra_attempt' ? 'Oportunidad' : 'Efecto'}</span>
              </button>
            ))}
          </div>
        )}

        {/* Indicador inferior */}
        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-slate-600 tracking-widest uppercase pointer-events-none">
          one-hand interactive
        </div>
      </div>

      {/* Informativo del Gremio */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
        <h3 className="text-xs font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider mb-3 flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-purple-500" />
          Reglas del Gremio del Examen Final (Simulador Secundaria)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-850 flex flex-col gap-1">
            <strong className="text-zinc-700 dark:text-zinc-300">⚔️ Poder Académico:</strong>
            <p className="leading-relaxed">Tu daño final depende de las tareas entregadas. Si tienes 0/2 tareas, harás 0 de daño.</p>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-850 flex flex-col gap-1">
            <strong className="text-zinc-700 dark:text-zinc-300">⌛ Turnos & Calificación:</strong>
            <p className="leading-relaxed">1-3 turnos = Nota 10 | 4-5 turnos = Nota 9 | 6-7 turnos = Nota 8 | 8-9 turnos = Nota 7 | 10+ turnos = Nota 6.</p>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-850 flex flex-col gap-1">
            <strong className="text-zinc-700 dark:text-zinc-300">🎁 Oportunidades Extra:</strong>
            <p className="leading-relaxed">Cuentas con 1 intento base. Cada artefacto comprado en la tienda o dado por tu profesor otorga +1 intento extra.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
