"use client";

import React, { useState, useEffect } from 'react';
import { useGamification } from '@/context/gamification-context';
import { Header } from '@/components/Header';
import { 
  Coins, ArrowLeft, Shield, Sparkles, Heart, Bell, ShoppingBag, 
  MessageSquare, Footprints, PenTool, BookOpen, Scroll, Dumbbell, 
  GlassWater, Wand2, Gem, Clock, Crown, Sparkle, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function MagicShopPage() {
  const { 
    stats, activeStudentId, shopArtifacts, studentInventoryMap, 
    studentMessages, purchaseArtifact, markStudentMessageAsRead, detailedStudents
  } = useGamification();

  const ownedArtifactIds = studentInventoryMap[activeStudentId] || [];
  const activeStudent = detailedStudents?.find(s => s.id === activeStudentId);

  const defaultDialogue = "¡Bienvenido/a a mi Tienda Mágica, joven héroe! Soy Lyra, la guardiana del bosque. Mis artefactos te darán oportunidades extra de reintentar tus exámenes. ¿Hay alguno que te interese?";
  const [fairyDialogue, setFairyDialogue] = useState(defaultDialogue);
  const [tempDialogueTimeout, setTempDialogueTimeout] = useState<NodeJS.Timeout | null>(null);

  // Helper to trigger temporary fairy dialogue
  const triggerFairyReaction = (text: string) => {
    if (tempDialogueTimeout) clearTimeout(tempDialogueTimeout);
    setFairyDialogue(text);
    const timeout = setTimeout(() => {
      setFairyDialogue(defaultDialogue);
    }, 4000);
    setTempDialogueTimeout(timeout);
  };

  const handlePurchase = (artifactId: string, price: number, name: string) => {
    if (ownedArtifactIds.includes(artifactId)) {
      triggerFairyReaction(`¡Ya llevas el/la "${name}" contigo! Su poder ya te acompaña.`);
      return;
    }

    if (stats.coins < price) {
      triggerFairyReaction(`¡Oh! Parece que aún necesitas más monedas escolares para llevarte el/la "${name}". ¡Sigue completando tus tareas!`);
      purchaseArtifact(activeStudentId, artifactId); // Trigger original context check/alert
      return;
    }

    // Process purchase
    purchaseArtifact(activeStudentId, artifactId);
    triggerFairyReaction(`¡Excelente elección! El/La "${name}" ahora es tuyo/a. ¡Equípalo/a en tu próxima batalla de examen!`);
  };

  const handleHoverItem = (name: string, price: number, description: string) => {
    if (tempDialogueTimeout) return; // Don't interrupt temporary reaction (like purchase success/fail)
    setFairyDialogue(`El/La "${name}" cuesta ${price} monedas. ${description} ¿Te gustaría comprarlo/a?`);
  };

  const handleLeaveHover = () => {
    if (tempDialogueTimeout) return;
    setFairyDialogue(defaultDialogue);
  };

  const getEmojiForIcon = (iconName: string) => {
    const emojiMap: Record<string, string> = {
      Footprints: '🥾', Shield: '🛡️', PenTool: '🖋️', Wine: '🧪', Scroll: '📜',
      Dumbbell: '⚔️', GlassWater: '🧪', Sparkles: '✨', Shirt: '🧥', Wand2: '🪄',
      Gem: '💎', Clock: '⏳', Crown: '👑', BookOpen: '📖', Heart: '❤️'
    };
    return emojiMap[iconName] || '🎁';
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white select-none">
      <Header />

      {/* CSS Animations blocks */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fairy-float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        @keyframes flap-left {
          0% { transform: scaleX(1) rotate(-5deg); }
          50% { transform: scaleX(0.3) rotate(-15deg); }
          100% { transform: scaleX(1) rotate(-5deg); }
        }
        @keyframes flap-right {
          0% { transform: scaleX(1) rotate(5deg); }
          50% { transform: scaleX(0.3) rotate(15deg); }
          100% { transform: scaleX(1) rotate(5deg); }
        }
        @keyframes sparkle-float {
          0% { transform: translateY(0px) opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-40px) opacity: 0; }
        }
        .fairy-container {
          animation: fairy-float 3s ease-in-out infinite;
        }
        .wing-l {
          animation: flap-left 1.2s ease-in-out infinite;
          transform-origin: 52px 42px;
        }
        .wing-r {
          animation: flap-right 1.2s ease-in-out infinite;
          transform-origin: 48px 42px;
        }
        .firefly {
          animation: sparkle-float 4s ease-in-out infinite;
        }
      `}} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        
        {/* BUTTON TO RETURN TO PORTAL */}
        <div className="flex justify-between items-center">
          <Link 
            href="/student"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white transition-all shadow-md active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Portal Escolar
          </Link>
          
          <div className="flex items-center gap-2 bg-purple-900/35 border border-purple-500/30 px-4 py-2 rounded-xl">
            <Coins className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-xs font-black text-zinc-100 uppercase tracking-wider">
              Tus Monedas: <strong className="text-yellow-400 text-sm">{stats.coins}</strong>
            </span>
          </div>
        </div>

        {/* TOP HALF: FOREST SHOP WITH FAIRY AND wooden COUNTER */}
        <div className="relative w-full rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-indigo-950 via-emerald-950/60 to-zinc-950 overflow-hidden shadow-2xl p-6 flex flex-col justify-end min-h-[260px] md:min-h-[300px]">
          
          {/* Layered Forest Background SVG */}
          <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
            <svg viewBox="0 0 1000 300" className="w-full h-full object-cover">
              {/* Back hills & trees */}
              <path d="M 0 300 L 0 200 Q 150 180 300 240 Q 450 280 600 210 Q 750 160 900 230 Q 950 250 1000 220 L 1000 300 Z" fill="#064E3B" />
              {/* Mid layer trees */}
              <g fill="#022C22">
                <polygon points="100,220 70,280 130,280" />
                <polygon points="100,190 80,240 120,240" />
                <polygon points="250,250 220,300 280,300" />
                <polygon points="500,240 460,290 540,290" />
                <polygon points="500,210 475,260 525,260" />
                <polygon points="780,210 740,280 820,280" />
                <polygon points="780,180 755,230 805,230" />
              </g>
              {/* Front ground */}
              <path d="M 0 300 L 0 250 Q 250 230 500 270 Q 750 290 1000 240 L 1000 300 Z" fill="#022C22" />
            </svg>
          </div>

          {/* Floating Fireflies (Sparkles) */}
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="firefly absolute left-[15%] top-[60%] w-2 h-2 rounded-full bg-yellow-400 blur-[1px]" style={{ animationDelay: '0s' }} />
            <div className="firefly absolute left-[30%] top-[40%] w-1.5 h-1.5 rounded-full bg-emerald-400 blur-[1px]" style={{ animationDelay: '1.5s' }} />
            <div className="firefly absolute left-[45%] top-[70%] w-2.5 h-2.5 rounded-full bg-yellow-300 blur-[1.5px]" style={{ animationDelay: '0.8s' }} />
            <div className="firefly absolute left-[70%] top-[35%] w-2 h-2 rounded-full bg-yellow-400 blur-[1px]" style={{ animationDelay: '2.3s' }} />
            <div className="firefly absolute left-[85%] top-[55%] w-1.5 h-1.5 rounded-full bg-emerald-300 blur-[0.8px]" style={{ animationDelay: '3.1s' }} />
          </div>

          {/* MAIN CHARACTERS ROW: FAIRY & SPEECH BUBBLE */}
          <div className="relative z-20 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 pb-4 w-full">
            
            {/* Dialogue Bubble */}
            <div className="flex-1 max-w-xl md:max-w-2xl bg-zinc-950/90 border-2 border-emerald-500/40 rounded-3xl p-4 md:p-5 shadow-2xl relative backdrop-blur-md">
              {/* Speech bubble arrow pointer */}
              <div className="absolute bottom-[-10px] md:bottom-auto md:top-1/2 right-1/2 translate-x-1/2 md:translate-x-0 md:right-[-10px] md:-translate-y-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-emerald-500 md:border-t-transparent md:border-l-[10px] md:border-l-emerald-500 md:border-y-[10px] md:border-y-transparent" />
              
              <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Lyra (Hada Guardiana)
              </div>
              <p className="text-xs md:text-sm text-zinc-100 font-medium leading-relaxed italic">
                "{fairyDialogue}"
              </p>
            </div>

            {/* SVG FAIRY BEHIND COUNTER */}
            <div className="relative w-44 h-44 flex flex-col justify-end items-center shrink-0">
              
              {/* Wooden Counter Background behind Fairy */}
              <div className="absolute bottom-0 w-36 h-8 bg-amber-900 border-t border-amber-600 rounded-t-md shadow-inner flex justify-center items-center">
                <div className="w-full h-1 bg-amber-950/40 mt-1" />
              </div>

              {/* The Fairy Sprite container */}
              <div className="fairy-container w-28 h-28 mb-3 relative flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_12px_rgba(34,211,238,0.5)] overflow-visible">
                  
                  {/* Wings (animated wing flaps) */}
                  <g className="wing-l">
                    <ellipse cx="32" cy="42" rx="18" ry="10" fill="url(#wingGradient)" transform="rotate(-30 32 42)" opacity="0.8" />
                    <ellipse cx="38" cy="50" rx="14" ry="7" fill="url(#wingGradient)" transform="rotate(-20 38 50)" opacity="0.6" />
                  </g>
                  <g className="wing-r">
                    <ellipse cx="68" cy="42" rx="18" ry="10" fill="url(#wingGradient)" transform="rotate(30 68 42)" opacity="0.8" />
                    <ellipse cx="62" cy="50" rx="14" ry="7" fill="url(#wingGradient)" transform="rotate(20 62 50)" opacity="0.6" />
                  </g>

                  {/* Body & Dress */}
                  <path d="M 40 78 C 40 78, 50 88, 60 78 L 56 55 L 44 55 Z" fill="#06B6D4" stroke="#22D3EE" strokeWidth="1" />
                  <ellipse cx="50" cy="80" rx="12" ry="4" fill="#22D3EE" opacity="0.6" />

                  {/* Face */}
                  <circle cx="50" cy="45" r="11" fill="#FFEDD5" />

                  {/* Hair */}
                  <path d="M 39 45 C 39 30, 61 30, 61 45 C 61 52, 63 60, 58 64 C 55 60, 45 60, 42 64 C 37 60, 39 52, 39 45 Z" fill="#F472B6" />
                  <circle cx="50" cy="34" r="6" fill="#F472B6" /> {/* Hair bun */}
                  
                  {/* Eyes & Blush */}
                  <ellipse cx="46" cy="44" rx="1.2" ry="2" fill="#0F172A" />
                  <ellipse cx="54" cy="44" rx="1.2" ry="2" fill="#0F172A" />
                  <circle cx="43" cy="47" r="1.5" fill="#FDA4AF" opacity="0.7" />
                  <circle cx="57" cy="47" r="1.5" fill="#FDA4AF" opacity="0.7" />
                  
                  {/* Smile */}
                  <path d="M 48 48 Q 50 50 52 48" stroke="#000" strokeWidth="1" fill="none" strokeLinecap="round" />

                  {/* Fairy Magic Wand */}
                  <line x1="58" y1="58" x2="68" y2="44" stroke="#FBBF24" strokeWidth="1.8" strokeLinecap="round" />
                  <polygon points="68,40 66,43 70,43" fill="#FDE047" />
                  <circle cx="68" cy="42" r="1.5" fill="#FFF" className="animate-pulse" />

                  <defs>
                    <radialGradient id="wingGradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.8" />
                      <stop offset="70%" stopColor="#0891B2" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#0891B2" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>

              {/* Sparkles Floating around Fairy */}
              <div className="absolute top-4 left-6 pointer-events-none">
                <Sparkle className="h-3.5 w-3.5 text-yellow-300 animate-spin opacity-80" />
              </div>
              <div className="absolute top-12 right-6 pointer-events-none">
                <Sparkle className="h-4 w-4 text-cyan-300 animate-pulse opacity-70" />
              </div>
            </div>

          </div>

          {/* WOODEN SHELF COUNTER FOREGROUND EFFECT */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-amber-800 via-amber-900 to-amber-800 border-t border-amber-600 z-30 shadow-md" />
        </div>

        {/* BOTTOM HALF: SHOP GRID + SIDE PANELS (INVENTORY & ALERTS) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ARTEFACTOS DISPONIBLES (Col-span 2) */}
          <div className="lg:col-span-2 rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md p-6 shadow-xl flex flex-col gap-4">
            <div>
              <h2 className="text-md font-black text-zinc-100 flex items-center gap-2 uppercase tracking-wider">
                <ShoppingBag className="h-5 w-5 text-emerald-400" />
                Reliquias Mágicas en Mostrador
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">Pasa el cursor sobre un artefacto para revelar su poder al hada. Compra con tus monedas escolares.</p>
            </div>

            {/* Scrollable grid of items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-1">
              {shopArtifacts.map((art) => {
                const isOwned = ownedArtifactIds.includes(art.id);
                const emoji = getEmojiForIcon(art.icon);
                const hasCoins = stats.coins >= art.price;

                return (
                  <div 
                    key={art.id} 
                    onMouseEnter={() => handleHoverItem(art.name, art.price, art.description)}
                    onMouseLeave={handleLeaveHover}
                    className={`p-3.5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-3 text-xs bg-zinc-950/60 ${
                      isOwned 
                        ? 'border-zinc-800/80 opacity-70' 
                        : 'border-zinc-800 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-950/25'
                    }`}
                  >
                    <div className="flex gap-3 items-start">
                      <span className="text-3xl p-2 bg-zinc-900 rounded-xl border border-zinc-800 shadow-inner shrink-0">
                        {emoji}
                      </span>
                      <div className="flex-1">
                        <strong className="text-zinc-100 block font-bold text-xs">{art.name}</strong>
                        <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">{art.description}</p>
                        <span className="text-[9px] text-purple-400 font-bold tracking-wide mt-2 block uppercase bg-purple-950/45 border border-purple-900/35 px-2 py-0.5 rounded-md w-fit">
                          Efecto: +1 reintento
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-zinc-800/80 pt-2.5 mt-1">
                      <span className="font-extrabold text-yellow-400 flex items-center gap-1">
                        <Coins className="h-4 w-4 fill-current text-yellow-500" />
                        {art.price} <span className="text-[8px] text-zinc-500 font-normal">monedas</span>
                      </span>

                      {isOwned ? (
                        <span className="px-3 py-1 bg-zinc-900 text-zinc-500 rounded-lg text-[9px] font-black uppercase tracking-wider border border-zinc-800">
                          Adquirido ✓
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePurchase(art.id, art.price, art.name)}
                          disabled={!hasCoins}
                          className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 ${
                            hasCoins 
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow shadow-emerald-700/35 border border-emerald-500/25' 
                              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-800'
                          }`}
                        >
                          Comprar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* INVENTARIO & ALERTAS (Col-span 1) */}
          <div className="flex flex-col gap-6">
            
            {/* TU INVENTARIO */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md p-6 shadow-xl flex flex-col gap-4">
              <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                🎒 Tu Inventario de Rol
              </h3>
              
              <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-1">
                {ownedArtifactIds.length === 0 ? (
                  <div className="text-center text-[10px] text-zinc-500 py-6 w-full italic">
                    Aún no posees ningún artefacto. ¡Compra reliquias mágicas para prepararte!
                  </div>
                ) : (
                  ownedArtifactIds.map((artId) => {
                    const art = shopArtifacts.find(a => a.id === artId);
                    if (!art) return null;
                    const emoji = getEmojiForIcon(art.icon);

                    return (
                      <div 
                        key={artId} 
                        className="flex items-center gap-2 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-[10px] font-bold shadow-inner"
                        title={art.description}
                      >
                        <span className="text-sm">{emoji}</span>
                        <span className="text-zinc-200">{art.name}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ALERTAS Y NOTIFICACIONES */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md p-6 shadow-xl flex-1 flex flex-col justify-between gap-4">
              <div>
                <div className="flex justify-between items-center border-b border-zinc-800/80 pb-3 mb-3">
                  <h3 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                    <Bell className="h-4 w-4 text-purple-400" />
                    Alertas del Gremio
                  </h3>
                  {studentMessages.filter(m => m.student_id === activeStudentId && !m.is_read).length > 0 && (
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </div>

                <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
                  {studentMessages.filter(m => m.student_id === activeStudentId).length === 0 ? (
                    <div className="text-center text-[10px] text-zinc-500 py-8 italic">
                      No hay mensajes del Gremio en este momento.
                    </div>
                  ) : (
                    studentMessages
                      .filter(m => m.student_id === activeStudentId)
                      .map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`p-3 rounded-2xl border text-[11px] leading-relaxed relative ${
                            msg.is_read 
                              ? 'border-zinc-800/60 bg-zinc-950/20 text-zinc-500' 
                              : msg.type === 'revocation'
                                ? 'border-rose-950 bg-rose-950/15 text-zinc-200'
                                : 'border-purple-950 bg-purple-950/15 text-zinc-200'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <span className="font-extrabold uppercase text-[9px] tracking-wide text-purple-300">
                              {msg.title}
                            </span>
                            {!msg.is_read && (
                              <button 
                                onClick={() => markStudentMessageAsRead(msg.id)}
                                className="text-[9px] text-purple-400 hover:underline shrink-0"
                              >
                                Marcar leído
                              </button>
                            )}
                          </div>
                          <p className="text-zinc-300">{msg.message}</p>
                          <span className="text-[8px] text-zinc-500 italic block mt-1.5">
                            {new Date(msg.sent_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
