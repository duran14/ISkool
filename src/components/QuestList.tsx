"use client";

import React from 'react';
import { 
  Trophy, FileSpreadsheet, AudioLines, Lock, Coins, CheckCircle2, XCircle, Sparkles, Swords
} from 'lucide-react';
import { Quest } from '@/types';

interface QuestListProps {
  quests: Quest[];
  getQuestStatus: (questId: string) => 'pending' | 'completed' | 'failed';
  onQuestClick: (quest: Quest) => void;
}

export default function QuestList({ quests, getQuestStatus, onQuestClick }: QuestListProps) {
  return (
    <div className="w-full flex flex-col gap-6 bg-zinc-950/60 p-6 sm:p-8 rounded-3xl border border-zinc-900 shadow-2xl backdrop-blur-md relative overflow-hidden">
      
      {/* Decorative top grid effect */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />

      {/* Stylized Video-game Header */}
      <div className="flex flex-col gap-1 relative z-10">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-amber-400 drop-shadow-[0_0_4px_rgba(245,158,11,0.6)]" />
          <span className="text-[10px] font-black tracking-[0.25em] text-zinc-400 uppercase">
            REGISTRO DE CONTRATOS
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wider font-serif bg-gradient-to-b from-yellow-200 via-amber-300 to-yellow-600 bg-clip-text text-transparent filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase">
          MISIONES ACTIVAS
        </h2>
        <div className="h-[2px] w-24 bg-gradient-to-r from-amber-500/60 to-transparent mt-1" />
      </div>

      {/* Quest list container */}
      <div className="flex flex-col gap-4 relative z-10 mt-2">
        {quests.map((quest, index) => {
          const status = getQuestStatus(quest.id);
          const isLocked = index > 0 && getQuestStatus(quests[index - 1].id) !== 'completed';
          const isCompleted = status === 'completed';
          const isFailed = status === 'failed';
          const isBoss = quest.type === 'exam';

          // Select visual style based on status and quest type
          let itemBorderClass = 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/30';
          let hoverGlowClass = 'hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:border-purple-500/40';
          let iconContainerClass = 'bg-zinc-950/60 text-zinc-400 border-zinc-800';

          if (isLocked) {
            itemBorderClass = 'border-zinc-900 bg-zinc-950/20 opacity-40';
            hoverGlowClass = '';
          } else if (isCompleted) {
            itemBorderClass = 'border-emerald-500/30 bg-emerald-950/10';
            hoverGlowClass = 'hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:border-emerald-500/50';
            iconContainerClass = 'bg-emerald-950/45 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]';
          } else if (isBoss) {
            itemBorderClass = 'border-purple-500/30 bg-purple-950/10';
            hoverGlowClass = 'hover:shadow-[0_0_18px_rgba(168,85,247,0.25)] hover:border-purple-500/50';
            iconContainerClass = 'bg-purple-950/45 text-purple-400 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.3)]';
          } else {
            // Pending standard quest
            iconContainerClass = 'bg-blue-950/45 text-blue-400 border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.2)]';
            hoverGlowClass = 'hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:border-blue-500/40';
          }

          return (
            <div
              key={quest.id}
              className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl border transition-all duration-350 ${itemBorderClass} ${hoverGlowClass}`}
            >
              {/* Left Column: Icon and Info */}
              <div className="flex gap-4 items-center">
                {/* Circular Icon */}
                <div className={`h-14 w-14 rounded-full border flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${!isLocked && 'group-hover:scale-105'} ${iconContainerClass}`}>
                  {isLocked ? (
                    <Lock className="h-5 w-5" />
                  ) : quest.type === 'exam' ? (
                    <Trophy className="h-6 w-6 animate-pulse" />
                  ) : quest.type === 'quiz' ? (
                    <FileSpreadsheet className="h-6 w-6" />
                  ) : (
                    <AudioLines className="h-6 w-6" />
                  )}
                </div>

                {/* Text Metadata */}
                <div className="flex flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-black text-zinc-500 tracking-wider">
                      RETO {index + 1}
                    </span>
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse">
                        <CheckCircle2 className="h-3 w-3" />
                        COMPLETADO
                      </span>
                    )}
                    {isFailed && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded bg-rose-950/50 border border-rose-500/30 text-rose-400">
                        <XCircle className="h-3 w-3" />
                        REINTENTAR
                      </span>
                    )}
                    {isBoss && !isCompleted && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded bg-purple-950/50 border border-purple-500/30 text-purple-400 animate-pulse">
                        ⚔️ JEFE DE NIVEL
                      </span>
                    )}
                  </div>

                  <h3 className="text-md font-bold text-zinc-100 mt-1 leading-snug font-serif">
                    {quest.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed max-w-md font-medium">
                    {quest.description}
                  </p>
                </div>
              </div>

              {/* Right Column: Rewards & Play Button */}
              <div className="flex items-center gap-4 self-stretch md:self-auto justify-between border-t md:border-t-0 pt-3.5 md:pt-0 border-zinc-900">
                {/* Rewards */}
                <div className="flex items-center gap-3.5 text-[11px] font-black text-zinc-400 bg-zinc-950/40 border border-zinc-900/60 px-3 py-1.5 rounded-xl shadow-inner">
                  <span className="text-blue-400">{quest.xp_reward} <span className="text-[9px] text-zinc-650">XP</span></span>
                  <span className="w-[1px] h-3.5 bg-zinc-800" />
                  <span className="text-yellow-500 flex items-center gap-0.5">
                    <Coins className="h-3.5 w-3.5 fill-current text-amber-500" />
                    {quest.coins_reward}
                  </span>
                </div>

                {/* Play Button / Action */}
                {isLocked ? (
                  <div className="p-3 rounded-xl bg-zinc-950 text-zinc-700 border border-zinc-900 flex items-center justify-center cursor-not-allowed">
                    <Lock className="h-4 w-4" />
                  </div>
                ) : (
                  <button
                    onClick={() => onQuestClick(quest)}
                    className={`px-4.5 py-2.5 rounded-xl text-xs font-black text-zinc-950 transition-all duration-300 flex items-center gap-1.5 active:scale-95 ${
                      isCompleted
                        ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700/50'
                        : isBoss
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-md shadow-purple-500/25 border border-purple-400/20'
                          : 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400'
                    }`}
                  >
                    {isBoss ? (
                      <>
                        <Swords className="h-4 w-4" />
                        {isCompleted ? 'Desafiar Jefe ⚔️' : 'Desafiar Jefe ⚔️'}
                      </>
                    ) : (
                      isCompleted ? 'Reintentar' : 'Jugar'
                    )}
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Subtle Player Vision Label */}
      <div className="w-full text-center border-t border-zinc-900/60 pt-4 mt-2">
        <span className="text-[9px] font-black tracking-[0.25em] text-zinc-650 uppercase">
          🛡️ VISIÓN DEL JUGADOR
        </span>
      </div>

    </div>
  );
}
