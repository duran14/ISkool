"use client";

import React, { useEffect, useRef } from 'react';
import { useCoopStore, PartyAction } from '@/store/useCoopStore';
import { ShieldAlert, Swords, Heart, MessageSquareText } from 'lucide-react';

const getStudentAvatarUrl = (name: string): string => {
  const firstName = name.split(' ')[0].toLowerCase();
  const validAvatars = ['elena', 'lucas', 'mateo', 'santi'];
  if (validAvatars.includes(firstName)) {
    return `/images/students/${firstName}.png`;
  }
  return '/images/students/default.png';
};

const getRpgActionMessage = (action: PartyAction): string => {
  const name = action.student_name || 'Compañero';
  const firstName = name.split(' ')[0];
  const damage = action.damage_dealt;
  
  const nameLower = firstName.toLowerCase();
  let skill = 'Ataque Rápido';
  if (nameLower === 'mateo') {
    const skills = ['Bola de Fuego', 'Rayo de Energía', 'Explosión Mental'];
    skill = skills[damage % skills.length];
  } else if (nameLower === 'elena') {
    const skills = ['Tormenta de Hielo', 'Rayo de Lógica', 'Prisma Sagrado'];
    skill = skills[damage % skills.length];
  } else if (nameLower === 'lucas') {
    const skills = ['Flecha Veloz', 'Tiro con Arco', 'Corte Rápido'];
    skill = skills[damage % skills.length];
  } else if (nameLower === 'santi') {
    const skills = ['Espadazo Fuerte', 'Corte Sagrado', 'Furia Guerrera'];
    skill = skills[damage % skills.length];
  } else {
    const skills = ['Golpe Intelectual', 'Ráfaga Matemática', 'Ataque Crítico'];
    skill = skills[damage % skills.length];
  }

  return `¡${firstName} lanzó ${skill} por ${damage} XP!`;
};

export default function PartyStatus() {
  const { members, actions, partyId, bossHp, bossMaxHp } = useCoopStore();
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll RPG combat log
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [actions]);

  if (!partyId) return null;

  // Calculate damage per student ID
  const damageMap = actions.reduce((acc, action) => {
    acc[action.student_id] = (acc[action.student_id] || 0) + action.damage_dealt;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/90 p-5 shadow-lg shadow-zinc-500/5 flex flex-col gap-5">
      
      {/* Estado del Grupo */}
      <div>
        <div className="flex items-center gap-1.5 mb-3 border-b border-zinc-150 dark:border-zinc-800/80 pb-2">
          <Swords className="h-4 w-4 text-rose-500" />
          <h3 className="text-xs font-black text-zinc-450 dark:text-zinc-400 uppercase tracking-wider">
            Miembros del Grupo
          </h3>
        </div>

        <div className="flex flex-col gap-3">
          {members.length === 0 ? (
            <p className="text-xs text-zinc-400 italic">Esperando a que se unan aliados...</p>
          ) : (
            members.map((member) => {
              const avatarUrl = getStudentAvatarUrl(member.name);
              const totalDmg = damageMap[member.student_id] || 0;

              return (
                <div 
                  key={member.student_id} 
                  className="flex items-center justify-between p-2 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-150/40 dark:border-zinc-800/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img 
                        src={avatarUrl} 
                        alt={member.name} 
                        className="h-9 w-9 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800"
                      />
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {member.name}
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-medium">Aliado Conectado</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 dark:bg-rose-955/20 dark:text-rose-400 border border-rose-100/30 dark:border-rose-900/20">
                      ⚔️ {totalDmg} Daño
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bitácora de Combate RPG */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 border-b border-zinc-150 dark:border-zinc-800/80 pb-2">
          <MessageSquareText className="h-4 w-4 text-purple-500" />
          <h3 className="text-xs font-black text-zinc-450 dark:text-zinc-400 uppercase tracking-wider">
            Consola de Combate RPG
          </h3>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 h-40 overflow-y-auto flex flex-col gap-2 font-mono text-[10px]">
          {actions.length === 0 ? (
            <p className="text-zinc-600 dark:text-zinc-500 italic select-none">
              Esperando acciones en el combate...
            </p>
          ) : (
            actions.map((action, idx) => {
              const isLocalStudent = action.student_id === useCoopStore.getState().partyId; // Simple styling separation if wanted
              return (
                <div 
                  key={action.id || idx} 
                  className="text-purple-400/90 leading-relaxed animate-fade-in"
                >
                  <span className="text-zinc-650 dark:text-zinc-600 select-none">
                    [{new Date(action.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                  </span>{' '}
                  <span className="text-purple-300 font-medium">
                    {getRpgActionMessage(action)}
                  </span>
                </div>
              );
            })
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
