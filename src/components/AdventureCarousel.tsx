"use client";

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Lock, Trophy, Coins, Sparkles, 
  BookOpen, Brain, Swords, Compass, HelpCircle, MapPin
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mission } from '@/types';

interface AdventureCarouselProps {
  missions: Mission[];
}

interface ExtendedCard {
  id: string;
  title: string;
  description: string;
  subjectName: string;
  subjectColor: string; // Tailwind glow/text classes
  glowColor: string; // Shadow RGB colors
  isLocked: boolean;
  xpReward: number;
  coinsReward: number;
  questsCount: number;
  icon: React.ReactNode;
  backgroundImage: string; // Gradient style
  minLevel?: number;
}

export default function AdventureCarousel({ missions }: AdventureCarouselProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [cards, setCards] = useState<ExtendedCard[]>([]);

  const handleCardClick = (card: ExtendedCard, isActive: boolean) => {
    if (!isActive) return;
    if (card.isLocked) {
      alert('Nivel insuficiente para desbloquear esta aventura');
      return;
    }
    router.push(`/student/missions/${card.id}`);
  };

  // Build the list of cards, combining real missions with immersive locked RPG placeholders
  useEffect(() => {
    const realCards: ExtendedCard[] = missions.map((mission) => {
      const isMath = mission.subject_id === 'sub-math';
      const subjectName = isMath ? 'Alquimia Matemática' : 'Runas y Lenguaje';
      const subjectColor = isMath 
        ? 'text-cyan-400 border-cyan-500/30 bg-cyan-950/30' 
        : 'text-purple-400 border-purple-500/30 bg-purple-950/30';
      const glowColor = isMath ? 'rgba(34,211,238,0.25)' : 'rgba(192,132,252,0.25)';
      
      const xpReward = mission.quests?.reduce((acc, q) => acc + (q.xp_reward || 0), 0) || 250;
      const coinsReward = mission.quests?.reduce((acc, q) => acc + (q.coins_reward || 0), 0) || 45;
      const questsCount = mission.quests?.length || 2;

      const icon = isMath 
        ? <Brain className="h-8 w-8 text-cyan-400" />
        : <BookOpen className="h-8 w-8 text-purple-400" />;

      const backgroundImage = isMath
        ? 'from-slate-900 via-cyan-950/40 to-slate-950'
        : 'from-slate-900 via-purple-950/40 to-slate-950';

      return {
        id: mission.id,
        title: mission.title,
        description: mission.description,
        subjectName,
        subjectColor,
        glowColor,
        isLocked: false,
        xpReward,
        coinsReward,
        questsCount,
        icon,
        backgroundImage
      };
    });

    // Epic locked placeholders to fill the 3D space and make it look like a true RPG map
    const placeholders: ExtendedCard[] = [
      {
        id: 'locked-equations',
        title: 'El Laberinto de las Ecuaciones',
        description: 'Desbloquea las compuertas de la antigua fortaleza resolviendo acertijos algebraicos de segundo grado.',
        subjectName: 'Aritmética Avanzada',
        subjectColor: 'text-emerald-400 border-emerald-500/20 bg-emerald-950/20',
        glowColor: 'rgba(52,211,153,0.1)',
        isLocked: true,
        xpReward: 350,
        coinsReward: 60,
        questsCount: 3,
        icon: <Lock className="h-8 w-8 text-zinc-500" />,
        backgroundImage: 'from-zinc-900 via-emerald-950/10 to-zinc-950',
        minLevel: 5
      },
      {
        id: 'locked-ecosystem',
        title: 'Ecosistemas en Desequilibrio',
        description: 'Adéntrate en el Bosque Susurrante y restaura la cadena alimenticia purificando el agua mágica.',
        subjectName: 'Biología y Entorno',
        subjectColor: 'text-amber-400 border-amber-500/20 bg-amber-950/20',
        glowColor: 'rgba(251,191,36,0.1)',
        isLocked: true,
        xpReward: 400,
        coinsReward: 80,
        questsCount: 4,
        icon: <Lock className="h-8 w-8 text-zinc-500" />,
        backgroundImage: 'from-zinc-900 via-amber-950/10 to-zinc-950',
        minLevel: 7
      },
      {
        id: 'locked-code',
        title: 'La Mazmorra del Silicio',
        description: 'Hackea los golems de seguridad programando algoritmos de búsqueda y rescata los planos perdidos.',
        subjectName: 'Tecnología e Informática',
        subjectColor: 'text-rose-400 border-rose-500/20 bg-rose-950/20',
        glowColor: 'rgba(251,113,133,0.1)',
        isLocked: true,
        xpReward: 500,
        coinsReward: 100,
        questsCount: 5,
        icon: <Lock className="h-8 w-8 text-zinc-500" />,
        backgroundImage: 'from-zinc-900 via-rose-950/10 to-zinc-950',
        minLevel: 10
      }
    ];

    setCards([...realCards, ...placeholders]);
  }, [missions]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % cards.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cards]);

  if (cards.length === 0) return null;

  return (
    <div className="relative w-full py-12 flex flex-col items-center justify-center select-none overflow-hidden bg-zinc-950/60 rounded-3xl border border-zinc-900 shadow-2xl backdrop-blur-md">
      
      {/* Background Starry/Glowing Aura */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      {/* Styled RPG Title */}
      <div className="text-center mb-10 relative z-10">
        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-amber-500/80 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">
          CONTRATOS ACADÉMICOS ACTIVOS
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-wider mt-1.5 uppercase font-serif bg-gradient-to-b from-yellow-100 via-amber-300 to-yellow-600 bg-clip-text text-transparent filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          ELIGE TU AVENTURA
        </h2>
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-500/50" />
          <div className="h-1.5 w-1.5 rotate-45 border border-amber-500/80 bg-amber-600/30" />
          <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-500/50" />
        </div>
      </div>

      {/* 3D Carousel Stage */}
      <div className="relative w-full max-w-5xl h-[460px] flex items-center justify-center">
        
        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-4 md:left-8 z-40 p-3 rounded-full border border-amber-500/30 bg-zinc-950/80 text-amber-500 hover:text-amber-400 hover:border-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:scale-110 active:scale-95 transition-all duration-300"
          aria-label="Aventura anterior"
        >
          <ChevronLeft className="h-6 w-6 stroke-[2.5]" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 md:right-8 z-40 p-3 rounded-full border border-amber-500/30 bg-zinc-950/80 text-amber-500 hover:text-amber-400 hover:border-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:scale-110 active:scale-95 transition-all duration-300"
          aria-label="Siguiente aventura"
        >
          <ChevronRight className="h-6 w-6 stroke-[2.5]" />
        </button>

        {/* 3D Perspective Card Container */}
        <div 
          className="relative w-full h-full flex items-center justify-center"
          style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
        >
          {cards.map((card, index) => {
            const N = cards.length;
            let offset = index - activeIndex;

            // Handle wrapping for circular offset
            if (offset < -Math.floor(N / 2)) offset += N;
            if (offset > Math.floor(N / 2)) offset -= N;

            const isActive = offset === 0;
            const isVisible = Math.abs(offset) <= 2; // Show active + 2 left + 2 right

            if (!isVisible) return null;

            // Calculate 3D transformation values
            const rotateY = offset * 42; // rotate slightly for side panels
            const translateZ = isActive ? 120 : -100 - Math.abs(offset) * 80; // push side cards back
            const translateX = offset * 260; // spread wide on large screens
            const scale = isActive ? 1.05 : 0.85 - Math.abs(offset) * 0.08;
            const zIndex = 10 - Math.abs(offset);
            const opacity = isActive ? 1 : 0.6 - Math.abs(offset) * 0.18;

            return (
              <div
                key={card.id}
                onClick={() => {
                  if (card.isLocked) {
                    alert('Nivel insuficiente para desbloquear esta aventura');
                    return;
                  }
                  if (isActive) {
                    handleCardClick(card, isActive);
                  } else {
                    setActiveIndex(index);
                  }
                }}
                className={`absolute w-[290px] md:w-[320px] h-[390px] rounded-2xl border transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col justify-between p-6 ${
                  isActive 
                    ? card.isLocked ? 'border-rose-500/40 cursor-not-allowed opacity-50' : 'border-amber-500/60 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.8)] shadow-amber-500/20 cursor-pointer' 
                    : 'border-zinc-800 hover:border-zinc-700 hover:opacity-80 cursor-pointer'
                } bg-gradient-to-b ${card.backgroundImage}`}
                style={{
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity: opacity,
                  zIndex: zIndex,
                  boxShadow: isActive ? `0 0 35px -5px ${card.glowColor}, 0 10px 30px rgba(0,0,0,0.8)` : undefined,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden'
                }}
              >
                {/* Decorative Celtic/RPG Borders on Active Card */}
                {isActive && (
                  <div className="absolute inset-[3px] border border-amber-500/10 rounded-[13px] pointer-events-none">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-amber-500/40" />
                    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-amber-500/40" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-amber-500/40" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-amber-500/40" />
                  </div>
                )}

                {/* Card Content */}
                <div className="flex flex-col gap-4">
                  {/* Category Tag */}
                  <div className="flex justify-between items-start">
                    <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-md border ${card.subjectColor}`}>
                      {card.subjectName}
                    </span>
                    {card.isLocked && (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-rose-500/90 bg-rose-950/20 border border-rose-500/30 px-2 py-0.5 rounded">
                        <Lock className="h-3 w-3" />
                        Nivel {card.minLevel}
                      </span>
                    )}
                  </div>

                  {/* Adventure Title */}
                  <div>
                    <h3 className={`text-lg font-black font-serif leading-snug tracking-wide transition-colors duration-300 ${
                      isActive ? 'text-zinc-100 group-hover:text-amber-400' : 'text-zinc-400'
                    }`}>
                      {card.title}
                    </h3>
                    <p className={`text-xs mt-2 leading-relaxed line-clamp-3 ${
                      isActive ? 'text-zinc-400' : 'text-zinc-500'
                    }`}>
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Adventure Stats / Rewards Panel */}
                <div className="flex flex-col gap-4 mt-auto">
                  
                  {/* Visual Artwork Placeholder in the card center */}
                  <div className="flex items-center justify-center py-4 bg-zinc-950/40 rounded-xl border border-zinc-900/60 shadow-inner relative overflow-hidden group">
                    <div className="absolute inset-0 bg-radial-gradient from-transparent to-zinc-950/30 opacity-40" />
                    <div className="transform group-hover:scale-110 transition-transform duration-300 z-10">
                      {card.icon}
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-zinc-950/50 px-3.5 py-2.5 rounded-xl border border-zinc-900/50 text-[11px] font-bold text-zinc-400">
                    <div className="flex items-center gap-1.5" title="XP a ganar">
                      <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                      <span>{card.xpReward} <span className="text-[9px] text-zinc-500">XP</span></span>
                    </div>
                    <div className="w-[1px] h-4 bg-zinc-800" />
                    <div className="flex items-center gap-1.5" title="Monedas a ganar">
                      <Coins className="h-3.5 w-3.5 text-amber-500" />
                      <span>{card.coinsReward} <span className="text-[9px] text-zinc-500">🪙</span></span>
                    </div>
                    <div className="w-[1px] h-4 bg-zinc-800" />
                    <div className="flex items-center gap-1" title="Cuestionarios / Tareas">
                      <Compass className="h-3.5 w-3.5 text-purple-400" />
                      <span>{card.questsCount} <span className="text-[9px] text-zinc-500">retos</span></span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {card.isLocked ? (
                    <button
                      disabled
                      className="w-full py-2.5 bg-zinc-900 text-zinc-650 border border-zinc-850 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed opacity-50 pointer-events-none"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      Nivel insuficiente
                    </button>
                  ) : (
                    <Link
                      href={`/student/missions/${card.id}`}
                      onClick={(e) => {
                        // Prevent clicking through to center card if the card was not active
                        if (!isActive) {
                          e.preventDefault();
                        }
                      }}
                      className={`w-full text-center py-3 rounded-xl text-xs font-black text-zinc-950 transition-all duration-300 flex items-center justify-center gap-2 tracking-wider uppercase ${
                        isActive 
                          ? 'bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.45)] hover:scale-[1.01] active:scale-[0.98]' 
                          : 'bg-zinc-800 text-zinc-400 pointer-events-none'
                      }`}
                    >
                      <Swords className="h-4 w-4 stroke-[2.5]" />
                      ¡INICIAR RETO! ⚡
                    </Link>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Mini Dot Indicators */}
      <div className="flex gap-2 mt-6 relative z-10">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === activeIndex 
                ? 'w-6 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' 
                : 'w-1.5 bg-zinc-800 hover:bg-zinc-700'
            }`}
            aria-label={`Ir a aventura ${index + 1}`}
          />
        ))}
      </div>

    </div>
  );
}
